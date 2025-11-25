# Booking Flow Improvements (Best-Practice Alignment)

This document captures what needs to change to align the Houseiana booking system with a best‑practice flow (request → approve → pay → confirm → cancel/refund), and the concrete edits to apply across backend/front‑end.

## Current gaps
- Auth: Clerk vs custom JWT split. `/api/bookings`, `/api/payments`, `/api/trips` expect `Authorization: Bearer <token>` or cookie `auth-token`, while the UI stores `auth_token` in `localStorage`. Users signed in via Clerk don’t get the JWT, so authenticated APIs 401.
- Status model: Backend uses `BookingStatus` {PENDING, CONFIRMED, CANCELLED, COMPLETED, REJECTED} and `PaymentStatus` {PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED}, but lifecycle phases (REQUESTED/APPROVED/PENDING_PAYMENT/EXPIRED/CHECKED_IN) are not represented in code paths.
- Payments: UI is read-only; no add-card, no payment intent, no capture/refund, no webhooks. Booking creation doesn’t initiate payment or handle expiry.
- Availability holds: Booking POST blocks dates on create, but there’s no short hold for “requested” vs “paid”, and no auto-expire to release holds.
- Policies/refunds: No cancellation policy computation or refund calls to a gateway.
- Notifications/audit: Not wired for booking state changes.

## Target flow
1) Quote: validate dates/guests vs availability; lock price; show policy.
2) Create booking:
   - Instant book → status REQUESTED → paymentStatus PENDING_PAYMENT.
   - Request-to-book → status REQUESTED; host must APPROVE; set auto-expire (e.g., 12–24h).
   - Soft-hold calendar (short TTL) on REQUESTED; hard-block on CONFIRMED/PAID.
3) Approval:
   - Host APPROVED → status APPROVED; require payment within window; else EXPIRED and release hold.
   - Host DECLINED → REJECTED.
4) Payment:
   - Create payment intent; capture on approval or at check-in per policy.
   - On success → status CONFIRMED; paymentStatus PAID.
   - On failure → paymentStatus FAILED; allow retry; keep short hold.
5) Cancellation/refund:
   - Apply listing policy to compute refund; call gateway; update paymentStatus REFUNDED/PARTIALLY_REFUNDED and status CANCELLED; release inventory.
6) Completion:
   - On check-out → COMPLETED; release inventory and trigger review eligibility.

## Concrete changes to implement

### 1) Auth unification (blocking)
- Standardize token name: store JWT in `auth-token` cookie and attach `Authorization: Bearer <token>` in all fetches (client dashboard, payments, trips, bookings).
- On Clerk session, mint the platform JWT and persist to `auth-token` + header.

### 2) Extend booking enums (Prisma)
- `BookingStatus`: add REQUESTED, APPROVED, EXPIRED, CHECKED_IN.
- `PaymentStatus`: keep as-is.
- Run migration and regenerate Prisma client.

### 3) Booking API adjustments (`app/api/bookings/route.ts`)
- POST:
  - Set `status = 'REQUESTED'`, `paymentStatus = 'PENDING'`.
  - Add `platformCommission`, `hostEarnings`, `nightlyRate`, `subtotal`, `taxAmount`, `totalPrice` to align with schema.
  - Add `holdExpiresAt` (new field) and block availability with TTL (e.g., 24h) for REQUESTED; on approval/confirmation, convert to hard block.
- Add PATCH routes:
  - Approve/decline booking (host): REQUESTED → APPROVED or REJECTED.
  - Mark payment success (webhook/intent success): APPROVED → CONFIRMED; paymentStatus → PAID.
  - Cancel booking (guest/host/admin): apply policy and set refund status; release inventory.
- GET:
  - Return `paymentStatus`, `numberOfNights`, `totalPrice`, `holdExpiresAt`.

### 4) Availability holds
- Add `holdExpiresAt` and a cron/queue or API handler to expire REQUESTED/APPROVED without payment → EXPIRED and release `availability`.

### 5) Payments integration
- Add `/api/payments/create-intent` to return client secret (Stripe or chosen gateway) and attach bookingId.
- On booking approval/instant book, create intent; on webhook success, set `paymentStatus=PAID`, `status=CONFIRMED`.
- Add refund endpoint for cancellations; handle partial refunds.

### 6) Frontend (client dashboard)
- Show distinct states: REQUESTED, APPROVED, PENDING_PAYMENT, CONFIRMED, CANCELLED/REJECTED, COMPLETED.
- Add “Pay now” CTA when status APPROVED/REQUESTED & paymentStatus PENDING; call create-intent + Stripe card flow.
- Show cancellation policy and refund amount preview before cancel.

### 7) Host console
- Add actions: Approve/Decline, Mark no-show, View paymentStatus, Manually refund (if allowed), View hold expiry.

### 8) Notifications & audit
- Emit events on REQUESTED, APPROVED, PAID, CANCELLED, REFUNDED, EXPIRED; email/push guest+host.
- Audit log entries for host/guest/admin actions.

### 9) Policies/refunds
- Per-listing cancellation policy fields; compute refundable amount server-side; store `refundAmount` and `refundedAt`.

### 10) KYC/Risk
- Gate payment/booking confirmation on verified email/phone/ID; for high-value bookings require KYC passed.

## Quick implementation sequence
1) Unify auth token (frontend + backend helpers).
2) Extend enums and regenerate Prisma client.
3) Update booking POST to REQUESTED + paymentStatus PENDING, pricing fields aligned to schema.
4) Add approve/decline/pay/cancel endpoints and wire UI CTAs.
5) Add payment intent + webhook handlers; set CONFIRMED/PAID on success; EXPIRE on timeout.
6) Add hold expiry job to release inventory.

## Acceptance criteria
- A booking request cannot block inventory indefinitely: auto-expires if unpaid/unapproved.
- Payment success transitions booking to CONFIRMED; failure keeps a short hold only.
- Host can approve/decline; guest can cancel with correct refund logic.
- UI surfaces correct statuses and payment actions; auth works end-to-end with a single token strategy.
