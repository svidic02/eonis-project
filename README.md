# Footprint — Footwear E-Commerce

MERN-stack footwear shop built as a university project for EONIS. A React storefront plus an admin panel; an Express + MongoDB backend with JWT auth and PayPal sandbox checkout.

## Tech Stack

**Frontend:** React (Create React App), React Router DOM, React Hook Form, Axios, CSS Modules, Recharts, React Toastify, `@paypal/react-paypal-js`

**Backend:** Node.js, Express, Mongoose (MongoDB), JSON Web Tokens, bcryptjs, PayPal REST API v2 (sandbox)

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/footprint
JWT_SECRET=<random 64+ char string>
PAYPAL_CLIENT_ID=<paypal sandbox client id>
PAYPAL_CLIENT_SECRET=<paypal sandbox client secret>
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
RSD_TO_USD=0.0091
```

Run the server:

```bash
npm run dev     # nodemon, runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (CRA-prefixed values only — never put secrets here):

```env
REACT_APP_PAYPAL_CLIENT_ID=<same as backend PAYPAL_CLIENT_ID>
REACT_APP_RSD_TO_USD=0.0091
```

Run the dev server:

```bash
npm start       # opens http://localhost:3000
```

## Features

- **Authentication** — register, login, JWT-based protected routes, role-based admin gate
- **Catalog** — products with size/color variants, search, filters (tag, brand, color, gender, category, price)
- **Cart** — persisted in `localStorage`, variant-aware
- **Checkout** — single-step form, COD or PayPal sandbox; server-authoritative pricing; promo codes; guest checkout via signed order JWT
- **PayPal** — server-side capture verification (re-fetches the order from PayPal and asserts `status === COMPLETED` + amount before flipping the order to `PAYED`)
- **Orders** — customer order history, admin order list with status transitions, atomic stock decrement with rollback
- **Admin panel** — CRUD for products, tags, brands, colors, promos, FAQs; user management; analytics dashboard (Recharts)
- **Other pages** — FAQ, Contact (demo form), 404

## Documentation

Detailed docs live in [`docs/`](./docs):

- [`getting-started.md`](./docs/getting-started.md) — setup walkthrough
- [`architecture.md`](./docs/architecture.md) — system design and folder layout
- [`api-endpoints.md`](./docs/api-endpoints.md) — REST API reference
- [`authentication.md`](./docs/authentication.md) — JWT flow + middleware
- [`admin-protection.md`](./docs/admin-protection.md) — role-based access control
- [`TRD.md`](./docs/TRD.md) — technical requirements

## License

Educational use.
