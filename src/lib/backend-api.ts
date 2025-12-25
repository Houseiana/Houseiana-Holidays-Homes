/**
 * Backend API Client
 *
 * Centralized facade for modular API services.
 */

import { PropertyService } from '@/features/property/api/property.service';
import { BookingService } from '@/features/booking/api/booking.service';
import { UserService, AccountService } from '@/features/auth/api/auth.service';
import { PaymentService } from '@/features/payment/api/payment.service';
import { PaymentMethodsService } from '@/features/payment/api/payment-methods.service';
import { WebhookService } from '@/features/payment/api/webhook.service';
import { InventoryService } from '@/features/inventory/api/inventory.service';
import { MessagingService } from '@/features/messaging/api/messaging.service';
import { FavoritesService } from '@/features/favorites/api/favorites.service';
import { TripsService } from '@/features/trips/api/trips.service';
import { SupportService } from '@/features/support/api/support.service';
import { AuditService } from '@/features/audit/api/audit.service';
import { CronService } from '@/features/cron/api/cron.service';

// Re-export types
export * from '@/types/api';

// Export individual services (renamed to match legacy API where appropriate)
export const PropertyAPI = PropertyService;
export const BookingAPI = BookingService;
export const BookingExtendedAPI = BookingService; // Merged into BookingService
export const UserAPI = UserService;
export const AccountAPI = AccountService;
export const PaymentAPI = PaymentService;
export const PaymentMethodsAPI = PaymentMethodsService;
export const InventoryAPI = InventoryService;
export const MessagingAPI = MessagingService;
export const WebhookAPI = WebhookService;
export const CronAPI = CronService;
export const FavoritesAPI = FavoritesService;
export const TripsAPI = TripsService;
export const SupportAPI = SupportService;
export const AuditAPI = AuditService;

// Default export acting as a unified namespace
const BackendAPI = {
  Property: PropertyAPI,
  Booking: BookingAPI,
  BookingExtended: BookingExtendedAPI,
  User: UserAPI,
  Account: AccountAPI,
  Payment: PaymentAPI,
  PaymentMethods: PaymentMethodsAPI,
  Inventory: InventoryAPI,
  Messaging: MessagingAPI,
  Webhook: WebhookAPI,
  Cron: CronAPI,
  Favorites: FavoritesAPI,
  Trips: TripsAPI,
  Support: SupportAPI,
  Audit: AuditAPI,
};

export default BackendAPI;
