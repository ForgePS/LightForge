# LightForge Customer Portal

## Complete Product and Implementation Specification

**Document status:** Build-ready specification  
**Product:** LightForge Christmas Lighting CRM  
**Feature:** Customer Portal  
**Primary access:** QR code, short URL, SMS link, and email link  
**Primary device:** Mobile phone  
**Architecture rule:** The portal must use the existing LightForge platform and data model. It must not become a separate CRM or disconnected customer-service database.

---

## 1. Project Objective

Build a secure, mobile-first customer portal where a Christmas lighting customer can scan a QR code or open a short URL and immediately access everything related to their lighting service.

The portal must allow customers to:

- View their current seasonal service status.
- Review exactly what lighting and decorations are included in their package.
- View design previews, installation photos, and approved customer-facing property photos.
- View installation, service, removal, and storage dates.
- Submit and track lighting service requests.
- View, approve, decline, or request changes to proposals.
- Electronically sign agreements.
- View invoices, balances, receipts, and payment history.
- Make secure online payments.
- Access agreements and other customer documents.
- Exchange messages with the lighting company.
- Review customer-visible property and access information.
- Renew service for the next season.
- Manage multiple service properties when applicable.

The customer should never need to download an app. The portal must open in a standard mobile or desktop browser and be installable as a progressive web app only if that capability already fits the LightForge platform.

---

## 2. Core Product Principles

### 2.1 Mobile First

Every customer workflow must be designed for one-handed use on a phone. Primary actions must use large touch targets, short forms, simple language, and minimal navigation.

### 2.2 Contractor Branded

The customer must feel like they are using their lighting company's portal, not a generic LightForge account. LightForge may appear only as a small `Powered by LightForge` footer unless the contractor disables that option under an authorized white-label plan.

### 2.3 Seasonal and Context Aware

The portal home page must change its primary call to action based on the customer's current stage in the seasonal lifecycle.

### 2.4 Shared Platform Records

The customer portal is a presentation and interaction layer over the existing LightForge records. It must not duplicate operational data into a separate portal database.

Examples:

- A crew member marking an installation complete must immediately update the customer's portal status.
- A portal service request must create a normal LightForge service request or work order.
- A portal proposal approval must advance the existing opportunity and job workflow.
- A successful portal payment must update the existing invoice and payment records.
- A portal message must appear in the existing customer communication timeline.

### 2.5 Simple Access With Layered Security

Customers should not have to type a password each time they scan their QR code. Normal portal access may use a secure tokenized link. Sensitive actions require additional identity or one-time-code verification.

### 2.6 Tenant Isolation

Every request, query, file, payment, notification, and mutation must be restricted to the correct LightForge tenant. No customer may access another customer, property, or contractor account by changing a URL or identifier.

---

## 3. User Roles

### 3.1 Portal Customer

A residential or commercial customer who may view customer-facing information and perform approved self-service actions.

### 3.2 Customer Account Manager

A customer contact who may manage multiple properties, invoices, documents, and authorized contacts under one customer account.

### 3.3 Contractor Administrator

A LightForge company administrator who controls portal branding, feature availability, access policies, notifications, and customer portal records.

### 3.4 Office Staff

Authorized contractor staff who manage proposals, schedules, billing, documents, messages, and customer records.

### 3.5 Field Technician or Crew Member

Authorized field staff who update job status, upload completion photos, respond to service work orders, and record field completion. They do not administer portal security or billing unless separately permitted.

### 3.6 Platform Administrator

Authorized LightForge personnel who manage global platform configuration and support. Platform administrators must not automatically receive unrestricted access to tenant customer data. Any support access must follow the platform's audited support-access process.

---

## 4. Portal Access Model

### 4.0 Yuletide Lighting Co Reference Experience

The provided Yuletide Customer Portal graphic is the tenant-specific visual and functional reference for the first branded implementation. LightForge remains the reusable multi-tenant platform beneath it.

The Yuletide implementation must support:

- Branded entry at `https://yuletidelightingco.com/portal`.
- A customer QR sticker that opens the customer's secure portal link.
- Email-based entry using the same email address already stored on the customer record.
- View designs and proposals.
- Approve and sign documents.
- Pay invoices online.
- View installation and takedown updates.
- Request service.
- Message the Yuletide team.
- Access receipts and documents.
- Rebook for the next season.

The phrase `takedown` may be used in Yuletide customer-facing copy while the underlying LightForge operational entity may continue to use `removal`. This is a tenant-configurable terminology choice and must not create a duplicate workflow.

The graphic's QR-sticker location is a print-layout placeholder. The system must generate a real, customer-specific QR code for each printed piece rather than placing a shared or decorative QR image in that area.

### 4.1 Customer Portal Address

Each portal-enabled customer or property receives a permanent public-facing short code.

Examples:

```text
https://lightforge.app/p/J7K4M2
https://portal.abcholidaylighting.com/p/J7K4M2
```

The short code is a lookup alias only. It must never be the actual secret that authorizes access.

### 4.2 QR Code

Each portal record must support an automatically generated QR code that points to the current short URL. The QR code may be used on:

- Proposals
- Invoices
- Payment receipts
- Customer welcome packets
- Leave-behind cards
- Service tags
- Yard signs
- Installation packets
- Renewal mailers
- Emails
- Text messages

### 4.2.1 Email-Based Portal Entry

In addition to QR and direct-link access, the contractor's public portal landing page must allow a returning customer to enter the same email address the contractor has on file.

For Yuletide, the entry route is:

```text
https://yuletidelightingco.com/portal
```

The flow must:

1. Accept an email address.
2. Always return the same neutral confirmation message, whether or not the address exists.
3. If a matching, portal-enabled customer contact exists, send a time-limited magic link or one-time code through the existing notification service.
4. If the email is connected to multiple authorized customer accounts or properties, allow selection only after successful verification.
5. Create a portal session with the assurance level granted by the completed verification.
6. Apply resend cooldowns, rate limits, expiration, single-use protection, and complete audit logging.

