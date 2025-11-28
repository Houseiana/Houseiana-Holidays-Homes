# Houseiana Inventory Management System

Professional operations center for managing Houseiana's property inventory, approvals, compliance, incidents, and financial performance.

## Features Overview

### 1. Approvals & Moderation
- **New Listing Approvals**: Review and approve properties before they go live
- **Document Verification**: Check property titles, owner IDs, licenses
- **Risk Assessment**: Automated risk scoring based on completeness
- **Bulk Actions**: Approve or reject multiple submissions
- **Filter by City**: Doha, Lusail, West Bay, Al Wakrah, etc.

### 2. Inventory & Lifecycle Management
- **Active Properties**: Monitor all live listings
- **Suspended Properties**: Manage temporarily disabled properties
- **Soft Delete**: Archive properties without permanent deletion
- **Property Status Tracking**: Pending, Active, Suspended, Deleted states
- **Quick Actions**: Suspend/Unsuspend, Soft Delete, View Details
- **Statistics Dashboard**: Total, Active, Pending, Suspended, Deleted counts

### 3. Calendar & Blocking
- **Block Specific Dates**: Prevent bookings on maintenance days
- **Bulk Date Blocking**: Block multiple properties at once
- **Reason Tracking**: Maintenance, Damage Repair, Owner Use, etc.
- **Calendar View**: Visual representation of blocked dates
- **Unblock Management**: Remove blocks when ready

### 4. Documents & Compliance
- **Property Documents**: Title Deeds, NOC, Municipality Licenses
- **Owner Documents**: National ID, Commercial Registration
- **Expiry Tracking**: Alert before documents expire
- **Upload & Replace**: Update expired or incorrect documents
- **Compliance Status**: Green (Valid), Yellow (Expiring Soon), Red (Expired)

### 5. Hosts & Owners Management
- **Host Profiles**: View all host information
- **Property Count**: Track properties per host
- **Contact Information**: Email, phone, address
- **Performance Metrics**: Response time, ratings, bookings
- **Document Status**: Track compliance per host

### 6. Notifications Center
- **Push Notifications**: Send alerts to hosts via app
- **Email Notifications**: Bulk email campaigns
- **SMS Notifications**: Critical alerts via SMS
- **Notification Templates**: Pre-built messages for common scenarios
- **Delivery Tracking**: See who received and opened notifications

### 7. History & Incidents
- **Property History**: All changes to property details
- **Maintenance Tickets**: Track repairs and maintenance
- **Damage Claims**: Document property damage incidents
- **Guest Complaints**: Record and resolve guest issues
- **Incident Timeline**: Chronological view of all events
- **Status Tracking**: Reported, In Progress, Resolved, Closed

### 8. Financials & Performance
- **Income Tracking**: Total revenue per property
- **Turnover Analysis**: Booking volume and frequency
- **Cost Breakdown**: Cleaning, maintenance, commissions
- **Profit Calculation**: Net profit after all costs
- **Performance Charts**: Visual trends over time
- **Comparative Analysis**: Compare properties by profitability

**Financial Formulas**:

```typescript
// Booking-level calculations
effectiveGuestRevenue = grossAmount - discountAmount - refundAmount
houseianaRevenue = commission + serviceFee + upsellIncome
totalVariableCosts = cleaning + maintenance + channelFees + paymentGatewayFees
bookingNetProfit = houseianaRevenue - totalVariableCosts
profitMargin = (bookingNetProfit / houseianaRevenue) * 100

// Property-level calculations (aggregated)
propertyNetProfit = SUM(houseianaRevenue) - SUM(totalVariableCosts) - totalFixedCosts
propertyProfitMargin = (propertyNetProfit / SUM(houseianaRevenue)) * 100
ROI = (propertyNetProfit / totalInvestment) * 100
```

### 9. Ratings & Reviews
- **Guest Reviews**: All reviews for each property
- **Average Ratings**: Overall score (1-5 stars)
- **Review Breakdown**: Cleanliness, Location, Communication, etc.
- **Response Management**: Track host responses to reviews
- **Review Trends**: Identify improving or declining properties
- **Guest Information**: Track who stayed and when

### 10. Audit & Activity Log
- **User Actions**: Track who did what and when
- **Change History**: Before/After values for all edits
- **Login Tracking**: Monitor admin access
- **System Events**: Automated actions and triggers
- **Export Logs**: Download audit reports
- **Filter & Search**: Find specific actions or users

## Installation

```bash
# Navigate to project directory
cd /Users/goldenloonie/Desktop/Houseiana\ Holidaies\ Houses\ fullstack/inventory-management

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will run on **http://localhost:3004**

## Environment Configuration

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/inventory
NEXT_PUBLIC_APP_URL=http://localhost:3004
PORT=3004
DEFAULT_ADMIN_USERNAME="Admin1005"
DEFAULT_ADMIN_EMAIL="inventory@houseiana.com"
DEFAULT_ADMIN_PASSWORD="inventory2025"
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://adminhouseiana.com/api/inventory
NEXT_PUBLIC_APP_URL=https://inventory.adminhouseiana.com
DEFAULT_ADMIN_USERNAME="Admin1005"
DEFAULT_ADMIN_EMAIL="inventory@houseiana.com"
DEFAULT_ADMIN_PASSWORD="inventory2025"
```

