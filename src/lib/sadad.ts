/**
 * Sadad Payment Integration
 *
 * This module handles payment creation via the .NET backend
 * which generates the checksum and returns form data for submission to Sadad
 *
 * Backend API: /users/sadad/payment
 */

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  'https://houseiana-user-backend-production.up.railway.app';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Request payload to initiate a Sadad payment
 */
export interface SadadPaymentRequest {
  amount: number;
  orderId: string;
  email: string;
  mobileNo: string;
  description?: string;
}

/**
 * Product detail structure in the form data
 */
export interface SadadProductDetail {
  order_id: string;
  quantity: string;
  amount: string;
  itemname: string;
}

/**
 * Form data returned by backend - ready for submission to Sadad
 */
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
  VERSION: string;
  productdetail: SadadProductDetail[];
}

/**
 * Backend API response structure
 */
export interface SadadPaymentResponse {
  success: boolean;
  error?: string | null;
  formAction: string;
  formData: SadadFormData;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a Sadad payment transaction via backend API
 *
 * Step 1: Send payment details to backend
 * Step 2: Backend generates checksum and returns form data
 * Step 3: Return the response for form submission
 *
 * @param request - Payment request details
 * @returns Promise with form action URL and form data
 * @throws Error if API call fails or response indicates failure
 */
export async function createSadadPayment(
  request: SadadPaymentRequest
): Promise<SadadPaymentResponse> {
  // Step 1: Prepare the request body
  const requestBody = {
    amount: request.amount,
    orderId: request.orderId,
    email: request.email,
    mobileNo: request.mobileNo,
    description: request.description || 'Booking Payment',
  };

  // Step 2: Call the backend API
  const response = await fetch(`${BACKEND_API_URL}/users/sadad/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // Step 3: Handle non-OK responses
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Sadad payment: ${errorText}`);
  }

  // Step 4: Parse the response
  const data: SadadPaymentResponse = await response.json();

  // Step 5: Check for API-level errors
  if (!data.success) {
    throw new Error(data.error || 'Failed to create Sadad payment');
  }

  return data;
}

// ============================================================================
// Form Submission Functions
// ============================================================================

/**
 * Submit payment form to Sadad
 *
 * This function dynamically creates an HTML form with all required fields
 * and submits it, redirecting the user to the Sadad payment page.
 *
 * @param formAction - The Sadad payment page URL
 * @param formData - The form data with all required fields including checksum
 */
export function submitToSadad(
  formAction: string,
  formData: SadadFormData
): void {
  // Step 1: Create a hidden form element
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formAction;
  form.style.display = 'none';

  // Helper function to add hidden input fields
  const addField = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  // Step 2: Add all standard form fields
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
  addField('VERSION', formData.VERSION);

  // Step 3: Add product details as array fields (Sadad expects array format)
  if (formData.productdetail && Array.isArray(formData.productdetail)) {
    formData.productdetail.forEach((product, index) => {
      addField(`productdetail[${index}][order_id]`, product.order_id);
      addField(`productdetail[${index}][quantity]`, product.quantity);
      addField(`productdetail[${index}][amount]`, product.amount);
      addField(`productdetail[${index}][itemname]`, product.itemname);
    });
  }

  // Step 4: Append form to document body and submit
  document.body.appendChild(form);
  form.submit();
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Complete Sadad payment flow - create payment and redirect to Sadad
 *
 * This is a convenience function that combines createSadadPayment and submitToSadad
 * into a single call for simpler usage.
 *
 * @param request - Payment request details
 * @throws Error if payment creation fails
 */
export async function initiateSadadPayment(
  request: SadadPaymentRequest
): Promise<void> {
  // Step 1: Create payment and get form data from backend
  const response = await createSadadPayment(request);

  // Step 2: Submit the form to redirect to Sadad payment page
  submitToSadad(response.formAction, response.formData);
}
