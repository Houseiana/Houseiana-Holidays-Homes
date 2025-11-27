import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All enum values converted to lookup table data
const lookupTableData = [
  // UserStatus
  { category: 'user_status', code: 'ACTIVE', label: 'Active', sortOrder: 1 },
  { category: 'user_status', code: 'SUSPENDED', label: 'Suspended', sortOrder: 2 },
  { category: 'user_status', code: 'BANNED', label: 'Banned', sortOrder: 3 },
  { category: 'user_status', code: 'DEACTIVATED', label: 'Deactivated', sortOrder: 4 },

  // KycStatus
  { category: 'kyc_status', code: 'PENDING', label: 'Pending', sortOrder: 1 },
  { category: 'kyc_status', code: 'IN_REVIEW', label: 'In Review', sortOrder: 2 },
  { category: 'kyc_status', code: 'APPROVED', label: 'Approved', sortOrder: 3 },
  { category: 'kyc_status', code: 'REJECTED', label: 'Rejected', sortOrder: 4 },
  { category: 'kyc_status', code: 'REQUIRES_UPDATE', label: 'Requires Update', sortOrder: 5 },

  // UserType
  { category: 'user_type', code: 'HOST', label: 'Host', sortOrder: 1 },
  { category: 'user_type', code: 'GUEST', label: 'Guest', sortOrder: 2 },
  { category: 'user_type', code: 'ADMIN', label: 'Admin', sortOrder: 3 },

  // LoyaltyTier
  { category: 'loyalty_tier', code: 'BRONZE', label: 'Bronze', sortOrder: 1 },
  { category: 'loyalty_tier', code: 'SILVER', label: 'Silver', sortOrder: 2 },
  { category: 'loyalty_tier', code: 'GOLD', label: 'Gold', sortOrder: 3 },
  { category: 'loyalty_tier', code: 'PLATINUM', label: 'Platinum', sortOrder: 4 },

  // HostType
  { category: 'host_type', code: 'INDIVIDUAL', label: 'Individual', description: 'Single person, 1-3 properties', sortOrder: 1 },
  { category: 'host_type', code: 'PROFESSIONAL', label: 'Professional', description: 'Professional host, 4-10 properties', sortOrder: 2 },
  { category: 'host_type', code: 'COMPANY', label: 'Company', description: 'Company account (managed via Organization)', sortOrder: 3 },

  // PayoutSchedule
  { category: 'payout_schedule', code: 'DAILY', label: 'Daily', sortOrder: 1 },
  { category: 'payout_schedule', code: 'WEEKLY', label: 'Weekly', sortOrder: 2 },
  { category: 'payout_schedule', code: 'BIWEEKLY', label: 'Bi-weekly', sortOrder: 3 },
  { category: 'payout_schedule', code: 'MONTHLY', label: 'Monthly', sortOrder: 4 },

  // VerificationLevel
  { category: 'verification_level', code: 'BASIC', label: 'Basic', description: 'ID verified', sortOrder: 1 },
  { category: 'verification_level', code: 'ENHANCED', label: 'Enhanced', description: 'ID + Address verified', sortOrder: 2 },
  { category: 'verification_level', code: 'PREMIUM', label: 'Premium', description: 'ID + Address + Business verified', sortOrder: 3 },

  // BusinessType
  { category: 'business_type', code: 'REAL_ESTATE_COMPANY', label: 'Real Estate Company', sortOrder: 1 },
  { category: 'business_type', code: 'PROPERTY_MANAGEMENT', label: 'Property Management', sortOrder: 2 },
  { category: 'business_type', code: 'HOTEL_GROUP', label: 'Hotel Group', sortOrder: 3 },
  { category: 'business_type', code: 'SERVICED_APARTMENTS', label: 'Serviced Apartments', sortOrder: 4 },
  { category: 'business_type', code: 'VACATION_RENTAL_AGENCY', label: 'Vacation Rental Agency', sortOrder: 5 },
  { category: 'business_type', code: 'REAL_ESTATE_DEVELOPER', label: 'Real Estate Developer', sortOrder: 6 },
  { category: 'business_type', code: 'HOSPITALITY_GROUP', label: 'Hospitality Group', sortOrder: 7 },
  { category: 'business_type', code: 'OTHER', label: 'Other', sortOrder: 8 },

  // IndustryType
  { category: 'industry_type', code: 'REAL_ESTATE', label: 'Real Estate', sortOrder: 1 },
  { category: 'industry_type', code: 'HOSPITALITY', label: 'Hospitality', sortOrder: 2 },
  { category: 'industry_type', code: 'TOURISM', label: 'Tourism', sortOrder: 3 },
  { category: 'industry_type', code: 'PROPERTY_SERVICES', label: 'Property Services', sortOrder: 4 },
  { category: 'industry_type', code: 'OTHER', label: 'Other', sortOrder: 5 },

  // CompanySize
  { category: 'company_size', code: 'SMALL', label: 'Small', description: '1-10 employees', sortOrder: 1 },
  { category: 'company_size', code: 'MEDIUM', label: 'Medium', description: '11-50 employees', sortOrder: 2 },
  { category: 'company_size', code: 'LARGE', label: 'Large', description: '51-200 employees', sortOrder: 3 },
  { category: 'company_size', code: 'ENTERPRISE', label: 'Enterprise', description: '200+ employees', sortOrder: 4 },

  // OrgStatus
  { category: 'org_status', code: 'PENDING_VERIFICATION', label: 'Pending Verification', sortOrder: 1 },
  { category: 'org_status', code: 'VERIFIED', label: 'Verified', sortOrder: 2 },
  { category: 'org_status', code: 'ACTIVE', label: 'Active', sortOrder: 3 },
  { category: 'org_status', code: 'SUSPENDED', label: 'Suspended', sortOrder: 4 },
  { category: 'org_status', code: 'DEACTIVATED', label: 'Deactivated', sortOrder: 5 },

  // OrgRole
  { category: 'org_role', code: 'OWNER', label: 'Owner', description: 'Full control, can delete org, manage billing', sortOrder: 1 },
  { category: 'org_role', code: 'ADMIN', label: 'Admin', description: 'Can manage team, properties, settings', sortOrder: 2 },
  { category: 'org_role', code: 'MANAGER', label: 'Manager', description: 'Can manage properties, bookings, reports', sortOrder: 3 },
  { category: 'org_role', code: 'AGENT', label: 'Agent', description: 'Can edit listings, respond to bookings', sortOrder: 4 },
  { category: 'org_role', code: 'ACCOUNTANT', label: 'Accountant', description: 'View-only for financials', sortOrder: 5 },
  { category: 'org_role', code: 'VIEWER', label: 'Viewer', description: 'Read-only access', sortOrder: 6 },

  // MemberStatus
  { category: 'member_status', code: 'PENDING', label: 'Pending', description: 'Invitation sent, not accepted', sortOrder: 1 },
  { category: 'member_status', code: 'ACTIVE', label: 'Active', sortOrder: 2 },
  { category: 'member_status', code: 'SUSPENDED', label: 'Suspended', sortOrder: 3 },
  { category: 'member_status', code: 'LEFT', label: 'Left', sortOrder: 4 },
  { category: 'member_status', code: 'REMOVED', label: 'Removed', sortOrder: 5 },

  // OwnerType
  { category: 'owner_type', code: 'INDIVIDUAL', label: 'Individual', sortOrder: 1 },
  { category: 'owner_type', code: 'ORGANIZATION', label: 'Organization', sortOrder: 2 },

  // PropertyType
  { category: 'property_type', code: 'APARTMENT', label: 'Apartment', sortOrder: 1 },
  { category: 'property_type', code: 'BARN', label: 'Barn', sortOrder: 2 },
  { category: 'property_type', code: 'BED_AND_BREAKFAST', label: 'Bed and Breakfast', sortOrder: 3 },
  { category: 'property_type', code: 'BOAT', label: 'Boat', sortOrder: 4 },
  { category: 'property_type', code: 'BUNGALOW', label: 'Bungalow', sortOrder: 5 },
  { category: 'property_type', code: 'CABIN', label: 'Cabin', sortOrder: 6 },
  { category: 'property_type', code: 'CAMPER_RV', label: 'Camper/RV', sortOrder: 7 },
  { category: 'property_type', code: 'CASA_PARTICULAR', label: 'Casa Particular', sortOrder: 8 },
  { category: 'property_type', code: 'CASTLE', label: 'Castle', sortOrder: 9 },
  { category: 'property_type', code: 'CAVE', label: 'Cave', sortOrder: 10 },
  { category: 'property_type', code: 'CHALET', label: 'Chalet', sortOrder: 11 },
  { category: 'property_type', code: 'CONDO', label: 'Condo', sortOrder: 12 },
  { category: 'property_type', code: 'COTTAGE', label: 'Cottage', sortOrder: 13 },
  { category: 'property_type', code: 'FARM', label: 'Farm', sortOrder: 14 },
  { category: 'property_type', code: 'GUEST_SUITE', label: 'Guest Suite', sortOrder: 15 },
  { category: 'property_type', code: 'GUESTHOUSE', label: 'Guesthouse', sortOrder: 16 },
  { category: 'property_type', code: 'HOTEL', label: 'Hotel', sortOrder: 17 },
  { category: 'property_type', code: 'HOUSE', label: 'House', sortOrder: 18 },
  { category: 'property_type', code: 'HOUSEBOAT', label: 'Houseboat', sortOrder: 19 },
  { category: 'property_type', code: 'HUT', label: 'Hut', sortOrder: 20 },
  { category: 'property_type', code: 'IGLOO', label: 'Igloo', sortOrder: 21 },
  { category: 'property_type', code: 'ISLAND', label: 'Island', sortOrder: 22 },
  { category: 'property_type', code: 'LIGHTHOUSE', label: 'Lighthouse', sortOrder: 23 },
  { category: 'property_type', code: 'LOFT', label: 'Loft', sortOrder: 24 },
  { category: 'property_type', code: 'PENSION', label: 'Pension', sortOrder: 25 },
  { category: 'property_type', code: 'RESORT', label: 'Resort', sortOrder: 26 },
  { category: 'property_type', code: 'STUDIO', label: 'Studio', sortOrder: 27 },
  { category: 'property_type', code: 'TENT', label: 'Tent', sortOrder: 28 },
  { category: 'property_type', code: 'TINY_HOUSE', label: 'Tiny House', sortOrder: 29 },
  { category: 'property_type', code: 'TOWNHOUSE', label: 'Townhouse', sortOrder: 30 },
  { category: 'property_type', code: 'TREEHOUSE', label: 'Treehouse', sortOrder: 31 },
  { category: 'property_type', code: 'VILLA', label: 'Villa', sortOrder: 32 },
  { category: 'property_type', code: 'WINDMILL', label: 'Windmill', sortOrder: 33 },
  { category: 'property_type', code: 'YACHT', label: 'Yacht', sortOrder: 34 },

  // RoomType
  { category: 'room_type', code: 'ENTIRE_PLACE', label: 'Entire Place', sortOrder: 1 },
  { category: 'room_type', code: 'PRIVATE_ROOM', label: 'Private Room', sortOrder: 2 },
  { category: 'room_type', code: 'SHARED_ROOM', label: 'Shared Room', sortOrder: 3 },

  // PropertyStatus
  { category: 'property_status', code: 'DRAFT', label: 'Draft', sortOrder: 1 },
  { category: 'property_status', code: 'PENDING_REVIEW', label: 'Pending Review', sortOrder: 2 },
  { category: 'property_status', code: 'PUBLISHED', label: 'Published', sortOrder: 3 },
  { category: 'property_status', code: 'UNLISTED', label: 'Unlisted', sortOrder: 4 },
  { category: 'property_status', code: 'SUSPENDED', label: 'Suspended', sortOrder: 5 },

  // BookingStatus
  { category: 'booking_status', code: 'PENDING', label: 'Pending', sortOrder: 1 },
  { category: 'booking_status', code: 'REQUESTED', label: 'Requested', sortOrder: 2 },
  { category: 'booking_status', code: 'APPROVED', label: 'Approved', sortOrder: 3 },
  { category: 'booking_status', code: 'CONFIRMED', label: 'Confirmed', sortOrder: 4 },
  { category: 'booking_status', code: 'CANCELLED', label: 'Cancelled', sortOrder: 5 },
  { category: 'booking_status', code: 'COMPLETED', label: 'Completed', sortOrder: 6 },
  { category: 'booking_status', code: 'REJECTED', label: 'Rejected', sortOrder: 7 },
  { category: 'booking_status', code: 'EXPIRED', label: 'Expired', sortOrder: 8 },

  // PaymentStatus
  { category: 'payment_status', code: 'PENDING', label: 'Pending', sortOrder: 1 },
  { category: 'payment_status', code: 'PAID', label: 'Paid', sortOrder: 2 },
  { category: 'payment_status', code: 'FAILED', label: 'Failed', sortOrder: 3 },
  { category: 'payment_status', code: 'REFUNDED', label: 'Refunded', sortOrder: 4 },
  { category: 'payment_status', code: 'PARTIALLY_REFUNDED', label: 'Partially Refunded', sortOrder: 5 },

  // PayoutType
  { category: 'payout_type', code: 'BANK_TRANSFER', label: 'Bank Transfer', sortOrder: 1 },
  { category: 'payout_type', code: 'MOBILE_PAYMENT', label: 'Mobile Payment', sortOrder: 2 },
  { category: 'payout_type', code: 'PAYPAL', label: 'PayPal', sortOrder: 3 },
  { category: 'payout_type', code: 'STRIPE_CONNECT', label: 'Stripe Connect', sortOrder: 4 },
  { category: 'payout_type', code: 'WISE', label: 'Wise', sortOrder: 5 },
  { category: 'payout_type', code: 'OTHER', label: 'Other', sortOrder: 6 },

  // Contract Types
  { category: 'contract_type', code: 'STANDARD', label: 'Standard', sortOrder: 1 },
  { category: 'contract_type', code: 'PREFERRED_PARTNER', label: 'Preferred Partner', sortOrder: 2 },
  { category: 'contract_type', code: 'ENTERPRISE', label: 'Enterprise', sortOrder: 3 },
  { category: 'contract_type', code: 'CUSTOM', label: 'Custom', sortOrder: 4 },

  // Renewal Types
  { category: 'renewal_type', code: 'AUTO_RENEW', label: 'Auto Renew', sortOrder: 1 },
  { category: 'renewal_type', code: 'MANUAL', label: 'Manual', sortOrder: 2 },
  { category: 'renewal_type', code: 'ONE_TIME', label: 'One Time', sortOrder: 3 },

  // SLA Levels
  { category: 'sla_level', code: 'STANDARD', label: 'Standard', sortOrder: 1 },
  { category: 'sla_level', code: 'PREMIUM', label: 'Premium', sortOrder: 2 },
  { category: 'sla_level', code: 'ENTERPRISE', label: 'Enterprise', sortOrder: 3 },

  // ContractStatus
  { category: 'contract_status', code: 'DRAFT', label: 'Draft', sortOrder: 1 },
  { category: 'contract_status', code: 'PENDING_ORG_SIGNATURE', label: 'Pending Org Signature', sortOrder: 2 },
  { category: 'contract_status', code: 'PENDING_PLATFORM_SIGNATURE', label: 'Pending Platform Signature', sortOrder: 3 },
  { category: 'contract_status', code: 'ACTIVE', label: 'Active', sortOrder: 4 },
  { category: 'contract_status', code: 'EXPIRED', label: 'Expired', sortOrder: 5 },
  { category: 'contract_status', code: 'TERMINATED', label: 'Terminated', sortOrder: 6 },
  { category: 'contract_status', code: 'SUSPENDED', label: 'Suspended', sortOrder: 7 },

  // InvoiceStatus
  { category: 'invoice_status', code: 'DRAFT', label: 'Draft', sortOrder: 1 },
  { category: 'invoice_status', code: 'PENDING', label: 'Pending', sortOrder: 2 },
  { category: 'invoice_status', code: 'PAID', label: 'Paid', sortOrder: 3 },
  { category: 'invoice_status', code: 'OVERDUE', label: 'Overdue', sortOrder: 4 },
  { category: 'invoice_status', code: 'CANCELLED', label: 'Cancelled', sortOrder: 5 },
  { category: 'invoice_status', code: 'REFUNDED', label: 'Refunded', sortOrder: 6 },

  // OTP Types
  { category: 'otp_type', code: 'PHONE_VERIFICATION', label: 'Phone Verification', sortOrder: 1 },
  { category: 'otp_type', code: 'EMAIL_VERIFICATION', label: 'Email Verification', sortOrder: 2 },
  { category: 'otp_type', code: 'LOGIN', label: 'Login', sortOrder: 3 },
  { category: 'otp_type', code: 'PASSWORD_RESET', label: 'Password Reset', sortOrder: 4 },

  // Admin Roles
  { category: 'admin_role', code: 'SUPER_ADMIN', label: 'Super Admin', sortOrder: 1 },
  { category: 'admin_role', code: 'ADMIN', label: 'Admin', sortOrder: 2 },
  { category: 'admin_role', code: 'SUPPORT', label: 'Support', sortOrder: 3 },
  { category: 'admin_role', code: 'MODERATOR', label: 'Moderator', sortOrder: 4 },

  // Account Action Types
  { category: 'account_action_type', code: 'SUSPEND', label: 'Suspend', sortOrder: 1 },
  { category: 'account_action_type', code: 'UNSUSPEND', label: 'Unsuspend', sortOrder: 2 },
  { category: 'account_action_type', code: 'BAN', label: 'Ban', sortOrder: 3 },
  { category: 'account_action_type', code: 'UNBAN', label: 'Unban', sortOrder: 4 },
  { category: 'account_action_type', code: 'VERIFY', label: 'Verify', sortOrder: 5 },
  { category: 'account_action_type', code: 'WARN', label: 'Warn', sortOrder: 6 },
  { category: 'account_action_type', code: 'KYC_APPROVE', label: 'KYC Approve', sortOrder: 7 },
  { category: 'account_action_type', code: 'KYC_REJECT', label: 'KYC Reject', sortOrder: 8 },

  // Approval Status
  { category: 'approval_status', code: 'PENDING', label: 'Pending', sortOrder: 1 },
  { category: 'approval_status', code: 'APPROVED', label: 'Approved', sortOrder: 2 },
  { category: 'approval_status', code: 'REJECTED', label: 'Rejected', sortOrder: 3 },
  { category: 'approval_status', code: 'REQUIRES_CHANGES', label: 'Requires Changes', sortOrder: 4 },

  // Complaint Categories
  { category: 'complaint_category', code: 'BOOKING_ISSUE', label: 'Booking Issue', sortOrder: 1 },
  { category: 'complaint_category', code: 'PAYMENT_PROBLEM', label: 'Payment Problem', sortOrder: 2 },
  { category: 'complaint_category', code: 'PROPERTY_ISSUE', label: 'Property Issue', sortOrder: 3 },
  { category: 'complaint_category', code: 'HOST_BEHAVIOR', label: 'Host Behavior', sortOrder: 4 },
  { category: 'complaint_category', code: 'GUEST_BEHAVIOR', label: 'Guest Behavior', sortOrder: 5 },
  { category: 'complaint_category', code: 'ACCOUNT_ISSUE', label: 'Account Issue', sortOrder: 6 },
  { category: 'complaint_category', code: 'TECHNICAL_ISSUE', label: 'Technical Issue', sortOrder: 7 },
  { category: 'complaint_category', code: 'REFUND_REQUEST', label: 'Refund Request', sortOrder: 8 },

  // Complaint Status
  { category: 'complaint_status', code: 'OPEN', label: 'Open', sortOrder: 1 },
  { category: 'complaint_status', code: 'IN_PROGRESS', label: 'In Progress', sortOrder: 2 },
  { category: 'complaint_status', code: 'WAITING_USER', label: 'Waiting User', sortOrder: 3 },
  { category: 'complaint_status', code: 'WAITING_ADMIN', label: 'Waiting Admin', sortOrder: 4 },
  { category: 'complaint_status', code: 'RESOLVED', label: 'Resolved', sortOrder: 5 },
  { category: 'complaint_status', code: 'CLOSED', label: 'Closed', sortOrder: 6 },
  { category: 'complaint_status', code: 'ESCALATED', label: 'Escalated', sortOrder: 7 },

  // Priority
  { category: 'priority', code: 'LOW', label: 'Low', sortOrder: 1 },
  { category: 'priority', code: 'NORMAL', label: 'Normal', sortOrder: 2 },
  { category: 'priority', code: 'HIGH', label: 'High', sortOrder: 3 },
  { category: 'priority', code: 'URGENT', label: 'Urgent', sortOrder: 4 },

  // Sender Types
  { category: 'sender_type', code: 'USER', label: 'User', sortOrder: 1 },
  { category: 'sender_type', code: 'ADMIN', label: 'Admin', sortOrder: 2 },

  // Chat Status
  { category: 'chat_status', code: 'ACTIVE', label: 'Active', sortOrder: 1 },
  { category: 'chat_status', code: 'CLOSED', label: 'Closed', sortOrder: 2 },
  { category: 'chat_status', code: 'ARCHIVED', label: 'Archived', sortOrder: 3 },

  // Transaction Types
  { category: 'transaction_status', code: 'PAID', label: 'Paid', sortOrder: 1 },
  { category: 'transaction_status', code: 'PENDING', label: 'Pending', sortOrder: 2 },
  { category: 'transaction_status', code: 'REFUNDED', label: 'Refunded', sortOrder: 3 },
  { category: 'transaction_status', code: 'FAILED', label: 'Failed', sortOrder: 4 },

  { category: 'transaction_type', code: 'PAYMENT', label: 'Payment', sortOrder: 1 },
  { category: 'transaction_type', code: 'REFUND', label: 'Refund', sortOrder: 2 },

  // Ticket Categories
  { category: 'ticket_category', code: 'BOOKING_ISSUE', label: 'Booking Issue', sortOrder: 1 },
  { category: 'ticket_category', code: 'PAYMENT', label: 'Payment', sortOrder: 2 },
  { category: 'ticket_category', code: 'ACCOUNT', label: 'Account', sortOrder: 3 },
  { category: 'ticket_category', code: 'TECHNICAL', label: 'Technical', sortOrder: 4 },
  { category: 'ticket_category', code: 'GENERAL', label: 'General', sortOrder: 5 },

  // Ticket Priority
  { category: 'ticket_priority', code: 'LOW', label: 'Low', sortOrder: 1 },
  { category: 'ticket_priority', code: 'MEDIUM', label: 'Medium', sortOrder: 2 },
  { category: 'ticket_priority', code: 'HIGH', label: 'High', sortOrder: 3 },
  { category: 'ticket_priority', code: 'URGENT', label: 'Urgent', sortOrder: 4 },

  // Ticket Status
  { category: 'ticket_status', code: 'OPEN', label: 'Open', sortOrder: 1 },
  { category: 'ticket_status', code: 'IN_PROGRESS', label: 'In Progress', sortOrder: 2 },
  { category: 'ticket_status', code: 'WAITING_USER', label: 'Waiting User', sortOrder: 3 },
  { category: 'ticket_status', code: 'RESOLVED', label: 'Resolved', sortOrder: 4 },
  { category: 'ticket_status', code: 'CLOSED', label: 'Closed', sortOrder: 5 },

  // Message Sender Role
  { category: 'message_sender_role', code: 'USER', label: 'User', sortOrder: 1 },
  { category: 'message_sender_role', code: 'SUPPORT', label: 'Support', sortOrder: 2 },
  { category: 'message_sender_role', code: 'SYSTEM', label: 'System', sortOrder: 3 },

  // Payout Status
  { category: 'payout_status', code: 'SCHEDULED', label: 'Scheduled', sortOrder: 1 },
  { category: 'payout_status', code: 'PROCESSING', label: 'Processing', sortOrder: 2 },
  { category: 'payout_status', code: 'PAID', label: 'Paid', sortOrder: 3 },
  { category: 'payout_status', code: 'FAILED', label: 'Failed', sortOrder: 4 },
  { category: 'payout_status', code: 'CANCELLED', label: 'Cancelled', sortOrder: 5 },
];

async function main() {
  console.log('🌱 Seeding lookup tables...');

  // Delete existing lookup data (optional, for fresh seed)
  // await prisma.lookupTable.deleteMany({});

  // Insert all lookup table data
  const result = await prisma.lookupTable.createMany({
    data: lookupTableData,
    skipDuplicates: true, // Skip if already exists
  });

  console.log(`✅ Created ${result.count} lookup table entries`);

  // Count by category
  const categories = await prisma.lookupTable.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('\n📊 Lookup tables summary:');
  categories.forEach((cat) => {
    console.log(`  - ${cat.category}: ${cat._count} values`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