Example neutral response:

> If that email address matches an active customer portal, we will send you a secure link to continue.

The screen must not reveal whether an email address exists, whether a customer is active, or how many properties are connected to it.

### 4.3 Access Levels

#### Level 1: Secure Portal Session

Used for routine, low-risk portal viewing.

- The short URL resolves server-side to a long, random, cryptographically secure access grant.
- The raw grant token must be stored hashed, never in plaintext.
- A successful grant exchange creates a short-lived, secure portal session.
- Do not expose internal tenant, customer, property, invoice, or proposal IDs in public URLs.
- Do not store bearer tokens in browser local storage.

Level 1 may allow access to:

- Seasonal status
- Customer greeting
- Service property summary
- Customer-visible lighting package
- Customer-visible schedule
- Customer-visible photos
- General company contact information

#### Level 2: Identity Confirmation

Used before displaying moderately sensitive records or after a risk signal.

Identity confirmation may require a matching combination of:

- Customer last name or business name
- Mobile phone number
- Email address
- Property ZIP code

Level 2 may be required for:

- Invoices and payment history
- Signed documents
- Detailed communication history
- Personal contact information
- Multiple-property account switching

#### Level 3: One-Time Verification Code

Required for high-risk actions. Send a time-limited verification code to an already verified phone number or email address.

Level 3 is required before:

- Making a payment
- Adding or changing a payment method
- Enabling autopay
- Signing an agreement
- Changing contact information
- Adding an authorized contact
- Changing property access instructions
- Downloading especially sensitive documents when configured by the contractor

### 4.4 Optional Full Account

LightForge may support an optional passwordless customer account for customers with multiple properties or long-term commercial accounts. It must not be required for basic QR portal use.

### 4.5 Lost or Compromised Link

Contractor staff must be able to revoke and regenerate a customer's portal access without changing the underlying customer or property record.

Regeneration must:

- Revoke existing grants and active sessions.
- Create a new access grant.
- Preserve the public short code when safe, or rotate it when requested.
- Generate a new QR code if the short URL changes.
- Record the actor, time, reason, previous grant identifier, and new grant identifier in the audit log.

---

## 5. Customer Portal Navigation

Use a simple mobile navigation model with no admin-dashboard styling.

### 5.1 Primary Navigation

- Home
- My Lighting
- Schedule
- Service
- Account

### 5.2 Home Page Quick Actions

The home page may display the following feature cards when enabled and relevant:

- My Lighting
- Photos
- Schedule
- Proposal
- Invoices
- Pay Now
- Agreements
- Messages
- My Property
- Renew Service

For the Yuletide tenant, the renewal label should be configurable as `Rebook for Next Season`.

### 5.3 Persistent High-Priority Action

During the active service season, display a highly visible `Report a Lighting Issue` action. It must not be buried inside a settings menu.

### 5.4 Account Menu

The account menu may include:

- Contact information
- Authorized contacts
- Property selector
- Communication preferences
- Accessibility preferences
- Sign out of this device
- Company support information
- Privacy and legal links

---

## 6. Customer Portal Home Page

### 6.1 Header

Display:

- Contractor logo
- Contractor portal name
- Optional season label
- Account or property selector when more than one property is available

### 6.2 Welcome Section

Example:

```text
Welcome back, Jeremy
123 Main Street
2026 Christmas Lighting Season
```

### 6.3 Current Status Card

Display the most important current service state.

Example:

```text
INSTALLATION SCHEDULED
November 12, 2026
Arrival window: 9:00 AM–12:00 PM
```

The status card may include:

- Status label
- Date and arrival window
- Weather-delay notice
- Assigned company contact
- Add-to-calendar action
- Preparation instructions
- Technician en route state
- Completion confirmation

### 6.4 Seasonal Primary Action

The home page must calculate one primary action from the current season state.

| Season or Status | Primary Message | Primary Action |
|---|---|---|
| Lead or proposal stage | Your lighting proposal is ready | View Proposal |
| Proposal sent | Review your 2026 lighting plan | Review Proposal |
| Awaiting deposit | Your deposit is due | Pay Deposit |
| Installation scheduled | Your installation is scheduled | View Schedule |
| Installation in progress | Your installation is underway | View Status |
| Installation complete | Your Christmas lights are installed | View Photos |
| Active season | Need help with your lights? | Request Service |
| Service request open | We are working on your request | Track Request |
| Removal scheduled | Your removal is scheduled | View Removal Date |
| Storage stage | Your lights are safely stored | View Season Summary |
| Renewal available | Reserve your next season | Renew Service |

Only one primary action should dominate the screen. Secondary actions remain available below it.

### 6.5 Account Balance Card

When billing is enabled and a balance exists, display:

- Current balance
- Due date
- Invoice number
- Past-due status when applicable
- `Pay Now` action

Do not display payment-card details at Level 1 access.

### 6.6 Recent Activity

Display a short customer-facing activity feed such as:

- Proposal approved
- Deposit received
- Installation scheduled
- Installation completed
- Photos added
- Service request updated
- Removal scheduled

Internal notes, staff-only activities, cost information, and sensitive audit events must never appear here.

---

## 7. My Lighting

This page gives the customer a clear record of what was purchased and installed for the selected property and season.

### 7.1 Grouping

Group items by service area, such as:

- Roofline
- Trees
- Bushes
- Columns
- Wreaths
- Garland
- Ground displays
- Walkways
- Entryway
- Backyard
- Commercial façade
- Interior display
- Custom area

### 7.2 Lighting Item Fields

Each customer-visible item may display:

- Item name
- Service area
- Description
- Product type
- Bulb or light type
- Color or color pattern
- Quantity
- Linear feet
- Installation location
- Customer-facing installation notes
- Design preview
- Completion photo
- Included service or warranty summary
- Current status
- Customer-visible service history

### 7.3 Example

