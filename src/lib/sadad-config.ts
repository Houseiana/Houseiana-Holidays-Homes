/**
 * Sadad Qatar Payment Gateway Configuration
 *
 * Implements Web Checkout 2.2 for inline payment processing
 * Documentation: https://developer.sadad.qa
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

// Sadad Configuration
export const SADAD_CONFIG = {
  merchantId: process.env.SADAD_ID || '',
  secretKey: process.env.SADAD_SECRET_KEY || '',
  domain: process.env.SADAD_DOMAIN || 'www.houseiana.net',
  mode: process.env.SADAD_MODE || 'test', // 'test' or 'live'
  testUrl: 'https://secure.sadadqa.com/webpurchasepage',
  liveUrl: 'https://secure.sadadqa.com/webpurchasepage',
  language: 'ENG', // 'ENG' or 'ARB'
}

const IV = '@@@@&&&&####$$$$' // Fixed IV for Sadad encryption

function buildKey(key: string): Buffer {
  const keyBytes = Buffer.from(key, 'utf8')
  // PHP openssl_encrypt for AES-128-CBC uses the first 16 bytes, zero-padding if shorter
  if (keyBytes.length >= 16) return keyBytes.subarray(0, 16)

  const buf = Buffer.alloc(16)
  keyBytes.copy(buf)
  return buf
}

/**
 * Generate random salt for checksum
 */
function generateSalt(length: number): string {
  const chars = 'AbcDE123IJKLMN67QRSTUVWXYZaBCdefghijklmn123opq45rs67tuv89wxyz0FGH45OP89'
  let salt = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    salt += chars[randomIndex]
  }

  return salt
}

/**
 * Encrypt string using AES-128-CBC (matching PHP's openssl_encrypt)
 */
