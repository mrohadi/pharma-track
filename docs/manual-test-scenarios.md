# PharmaTrack — Manual Test Scenarios

> Import this file into Notion as a Markdown page. Each feature section maps to one Notion table.
> **Legend — Status column:** ✅ Pass · ❌ Fail · ⏭ Skip

---

## 1. Authentication — Login

| # | Type | Detail Scenario | Steps | Expected Result | Evidence (screenshot / log) | Status |
|---|------|-----------------|-------|-----------------|-----------------------------|--------|
| 1.1 | ✅ Positive | Valid pharmacy user login | 1. Go to `/login` 2. Enter valid pharmacy email + password 3. Click **Sign In** | Redirect to `/p` (pharmacy dashboard) | [ ] | ⬜ |
| 1.2 | ✅ Positive | Valid admin user login | 1. Go to `/login` 2. Enter valid admin email + password 3. Click **Sign In** | Redirect to `/a` (admin dashboard) | [ ] | ⬜ |
| 1.3 | ✅ Positive | Valid driver user login | 1. Go to `/login` 2. Enter valid driver email + password 3. Click **Sign In** | Redirect to `/d` (driver dashboard) | [ ] | ⬜ |
| 1.4 | ❌ Negative | Wrong password | 1. Go to `/login` 2. Enter valid email + wrong password 3. Click **Sign In** | Error message shown, no redirect | [ ] | ⬜ |
| 1.5 | ❌ Negative | Non-existent email | 1. Go to `/login` 2. Enter unregistered email + any password 3. Click **Sign In** | Error message shown, no redirect | [ ] | ⬜ |
| 1.6 | ❌ Negative | Empty form submission | 1. Go to `/login` 2. Click **Sign In** without entering anything | Validation errors on both fields | [ ] | ⬜ |
| 1.7 | ❌ Negative | Unauthenticated access to protected route | 1. Clear cookies 2. Navigate directly to `/a`, `/p`, or `/d` | Redirect back to `/login` | [ ] | ⬜ |
| 1.8 | ❌ Negative | Role mismatch (driver accessing `/a`) | 1. Login as driver 2. Manually navigate to `/a` | Redirect to `/d` or 403 | [ ] | ⬜ |

---

## 2. Pharmacy Signup

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 2.1 | ✅ Positive | Complete pharmacy registration (3 steps) | 1. Go to `/signup/pharmacy` 2. Fill Step 1 (pharmacy info) → Next 3. Fill Step 2 (owner info) → Next 4. Fill Step 3 (documents) → Submit | Success page / redirect to pending verification | [ ] | ⬜ |
| 2.2 | ✅ Positive | NPWP auto-formatted | 1. On Step 2 NPWP field, type `123456789012345` | Display formatted as `12.345.678.9-012.345` | [ ] | ⬜ |
| 2.3 | ❌ Negative | Skip required Step 1 fields | 1. Go to Step 1 2. Leave pharmacy name empty 3. Click **Next** | Validation error, stays on Step 1 | [ ] | ⬜ |
| 2.4 | ❌ Negative | Duplicate pharmacy email | 1. Submit pharmacy signup with already-registered email | Error: email already exists | [ ] | ⬜ |
| 2.5 | ❌ Negative | Invalid NPWP format | 1. Enter NPWP with letters or wrong digit count | Validation error on NPWP field | [ ] | ⬜ |

---

## 3. Driver Signup

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 3.1 | ✅ Positive | Complete driver registration (3 steps) | 1. Go to `/signup/driver` 2. Fill Step 1 (personal info) → Next 3. Fill Step 2 (vehicle info) → Next 4. Fill Step 3 (documents) → Submit | Success / pending verification page | [ ] | ⬜ |
| 3.2 | ❌ Negative | Skip required Step 2 fields | 1. On Step 2, leave vehicle plate empty 2. Click **Next** | Validation error, stays on Step 2 | [ ] | ⬜ |
| 3.3 | ❌ Negative | Duplicate driver phone number | 1. Submit with already-registered phone | Error: phone already exists | [ ] | ⬜ |

---

## 4. Pending Verification Page

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 4.1 | ✅ Positive | New signup lands on pending page | 1. Complete pharmacy or driver signup | Page shows "Awaiting Verification" status | [ ] | ⬜ |
| 4.2 | ✅ Positive | SIA/SIPA update shows warning | 1. Login as pending pharmacy 2. Update SIA or SIPA number | Warning: "Awaiting verification" banner visible | [ ] | ⬜ |
| 4.3 | ❌ Negative | Pending user accesses dashboard directly | 1. Pending user manually navigates to `/p` | Redirect back to pending page | [ ] | ⬜ |