```text
Roofline
Warm White C9 Lights
185 linear feet
Front and right elevation

Trees
Two oak trees
Warm white mini lights

Wreath
48-inch pre-lit wreath
Front peak
```

### 7.4 Visibility Controls

Every item and note must support a visibility setting:

- Customer visible
- Staff only

Material costs, labor costs, margin, vendor data, staff-only notes, safety notes, and internal installation methods are staff-only by default.

### 7.5 Add-On Request

When enabled, a customer may select `Request an Addition` from an existing lighting area or choose a new area. This creates an upsell request for office review. It must not directly alter the signed scope, invoice, crew work order, or inventory reservation.

---

## 8. Photos and Media

### 8.1 Photo Categories

- Design preview
- Before installation
- Completed installation
- Service issue
- Service completion
- Removal completion
- Customer-uploaded reference
- Property reference

### 8.2 Customer Visibility

All uploaded media must default to staff-only unless it was uploaded through a customer-facing workflow or explicitly marked customer-visible by an authorized user.

### 8.3 Gallery Requirements

- Mobile image grid
- Full-screen viewer
- Swipe navigation
- Image caption
- Date captured or uploaded
- Category
- Download permission when enabled
- Accessible alternate text
- Loading placeholder
- Image compression and responsive sizes

### 8.4 Upload Requirements

Customer service-request uploads must:

- Accept common mobile image formats.
- Validate MIME type and file signature.
- Enforce tenant-configurable file-size and quantity limits.
- Strip unnecessary metadata where required by privacy policy.
- Scan uploads through the platform's existing file-security process.
- Store files under tenant-scoped object keys.
- Prevent public bucket or predictable object access.

---

## 9. Schedule and Seasonal Timeline

### 9.1 Timeline Stages

The customer may see:

- Proposal created
- Proposal approved
- Deposit paid
- Installation scheduled
- Installation in progress
- Installation complete
- Active service season
- Removal scheduled
- Removal complete
- Storage
- Renewal available

### 9.2 Appointment Details

For each customer-visible appointment, display:

- Appointment type
- Date
- Arrival window
- Address
- Current status
- Preparation instructions
- Add-to-calendar action
- Reschedule-request action when permitted
- Weather-delay or schedule-update notice

Do not expose internal route order, crew capacity, other customers, employee phone numbers, or internal schedule notes.

### 9.3 Reschedule Requests

A customer may request a schedule change when the contractor enables it. A request must create a pending schedule-change request for office approval. It must not automatically move the operational job unless the contractor has specifically enabled automated rescheduling rules.

### 9.4 Technician Arrival

When enabled, the portal may show:

- Technician en route
- Estimated arrival window
- Crew leader first name
- Company-approved crew photo
- Completion notice

Exact live employee location must not be displayed unless LightForge later adds a clearly consented and intentionally designed location-sharing feature.

---

## 10. Service Requests

### 10.1 Entry Point

Use a large, plain-language action:

```text
REPORT A LIGHTING ISSUE
```

### 10.2 Service Request Form

#### Problem Type

- All lights not working
- Section of lights out
- Lights falling or hanging down
- Timer problem
- Extension cord or power issue
- Decoration damaged
- Color or pattern issue
- Removal issue
- Other

#### Problem Location

- Roofline
- Trees
- Bushes
- Wreath
- Garland
- Ground display
- Walkway
- Entryway
- Backyard
- Other

#### Additional Fields

- Related lighting item, when known
- Description
- Photo or video attachment
- When the problem started
- Preferred contact method
- Permission to access property if nobody is home
- Customer availability
- Safety warning acknowledgement when relevant

### 10.3 Safety Message

Display a configurable warning before submission:

> Do not climb a ladder, access the roof, handle damaged electrical connections, or attempt repairs yourself. If there is smoke, fire, sparking, or an immediate electrical hazard, move to a safe location and call emergency services.

### 10.4 Creation Workflow

Submitting the form must:

1. Validate the active portal session and tenant context.
2. Confirm the selected property belongs to the portal customer.
3. Create a standard LightForge service request or work order.
4. Generate a tenant-scoped human-readable number such as `SR-2026-00184`.
5. Attach customer-uploaded files through the normal file service.
6. Write the request to the customer timeline.
7. Trigger configured staff notifications.
8. Send the customer a confirmation by their permitted notification channels.
9. Return a tracking page without exposing internal IDs.

### 10.5 Customer Statuses

Map internal operational statuses to simple customer-facing statuses.

| Internal Examples | Customer Status |
|---|---|
| New, triage pending | Submitted |
| Accepted, dispatch pending | Received |
| Scheduled, assigned | Scheduled |
| En route | Technician En Route |
| Work started | In Progress |
| Resolved, work complete | Completed |
| Waiting on customer | Action Needed |
| Canceled | Canceled |

Internal priority scores, employee notes, labor time, routing data, and internal cause codes are never displayed.

### 10.6 Completion

When work is completed, the customer may see:

- Completion date and time
- Customer-facing resolution summary
- Completion photos
- Follow-up instructions
- `Issue Not Resolved` action for a configurable period

---

## 11. Proposals

### 11.1 Proposal Capabilities

Customers may:

- View proposal summary
- View proposal line items grouped by service area
- View pricing and taxes
- View design previews and attachments
- Select approved optional items when allowed
- Accept the proposal
- Decline the proposal
- Request modifications
- Electronically sign
- Pay the required deposit
- Download the finalized customer copy

### 11.2 Proposal States

- Draft: never customer-visible
- Ready for review
- Viewed
- Change requested
- Accepted pending signature
- Accepted pending deposit
- Approved
- Declined
- Expired
- Superseded

### 11.3 Change Request

The customer may submit a plain-language modification request. It must create an activity and staff task against the existing proposal. It must not edit proposal pricing or line items directly.

### 11.4 Acceptance and Signature

Before final acceptance:

- Display the complete customer-facing proposal.
- Display all required terms and disclosures.
- Require any mandatory checkboxes.
- Require Level 3 one-time-code verification.
- Capture signer name, signer role when a business, timestamp, IP-derived audit data as legally permitted, verification method, document version, and acceptance event.
- Generate or preserve a tamper-evident finalized customer copy.
- Update the existing proposal and opportunity workflow.

Do not represent the electronic-signature flow as legally sufficient for every jurisdiction without a legal review of the final implementation and agreement language.

---

## 12. Billing and Payments

### 12.1 Billing Summary

Display:

- Account balance
- Amount currently due
- Due date
- Deposit requirement
- Invoice status
- Invoice number
- Payment history
- Credits and refunds
- Downloadable receipts

### 12.2 Invoice List

Invoice statuses may include:

- Draft: staff-only
- Open
- Partially paid
- Paid
- Past due
- Voided
- Refunded

### 12.3 Payments

Payments must use the payment processor connected to the contractor's LightForge tenant. The initial implementation should support Stripe if Stripe is the platform's selected payment processor.

Requirements:

- Level 3 verification before payment.
- Server-created payment intent or equivalent processor object.
- Use processor-hosted or processor-secure payment components.
- Never store full card numbers, bank account numbers, or security codes in LightForge.
- Verify payment results using signed server-side webhooks.
- Make webhook processing idempotent.
- Update the existing payment, invoice, and customer timeline records.
- Issue a receipt through configured channels.
- Clearly show processing, success, failure, canceled, and retry states.

### 12.4 Saved Payment Methods and Autopay

These are future or tenant-enabled features. They require:

- Explicit customer consent
- Clear amount or billing-rule disclosure
- Easy revocation
- Processor tokens only
- Complete audit events
- Level 3 verification for changes

### 12.5 Payment Failure

A failed client redirect must never be treated as authoritative. The server must reconcile payment status with the processor and webhook record before marking an invoice paid.

---

## 13. Agreements and Documents

### 13.1 Document Categories

- Proposal
- Service agreement
- Signed contract
- Invoice
- Payment receipt
- Installation agreement
- Property authorization
- Renewal agreement
- Warranty information
- Care and safety instructions
- Change order
- Other customer document

### 13.2 Document Requirements

- Customer-visible flag
- Tenant and customer ownership validation
- Property and season association
- Version number
- Document status
- Signature status when applicable
- Created and signed dates
- Secure download authorization
- Short-lived download URL or authenticated streaming
- Access audit event for sensitive documents when required

### 13.3 Staff-Only Documents

Internal estimates, crew worksheets, cost reports, route sheets, employee documents, vendor documents, and internal incident notes must never appear in the portal.

---

## 14. Messages

### 14.1 Purpose

Provide a simple customer-to-company conversation connected to the existing customer record. Do not attempt to recreate a complete email client.

### 14.2 Capabilities

- View customer-visible conversation threads
- Send a new message
- Reply to a thread
- Attach approved files or photos
- Receive unread-message indicators
- Receive optional SMS or email alerts
- Mark messages read

### 14.3 Messaging Rules

- Portal messages must write to the normal LightForge communication timeline.
- Staff-only notes and internal mentions must remain separate and inaccessible.
- An SMS or email notification must contain a safe summary and portal link, not sensitive account contents.
- Notification preferences and consent must be respected.
- STOP, unsubscribe, quiet-hours, and applicable messaging rules must be enforced by the notification service.

---

## 15. My Property

### 15.1 Customer-Visible Information

- Property name or nickname
- Service address
- Customer-visible property photo
- Primary service contact
- Approved access instructions
- Gate information entered or approved by the customer
- Power-source summary
- Timer location
- Storage preference
- Pet notice
- Preferred arrival instructions

### 15.2 Customer Changes

Low-risk preferences may update immediately when configured. Sensitive or operationally important changes should create a pending review request.

Examples requiring review:

- Service address change
- Gate or alarm instructions
- Property access authorization
- Power-source changes
- Permanent installation changes
- Scope-impacting property updates

### 15.3 Staff-Only Information

Never display:

- Staff-only notes
- Internal safety ratings
- Crew access codes not approved for customer display
- Internal maps or route notes
- Neighbor information
- Pricing calculations
- Employee concerns or incident notes
- Security-sensitive property details beyond what the customer is authorized to view

---

## 16. Seasonal Renewal

### 16.1 Renewal Experience

When the contractor opens renewals, eligible customers may:

- Review last season's lighting package
- View proposed renewal pricing
- Keep the same design
- Request changes
- Select approved add-ons
- Accept renewal terms
- Sign the renewal agreement
- Pay a deposit
- Select a preferred installation period when enabled

### 16.2 Renewal Rules

- Never overwrite the previous season's finalized records.
- Create a new season record linked to the prior season.
- Copy only authorized scope, design, property, and preference information.
- Use current pricing rules and current document versions.
- Flag copied photos and notes with their original season.
- Require office review when customer-requested changes affect scope or pricing.

---

## 17. Multiple Properties and Commercial Accounts

One customer account may have multiple service properties.

Requirements:

- Clear property selector
- Property-specific status, schedule, photos, lighting package, service requests, and documents
- Account-level invoice view when authorized
- Property-level portal QR codes when configured
- Authorized-contact permissions by account or property
- No cross-property visibility unless the contact is explicitly authorized

Commercial or property-manager accounts may support multiple authorized contacts with scoped roles such as:

- Billing only
- Property operations
- Proposal approver
- Signer
- Full account manager

---

## 18. Tenant Branding and Configuration

### 18.1 Branding Settings

Each LightForge tenant may configure:

- Company logo
- Portal display name
- Primary color
- Secondary color
- Accent color
- Text color overrides when accessible
- Support phone
- Support email
- Website
- Portal welcome message
- Footer text
- Terms URL
- Privacy URL
- Optional custom portal domain
- `Powered by LightForge` display based on plan entitlement

### 18.2 Feature Settings

Under `Settings → Customer Portal`, provide toggles for:

