# Property Creation Feature for Inventory Managers

## Overview

This feature allows inventory managers to create and list properties directly from the Inventory Dashboard. Properties can be created on behalf of:
1. **Existing hosts** - Select by host ID
2. **New hosts** - Create a new user as property host
3. **Houseiana** - Company-owned properties

## Implementation Status

### ✅ Backend (Completed)

1. **Houseiana System User**
   - File: `/scripts/ensure-houseiana-user.js`
   - System user ID: `user_houseiana_system`
   - Email: `properties@houseiana.com`
   - Status: Created and ready

2. **API Endpoints Created:**

   **GET /api/hosts**
   - Search and fetch hosts
   - Supports search by ID, name, or email
   - Returns up to 20 results with property counts
   - Flags if host is Houseiana system user

   **POST /api/hosts**
   - Create new host user
   - Validates email uniqueness
   - Sets user as host (`isHost: true`)
   - Returns created host details

   **POST /api/properties**
   - Create property on behalf of host
   - Requires `hostId` parameter
   - Optional `autoPublish` flag to publish immediately
   - Auto-publishes if `autoPublish: true`, otherwise sets to PENDING_REVIEW
   - Creates audit log entry
   - Supports full property data including KYC

3. **Approval Fix**
   - File: `/app/api/approvals/[id]/approve/route.ts`
   - Now sets both `status: 'PUBLISHED'` and `approval_status: 'approved'`
   - Properties now appear in search results after approval

### 🚧 Frontend (In Progress)

#### Components to Create:

1. **HostSelectionModal.tsx**
   - Three tabs/options:
     - Select Existing Host (with search)
     - Create New Host (form)
     - Use Houseiana (one-click)
   - Returns selected/created host ID to parent

2. **PropertyCreationForm.tsx**
   - Multi-step form (8 steps):
     1. Property Type
     2. Location
     3. Property Details
     4. Amenities
     5. Photos
     6. Pricing
     7. House Rules
     8. KYC Documents
   - Auto-publish toggle
   - Uses POST /api/properties endpoint

3. **Dashboard Integration**
   - Add "Add Property" button to Inventory tab
   - Opens HostSelectionModal
   - Then opens PropertyCreationForm
   - Refreshes property list after creation

## Usage Flow

```
1. Inventory Manager clicks "Add Property" button
   ↓
2. HostSelectionModal opens with 3 options:

   Option A: Select Existing Host
   - Search input for host ID/name/email
   - Dropdown of matching hosts
   - Shows host name, email, property count
   - "Select" button

   Option B: Create New Host
   - Form: First Name, Last Name, Email, Phone
   - "Create Host" button
   - Returns new host ID

   Option C: Use Houseiana
   - One button: "Use Houseiana as Host"
   - Uses user_houseiana_system ID
   - Property will show "Houseiana Properties" as owner
   ↓
3. PropertyCreationForm opens
   - Pre-filled hostId from step 2
   - 8-step wizard (same as regular host listing)
   - Additional toggle: "Auto-publish after creation"
   ↓
4. Property created via POST /api/properties
   - If auto-publish: status = PUBLISHED (immediately live)
   - If not: status = PENDING_REVIEW (needs approval)
   ↓
5. Success message + redirect to property list
```

## API Reference

### Search Hosts
```bash
GET /api/hosts?search=john

Response:
{
  "success": true,
  "hosts": [
    {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "kycStatus": "APPROVED",
      "propertyCount": 5,
      "isHouseiana": false
    }
  ]
}
```

### Create Host
```bash
POST /api/hosts
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "nationality": "USA"
}

Response:
{
  "success": true,
  "host": {
    "id": "user_456",
    "firstName": "Jane",
    "lastName": "Smith",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "kycStatus": "PENDING"
  },
  "message": "Host created successfully"
}
```

### Create Property
```bash
POST /api/properties
Content-Type: application/json

{
  "hostId": "user_houseiana_system", // or any host ID
  "title": "Luxury Villa in Doha",
  "description": "Beautiful villa...",
  "propertyType": "VILLA",
  "address": "123 Main St",
  "city": "Doha",
  "state": "Doha",
  "country": "Qatar",
  "zipCode": "12345",
  "latitude": 25.2854,
  "longitude": 51.5310,
  "guests": 8,
  "bedrooms": 4,
  "beds": 5,
  "bathrooms": 3,
  "pricePerNight": 500,
  "cleaningFee": 50,
  "serviceFee": 30,
  "amenities": ["wifi", "pool", "parking"],
  "photos": ["url1", "url2"],
  "coverPhoto": "url1",
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "minNights": 2,
  "instantBook": false,
  "allowPets": false,
  "allowSmoking": false,
  "allowEvents": false,
  "autoPublish": true, // <-- Inventory manager option
  "kyc": {
    "hostName": "Houseiana Properties",
    "hostIdType": "CR",
    "hostIdNumber": "123456",
    "deedDocument": "url_to_deed",
    "verificationStatus": "APPROVED"
  }
}

Response:
{
  "success": true,
  "message": "Property created and published successfully",
  "property": {
    "id": "prop_789",
    "title": "Luxury Villa in Doha",
    "status": "PUBLISHED",
    "approval_status": "approved",
    "owner": {
      "id": "user_houseiana_system",
      "name": "Houseiana Properties",
      "email": "properties@houseiana.com"
    },
    "publishedAt": "2025-01-27T..."
  }
}
```

## Database Schema

### Users (Hosts)
- `id`: Unique identifier
- `firstName`, `lastName`: Host name
- `email`: Must be unique
- `isHost`: true for hosts
- `kycStatus`: PENDING | APPROVED | REJECTED
- Special user: `user_houseiana_system` for company-owned properties

### Properties
- `ownerId`: References user.id (the host)
- `status`: DRAFT | PENDING_REVIEW | PUBLISHED | UNLISTED | SUSPENDED
- `approval_status`: pending | approved | rejected
- `publishedAt`: Timestamp when property went live
- `submittedForReviewAt`: Timestamp when submitted for approval

## Next Steps

1. Create HostSelectionModal component
2. Create PropertyCreationForm component
3. Add "Add Property" button to dashboard
4. Wire up the complete flow
5. Test end-to-end:
   - Create property with existing host
   - Create property with new host
   - Create property with Houseiana
   - Verify properties show in search when published
   - Verify approval workflow still works

## Notes

- When host is Houseiana, the property owner will display as "Houseiana Properties"
- Auto-publish is only available to inventory managers (not regular hosts)
- All properties are logged in audit_logs table
- KYC documents are optional but recommended
- Property photos should be uploaded separately (URL references in JSON)
