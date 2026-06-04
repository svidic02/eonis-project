# Technical Requirements Document — Footwear E-Commerce Adaptation

## 1. Project Overview

**Project:** E-commerce web shop for footwear sales (university project — EONIS)

**Starting point:** MERN stack food-ordering application (PurePlate). The existing architecture (Express + MongoDB + React) is retained; the domain is changed from food to footwear.

**Why footwear:** Product variants (size + color) create a clear, demonstrable technical problem — real-time stock visibility per variant — that competing Serbian shops fail to solve.

---

## 2. Status snapshot — 2026-05-21

| Area                                                           | Status                                 |
| -------------------------------------------------------------- | -------------------------------------- |
| Phase 1 — Rename & rebrand (food → footwear)                   | ✅ Done                                |
| Phase 2 — Variant model + selector                             | ✅ Done                                |
| Phase 3 — Cart transparency (RSD, shipping, promos, breakdown) | ✅ Done                                |
| Phase 4 — Owner analytics dashboard                            | ✅ Done                                |
| Single-step checkout + Cash on delivery                        | ✅ Done                                |
| Admin order status management                                  | ✅ Done                                |
| Admin list search + status filter pills                        | ✅ Done                                |
| Header consolidation (Catalog dropdown + icons)                | ✅ Done                                |
| Guest checkout (signed token in URL)                           | ✅ Done                                |
| PayPal payment                                                 | ⏸ Hidden (RSD not supported by PayPal) |

Brand name: **Footprint**.

---

## 3. Key Features (New / Adapted)

### 3.1 Variant Stock Visibility ✅

- Each product (shoe) has multiple variants: **size × color**, each with its own stock count.
- On the product detail page, unavailable combinations are **dynamically disabled** via `VariantSelector` — the customer never reaches checkout with an out-of-stock variant.
- When a user selects a color, only sizes with stock > 0 for that color are selectable, and vice versa.
- Order creation atomically decrements variant stock with rollback on failure (`order.router.js`).
- Cart hard-caps quantity at the variant's current stock.

### 3.2 Cart Transparency ✅

- Itemized cost in cart and checkout: **subtotal, shipping, discount, total** in **RSD** (`sr-RS` formatting).
- **Shipping rule:** flat 500 RSD, free over 8.000 RSD subtotal. Constants in both `frontend/src/constants/shipping.js` and `backend/src/constants/shipping.js` (server is authoritative).
- **Promo codes:** DB-backed (`PromoModel`), admin CRUD at `/promos`, two seeded codes (`WELCOME10` percent-off, `EONIS500` fixed-amount with min subtotal). Validation server-side; client-side codes never trusted.
- **Single-step checkout** at `/checkout`: shipping fields + payment method radio + sticky breakdown summary + **Place order** button. Successful order navigates to `/orders/:id`, cart auto-clears.
- **Cash on Delivery** is the active payment method. Order schema gains `paymentMethod` (`COD` | `PAYPAL`) and `OrderStatus.COD_PENDING`.
- PayPal radio is rendered disabled with a "Coming soon — RSD not supported" hint.

### 3.3 Owner Analytics Dashboard ✅

- Accessible only to admin users (existing `isAdmin` flag) at `/admin/analytics`.
- Time-window toggle (`Today · Week · Month · All`, persisted in localStorage under `admin.analytics.window`) re-scopes every widget. Sales/revenue aggregations exclude `CANCELED` and `REFUNDED`.
- Widgets shipped:
  - **Stat strip** — orders, units sold, revenue, average order value.
  - **Revenue trend** — line chart bucketed by day (`today`/`week`/`month`) or by week (`all`).
  - **Top products** — horizontal bar chart, ranked by units, gender filter (`All · Men · Women · Kids`), bar click → product detail.
  - **Top sizes** — bar chart over numeric size buckets, gender filter.
  - **Revenue by category** — donut across the 5 product categories.