- Enable Customer Portal
- My Lighting
- Photos
- Schedule
- Service Requests
- Proposals
- Online Payments
- Agreements
- Messages
- Property Information
- Seasonal Renewal
- Referrals
- Reviews
- Add-On Requests
- Saved Payment Methods
- Autopay
- Multiple Properties
- Customer File Uploads
- Technician Arrival Status

### 18.3 Access Settings

- QR codes
- Short URLs
- SMS links
- Email links
- Identity-check policy
- One-time-code delivery methods
- Session duration
- Trusted-device duration
- Force verification for invoices
- Force verification for documents
- Allow portal short-code rotation

### 18.4 Notification Settings

Tenant administrators may configure customer notifications for:

- Proposal ready
- Proposal accepted
- Deposit due
- Payment received
- Installation scheduled
- Appointment reminder
- Technician en route
- Installation completed
- Photos available
- Weather delay
- Service request received
- Service request scheduled
- Service request completed
- Removal scheduled
- Renewal available
- New portal message

---

## 19. Contractor-Side Portal Management

Add a `Customer Portal` panel to the existing customer and property records.

### 19.1 Portal Panel

Display:

```text
Customer Portal

Status: Active
Short URL: https://lightforge.app/p/J7K4M2
Last access: December 3, 2026 at 7:42 PM
Last verified: December 3, 2026 at 7:43 PM

[Open Preview] [Copy Link] [Send by Text] [Send by Email]
[Download QR] [Print QR] [Regenerate Access] [Disable Portal]
```

### 19.2 Staff Controls

Authorized staff may:

- Enable or disable a portal
- Select the primary portal property
- Generate or rotate access
- Copy the short URL
- Download QR code as PNG or SVG
- Print a QR leave-behind
- Send the link by text or email
- Preview the portal as the customer, with a clearly marked audited preview mode
- View recent access history
- Configure feature exceptions for that customer when permitted
- Revoke active sessions
- Troubleshoot delivery failures

### 19.3 Preview Mode

Staff preview must:

- Be read-only unless the staff member intentionally switches to their normal operational screen.
- Display a persistent `Customer Preview` banner.
- Never generate a reusable customer session.
- Respect the same customer-visible field rules.
- Be audit logged.

---

## 20. Suggested Routes

Public routes should remain short and contain no internal IDs.

```text
/p/:shortCode
/p/:shortCode/verify
/portal/home
/portal/lighting
/portal/photos
/portal/schedule
/portal/service
/portal/service/new
/portal/service/:publicRequestNumber
/portal/proposals
/portal/proposals/:publicProposalNumber
/portal/invoices
/portal/invoices/:publicInvoiceNumber
/portal/payments/:publicInvoiceNumber
/portal/documents
/portal/messages
/portal/messages/:publicThreadNumber
/portal/property
/portal/renewal
/portal/account
/portal/sign-out
```

The application may use tenant custom domains, but tenant resolution must be server verified. Never trust a client-provided tenant ID.

---

## 21. Data Model

Use the existing LightForge entities whenever they already exist. The names below are conceptual and may be mapped to the platform's established naming conventions.

### 21.1 `customer_portals`

| Field | Purpose |
|---|---|
| `id` | Internal portal UUID |
| `tenant_id` | Tenant ownership |
| `customer_id` | Existing customer relationship |
| `primary_property_id` | Default service property |
| `short_code` | Unique public lookup alias |
| `status` | Pending, active, disabled, revoked |
| `portal_name_override` | Optional customer-specific name |
| `enabled_features` | Optional feature overrides |
| `created_at` | Creation timestamp |
| `created_by` | Authorized staff actor |
| `updated_at` | Last update timestamp |
| `disabled_at` | Disable timestamp |
| `disabled_by` | Actor who disabled portal |

### 21.2 `customer_portal_grants`

| Field | Purpose |
|---|---|
| `id` | Grant UUID |
| `tenant_id` | Tenant ownership |
| `portal_id` | Portal relationship |
| `token_hash` | One-way hash of random grant token |
| `token_prefix` | Non-secret support identifier |
| `status` | Active, revoked, expired |
| `issued_at` | Issue time |
| `expires_at` | Optional expiration |
| `last_used_at` | Last successful exchange |
| `revoked_at` | Revoke time |
| `revoked_by` | Actor or system source |
| `revoke_reason` | Audit reason |

### 21.3 `customer_portal_sessions`

| Field | Purpose |
|---|---|
| `id` | Session UUID |
| `tenant_id` | Tenant ownership |
| `portal_id` | Portal relationship |
| `grant_id` | Grant used to create session |
| `session_token_hash` | Hashed session token |
| `assurance_level` | Level 1, 2, or 3 |
| `verified_contact_id` | Contact used for verification |
| `created_at` | Session creation |
| `last_seen_at` | Last activity |
| `expires_at` | Absolute expiration |
| `idle_expires_at` | Idle expiration |
| `revoked_at` | Revocation time |
| `risk_flags` | Non-sensitive risk results |

### 21.4 `customer_portal_verifications`

| Field | Purpose |
|---|---|
| `id` | Verification UUID |
| `tenant_id` | Tenant ownership |
| `portal_id` | Portal relationship |
| `session_id` | Related session |
| `channel` | SMS or email |
| `destination_masked` | Safe display value |
| `code_hash` | Hashed verification code |
| `purpose` | Payment, signature, profile change, or step-up |
| `attempt_count` | Failed attempts |
| `sent_at` | Delivery time |
| `expires_at` | Expiration |
| `verified_at` | Successful verification |
| `consumed_at` | Single-use consumption |

### 21.5 `customer_portal_feature_settings`

Use a tenant-scoped configuration record. Prefer explicit typed fields or a versioned schema over an unrestricted settings blob.

### 21.6 Existing Entity Relationships

The portal must reference existing entities such as:

