# Architecture

This document provides an overview of the Footprint system architecture, folder structure, and key design decisions.

## System Overview

Footprint is a **monorepo** containing a React frontend and a Node.js/Express backend that communicate via REST APIs.

```
┌─────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         React Frontend (Port 3000)              │    │
│  │  - React Router for navigation                  │    │
│  │  - Axios for HTTP requests                      │    │
│  │  - JWT token in localStorage                    │    │
│  └────────────────────┬───────────────────────────┘    │
└────────────────────────┼──────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ (JWT in headers)
                         │
┌────────────────────────▼──────────────────────────────┐
│         Express Backend (Port 4000)                    │
│  ┌──────────────────────────────────────────────┐    │
│  │  Middleware Layer                            │    │
│  │  - CORS                                      │    │
│  │  - JSON parser                               │    │
│  │  - Auth middleware (JWT verification)        │    │
│  │  - Admin middleware (role check)             │    │
│  └────────────────┬─────────────────────────────┘    │
│                   │                                    │
│  ┌────────────────▼─────────────────────────────┐    │
│  │  Routers                                     │    │
│  │  - /api/users        /api/orders             │    │
│  │  - /api/products     /api/admin              │    │
│  │  - /api/tags         /api/brands             │    │
│  │  - /api/colors       /api/promos             │    │
│  │  - /api/faqs         /api/checkout-attempts  │    │
│  └────────────────┬─────────────────────────────┘    │
│                   │                                    │
│  ┌────────────────▼─────────────────────────────┐    │
│  │  Models (Mongoose)                           │    │
│  │  - UserModel, ProductModel, OrderModel       │    │
│  │  - TagModel, BrandModel, ColorModel          │    │
│  │  - PromoModel, FAQModel, CheckoutAttemptModel│    │
│  └────────────────┬─────────────────────────────┘    │
└────────────────────┼──────────────────────────────────┘
                     │
                     │ MongoDB Driver
                     │
┌────────────────────▼──────────────────────────────────┐
│               MongoDB Database                         │
│  Collections: users, products, orders, tags,           │
│               brands, colors, promos, faqs,            │
│               checkoutattempts                         │
└────────────────────────────────────────────────────────┘
```

## Project Structure

```
footwear-app/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── server.js                # Entry point
│   │   ├── config/
│   │   │   └── database.config.js
│   │   ├── constants/
│   │   │   ├── httpStatus.js
│   │   │   ├── orderStatus.js
│   │   │   └── ports.js
│   │   ├── middleware/
│   │   │   ├── auth.mid.js          # JWT authentication
│   │   │   └── admin.mid.js         # Admin authorization
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── product.model.js
│   │   │   ├── order.model.js
│   │   │   ├── tag.model.js
│   │   │   ├── brand.model.js
│   │   │   ├── color.model.js
│   │   │   ├── promo.model.js
│   │   │   ├── faq.model.js
│   │   │   └── checkoutAttempt.model.js
│   │   ├── routers/
│   │   │   ├── user.router.js       # Auth & user management
│   │   │   ├── product.router.js    # Product CRUD + variants
│   │   │   ├── order.router.js      # Orders + PayPal capture
│   │   │   ├── tag.router.js        # Tag taxonomy
│   │   │   ├── brand.router.js      # Brand taxonomy
│   │   │   ├── color.router.js      # Color taxonomy
│   │   │   ├── promo.router.js      # Promo codes
│   │   │   ├── faq.router.js        # FAQ entries
│   │   │   ├── checkoutAttempt.router.js
│   │   │   └── admin.router.js      # Admin-only operations
│   │   ├── services/
│   │   │   └── paypal.service.js    # OAuth + capture verification
│   │   └── utils/
│   │       └── orderToken.js        # Guest order JWT
│   ├── .env                         # Environment variables (not in git)
│   └── package.json
│
├── frontend/                        # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js                 # React entry point
│   │   ├── App.js                   # Root component
│   │   ├── AppRoutes.js             # Route definitions
│   │   ├── components/              # Reusable components
│   │   │   ├── Header/  Footer/  Loading/  Title/
│   │   │   ├── Thumbnails/          # Product grid
│   │   │   ├── Filters/  Search/  SearchInput/  Tags/
│   │   │   ├── VariantSelector/  VariantsEditor/  ImagesEditor/
│   │   │   ├── PayPalButtons/  Price/
│   │   │   ├── AdminTaxonomy/       # Shared list/input for taxonomies
│   │   │   ├── ProductsList/  ProductInput/  ProductAdd/
│   │   │   ├── TagsList/  TagInput/  BrandsList/  BrandInput/
│   │   │   ├── ColorsList/  ColorInput/  PromosList/  PromoInput/
│   │   │   ├── FAQsList/  FAQInput/
│   │   │   ├── OrdersList/  OrderItemsList/
│   │   │   ├── UserList/  UserInput/
│   │   │   ├── AuthRoute/  AdminRoute/  CustomerRoute/
│   │   │   ├── Input/  InputContainer/  Button/  ConfirmationDialog/
│   │   │   └── NotFound/
│   │   ├── pages/                   # Route components
│   │   │   ├── Home/                # Browse + filter
│   │   │   ├── Product/             # Product detail
│   │   │   ├── Cart/
│   │   │   ├── Checkout/            # Single-step COD or PayPal
│   │   │   ├── Login/  Register/
│   │   │   ├── Profile/             # Profile + order history
│   │   │   ├── Contact/             # Demo contact form
│   │   │   └── Admin/               # Admin sub-pages
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Auth state & methods
│   │   │   ├── useCart.js           # Cart state
│   │   │   ├── useDocumentTitle.js
│   │   │   └── useLoading.js
│   │   ├── services/                # API clients
│   │   │   ├── userService.js     productService.js
│   │   │   ├── orderService.js    tagService.js
│   │   │   ├── brandService.js    colorService.js
│   │   │   ├── promoService.js    faqService.js
│   │   │   └── checkoutService.js
│   │   ├── utils/
│   │   │   ├── analytics.js         # Client-side aggregation
│   │   │   ├── dateWindow.js
│   │   │   └── facets.js
│   │   └── interceptors/
│   │       ├── authInterceptor.js   # Adds access_token header
│   │       └── loadingInterceptor.js
│   └── package.json
│
├── docs/                            # Documentation
├── README.md
└── .gitignore
```