---

## 5. Admin Dashboard

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 5.1 | ✅ Positive | Dashboard KPIs load correctly | 1. Login as admin 2. Navigate to `/a` | Stats (total orders, pharmacies, drivers) shown correctly | [ ] | ⬜ |
| 5.2 | ✅ Positive | Recent orders table loads | 1. Login as admin 2. View recent orders section | Orders list with status visible | [ ] | ⬜ |
| 5.3 | ✅ Positive | Analytics chart renders | 1. Login as admin 2. Navigate to `/a/analytics` | Chart with order trend visible | [ ] | ⬜ |
| 5.4 | ❌ Negative | Non-admin accesses admin dashboard | 1. Login as pharmacy user 2. Navigate to `/a` | Redirect to `/p` or 403 | [ ] | ⬜ |

---

## 6. Admin — User Management

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 6.1 | ✅ Positive | View all users list | 1. Login as admin 2. Navigate to user management | All users (pharmacy + driver) listed | [ ] | ⬜ |
| 6.2 | ✅ Positive | Approve pending pharmacy | 1. Find pending pharmacy in list 2. Click **Approve** | Status changes to Active; user can now login | [ ] | ⬜ |
| 6.3 | ✅ Positive | Approve pending driver | 1. Find pending driver in list 2. Click **Approve** | Status changes to Active | [ ] | ⬜ |
| 6.4 | ✅ Positive | Admin sees pending SIA/SIPA entry | 1. Pharmacy submits updated SIA/SIPA 2. Admin views user management | Pending entry visible in admin list | [ ] | ⬜ |
| 6.5 | ❌ Negative | Approve already-active user | 1. Find active user 2. Attempt duplicate approve | No state change / button disabled | [ ] | ⬜ |

---

## 7. Admin — Order Management & Assignment

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 7.1 | ✅ Positive | View all orders | 1. Login as admin 2. Navigate to `/a` orders table | All orders from all pharmacies visible | [ ] | ⬜ |
| 7.2 | ✅ Positive | Filter orders by pharmacy | 1. Select pharmacy from filter dropdown | Orders list filtered to selected pharmacy | [ ] | ⬜ |
| 7.3 | ✅ Positive | Assign order to driver | 1. Find unassigned order 2. Select driver from assign cell dropdown 3. Confirm | Order status updated; driver gets push notification | [ ] | ⬜ |
| 7.4 | ✅ Positive | Export orders to CSV | 1. Click **Export** button 2. Download triggers | CSV file downloads with correct order data | [ ] | ⬜ |
| 7.5 | ✅ Positive | Send address request via WhatsApp | 1. Find order with missing address 2. Click **Send Address Request** | WhatsApp message sent to customer | [ ] | ⬜ |
| 7.6 | ❌ Negative | Assign order with no driver available | 1. Open assign dropdown when no drivers exist | Dropdown empty / disabled or error shown | [ ] | ⬜ |
| 7.7 | ❌ Negative | Export with zero orders | 1. Filter to pharmacy with no orders 2. Click **Export** | Empty CSV or "no data" message | [ ] | ⬜ |

---

## 8. Admin — Batch Management

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 8.1 | ✅ Positive | Create batch from batchable orders | 1. Navigate to `/a/batches` 2. Select multiple orders 3. Click **Create Batch** | Batch created with PIN generated; driver notified | [ ] | ⬜ |
| 8.2 | ✅ Positive | Toggle select all orders | 1. On create batch form, click **Select All** | All batchable orders selected | [ ] | ⬜ |
| 8.3 | ✅ Positive | View batches list | 1. Navigate to `/a/batches` | All batches with status shown | [ ] | ⬜ |
| 8.4 | ❌ Negative | Create batch with zero orders selected | 1. Click **Create Batch** without selecting any order | Validation error / button disabled | [ ] | ⬜ |
| 8.5 | ❌ Negative | Create batch when no batchable orders exist | 1. Navigate to `/a/batches` when all orders assigned | "No batchable orders" message | [ ] | ⬜ |

---

