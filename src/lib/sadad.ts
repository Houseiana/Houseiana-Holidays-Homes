/**
 * Sadad Payment Integration
 *
 * This module handles payment creation via the .NET backend
 * which generates the checksum and returns form data for submission to Sadad
 */

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

export interface SadadPaymentRequest {
  amount: number;
  orderId: string;
  email: string;
  mobileNo: string;
  description?: string;
}

export interface SadadProductDetail {
  order_id: string;
  quantity: string;
  amount: string;
  itemname: string;
}

export interface SadadFormData {
  merchant_id: string;
  ORDER_ID: string;
  WEBSITE: string;
  TXN_AMOUNT: string;
  CUST_ID: string;
  EMAIL: string;
  MOBILE_NO: string;
  CALLBACK_URL: string;
  txnDate: string;
  checksumhash: string;
  productdetail: SadadProductDetail[];
}

// Backend API response format
interface BackendFormData {
  actionUrl: string;
  merchantId: string;
  orderId: string;
  website: string;
  txnAmount: string;
  customerId: string;
  email: string;
  mobileNo: string;
  callbackUrl: string;
  txnDate: string;
  checksumHash: string;
  productDetail: {
    order_id: string;
    itemname: string;
    amount: string;
    quantity: string;
  };
}

interface BackendResponse {
  success: boolean;
  message?: string;
  data: BackendFormData;
}

export interface SadadPaymentResponse {
  success: boolean;
  error: string | null;
  formAction: string;
  formData: SadadFormData;
}

/**
 * Create a Sadad payment transaction via backend API
 * Returns form data that should be submitted to Sadad
 */
export async function createSadadPayment(request: SadadPaymentRequest): Promise<SadadPaymentResponse> {
  const response = await fetch(`${BACKEND_API_URL}/api/sadadpayment/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: request.amount,
      orderId: request.orderId,
      customerEmail: request.email,
      customerMobile: request.mobileNo,
      itemName: request.description || 'Booking Payment',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Sadad payment: ${errorText}`);
  }

  const backendResponse: BackendResponse = await response.json();

  if (!backendResponse.success) {
    throw new Error(backendResponse.message || 'Failed to create Sadad payment');
  }

  const data = backendResponse.data;

  // Map backend response to Sadad form format
  return {
    success: true,
    error: null,
    formAction: data.actionUrl,
    formData: {
      merchant_id: data.merchantId,
      ORDER_ID: data.orderId,
      WEBSITE: data.website,
      TXN_AMOUNT: data.txnAmount,
      CUST_ID: data.customerId,
      EMAIL: data.email,
      MOBILE_NO: data.mobileNo,
      CALLBACK_URL: data.callbackUrl,
      txnDate: data.txnDate,
      checksumhash: data.checksumHash,
      productdetail: [{
        order_id: data.productDetail.order_id,
        quantity: data.productDetail.quantity,
        amount: data.productDetail.amount,
        itemname: data.productDetail.itemname,
      }],
    },
  };
}

/**
 * Submit payment form to Sadad
 * This creates a hidden form and submits it, redirecting the user to Sadad payment page
 */
export function submitToSadad(formAction: string, formData: SadadFormData): void {
  // Create a hidden form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formAction;
  form.style.display = 'none';

  // Add all form fields
  const addField = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField('merchant_id', formData.merchant_id);
  addField('ORDER_ID', formData.ORDER_ID);
  addField('WEBSITE', formData.WEBSITE);
  addField('TXN_AMOUNT', formData.TXN_AMOUNT);
  addField('CUST_ID', formData.CUST_ID);
  addField('EMAIL', formData.EMAIL);
  addField('MOBILE_NO', formData.MOBILE_NO);
  addField('CALLBACK_URL', formData.CALLBACK_URL);
  addField('txnDate', formData.txnDate);
  addField('checksumhash', formData.checksumhash);

  // Add product details as array fields (Sadad expects array format)
  if (formData.productdetail && Array.isArray(formData.productdetail)) {
    formData.productdetail.forEach((product, index) => {
      addField(`productdetail[${index}][order_id]`, product.order_id);
      addField(`productdetail[${index}][quantity]`, product.quantity);
      addField(`productdetail[${index}][amount]`, product.amount);
      addField(`productdetail[${index}][itemname]`, product.itemname);
    });
  }

  // Append form to body and submit
  document.body.appendChild(form);
  form.submit();
}