- Implemented client-side over `getAllOrders()` / `getAll()` (products) using a shared aggregation module (`frontend/src/utils/analytics.js`); no backend aggregation endpoints needed at current dataset size.

---

## 4. Competitive Gaps Addressed

| Competitor | Missing capability                                                         | Our solution                                                               |
| ---------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Obuća.net  | No dynamic variant availability; multi-step checkout; shipping cost hidden | Real-time variant disabling; single-step checkout; all costs shown in cart |
| Obuća Saša | No per-size availability online ("call store to check"); no order tracking | Full variant stock visibility; order status tracking (existing)            |

---

## 5. Data Model

### 5.1 Product (`product.model.js`) ✅

```javascript
{
  name: String,           // e.g. "Air Max 90" — brand prefix lives in `brand` field
  brand: String,          // e.g. "Nike"
  gender: "men" | "women" | "kids",
  category: "Sneakers" | "Boots" | "Running" | "Formal" | "Sandals",
  description: String,
  price: Number,          // base price (RSD)
  tags: [String],
  images: [String],
  variants: [{
    color: String,
    size: Number,
    stock: Number,
    sku: String,          // auto-generated `${productId}-${color}-${size}`
  }],
  timestamps: true,
}
```

### 5.2 Order (`order.model.js`) ✅

```javascript
{
  name, address, paymentId,
  subtotal, shipping, discount, promoCode,   // breakdown — recomputed server-side
  totalPrice,
  items: [{ product (snapshot), price, quantity, selectedColor, selectedSize, sku }],
  status: "NEW" | "COD_PENDING" | "PAYED" | "SHIPPED" | "CANCELED" | "REFUNDED",
  paymentMethod: "COD" | "PAYPAL",
  user, timestamps: true,
}
```

### 5.3 Promo (`promo.model.js`) ✅

```javascript
{
  code: String (uppercase, unique),
  type: "PERCENT" | "FIXED",
  value: Number,           // 1-100 for PERCENT, > 0 RSD for FIXED
  minSubtotal: Number,
  active: Boolean,
  timestamps: true,
}
```

### 5.4 Seed Data ✅

- 10 sample products across men / women / kids, each with a variant matrix.
- Sample tags, colors, brands.
- Sample orders exercising NEW / COD_PENDING / PAYED / SHIPPED.
- Two sample promos (`WELCOME10`, `EONIS500`).

---

## 6. Tech Stack (unchanged)

| Layer         | Technology                                        |
| ------------- | ------------------------------------------------- |
| Frontend      | React, React Router, Axios, React Hook Form       |
| Backend       | Express, Mongoose, JWT, bcryptjs                  |
| Database      | MongoDB                                           |
| Payments      | PayPal SDK (currently disabled — RSD unsupported) |
| Maps          | Leaflet / React-Leaflet                           |
| Notifications | React Toastify                                    |

---

## 7. UX / Admin Improvements Shipped