## Backend Architecture

### Entry Point: `server.js`

The server initialization flow:

```javascript
1. Load environment variables (dotenv)
2. Connect to MongoDB
3. Initialize Express app
4. Configure middleware (CORS, JSON parser)
5. Register routers
6. Start listening on port 4000
```

### Middleware Stack

Requests flow through middleware in this order:

```
1. CORS middleware (allows requests from localhost:3000)
2. express.json() (parses JSON bodies)
3. Route-specific middleware:
   - auth.mid.js (validates JWT token from access_token header)
   - admin.mid.js (checks admin role)
4. Route handler
5. Global error handler (formats ValidationError → 400)
6. Response sent to client
```

### Data Models

**User Model** (`user.model.js`):
```javascript
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed with bcryptjs)
  address: String
  isAdmin: Boolean (default: false)
  timestamps: true
}
```

**Product Model** (`product.model.js`):
```javascript
{
  name: String (required)
  description: String
  price: Number (required, RSD)
  brand: ObjectId → Brand
  gender: String (men / women / unisex / kids)
  category: String
  tags: [ObjectId] → Tag
  images: [String] (URLs)
  variants: [{
    size: String (required)
    color: ObjectId → Color (required)
    stock: Number (required, default 0)
  }]
  timestamps: true
}
```

**Order Model** (`order.model.js`):
```javascript
{
  name: String (required)
  email: String
  guestEmail: String (set when user is null)
  address: String (required)
  phone: String (required for COD)
  paymentMethod: String ("COD" | "PAYPAL")
  paypalOrderId: String (set after PayPal create)
  paymentId: String (set after PayPal capture)
  subtotal, shipping, discount, total: Number
  promoCode: String
  items: [OrderItemSchema]
  status: String (default: "NEW")
  user: ObjectId → User (null for guest)
  timestamps: true
}

OrderItemSchema:
{
  product: ProductSnapshot (embedded snapshot — name, price, image, brand)
  size: String, color: String
  quantity: Number, price: Number
}
```

**Taxonomy models** (Tag, Brand, Color, Promo, FAQ): small documents with `name` (unique) and entity-specific fields (e.g. `hex` on Color, `percent` + `active` on Promo).

### API Router Organization

**Public routes** — no authentication required:
- `POST /api/users/login`, `POST /api/users/register`
- `GET /api/products/*`, `GET /api/tags`, `GET /api/brands`, `GET /api/colors`, `GET /api/faqs`
- `POST /api/promos/validate`
- `POST /api/orders` (guest checkout supported via `guestEmail`)
- `GET /api/orders/:id?t=<token>` (guest order lookup via signed JWT)

**Protected routes** — require authentication:
- `GET /api/users/getuser`, `PUT /api/users/profile`
- `POST /api/orders` (when logged in), `PUT /api/orders/pay`
- `GET /api/orders/track/:id` (owner only)

**Admin routes** — require admin role:
- `/api/admin/*` (users list, role toggle, analytics, order status changes)
- `POST/PUT/DELETE /api/products/*`, and the same on `/api/tags`, `/api/brands`, `/api/colors`, `/api/promos`, `/api/faqs`

## Frontend Architecture

### Component Hierarchy

