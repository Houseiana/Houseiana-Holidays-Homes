// API exports
// Export all from api-client
export * from './api-client';

// Export types unique to backend-api
export type { CreateBookingDto, User } from './backend-api';

// Export APIs from backend-api
export {
  PropertyAPI,
  BookingAPI,
  UserAPI,
  PaymentAPI,
  InventoryAPI,
  MessagingAPI,
  WebhookAPI,
  CronAPI,
  FavoritesAPI,
  TripsAPI,
  PaymentMethodsAPI,
  SupportAPI,
  BookingExtendedAPI,
  AuditAPI,
} from './backend-api';
