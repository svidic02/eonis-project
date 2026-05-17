# Technical Requirements Document — Footwear E-Commerce Adaptation

## 1. Project Overview

**Project:** E-commerce web shop for footwear sales (university project — EONIS)

**Starting point:** MERN stack food-ordering application (PurePlate). The existing architecture (Express + MongoDB + React) is retained; the domain is changed from food to footwear.

**Why footwear:** Product variants (size + color) create a clear, demonstrable technical problem — real-time stock visibility per variant — that competing Serbian shops fail to solve.

---

## 2. Key Features (New / Adapted)

### 2.1 Variant Stock Visibility

- Each product (shoe) has multiple variants: **size × color**, each with its own stock count.
- On the product detail page, unavailable combinations are **dynamically disabled** — the customer never reaches checkout with an out-of-stock variant.
- When a user selects a color, only sizes with stock > 0 for that color are selectable, and vice versa.

### 2.2 Cart Transparency (Reduce Abandonment)

- As soon as an item is added to the cart, the user sees: **item price, shipping cost, any discounts, and total**.
- Checkout is a **single step** — no multi-page wizard. Address + payment on one screen.
- The existing cart hook (`useCart`) is extended to compute and display all cost components.

### 2.3 Owner Analytics Dashboard

- Accessible only to admin users (existing `isAdmin` flag).
- Metrics tailored to footwear:
  - Best-selling sizes and models, filterable by category (men / women / kids)
  - Revenue trend per category over time
  - Low-stock alerts per variant (size + color)
- Built as new admin pages; backend exposes aggregation endpoints.

---

## 3. Competitive Gaps Addressed

| Competitor | Missing capability                                                         | Our solution                                                               |
| ---------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Obuća.net  | No dynamic variant availability; multi-step checkout; shipping cost hidden | Real-time variant disabling; single-step checkout; all costs shown in cart |
| Obuća Saša | No per-size availability online ("call store to check"); no order tracking | Full variant stock visibility; order status tracking (existing)            |

---

## 4. Data Model Changes

### 4.1 Current: Food Model

```
name, price, tags[], imageUrl, cookTime
```

### 4.2 Target: Product Model (`product.model.js`)

```javascript
{
  name: String,           // e.g. "Nike Air Max 90"
  brand: String,          // e.g. "Nike"
  description: String,
  price: Number,          // base price
  category: String,       // "men" | "women" | "kids"
  tags: [String],         // e.g. ["Sneakers", "Running", "Casual"]
  images: [String],       // multiple product images
  variants: [{
    color: String,        // e.g. "Black"
    size: Number,         // e.g. 42
    stock: Number,        // quantity available
    sku: String           // unique variant identifier
  }],
  material: String,
  timestamps: true
}
```

### 4.3 Order Item Update

Currently stores: `food (ref), price, quantity`
Change to: `product (ref), price, quantity, selectedColor, selectedSize`

### 4.4 Seed Data

Replace `sample_foods` (burritos, pizzas) with `sample_products` (shoes with realistic variants).
Replace `sample_tags` with footwear tags: Sneakers, Formal, Sport, Running, Casual, Boots, Sandals, etc.

---

## 5. Renaming Map

### 5.1 Backend Files

| Current                           | Target                        |
| --------------------------------- | ----------------------------- |
| `models/food.model.js`            | `models/product.model.js`     |
| `routers/food.router.js`          | `routers/product.router.js`   |
| `data.js` → `sample_foods`        | `data.js` → `sample_products` |
| API path `/api/foods`             | `/api/products`               |
| `server.js` food router import    | product router import         |
| `database.config.js` Food seeding | Product seeding               |

### 5.2 Frontend Files