function encrypt(input: string, key: string): string {
  const cipher = createCipheriv('aes-128-cbc', buildKey(key), Buffer.from(IV))
  let encrypted = cipher.update(input, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

/**
 * Decrypt string using AES-128-CBC (matching PHP's openssl_decrypt)
 */
function decrypt(crypt: string, key: string): string {
  const decipher = createDecipheriv('aes-128-cbc', buildKey(key), Buffer.from(IV))
  let decrypted = decipher.update(crypt, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Generate checksumhash for Sadad payment request
 * Matches PHP's getChecksumFromString function
 */
export function generateChecksumhash(data: any, secretKey: string, merchantId: string): string {
  const salt = generateSalt(4)
  const dataString = JSON.stringify(data)
  const finalString = `${dataString}|${salt}`

  // Hash with SHA256
  const hash = createHash('sha256').update(finalString).digest('hex')
  const hashString = hash + salt

  // Encrypt with key (secretKey + merchantId)
  const key = secretKey + merchantId
  const checksum = encrypt(hashString, key)

  return checksum
}

/**
 * Verify checksumhash from Sadad callback response
 * Matches PHP's verifychecksum_eFromStr function
 */
export function verifyChecksumhash(
  data: Record<string, any>,
  secretKey: string,
  merchantId: string,
  checksumvalue: string
): boolean {
  try {
    const key = secretKey + merchantId
    const sadadHash = decrypt(checksumvalue, key)
    const salt = sadadHash.slice(-4)

    const dataString = JSON.stringify(data)
    const finalString = `${dataString}|${salt}`
    const websiteHash = createHash('sha256').update(finalString).digest('hex')
    const fullHash = websiteHash + salt

    return fullHash === sadadHash
  } catch (error) {
    console.error('Checksumhash verification error:', error)
    return false
  }
}

/**
 * Create Sadad payment form data
 */
export interface SadadPaymentData {
  orderId: string
  amount: number
  currency: string
  customerEmail: string
  customerMobile: string
  customerId?: string
  productDetails: Array<{
    order_id: string
    itemname: string
    amount: number
    quantity: number
    type?: string
  }>
  callbackUrl: string
}

/**
 * Generate Sadad payment form with checksumhash
 */
export function createSadadPaymentForm(paymentData: SadadPaymentData): {
  action: string
  formFields: Record<string, string>
} {
  const { merchantId, secretKey, domain } = SADAD_CONFIG
  const txnDate = new Date().toISOString().replace('T', ' ').substring(0, 19)
  const amount = paymentData.amount.toFixed(2)
  const customerId = paymentData.customerId || paymentData.customerEmail

  // Build data EXACTLY like the PHP sample before hashing (no extra fields)
  const checksumPayload = {
    postData: {
      merchant_id: merchantId,
      ORDER_ID: paymentData.orderId,
      WEBSITE: domain,
      TXN_AMOUNT: amount,
      CUST_ID: customerId,
      EMAIL: paymentData.customerEmail,
      MOBILE_NO: paymentData.customerMobile,
      VERSION: '2.1',
      CALLBACK_URL: paymentData.callbackUrl,
      txnDate: txnDate,
      productdetail: paymentData.productDetails.map(item => ({
        order_id: item.order_id,
        quantity: String(item.quantity),
        amount: item.amount.toFixed(2),
        itemname: item.itemname,
      })),
    },
    secretKey: secretKey,
  }

 const checksumhash = generateChecksumhash(checksumPayload, secretKey, merchantId)

  // Build final form fields
  const formFields: Record<string, string> = {
    merchant_id: merchantId,
    ORDER_ID: paymentData.orderId,
    WEBSITE: domain,
    TXN_AMOUNT: amount,
    CUST_ID: customerId,
    EMAIL: paymentData.customerEmail,
    MOBILE_NO: paymentData.customerMobile,
    VERSION: '2.1',
    CALLBACK_URL: paymentData.callbackUrl,
    txnDate: txnDate,
    checksumhash: checksumhash,
  }

  // Add product details as individual fields
  paymentData.productDetails.forEach((product, index) => {
    formFields[`productdetail[${index}][order_id]`] = product.order_id
    formFields[`productdetail[${index}][itemname]`] = product.itemname
    formFields[`productdetail[${index}][amount]`] = product.amount.toFixed(2)
    formFields[`productdetail[${index}][quantity]`] = String(product.quantity)
  })

  return {
    action: SADAD_CONFIG.mode === 'live' ? SADAD_CONFIG.liveUrl : SADAD_CONFIG.testUrl,
    formFields,
  }
}

/**
 * Verify Sadad callback response
 */
export interface SadadCallbackResponse {
  ORDERID: string
  RESPCODE: string
  RESPMSG: string
  TXNAMOUNT: string
  transaction_number: string
  checksumhash: string
}

export function verifySadadCallback(response: SadadCallbackResponse): {
  valid: boolean
  success: boolean
  orderId: string
  transactionId: string
  amount: number
  message: string
} {
  const { secretKey, merchantId } = SADAD_CONFIG

  // Remove checksumhash from response for verification
  const { checksumhash, ...dataForVerification } = response

  // Create verification data
  const verificationData = {
    postData: dataForVerification,
    secretKey: secretKey
  }

  // Verify checksumhash
  const isValid = verifyChecksumhash(verificationData, secretKey, merchantId, checksumhash)

  if (!isValid) {
    return {
      valid: false,
      success: false,
      orderId: response.ORDERID,
      transactionId: response.transaction_number,
      amount: parseFloat(response.TXNAMOUNT),
      message: 'Invalid checksumhash - response verification failed',
    }
  }

  // Check response code
  const isSuccess = response.RESPCODE === '1'
  const isPending = response.RESPCODE === '400' || response.RESPCODE === '402'

  return {
    valid: true,
    success: isSuccess,
    orderId: response.ORDERID,
    transactionId: response.transaction_number,
    amount: parseFloat(response.TXNAMOUNT),
    message: isSuccess
      ? 'Transaction successful'
      : isPending
      ? 'Transaction pending'
      : response.RESPMSG || 'Transaction failed',
  }
}
