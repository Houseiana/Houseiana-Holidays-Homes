// Types exports
// Note: auth types (LoginRequest, RegisterRequest, AuthResponse, User) are exported from ./api
// export * from './auth';

// Export specific types from booking (Booking is defined in ./api)
export type {
  BookingGuest,
  BookingProperty,
  BookingPayment,
  BookingCancellation,
  BookingReview,
  BookingFilter,
  BookingStats,
} from './booking';

// Export specific types from dashboard (ApiResponse and PaginatedResponse defined in ./api)
export type {
  DashboardStats,
  QuickAction,
  DashboardWidget,
  DashboardPersonalization,
} from './dashboard';

export * from './property';