| Current                   | Target                       |
| ------------------------- | ---------------------------- |
| `services/foodService.js` | `services/productService.js` |
| `pages/Food/`             | `pages/Product/`             |
| `pages/Admin/Meals/`      | `pages/Admin/Products/`      |
| `pages/Admin/MealInfo/`   | `pages/Admin/ProductInfo/`   |
| `components/MealsList/`   | `components/ProductsList/`   |
| `components/MealInput/`   | `components/ProductInput/`   |
| `components/MealAdd/`     | `components/ProductAdd/`     |
| `public/foods/`           | `public/products/`           |

### 5.3 Route Paths (AppRoutes.js)

| Current      | Target                  |
| ------------ | ----------------------- |
| `/food/:id`  | `/product/:id`          |
| `/meals`     | `/products` (admin)     |
| `/meals/:id` | `/products/:id` (admin) |
| `/meal/add`  | `/product/add` (admin)  |

### 5.4 Branding

- Header: **"PurePlate"** → new footwear brand name (TBD)
- Nav links: "Meals" → "Products" / "Shoes"
- All UI text referencing food terminology

---

## 6. New Backend Endpoints

### 6.1 Product Endpoints (replace food endpoints)

All existing food endpoints carry over with renamed paths. Additionally:

| Method | Path                         | Purpose                           |
| ------ | ---------------------------- | --------------------------------- |
| `GET`  | `/api/products/:id/variants` | Get available variants with stock |
| `PUT`  | `/api/products/:id/variants` | Admin: update variant stock       |

### 6.2 Analytics Endpoints (new)

| Method | Path                         | Purpose                                       |
| ------ | ---------------------------- | --------------------------------------------- |
| `GET`  | `/api/analytics/top-sellers` | Best-selling products, filterable by category |
| `GET`  | `/api/analytics/top-sizes`   | Most popular sizes, filterable by category    |
| `GET`  | `/api/analytics/revenue`     | Revenue over time, grouped by category        |
| `GET`  | `/api/analytics/low-stock`   | Variants with stock below threshold           |

All analytics endpoints require admin auth.

---

## 7. New Frontend Pages / Components

| Component                               | Purpose                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| `ProductPage` (replaces FoodPage)       | Product detail with variant selector (color/size grid)                       |
| `VariantSelector`                       | Color + size picker with disabled states for out-of-stock                    |
| `CartSummary` (enhanced)                | Shows itemized costs: subtotal, shipping, discounts, total                   |
| `Admin/Analytics`                       | Dashboard page with charts for sales, sizes, revenue, stock alerts           |
| `Admin/ProductInfo` (replaces MealInfo) | Product form with variant management (add/edit/remove size-color-stock rows) |

---

## 8. Implementation Phases

### Phase 1 — Rename & Rebrand

- Rename all files, variables, routes, and UI text from food → product/footwear.
- Update seed data with sample shoe products and footwear tags.
- Verify the app runs identically with the new naming.

### Phase 2 — Variant Model

- Extend Product schema with `variants[]`, `brand`, `category`, `description`, `images[]`.
- Update seed data with variant entries (size × color × stock).
- Update admin CRUD forms for the new fields.
- Build VariantSelector component on product detail page.

### Phase 3 — Cart Transparency

- Extend `useCart` hook to include shipping calculation and discount logic.
- Redesign cart page to show full cost breakdown.
- Merge checkout into a single-step flow (address + payment on one page).

### Phase 4 — Analytics Dashboard

- Create aggregation endpoints on the backend.
- Build admin analytics page with charts (consider recharts or chart.js).
- Add low-stock alert indicators.

---

## 9. Tech Stack (Unchanged)

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Frontend      | React, React Router, Axios, React Hook Form     |
| Backend       | Express, Mongoose, JWT (jsonwebtoken), bcryptjs |
| Database      | MongoDB                                         |
| Payments      | PayPal SDK                                      |
| Maps          | Leaflet / React-Leaflet                         |
| Notifications | React Toastify                                  |

---

## 10. Out of Scope

- User reviews / ratings (StarRating component exists but not prioritized)
- Wishlist functionality
- Multi-language support
- Mobile app
