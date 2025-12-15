/**
 * Sadad Payment Gateway Client
 * All payment creation is handled by the Backend API
 * This file only provides client-side form submission utility
 */

export interface SadadPaymentRequest {
  amount: number;
  orderId: string;
  email: string;
  mobileNo: string;
  description?: string;
}

export interface SadadPaymentResponse {
  success: boolean;
  formAction: string;
  formData: Record<string, string>;
  transactionId?: string;
  error?: string;
}

/**
 * Create a Sadad payment via the API
 * Calls the backend API which handles checksum generation
 */
export async function createSadadPayment(
  request: SadadPaymentRequest
): Promise<SadadPaymentResponse> {
  const response = await fetch('/api/sadad/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create Sadad payment');
  }

  return response.json();
}

/**
 * Submit payment form to Sadad gateway
 * Creates a hidden form and submits it to redirect user to Sadad
 */
export function submitToSadad(
  formAction: string,
  formData: Record<string, string>
): void {
  // Create a hidden form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formAction;
  form.style.display = 'none';

  // Add form fields
  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  // Append to body and submit
  document.body.appendChild(form);
  form.submit();
}