## 9. Admin — Audit Log

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 9.1 | ✅ Positive | View audit log | 1. Login as admin 2. Navigate to audit log | List of actions with entity, actor, timestamp | [ ] | ⬜ |
| 9.2 | ✅ Positive | Filter by entity type | 1. Select entity type from dropdown | Log filtered to selected entity type | [ ] | ⬜ |
| 9.3 | ❌ Negative | Non-admin accesses audit log | 1. Login as pharmacy/driver 2. Navigate to audit log URL | Redirect or 403 | [ ] | ⬜ |

---

## 10. Pharmacy — Dashboard & Orders

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 10.1 | ✅ Positive | View recent orders | 1. Login as pharmacy 2. Navigate to `/p` | Recent orders list shown | [ ] | ⬜ |
| 10.2 | ✅ Positive | Export pharmacy orders to CSV | 1. Click **Export** on pharmacy dashboard | CSV file with pharmacy-specific orders downloads | [ ] | ⬜ |
| 10.3 | ❌ Negative | Pharmacy sees only own orders | 1. Login as Pharmacy A 2. View orders | Orders from Pharmacy B not visible | [ ] | ⬜ |

---

## 11. Pharmacy — CSV Upload (Manual Order)

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 11.1 | ✅ Positive | Upload valid CSV | 1. Navigate to `/p/upload` 2. Download CSV template 3. Fill template with valid data 4. Upload file | Orders created; success message shown | [ ] | ⬜ |
| 11.2 | ✅ Positive | Download CSV template | 1. Navigate to `/p/upload` 2. Click **Download Template** | CSV template file downloads | [ ] | ⬜ |
| 11.3 | ❌ Negative | Upload malformed CSV | 1. Upload CSV with missing required columns | Error: "Invalid CSV format" | [ ] | ⬜ |
| 11.4 | ❌ Negative | Upload non-CSV file | 1. Attempt to upload `.xlsx` or `.txt` | Validation error: file type not supported | [ ] | ⬜ |
| 11.5 | ❌ Negative | Upload empty CSV | 1. Upload CSV with header only, no data rows | Error: "No orders found in file" | [ ] | ⬜ |

---

## 12. Pharmacy — Settings

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 12.1 | ✅ Positive | Update pharmacy settings | 1. Navigate to `/p/settings` 2. Modify allowed field(s) 3. Click **Save** | Settings saved; success toast shown | [ ] | ⬜ |
| 12.2 | ✅ Positive | Toggle notification preference | 1. On settings, toggle notification switch 2. Save | Page reloads; saved state persists | [ ] | ⬜ |
| 12.3 | ✅ Positive | Update SIA/SIPA shows warning | 1. Change SIA or SIPA value 2. Save | Warning: "Awaiting admin verification" shown | [ ] | ⬜ |
| 12.4 | ❌ Negative | Save settings with required field empty | 1. Clear required field 2. Click **Save** | Validation error; settings not saved | [ ] | ⬜ |
| 12.5 | ❌ Negative | Non-pharmacy role accesses settings | 1. Login as driver 2. Navigate to `/p/settings` | Redirect or 403 | [ ] | ⬜ |

---

## 13. Driver — Dashboard & Batch Pickup

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 13.1 | ✅ Positive | View assigned batches | 1. Login as driver 2. Navigate to `/d` | Assigned batches list visible | [ ] | ⬜ |
| 13.2 | ✅ Positive | Confirm batch pickup with PIN | 1. Select batch 2. Enter correct PIN 3. Submit pickup form | Batch status → In Transit | [ ] | ⬜ |
| 13.3 | ❌ Negative | Confirm pickup with wrong PIN | 1. Enter incorrect PIN 2. Submit | Error: "Invalid PIN" | [ ] | ⬜ |
| 13.4 | ❌ Negative | Driver sees only own batches | 1. Login as Driver A | Batches assigned to Driver B not visible | [ ] | ⬜ |

---