- **Admin homepage at `/admin`:** stat tiles (Orders / Users / Products / Today's revenue), pending-attention card surfacing `NEW + COD_PENDING` order count, top-5 low-stock products with quick links, and the catalog shortcuts grid (incl. an Analytics shortcut). Admins are auto-redirected from `/` so the dashboard is the role's natural starting point. Profile page is now account-only for admins; shortcuts moved into the dashboard.
  - **Time-window toggle** (`Today · Week · Month · All`, persisted in localStorage) re-scopes the order count and revenue tiles.
  - **Deep-link CTAs** — pending card → `/orders?status=COD_PENDING`, revenue tile → `/orders?from=<window>`. `OrdersList` now drives status + date filters from URL params (shareable, back-button friendly) and surfaces a removable "From: …" chip.
  - **Stale orders card** lists `NEW`/`COD_PENDING` orders older than 7 days, top 5 sorted oldest-first, click → detail.
- **Analytics page at `/admin/analytics`:** revenue trend, top products (gender filter), top sizes (gender filter), revenue-by-category donut, and a stat strip (orders, units, revenue, AOV). Time-window toggle shared with `/admin` (separate localStorage key). Charts via Recharts; aggregation lives in `frontend/src/utils/analytics.js`. Linked from the admin header (`Analytics`) and the dashboard shortcut grid.
- **Header:** consolidated admin nav (`Users · Catalog ▾ · Orders · Analytics · Name ▾`) with inline-SVG icons; Catalog dropdown groups Products / Tags / Colors / Brands / Promos. Admin Logout grouped under the profile name dropdown to match the customer pattern.
- **Admin shell cues:** brand badge "Admin" next to the title, accent-colored 2px header border, page titles prefixed `Footprint Admin · X` (via `useDocumentTitle` hook), footer reads `Footprint Admin · signed in as <name>` for admin sessions.
- **Admin lists:** shared `<SearchInput />` on Tags, Colors, Brands, Promos, Products, Orders. OrdersList also has status filter pills (All · New · COD pending · Paid · Shipped · Canceled).
- **ConfirmationDialog:** restyled with blurred backdrop, warning icon, focus trap, scroll lock, Esc-to-cancel, distinct destructive button.
- **Product cards (Thumbnails):** show brand · name · category · gender · price + low/out-of-stock badge.
- **Product detail:** "Only N left in stock" hint when selected variant ≤ 3; "Max in cart" disabled state when a customer already holds the variant's full stock; Add To Cart hard-disabled for admins.
- **Admin product list:** `Variants N · M in stock · K low` summary, RSD prices, low-stock badges.
- **My orders:** rendered on Profile page, RSD totals, status pills (incl. `COD_PENDING`).
- **Order detail:** admin-only inline status editor (dropdown + Save). Customer view stays read-only. Differentiates 404 ("Order not found") from other errors with contextual back-link. Renders the full breakdown (subtotal · shipping · promo · total) the customer saw at checkout.
- **Cart / checkout:** Continue shopping link, ConfirmationDialog before clearing cart, client-side promo regex validation (`A-Z0-9_`, ≤30 chars) with inline hint, on-mount cart freshness pass (re-fetches each line, drops missing variants, clamps qty, re-validates the saved promo, toasts a summary).
- **Role boundaries:** `CustomerRoute` wrapper blocks admins from `/cart` and `/checkout` with a redirect + toast; `/profile` now wrapped in `AuthRoute`.
- **404:** catch-all `<Route path="*">` renders the shared `NotFound` component with "back home" CTA.
- **Guest checkout:** `/checkout` and `/orders/:id` no longer require auth. Guest orders carry a `guestEmail` and the create response includes a signed token that gates `GET /api/orders/:id?t=…`. Order page shows a "save this link" block + `mailto:` anchor for guests; admins still see the order via auth.

---

## 8. Backend Endpoints Reference

### Public / authenticated

| Method | Path                            | Purpose                                  |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/api/products`                 | List / filter products                   |
| GET    | `/api/products/:id`             | Product detail                           |
| GET    | `/api/tags` `/colors` `/brands` | Public taxonomy lists                    |
| POST   | `/api/promos/validate`          | Validate a promo code against a subtotal |
| POST   | `/api/orders/create`            | Create an order (auth)                   |
| GET    | `/api/orders/mine`              | Current user's order history (auth)      |
| GET    | `/api/orders/:id`               | Single order (auth, owner or admin)      |

### Admin (`/api/admin/*`, requires `isAdmin`)

Users · Products (incl. variants) · Orders · Status update · Tags · Colors · Brands · Promos — full CRUD.

### Not yet built

`/api/analytics/top-sellers · top-sizes · revenue · low-stock` — see §10.

---

## 9. Out of Scope (decided)

- User reviews / star ratings (component exists but not surfaced).
- Wishlist.
- Multi-language support (UI is English; product data only).
- Mobile app.
- Saved addresses on profile.
- Audit log of order status changes.

---

## 10. Future Improvements

### 10.1 Must-have before final submission

1. ~~Owner analytics dashboard (TRD §3.3).~~ ✅ Shipped — see §3.3 and §7.
2. **Admin product variants editor polish.** Variants are editable today, but a clearer UI (per-row stock, in-place save, low-stock highlight) would help the demo story.
3. **Order detail timestamps.** Show last-status-change time alongside `Placed`. Useful when demoing status transitions.
4. **Product images.** Replace seed placeholders with one real image per product so cards/detail look complete. The pipeline already exists (`seedProducts` prepends `/products/` to each entry, served by CRA from `frontend/public/products/`), but `data.js` currently ships full Unsplash URLs which produce broken `/products/https://…` paths. To finish: rewrite each product's `images` array to a bare filename (e.g. `air-max-90.jpg`), drop matching files into `frontend/public/products/`, wipe the `products` collection, and restart. ~17 files to source.

### 10.2 Optional polish (nice-to-haves)

1. **Re-enable PayPal** in EUR (with a fixed display rate or a currency switcher) for parity with TRD §6.
2. **Saved addresses on user profile** so checkout can prefill from a list.
3. **My-orders dedicated page** at `/my-orders` (currently inlined on Profile; standalone page would be cleaner).
4. **Order cancellation by customer** while status is `NEW` or `COD_PENDING`.
5. **Email or toast on status change** — at least a toast nudge when admin updates a status the customer is viewing.
6. **Wishlist / favorites** (out-of-scope today; light to add).
7. **Reviews & star ratings** — `StarRating` component already exists; surfacing it would round out the product detail page.
8. **Audit log** of order status transitions (who changed what when).
9. **Bulk admin actions** — multi-select on Orders/Products list with bulk delete or bulk status change.
10. **Server-side filtering & pagination** on admin lists once dataset grows past a few hundred rows (client-side search is enough for now).
11. **Stock low-water-mark configurable per product** instead of the global `LOW_STOCK = 5`.
12. **Persistent cart per user** (sync localStorage → server on login) so a cart survives device switches.
13. **Product compare** view — side-by-side spec table for two or three products.
14. **Out-of-stock waitlist** — let customers ask to be notified when a specific size/color is restocked.
15. **Internationalization (i18n)** — Serbian / English toggle.
16. **Accessibility audit** — keyboard nav across all admin tables, ARIA labels on icon-only buttons in the header.
17. ~~Admin landing page~~ — shipped (see §7).
18. **Customer order cancel + admin "view as customer"** preview toggle for demos.
19. **Guest checkout** — ✅ shipped (see §10.3).

### 10.3 Guest checkout ✅ (shipped)

Guests can buy without an account. `OrderModel.user` is now optional and `guestEmail` is stored on the order. `POST /api/orders/create` and `GET /api/orders/:id` use an `optionalAuth` middleware: logged-in users hit the existing owner/admin path, guests get a signed JWT (`signOrderToken`/`verifyOrderToken` in `backend/src/utils/orderToken.js`, no expiry) returned alongside the created order. The order page reads `?t=<token>` via `useSearchParams` and passes it to `getOrderById`. `/checkout` and `/orders/:id` no longer require `AuthRoute`; `/checkout` keeps `CustomerRoute` so admins still can't buy. A guest-only banner on `/checkout` links to `/login?returnUrl=/checkout`. The order page renders a "Save this link — it's your receipt" block with a `mailto:` anchor and the URL as visible text for guests.

Out of scope (intentional): transactional emails, "convert guest order to account" on register, guest order history listing, token expiry/revocation.

Buy without an account. The cart already lives in localStorage so guests can fill it; the only blockers are auth-guarded `/checkout` and `/orders/:id`. Outline of work:

**Backend**

- `OrderModel.user` → optional. Add `guestEmail: { type: String }`.
- `POST /api/orders/create` becomes optional-auth: if a JWT is present, attach `user`; otherwise require `guestEmail` in the body.
- New helper `signOrderToken(orderId)` using the existing `JWT_SECRET`. Returned in the create response.
- `GET /api/orders/:id` accepts `?t=<token>`. If the token signs to this order's `_id`, allow read; otherwise fall back to existing auth/owner check. Admin auth still wins.

**Frontend**

- Drop `AuthRoute` from `/checkout` (keep `CustomerRoute` so admins still can't buy).
- `CheckoutPage` already prefills from `useAuth()`; for guests the inputs render empty. Email + phone are already required for COD.
- On success, navigate to `/orders/<id>?t=<token>` and pass the token through `getOrderById`.
- Drop `AuthRoute` from `/orders/:id`. `OrderInfoPage` reads `?t=` from `useSearchParams` and includes it in the request.
- No new UI surface area: success toast + order detail page, exactly as today.

**Effort:** ~60 backend LOC + small frontend route/handler changes. Half a day's work.

**Trade-off accepted:** the order URL is the only handle a guest has. Close the tab without bookmarking and the order becomes unreachable to them (still visible to admins).

**Recovery: `mailto:` link on the success page.** Add a single anchor that opens the user's default mail client with the order URL pre-filled in the body — they click Send themselves, your backend never touches SMTP.

```jsx
const orderUrl = `${window.location.origin}/orders/${order._id}?t=${token}`;
const mailto =
  `mailto:?subject=${encodeURIComponent("Your Footprint order")}` +
  `&body=${encodeURIComponent(`Your order link:\n${orderUrl}`)}`;
<a href={mailto}>Email me this link</a>;
```

Render the URL as visible text on the page too, in case the user has no default mail client configured.

**Decisions (locked-in recommendations)**

- **Token style: signed JWT** (`JWT.sign({ orderId }, JWT_SECRET)`). The token's only job is to prove "bearer may read order X" — exactly what JWT is for. `JWT_SECRET` and `jsonwebtoken` are already used by `auth.mid.js`, so a 5-line `signOrderToken` / `verifyOrderToken` helper covers it. No schema change, no DB lookup on read, no second token system to maintain. Random opaque + stored only wins when revocation matters; the order page is read-only, so it doesn't.

- **Token expiry: none.** The token authorizes reading a finalized, read-only order — the customer's mental model is "the URL is my receipt". Expiring it generates "my link stopped working" support load and forces reissue UI/endpoints we don't otherwise need. Leakage is not catastrophic: the page only exposes data the customer themselves entered (name, address, phone, items) and offers no actions. If destructive customer actions ever land on the order page (cancel, edit), require fresh auth for _those actions_ rather than expiring read access.

- **Page layout: single `/checkout` for both flows.** `CheckoutPage` is driven by the cart, not by the user; the only auth-aware code is `defaultValue={user?.name}` (and email/address). For guests `user` is `null`, those defaults become `undefined`, inputs render blank — that's the entire difference. A separate `/guest-checkout` would duplicate JSX, styles, validation, and submit handling for no behavioral gain. The codebase already lazy-branches on auth state inside single components (`Header.js`, `OrderInfoPage`); checkout is the same shape. Future enhancement when desired: a small "Buying as a guest — Sign in to save your details" banner inside the same form when `!user`.

**Not in this proposal**

- Email delivery / transactional emails (`mailto:` is the recovery path).
- "Convert guest order to account" flow on register.
- Guest order history (intentionally none — that's what accounts are for).

---

## 11. Implementation Phases (historical)

| Phase | Scope                                                                          | Outcome                |
| ----- | ------------------------------------------------------------------------------ | ---------------------- |
| 1     | Rename & rebrand food → footwear                                               | ✅ Shipped             |
| 2     | Variant model + selector with disabled OOS combos                              | ✅ Shipped             |
| 3     | Cart transparency: RSD, shipping, promos, breakdown, single-step checkout, COD | ✅ Shipped             |
| 4     | Owner analytics dashboard                                                      | ✅ Shipped             |

Smaller cross-cutting work (header consolidation, list search, admin order management, profile orders, low-stock indicators) shipped after phase 3.