- Tenant
- Customer
- Customer contact
- Property
- Season
- Opportunity
- Proposal
- Proposal line item
- Design or estimate
- Job
- Appointment
- Installation
- Lighting item
- Photo or file
- Service request
- Work order
- Invoice
- Payment
- Agreement
- Document
- Message thread
- Notification
- Audit event

### 21.7 Public Identifiers

Customer-facing records may use tenant-scoped public numbers. Never use sequential database primary keys in public routes.

Examples:

- `SR-2026-00184`
- `PROP-2026-00412`
- `INV-2026-010284`

Public identifiers still require full authorization checks. They are not security controls.

---

## 22. API and Service Boundaries

Follow the existing LightForge API style. The following endpoints are conceptual.

### 22.1 Session and Verification

```text
POST /api/customer-portal/access/exchange
GET  /api/customer-portal/session
POST /api/customer-portal/identity/confirm
POST /api/customer-portal/verification/send
POST /api/customer-portal/verification/confirm
POST /api/customer-portal/session/revoke
```

### 22.2 Portal Views

```text
GET /api/customer-portal/home
GET /api/customer-portal/lighting
GET /api/customer-portal/photos
GET /api/customer-portal/schedule
GET /api/customer-portal/proposals
GET /api/customer-portal/proposals/:publicNumber
GET /api/customer-portal/invoices
GET /api/customer-portal/invoices/:publicNumber
GET /api/customer-portal/documents
GET /api/customer-portal/messages
GET /api/customer-portal/property
GET /api/customer-portal/renewal
```

### 22.3 Portal Mutations

```text
POST /api/customer-portal/service-requests
POST /api/customer-portal/service-requests/:publicNumber/messages
POST /api/customer-portal/proposals/:publicNumber/change-request
POST /api/customer-portal/proposals/:publicNumber/accept
POST /api/customer-portal/proposals/:publicNumber/decline
POST /api/customer-portal/payments/create
POST /api/customer-portal/agreements/:publicNumber/sign
POST /api/customer-portal/messages
POST /api/customer-portal/messages/:publicNumber/reply
POST /api/customer-portal/property/change-requests
POST /api/customer-portal/renewal/request
```

### 22.4 Contractor Administration

```text
GET  /api/admin/customer-portals/:customerId
POST /api/admin/customer-portals/:customerId/enable
POST /api/admin/customer-portals/:portalId/disable
POST /api/admin/customer-portals/:portalId/rotate-access
POST /api/admin/customer-portals/:portalId/revoke-sessions
POST /api/admin/customer-portals/:portalId/send-link
GET  /api/admin/customer-portals/:portalId/qr
GET  /api/admin/customer-portals/:portalId/access-history
```

### 22.5 API Rules

- Resolve tenant context server-side from the domain, access grant, and authenticated staff session.
- Recheck entity ownership on every query and mutation.
- Use allowlisted response serializers created specifically for the customer portal.
- Do not return internal database models directly.
- Rate limit public access, verification, file upload, messaging, signature, service-request, and payment endpoints.
- Use idempotency keys for payment creation, proposal acceptance, agreement signature, and service-request submission.
- Validate all server input with the platform's standard schema-validation library.
- Return safe customer-facing errors without revealing whether unrelated customers or records exist.

---

## 23. Security Requirements

### 23.1 Token Security

- Generate access tokens with a cryptographically secure random generator.
- Use at least 128 bits of entropy.
- Store only strong one-way hashes of bearer tokens.
- Compare hashes using constant-time methods when supported.
- Support expiration, revocation, and rotation.
- Do not write raw tokens to logs, analytics, error trackers, or audit metadata.
- Redact tokens from referrers and browser history where practical through an immediate server exchange and redirect.

### 23.2 Session Security

- Use secure, HTTP-only, same-site cookies.
- Enforce HTTPS.
- Rotate the session identifier after verification-level changes.
- Apply idle and absolute expiration.
- Revoke sessions after access rotation or portal disablement.
- Protect all state-changing actions against CSRF.

### 23.3 Verification Security

- Short expiration period
- Single use
- Attempt limit
- Resend cooldown
- Per-session, per-destination, per-IP, and per-tenant rate limits
- Hashed codes
- Generic failure messages
- Verification event audit trail
- Step-up verification expires after a short configurable period

### 23.4 Authorization

Every customer-facing query must enforce:

```text
active portal
+ active portal session
+ correct tenant
+ customer ownership
+ property authorization
+ feature enabled
+ customer-visible record
+ required assurance level
```

### 23.5 Sensitive Data

- Mask phone numbers and email addresses used for verification.
- Never expose full payment credentials.
- Do not expose staff-only fields through source maps, client state, hidden HTML, or unused API properties.
- Encrypt sensitive data using the platform's existing encryption standards.
- Use signed, short-lived file access.

### 23.6 Abuse Protection

- Rate limiting
- Bot and automation detection where warranted
- File scanning
- Message spam limits
- Duplicate-submission protection
- Verification lockout and cooldown
- Suspicious-access alerting
- Safe account-recovery and link-rotation workflow

### 23.7 Audit Events

Record at minimum:

- Portal enabled, disabled, and access rotated
- Successful and failed grant exchange
- Identity confirmation attempts
- Verification code sent, failed, and completed
- Portal session created and revoked
- Proposal viewed, change requested, accepted, or declined
- Agreement viewed and signed
- Payment initiated and confirmed
- Service request submitted and updated
- Customer profile or property change requested
- Document accessed when required
- Staff customer-preview session

Audit records must be tenant scoped, append oriented, time stamped, and linked to the correct actor type.

---

## 24. Privacy and Visibility Controls

Every portal-backed domain object should use explicit customer visibility rules. Do not infer visibility simply because a record is connected to the customer.

Use fields or policies such as:

- `customer_visible`
- `customer_visible_at`
- `customer_visible_by`
- `customer_summary`
- `internal_notes`

The portal API should use customer-specific data-transfer objects and an allowlist of safe fields.

Portal access analytics must be limited to legitimate security, support, and product purposes and handled under the platform privacy policy.