## 14. Driver — Delivery Flow (OTP)

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 14.1 | ✅ Positive | Start delivery | 1. Select picked-up batch 2. Click **Start Delivery** | Delivery status → Active | [ ] | ⬜ |
| 14.2 | ✅ Positive | Send OTP to customer | 1. On active delivery, click **Send OTP** | OTP sent via WhatsApp to customer | [ ] | ⬜ |
| 14.3 | ✅ Positive | Verify correct OTP | 1. Enter OTP customer received 2. Click **Verify** | Delivery status → Delivered | [ ] | ⬜ |
| 14.4 | ✅ Positive | Upload proof-of-delivery photo | 1. On delivery completion, upload photo | Photo uploaded; POD link available | [ ] | ⬜ |
| 14.5 | ❌ Negative | Verify wrong OTP | 1. Enter incorrect OTP 2. Click **Verify** | Error: "Invalid OTP" | [ ] | ⬜ |
| 14.6 | ✅ Positive | Mark delivery as failed | 1. Click **Report Failure** 2. Select reason 3. Submit | Delivery status → Failed; failure logged | [ ] | ⬜ |
| 14.7 | ❌ Negative | Submit failure without selecting reason | 1. Click **Report Failure** 2. Submit without reason | Validation error on reason field | [ ] | ⬜ |

---

## 15. Driver — Push Notifications

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 15.1 | ✅ Positive | Subscribe to push notifications | 1. Login as driver 2. Allow browser notification permission | Subscription saved; no error | [ ] | ⬜ |
| 15.2 | ✅ Positive | Receive push on batch assignment | 1. Admin assigns order/batch to driver | Driver receives push notification | [ ] | ⬜ |
| 15.3 | ✅ Positive | Unsubscribe from notifications | 1. Driver denies/revokes notification permission | Subscription removed from DB | [ ] | ⬜ |
| 15.4 | ❌ Negative | Push with denied browser permission | 1. Block notification permission 2. Admin assigns batch | No crash; graceful failure; no push sent | [ ] | ⬜ |

---

## 16. Customer — Address Submission

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 16.1 | ✅ Positive | Submit address via WhatsApp link | 1. Open address link (`/address/[token]`) 2. Fill address form 3. Submit | Success message; address saved | [ ] | ⬜ |
| 16.2 | ❌ Negative | Access expired or invalid token | 1. Manually modify token in URL | Error: "Invalid or expired link" | [ ] | ⬜ |
| 16.3 | ❌ Negative | Submit empty address form | 1. Open valid address link 2. Click **Submit** without filling | Validation errors on required fields | [ ] | ⬜ |
| 16.4 | ✅ Positive | Address reminder sent for pending addresses | 1. Order with missing address exists 2. Reminder cron fires (`/api/reminders/address`) | WhatsApp reminder sent to customer | [ ] | ⬜ |

---

## 17. Customer — Order Rating

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 17.1 | ✅ Positive | Rate delivered order | 1. Order status = Delivered 2. Customer submits rating | Rating saved; confirmation shown | [ ] | ⬜ |
| 17.2 | ❌ Negative | Rate non-delivered order | 1. Attempt to rate pending/in-transit order | Error or rating option not available | [ ] | ⬜ |

---

## 18. Locale / Language Switcher

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 18.1 | ✅ Positive | Switch locale | 1. Click locale switcher (e.g., EN → ID) | Page reloads in selected language | [ ] | ⬜ |
| 18.2 | ❌ Negative | Unsupported locale in URL | 1. Manually navigate to `/xx/login` | Fallback to default locale | [ ] | ⬜ |

---

## 19. POD Photo — Upload & View

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 19.1 | ✅ Positive | Driver uploads POD photo | 1. On delivery completion screen 2. Select/capture photo 3. Submit | Photo uploaded to S3; presigned URL generated | [ ] | ⬜ |
| 19.2 | ✅ Positive | Admin/pharmacy views POD photo | 1. Click POD link on order row | Photo opens via presigned URL | [ ] | ⬜ |
| 19.3 | ❌ Negative | Upload file exceeding size limit | 1. Select file > allowed size | Error: "File too large" | [ ] | ⬜ |
| 19.4 | ❌ Negative | View POD without authentication | 1. Clear session 2. Access POD URL directly | Redirect to login | [ ] | ⬜ |

---

## 20. Health & API Endpoints

| # | Type | Detail Scenario | Steps | Expected Result | Evidence | Status |
|---|------|-----------------|-------|-----------------|----------|--------|
| 20.1 | ✅ Positive | Health check endpoint | 1. GET `/api/health` | Response: `200 OK` with healthy status | [ ] | ⬜ |
| 20.2 | ✅ Positive | VAPID key endpoint | 1. GET `/api/push/vapid-key` | Returns public VAPID key | [ ] | ⬜ |
| 20.3 | ❌ Negative | Analytics endpoint without auth | 1. GET `/api/analytics` without session cookie | `401 Unauthorized` | [ ] | ⬜ |
