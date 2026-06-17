# API Endpoints

Complete reference for all REST API endpoints in the Footprint backend.

**Base URL:** `http://localhost:4000/api`

## Authentication

All protected endpoints require a JWT token in the `access_token` header:

```
Headers:
  access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Some endpoints accept optional authentication — they enrich the response if a valid token is present, but won't reject anonymous callers. Guest order lookup uses a signed JWT order token passed as `?t=<token>` instead of `access_token`.

## Response Format

Most success responses return JSON directly (no wrapping envelope). Error responses are plain-text status messages from the corresponding HTTP error code.

---

## User Endpoints

### `POST /api/users/login`
Authenticate. **Public.**

Request:
```json
{ "email": "user@example.com", "password": "password123" }
```

Response (200):
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "isAdmin": false,
  "token": "eyJhbGciOi..."
}
```

Errors: 400 `Username or password is invalid.`

---

### `POST /api/users/register`
Create a new account. **Public.**

Request:
```json
{ "name": "John", "email": "user@example.com", "password": "password123", "address": "123 Main St" }
```

Response (200): same shape as `/login`.
Errors: 400 `User already exists!`

---

### `GET /api/users` (admin path is `/api/admin/users` — see Admin Endpoints)
Return all users. **Admin.**

---

### `PUT /api/users/me`
Update the current user's own profile (name, email, address, password). **Auth required.**

Request:
```json
{ "name": "...", "email": "...", "address": "...", "password": "..." }
```
Returns a fresh user payload + token (same shape as login).

---

## Product Endpoints

### `GET /api/products`
List all products. **Public.** Supports query parameters for filtering (tag, brand, color, gender, category, price range — see the implementation in `product.router.js`).

### `GET /api/products/tags`
Returns all tags with product counts (used by the home page filter chip row). **Public.**

### `GET /api/products/search/:searchTerm`
Case-insensitive substring search on product name. **Public.**

### `GET /api/products/tag/:tag`
All products carrying the given tag. **Public.**

### `GET /api/products/:productId`
Single product detail (variants, images, brand, etc.). **Public.**

### `GET /api/products/:productId/variants`
Variant-only payload (size, color, stock) for the given product. **Public.**

---

## Promo Endpoints

### `POST /api/promos/validate`
Validate a promo code against the cart and return discount info. **Public.**

Request:
```json
{ "code": "SUMMER10", "subtotal": 5000 }
```

---

## Order Endpoints

### `GET /api/orders/mine`
List orders belonging to the current user. **Auth required.**

### `GET /api/orders/:id`
Fetch a single order. **Auth required** for owner; **public via token** for guest orders when called with `?t=<order-jwt>`.

### `POST /api/orders/create`
Create a new order. **Auth required** for registered customers; guest checkout accepted when `guestEmail` is in the body.

The server is authoritative — it recomputes subtotal, shipping, discount, and total from the current product documents and only persists those values. It also atomically decrements stock per variant with rollback on partial failure.

Request:
```json
{
  "name": "John Doe",
  "email": "buyer@example.com",
  "guestEmail": null,
  "address": "123 Main St",
  "phone": "+381...",
  "paymentMethod": "COD",
  "promoCode": "SUMMER10",
  "items": [
    { "productId": "...", "size": "42", "colorId": "...", "quantity": 1 }
  ]
}
```

Response (200): the persisted order with computed totals, status (`NEW` for PayPal, `COD_PENDING` for COD), and — for guest orders — an `orderToken` to use as `?t=` later.

### `PUT /api/orders/pay`
Verify a PayPal capture and flip the order to `PAYED`. **Auth required** for registered orders; **token-authorized** for guest orders.

Request:
```json
{ "orderId": "...", "paypalOrderId": "..." }
```

The backend re-fetches the PayPal order via `GET /v2/checkout/orders/:id` and asserts `status === COMPLETED` plus amount match before changing state. A client claim of payment is never trusted.

Errors: 400 / 422 if PayPal verification fails.

---

## Taxonomy Endpoints (public reads)

### `GET /api/tags`
All tags.

### `GET /api/brands`
All brands.

### `GET /api/colors`
All colors (`name`, `hex`).