---

## 25. Notifications

### 25.1 Channels

- In-portal
- Email
- SMS

### 25.2 Notification Content

Notifications should be short and action focused.

Example:

```text
ABC Holiday Lighting: Your installation is scheduled for November 12 between 9:00 AM and 12:00 PM. View details: [secure portal link]
```

Do not include complete invoices, personal information, gate codes, payment details, or sensitive document contents in SMS or email previews.

### 25.3 Preferences and Consent

- Respect transactional versus marketing consent.
- Store communication preferences on the existing customer/contact record.
- Provide required opt-out controls for marketing messages.
- Do not suppress legally or operationally necessary transactional notices unless policy allows it.
- Record delivery, bounce, failure, and opt-out events through the existing notification system.

---

## 26. User Experience Requirements

### 26.1 Visual Style

- Customer-facing service experience, not an admin dashboard
- Contractor's logo and colors
- Large cards and buttons
- Clear status labels
- Minimal text per screen
- Warm seasonal character without excessive decoration
- High contrast and readable typography
- No snow animations, autoplay media, or effects that interfere with speed or accessibility

### 26.2 Responsive Layout

Required widths:

- Small mobile: 320 px and above
- Standard mobile
- Tablet
- Desktop

The portal must remain fully usable at 200% zoom and with device text scaling.

### 26.3 Touch and Forms

- Minimum 44 by 44 px interactive targets
- Mobile-friendly input types
- Clear labels above fields
- Inline validation in plain language
- Preserve form values after recoverable errors
- Disable duplicate submissions while a request is processing
- Show upload progress
- Provide confirmation before irreversible customer actions

### 26.4 Loading, Empty, and Error States

Every page must include:

- Loading state
- Empty state
- Permission or verification state
- Recoverable error state
- Offline or connection-error state
- Expired-session state
- Disabled-portal state
- Safe not-found state

### 26.5 Accessibility

Target WCAG 2.2 AA.

Requirements include:

- Keyboard navigation
- Visible focus indicators
- Semantic headings and landmarks
- Proper form labels and error relationships
- Screen-reader status announcements
- Alternative text for meaningful photos
- Color-independent status indicators
- Accessible modal and drawer focus management
- Reduced-motion support
- Captions or transcripts for customer-facing video when used

---

## 27. Performance and Reliability

### 27.1 Performance Targets

On a typical mobile connection:

- Render useful portal content quickly.
- Prioritize the current status and primary action.
- Lazy-load galleries and secondary sections.
- Serve responsive image sizes.
- Avoid shipping contractor admin code to the portal bundle.
- Cache safe branding and configuration data without caching private customer responses across sessions.

### 27.2 Reliability

- Portal reads should fail safely without exposing data.
- Mutations must be idempotent where duplicates could cause harm.
- Payment and signature results must survive client disconnects.
- Notification failure must not roll back an otherwise successful business transaction.
- Background jobs must retry safely with bounded retries and dead-letter handling where supported.

### 27.3 Observability

Track:

- Portal access success and failure
- Page and API error rate
- Verification delivery and completion rate
- Service-request submission success
- Proposal acceptance success
- Payment conversion and failure categories
- Notification delivery
- File-upload failures
- Latency by endpoint

Never include raw access tokens, one-time codes, payment details, or sensitive customer text in observability data.

---

## 28. Analytics

Tenant dashboards may include:

- Active customer portals
- Portal adoption rate
- QR versus SMS versus email access
- Proposal views and acceptance rate
- Deposit conversion
- Portal payments
- Service requests by type and lighting area
- Average service-response time
- Renewal views and conversions
- Most-used portal features
- Notification delivery and engagement

Analytics must use tenant-scoped aggregated data and follow the platform's access controls.

---

## 29. Migration and Existing Customers

For current LightForge customers:

1. Add portal records without changing existing customer IDs.
2. Associate each portal with the correct tenant and customer.
3. Select a primary property only when unambiguous.
4. Generate unique short codes and secure grants.
5. Keep portals disabled until tenant administrators approve launch or a controlled bulk enablement is performed.
6. Default existing files, notes, and photos to staff-only unless visibility can be established safely.
7. Provide an administrative preview and readiness check.
8. Allow controlled bulk invitation by email or SMS.

Do not automatically expose historical documents or photos merely because they are attached to a customer record.

---

## 30. Build Phases

### Phase 0: Discovery and Mapping

- Inventory existing customer, property, season, proposal, job, schedule, service, invoice, payment, document, file, messaging, tenant, and audit models.
- Map this specification to existing routes and services.
- Identify all staff-only fields.
- Confirm payment, SMS, email, file-storage, and electronic-signature integrations.
- Produce a field-visibility matrix before exposing real customer records.

### Phase 1: Portal Foundation

- Tenant branding
- Portal configuration
- Portal record and short code
- Secure grant exchange
- QR generation
- Portal sessions
- Level 1 customer home
- Contractor portal-management panel
- Audit foundation

### Phase 2: Core Service Experience

- My Lighting
- Photos
- Seasonal schedule and timeline
- Property summary
- Service-request creation and tracking
- Staff notifications
- Customer confirmations

### Phase 3: Proposals and Documents

- Proposal review
- Change request
- Acceptance and decline
- Level 3 verification
- Electronic signature
- Customer document center

### Phase 4: Billing and Payments

- Invoice list and detail
- Payment history
- Secure payment flow
- Processor webhooks
- Receipts
- Refund and credit display

### Phase 5: Messaging and Renewal

- Customer messaging
- SMS and email alerts
- Seasonal renewal
- Add-on requests
- Multiple-property account experience

### Phase 6: Enhancements

- Saved payment methods
- Autopay
- Referrals
- Review requests
- Technician arrival updates
- Weather-delay automation
- Commercial and HOA portal enhancements

Each phase must be deployable behind tenant-scoped feature flags and default to off until enabled intentionally.

---

## 31. Testing Requirements