```
App.js
├── Header (Navigation, cart count)
├── Loading (Global loading indicator)
├── AppRoutes (React Router)
│   ├── Public routes
│   │   ├── HomePage           (browse + filter)
│   │   ├── ProductPage        (variant selection, add-to-cart)
│   │   ├── CartPage
│   │   ├── LoginPage / RegisterPage
│   │   ├── ContactPage / FAQ
│   │   └── 404 (NotFound)
│   ├── CustomerRoute (logged-in users)
│   │   └── CheckoutPage       (COD or PayPal)
│   ├── AuthRoute (logged-in users)
│   │   └── ProfilePage        (profile + order history)
│   └── AdminRoute (admins only)
│       ├── AdminHomePage / AnalyticsPage
│       ├── Users / Products / Orders
│       └── Tags / Brands / Colors / Promos / FAQs
└── Footer
```

### State Management

**Global state:**
- **Auth** — `useAuth` hook (Context). User stored in `localStorage`. Provides `user`, `login()`, `logout()`, `register()`.
- **Cart** — `useCart` hook (Context). Cart stored in `localStorage`. Variant-aware.
- **Loading** — `useLoading` hook (Context). Drives the global loading bar from Axios interceptors.

**Local state:** components manage UI state with `useState` and React Hook Form.

### Service Layer

Each backend domain has a matching service module under `frontend/src/services/`. They wrap Axios calls and return typed-shaped data to the components. The taxonomy services (`tagService`, `brandService`, `colorService`, `promoService`, `faqService`) share the same shape so `AdminTaxonomyList` / `AdminTaxonomyInput` can drive all of them.

### Routing Strategy

- **Public routes** — accessible to everyone
- **CustomerRoute** — gates `/cart` and `/checkout` to logged-in users
- **AuthRoute** — gates `/profile`
- **AdminRoute** — gates admin pages; redirects non-admins to `/`

Route protection is enforced **both** on frontend (UX) and backend (security).

### Axios Interceptors

- **`authInterceptor.js`** — request interceptor; reads JWT from `localStorage` and adds it as the `access_token` header.
- **`loadingInterceptor.js`** — toggles the global loading bar on request start/finish.

### Analytics

`frontend/src/utils/analytics.js` aggregates orders + products in memory (revenue trend, top products, category split, top sizes/brands) so the admin Analytics page can drive Recharts without extra backend endpoints. Adequate at college-project dataset size.

## Key Design Decisions

### Why JWT in `access_token` header (not `Authorization: Bearer`)?
The custom header is what the project started with and what `auth.mid.js` reads. The frontend interceptor and every doc/example mirrors that.

### Why server-authoritative pricing?
The client posts the cart, but `order.router.js` recomputes subtotal/discount/shipping/total from the current `Product` documents before saving. A tampered client price never reaches the order.

### Why atomic stock decrement with rollback?
No replica-set transactions are assumed. The router does sequential `findOneAndUpdate` `$inc` operations per variant; if any one fails the prior decrements are reversed in code. Trades the cleanliness of a transaction for portability.

### Why server-verified PayPal capture?
On `PUT /api/orders/pay` the backend re-fetches the order from PayPal (`GET /v2/checkout/orders/:id`) and asserts `status === COMPLETED` and amount match before flipping `status` to `PAYED`. A client claiming "I paid" is never enough.

### Why guest checkout via signed JWT?
Guests don't have accounts to associate with their orders. The order returns a JWT token; the order detail page accepts `?t=<token>` to authorize lookup without an account.

### Why localStorage for auth/cart?
Persists across sessions; simple. Trade-off: XSS exposure — for a college project this is acceptable.

### Why React Context (not Redux)?
Global state is small (auth, cart, loading). Context avoids the Redux boilerplate.

### Why Mongoose?
Schema validation, virtuals, middleware hooks (e.g. password hashing), and easier MongoDB queries.

### Why monorepo?
Single repo for related frontend/backend, shared docs, simpler workflow.

## Security Considerations

1. **Passwords** — hashed with bcryptjs (10 salt rounds).
2. **JWT secret** — stored in `JWT_SECRET` env var.
3. **CORS** — restricted to `http://localhost:3000` in dev.
4. **Auth middleware** — validates JWT on protected routes; admin middleware double-checks the role flag.
5. **Server-authoritative pricing** — totals recomputed server-side, ignoring client-supplied values.
6. **PayPal capture verification** — backend re-fetches and asserts on capture status + amount.
7. **PayPal secret** — `PAYPAL_CLIENT_SECRET` only lives in `backend/.env`; the frontend only sees the public `REACT_APP_PAYPAL_CLIENT_ID`.
8. **Input validation** — Mongoose schema validators + ObjectId checks at router level.

## Performance Considerations

1. **MongoDB indexes** — unique index on user email, on taxonomy names.
2. **Cached PayPal token** — `paypal.service.js` caches the OAuth2 token until expiry.
3. **Client-side analytics** — avoids extra backend round-trips at current data volume.
4. **Frontend build** — production build minifies and code-splits.

## Future Architecture Improvements

- Refresh tokens
- Rate limiting on `/login` and `/register`
- Server-side pagination + filtering for admin lists as data grows
- Server-side analytics endpoints (move computation off the client)
- Real-time order status (WebSockets)
- Replica-set Mongo + true multi-document transactions for the stock decrement
- Image upload (currently URL-only)