### `GET /api/faqs`
All published FAQ entries.

Write methods for these collections live under `/api/admin/*` — see below.

---

## Checkout Attempt Endpoints

### `POST /api/checkout-attempts`
Logs a checkout step (used for funnel analytics on the admin dashboard). **Public.**

---

## Admin Endpoints

All `/api/admin/*` routes require both authentication and the admin role.

### Users
- `GET /api/admin/users` — list all users
- `GET /api/admin/users/:id` — get user by ID
- `PUT /api/admin/users/:id` — update user (including `isAdmin` toggle)
- `DELETE /api/admin/users/:id` — delete user

### Products
- `POST /api/admin/products` — create product
- `PUT /api/admin/products/:productId` — update product
- `PUT /api/admin/products/:productId/variants` — replace the variant list
- `DELETE /api/admin/products/:productId` — delete product

### Orders
- `GET /api/admin/orders` — list all orders
- `PUT /api/admin/orders/:id/status` — change order status (see status table below)

### Tags / Brands / Colors / Promos / FAQs
The same shape applies to each taxonomy. Examples:
- `POST /api/admin/tags`, `PUT /api/admin/tags/:id`, `DELETE /api/admin/tags/:id`
- `POST /api/admin/brands`, `PUT /api/admin/brands/:id`, `DELETE /api/admin/brands/:id`
- `POST /api/admin/colors`, `PUT /api/admin/colors/:id`, `DELETE /api/admin/colors/:id`
- `GET /api/admin/promos`, `POST /api/admin/promos`, `PUT /api/admin/promos/:id`, `DELETE /api/admin/promos/:id`
- `POST /api/admin/faqs`, `PUT /api/admin/faqs/:id`, `DELETE /api/admin/faqs/:id`

A 409 is returned on uniqueness conflicts (e.g. duplicate tag/brand/color name).

### Checkout attempts (analytics raw data)
- `GET /api/admin/checkout-attempts` — list logged checkout funnel events

---

## Status Codes

| Code | Meaning                  |
|------|--------------------------|
| 200  | OK                       |
| 400  | Bad Request              |
| 401  | Unauthorized (no token)  |
| 403  | Forbidden (not admin)    |
| 404  | Not Found                |
| 409  | Conflict (uniqueness)    |
| 422  | PayPal verification failed |
| 500  | Internal Server Error    |

## Order Status Values

| Status        | Description                                  |
|---------------|----------------------------------------------|
| NEW           | PayPal order created, awaiting capture       |
| COD_PENDING   | Cash-on-delivery order awaiting fulfillment  |
| PAYED         | Payment captured and verified                |
| SHIPPED       | Order shipped                                |
| DELIVERED     | Order delivered                              |
| CANCELED      | Order canceled                               |
| REFUNDED      | Order refunded                               |

## Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**List products:**
```bash
curl http://localhost:4000/api/products
```

**Create order (authenticated):**
```bash
curl -X POST http://localhost:4000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "access_token: YOUR_JWT_TOKEN" \
  -d '{ "name": "John", "address": "123 St", "phone": "+381...", "paymentMethod": "COD", "items": [...] }'
```

**List all users (admin):**
```bash
curl http://localhost:4000/api/admin/users \
  -H "access_token: ADMIN_JWT_TOKEN"
```

**Look up a guest order:**
```bash
curl "http://localhost:4000/api/orders/<orderId>?t=<orderToken>"
```

## Testing with Postman

1. Create a new request
2. Set method (GET, POST, PUT, DELETE)
3. Set URL: `http://localhost:4000/api/...`
4. Add headers:
   - `Content-Type: application/json`
   - `access_token: YOUR_JWT_TOKEN` (for protected routes)
5. Add request body (JSON) for POST/PUT
6. Send request

## Notes

- All timestamps are ISO 8601 (UTC)
- MongoDB ObjectIds are 24-character hex strings
- JWT tokens expire in 30 days
- Password hashing uses bcryptjs with 10 salt rounds
- CORS is enabled for `http://localhost:3000`
- PayPal sandbox uses `PAYPAL_API_BASE=https://api-m.sandbox.paypal.com`