### 31.1 Unit Tests

- Token generation and hashing
- Grant exchange
- Session expiration and revocation
- Assurance-level enforcement
- Customer-visible serializers
- Tenant and property authorization
- Status mapping
- Seasonal primary-action calculation
- Verification-code lifecycle
- Idempotency behavior
- Payment and webhook reconciliation
- Notification preference enforcement

### 31.2 Integration Tests

- Scan QR and create portal session
- Rotate access and reject old grant
- Prevent cross-tenant access
- Prevent cross-customer and cross-property access
- Step up from Level 1 to Level 2 and Level 3
- Submit service request and create operational work order
- Update work order and reflect safe customer status
- Accept proposal and advance workflow
- Sign correct agreement version
- Complete payment using webhook authority
- Retrieve only customer-visible documents and photos
- Send and receive portal messages without exposing internal notes

### 31.3 End-to-End Tests

At minimum:

1. New residential customer scans QR, views schedule, and submits a lighting issue with a photo.
2. Returning customer reviews a proposal, verifies identity, signs, and pays a deposit.
3. Multi-property manager switches between authorized properties without data leakage.
4. Staff rotates a compromised portal link and old sessions stop working.
5. Disabled tenant feature disappears from navigation and its direct route is denied.
6. A customer cannot retrieve another customer's invoice by changing a public number.
7. Payment succeeds even if the browser closes before the return page, because the webhook is authoritative.
8. Internal photos and notes never appear in portal API responses.

### 31.4 Accessibility Testing

- Automated accessibility checks
- Keyboard-only navigation
- Screen-reader testing on critical workflows
- Color contrast verification for tenant themes
- 200% zoom
- Reduced-motion mode
- Error announcement and focus placement

### 31.5 Security Testing

- Authorization and object-level access tests
- Token leakage checks
- Rate-limit tests
- CSRF testing
- File-upload validation
- Verification brute-force protection
- Session fixation and revocation testing
- Safe error-response testing
- Dependency and vulnerability scanning through the platform's approved process

---

## 32. Acceptance Criteria

The initial production release is accepted only when all of the following are true:

- A contractor can enable a customer portal from the existing customer record.
- LightForge generates a unique short URL and scannable QR code.
- Scanning the code opens the correct tenant-branded portal on a phone.
- The portal does not require an app download or password for routine Level 1 access.
- Sensitive views and actions require the configured verification level.
- The home page displays the correct customer, property, season, status, and primary action.
- My Lighting uses existing scoped service records rather than copied portal-only records.
- Only explicitly customer-visible photos, documents, notes, and fields are returned.
- Schedule changes made in LightForge appear in the portal.
- A portal service request creates a normal operational service request or work order.
- Customers can track only the approved customer-facing status and resolution details.
- Proposal acceptance updates the existing proposal and opportunity workflow.
- Payment updates the existing invoice through verified processor events.
- Portal messages appear in the existing customer communication timeline.
- Access is tenant isolated and object-level authorization tests pass.
- Staff can disable a portal, rotate access, and revoke sessions.
- All important actions create tenant-scoped audit events.
- Critical mobile, accessibility, security, and end-to-end tests pass.
- Portal features can be enabled per tenant and default to off during rollout.
- No unrelated LightForge module, customer workflow, or production data is broken.

---

## 33. Definition of Done

A feature is not complete merely because the screen exists. It is done when:

- UI, API, authorization, validation, persistence, audit, notifications, and error states are implemented.
- Tenant isolation is verified.
- Customer visibility is explicit.
- Mobile and desktop layouts are tested.
- Accessibility requirements are met.
- Loading, empty, offline, expired, disabled, and failure states are present.
- Automated tests cover the critical paths.
- Existing LightForge records update correctly.
- No parallel portal-only business record was created where an existing LightForge record should be used.
- Documentation and tenant settings are complete.
- The feature remains behind the correct tenant-scoped flag until approved for rollout.

---

## 34. Non-Goals for the Initial Release

The first release does not need to include:

- A native iOS or Android app
- Public social features
- Live technician GPS tracking
- A full email client
- Customer editing of proposal prices
- Customer editing of signed scope
- Automatic schedule changes without contractor rules
- Direct customer access to internal crew notes
- A separate portal database containing copies of operational records
- Advanced referral rewards
- HOA community management
- Fully automated upsell pricing

These may be evaluated after the secure core portal is stable.

---

## 35. Build Guardrails

The implementation team must follow these instructions:

1. Inspect and reuse the existing LightForge architecture before creating new services, tables, routes, or components.
2. Do not create a second customer, proposal, service, invoice, payment, document, or messaging system for the portal.
3. Do not expose raw database entities to the customer-facing API.
4. Do not expose a record unless it is both authorized and explicitly customer-visible.
5. Do not trust a tenant ID, customer ID, property ID, role, price, balance, or status supplied by the browser.
6. Do not place raw grant tokens or verification codes in logs.
7. Do not mark payments successful based only on a browser redirect.
8. Do not allow portal settings to bypass platform permissions or plan entitlements.
9. Do not redesign unrelated LightForge screens while implementing this feature.
10. Preserve existing production behavior unless this specification explicitly changes it.
11. Use database migrations that are forward safe and reversible through a documented recovery plan.
12. Keep every release behind tenant-scoped feature flags until the phase passes testing and is intentionally enabled.

---

## 36. Final Product Outcome

The completed LightForge Customer Portal should give a Christmas lighting customer one simple place to understand and manage their entire seasonal service:

```text
Scan the QR code
        ↓
See the current season status
        ↓
View lighting, photos, and schedule
        ↓
Approve, sign, pay, message, or request service
        ↓
Every action updates the existing LightForge workflow
```

The experience must be fast, secure, contractor branded, and extremely easy to use from a mobile phone. The portal should reduce office calls, improve customer communication, speed up proposal and payment completion, create better service documentation, and make LightForge feel like a complete Christmas lighting operating platform rather than a basic CRM.