## Backend API Endpoints

All endpoints are prefixed with `/api/inventory` in the unified Administration backend.

### Properties
- `GET /properties` - List all properties with filters
- `GET /properties/:id` - Get property details
- `PATCH /properties/:id` - Update property
- `POST /properties/:id/suspend` - Suspend property
- `POST /properties/:id/unsuspend` - Unsuspend property
- `POST /properties/:id/soft-delete` - Soft delete property
- `POST /properties/:id/restore` - Restore soft-deleted property

### Approvals
- `GET /approvals` - List pending approvals
- `POST /approvals/:id/approve` - Approve property
- `POST /approvals/:id/reject` - Reject property with reason
- `PATCH /approvals/:id/request-changes` - Request document updates

### Calendar
- `GET /properties/:id/blocked-dates` - Get blocked dates
- `POST /properties/:id/block-dates` - Block specific dates
- `DELETE /properties/:id/blocked-dates/:blockId` - Unblock dates

### Documents
- `GET /properties/:id/documents` - Get all property documents
- `POST /properties/:id/documents` - Upload new document
- `PATCH /documents/:id` - Update document
- `DELETE /documents/:id` - Remove document
- `GET /hosts/:id/documents` - Get host documents

### Notifications
- `POST /notifications/send` - Send notification to hosts
- `POST /notifications/bulk` - Send bulk notifications
- `GET /notifications/history` - Get notification history
- `GET /notifications/:id/status` - Check delivery status

### Incidents
- `GET /properties/:id/incidents` - Get property incident history
- `POST /incidents` - Create new incident
- `PATCH /incidents/:id` - Update incident status
- `POST /incidents/:id/resolve` - Mark as resolved

### Financials
- `GET /properties/:id/financials` - Get property financial data
- `GET /financials/summary` - Overall financial summary
- `GET /properties/:id/bookings` - Get booking history
- `GET /properties/:id/costs` - Get cost breakdown

### Reviews
- `GET /properties/:id/reviews` - Get property reviews
- `GET /reviews/:id` - Get review details
- `POST /reviews/:id/respond` - Host response to review

### Audit
- `GET /audit-logs` - Get audit trail
- `GET /audit-logs/user/:userId` - Get user activity
- `GET /audit-logs/property/:propertyId` - Get property changes
- `POST /audit-logs/export` - Export audit logs

## Project Structure

```
inventory-management/
├── app/
│   ├── page.tsx              # Main dashboard with 10 tabs
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── .env.local                # Development environment
├── .env.production           # Production environment
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── README.md                 # This file
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Unified Administration Backend (NestJS)
- **Database**: PostgreSQL via Prisma
- **Authentication**: JWT tokens
- **Deployment**: Vercel (inventory.adminhouseiana.com)

## Development Roadmap

### Phase 1: Foundation (Completed)
- ✅ Project setup with Next.js + TypeScript + Tailwind
- ✅ 10 tab navigation system
- ✅ Approvals panel with sample data
- ✅ Inventory panel with statistics
- ✅ Environment configuration
- ✅ Professional UI design

### Phase 2: Backend Integration (Next)
- [ ] Create Prisma schema for inventory models
- [ ] Implement all API endpoints in Administration backend
- [ ] Connect frontend to real APIs
- [ ] Add authentication (login page)
- [ ] Implement JWT token handling

### Phase 3: Core Features
- [ ] Property approval workflow
- [ ] Document upload and management
- [ ] Calendar blocking system
- [ ] Notification sending system
- [ ] Soft delete and suspension logic

### Phase 4: Advanced Features
- [ ] Incident tracking system
- [ ] Financial calculations and charts
- [ ] Review management
- [ ] Audit logging
- [ ] Export functionality

### Phase 5: Polish & Deploy
- [ ] Responsive design optimization
- [ ] Loading states and error handling
- [ ] Toast notifications for actions
- [ ] Performance optimization
- [ ] Production deployment

## Integration with Unified Backend

This Inventory Management system is designed to work with the unified Administration Backend at `https://adminhouseiana.com/api`.

**Authentication Flow**:
1. Admin logs in via `/api/inventory/auth/login`
2. Backend returns JWT token
3. Token stored in localStorage as `inventory_token`
4. All subsequent requests include token in Authorization header

**Data Flow**:
1. Frontend fetches data from `/api/inventory/*` endpoints
2. Backend validates JWT token
3. Backend queries PostgreSQL database via Prisma
4. Backend returns JSON response
5. Frontend updates UI with data

## Default Credentials

For initial setup and development:
- **Username**: `Admin1005`
- **Email**: `inventory@houseiana.com`
- **Password**: `inventory2025`

**Important**: Change these credentials in production after first login.

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_APP_URL
```

### Domain Configuration
- Production URL: `https://inventory.adminhouseiana.com`
- Configure DNS CNAME record pointing to Vercel

## Support

For issues or questions, contact the Houseiana development team.

---

**Built with [Next.js](https://nextjs.org/) | Powered by Houseiana**
