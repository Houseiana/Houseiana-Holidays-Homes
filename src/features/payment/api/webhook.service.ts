import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const WebhookService = {
  async handleStripeWebhook(data: {
    rawBody: string;
    signature: string;
  }): Promise<ApiResponse> {
    return backendFetch('/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async handlePayPalWebhook(event: {
    event_type: string;
    resource: any;
  }): Promise<ApiResponse> {
    return backendFetch('/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },
};
