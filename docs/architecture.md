# Architecture

This document provides an overview of the WOT-projekat system architecture, folder structure, and key design decisions.

## System Overview

WOT-projekat is a **monorepo** containing a React frontend and Node.js/Express backend that communicate via REST APIs.

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
│         Express Backend (Port 5000)                    │
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
│  │  - /api/users                                │    │
│  │  - /api/foods                                │    │
│  │  - /api/orders                               │    │
│  │  - /api/admin                                │    │
│  └────────────────┬─────────────────────────────┘    │
│                   │                                    │
│  ┌────────────────▼─────────────────────────────┐    │
│  │  Models (Mongoose)                           │    │
│  │  - UserModel                                 │    │
│  │  - FoodModel                                 │    │
│  │  - OrderModel                                │    │
│  └────────────────┬─────────────────────────────┘    │
└────────────────────┼──────────────────────────────────┘
                     │
                     │ MongoDB Driver
                     │
┌────────────────────▼──────────────────────────────────┐
│               MongoDB Database                         │
│  Collections: users, foods, orders                     │
└────────────────────────────────────────────────────────┘
```

## Project Structure

```
wot-project/
├── backend/                      # Node.js/Express backend
│   ├── src/
│   │   ├── server.js            # Entry point
│   │   ├── config/
│   │   │   └── database.config.js
│   │   ├── constants/
│   │   │   ├── httpStatus.js
│   │   │   ├── orderStatus.js
│   │   │   └── ports.js
│   │   ├── middleware/
│   │   │   ├── auth.mid.js      # JWT authentication
│   │   │   └── admin.mid.js     # Admin authorization
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── food.model.js
│   │   │   └── order.model.js
│   │   ├── routers/
│   │   │   ├── user.router.js   # Auth & user management
│   │   │   ├── food.router.js   # Food CRUD
│   │   │   ├── order.router.js  # Order processing
│   │   │   └── admin.router.js  # Admin operations
│   │   └── data.js              # Sample data (optional)
│   ├── .env                     # Environment variables (not in git)
│   ├── package.json
│   └── jsconfig.json
│
├── frontend/                    # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── basics/              # Static assets
│   ├── src/
│   │   ├── index.js             # React entry point
│   │   ├── App.js               # Root component
│   │   ├── AppRoutes.js         # Route definitions
│   │   ├── components/          # Reusable components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Thumbnails/      # Food grid display
│   │   │   ├── Search/
│   │   │   ├── Tags/
│   │   │   ├── AuthRoute/       # Protected route wrapper
│   │   │   ├── AdminRoute/      # Admin route wrapper
│   │   │   ├── Loading/
│   │   │   ├── PayPalButtons/
│   │   │   ├── Map/             # Leaflet map
│   │   │   └── ...
│   │   ├── pages/               # Route components
│   │   │   ├── Home/
│   │   │   ├── Food/            # Single food details
│   │   │   ├── Cart/
│   │   │   ├── Checkout/
│   │   │   ├── Payment/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Profile/
│   │   │   └── Admin/           # Admin pages
│   │   │       ├── Users/
│   │   │       ├── Meals/
│   │   │       ├── Orders/
│   │   │       ├── Tags/
│   │   │       ├── UserInfo/    # Add/edit user
│   │   │       └── MealInfo/    # Add/edit meal
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.js       # Auth state & methods
│   │   │   ├── useCart.js       # Cart state
│   │   │   └── useLoading.js    # Loading state
│   │   ├── services/            # API clients
│   │   │   ├── userService.js
│   │   │   ├── foodService.js
│   │   │   └── orderService.js
│   │   └── interceptors/        # Axios interceptors
│   │       ├── authInterceptor.js    # Adds JWT to requests
│   │       └── loadingInterceptor.js # Loading UI
│   ├── package.json
│   └── .gitignore
│
├── docs/                        # Documentation
├── README.md
├── CLAUDE.md                    # AI assistant instructions
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
6. Start listening on port 5000
```

### Middleware Stack

Requests flow through middleware in this order:

```
1. CORS middleware (allows requests from localhost:3000)
2. express.json() (parses JSON bodies)
3. Route-specific middleware:
   - auth.mid.js (validates JWT token)
   - admin.mid.js (checks admin role)
4. Route handler
5. Response sent to client
```

### Data Models

**User Model** (`user.model.js`):
```javascript
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed with bcryptjs)
  address: String (required)
  isAdmin: Boolean (default: false)
  timestamps: true (createdAt, updatedAt)
}
```

**Food Model** (`food.model.js`):
```javascript
{
  name: String (required)
  price: Number (required)
  tags: [String] (array of tags)
  imageUrl: String (required)
  cookTime: String (required)
  timestamps: true
}
```

**Order Model** (`order.model.js`):
```javascript
{
  name: String (required)
  address: String (required)
  paymentId: String (optional, from PayPal)
  totalPrice: Number (required)
  items: [OrderItemSchema] (array of order items)
  status: String (default: "NEW")
  user: ObjectId (required, references User)
  timestamps: true
}

OrderItemSchema:
{
  food: FoodSchema (embedded food document)
  price: Number (calculated: food.price * quantity)
  quantity: Number (required)
}
```

### API Router Organization

**Public Routes** - No authentication required:
- `POST /api/users/login`
- `POST /api/users/register`
- `GET /api/foods/*` (browse, search, view)

**Protected Routes** - Requires authentication:
- `POST /api/orders/create`
- `GET /api/orders/newOrderForCurrentUser`
- `PUT /api/orders/pay`

**Admin Routes** - Requires admin role:
- `/api/admin/users/*` (CRUD operations)
- `/api/admin/foods/*` (CRUD operations)
- `/api/admin/orders` (view all)

## Frontend Architecture

### Component Hierarchy

```
App.js (Theme context provider)
├── Header (Navigation, dark mode toggle)
├── Loading (Global loading indicator)
├── AppRoutes (React Router)
│   ├── Public Routes
│   │   ├── HomePage (Browse foods)
│   │   ├── FoodPage (Single food details)
│   │   ├── CartPage
│   │   ├── LoginPage
│   │   └── RegisterPage
│   ├── AuthRoute (Protected routes wrapper)
│   │   ├── CheckoutPage
│   │   └── PaymentPage
│   └── AdminRoute (Admin routes wrapper)
│       ├── UsersPage
│       ├── MealsPage
│       ├── OrdersPage
│       └── TagsPage
└── Footer
```

### State Management

**Global State:**
- **Authentication**: Managed by `useAuth` hook (Context API)
  - User data stored in localStorage
  - Provides: `user`, `login()`, `logout()`, `register()`

- **Cart**: Managed by `useCart` hook (Context API)
  - Cart data stored in localStorage
  - Provides: `cart`, `addToCart()`, `removeFromCart()`, `clearCart()`

- **Loading**: Managed by `useLoading` hook (Context API)
  - Global loading state for API calls
  - Provides: `showLoading()`, `hideLoading()`

- **Theme**: Managed by `ThemeContext` in `App.js`
  - Light/dark mode toggle
  - Provides: `theme`, `toggleTheme()`

**Local State:**
- Individual components manage their own UI state with `useState`

### Service Layer

All API calls are centralized in service modules:

**`userService.js`:**
- `login(email, password)` - Authenticate user
- `register(userData)` - Create new user
- `logout()` - Clear user from localStorage
- `getUser()` - Get current user from localStorage
- `getAllUsers()` - Admin: fetch all users
- `getUserById(id)` - Get user details
- `editUser(userData)` - Update user
- `deleteUser(userId)` - Delete user

**`foodService.js`:**
- `getAll()` - Get all foods
- `search(searchTerm)` - Search foods by name
- `getAllTags()` - Get all food tags
- `getAllByTag(tag)` - Filter foods by tag
- `getById(foodId)` - Get single food details

**`orderService.js`:**
- `createOrder(order)` - Create new order
- `getNewOrderForCurrentUser()` - Get current active order
- `pay(paymentId)` - Process payment
- `getAllOrders()` - Admin: get all orders

### Routing Strategy

**Public Routes:** Accessible to everyone
**AuthRoute:** Redirects to `/login` if not authenticated
**AdminRoute:** Redirects to `/` if not admin

Route protection is enforced **both** on frontend (UX) and backend (security).

### Axios Interceptors

**Request Interceptor** (`authInterceptor.js`):
- Automatically adds JWT token to all requests
- Reads token from localStorage
- Adds to `access_token` header

**Loading Interceptor** (`loadingInterceptor.js`):
- Shows loading indicator on request start
- Hides loading indicator on request completion/error

## Key Design Decisions

### Why JWT?
- Stateless authentication (no server-side sessions)
- Scalable (no session storage needed)
- Works well with REST APIs
- Contains user info (reduces database queries)

### Why localStorage?
- Persists across browser sessions
- Simple API
- Automatic with every page load
- Trade-off: Vulnerable to XSS (ensure input sanitization)

### Why Mongoose?
- Schema validation
- Built-in virtuals and methods
- Middleware hooks (e.g., password hashing)
- Easier MongoDB queries

### Why React Context?
- Avoid prop drilling
- Global state without Redux overhead
- Perfect for small to medium apps
- Built into React

### Why Monorepo?
- Easier to manage related frontend/backend
- Shared documentation
- Single git repository
- Simpler deployment

## Security Considerations

1. **Passwords**: Hashed with bcryptjs (10 salt rounds)
2. **JWT Secret**: Stored in environment variables
3. **CORS**: Restricted to localhost:3000 (dev) - configure for production
4. **Middleware**: Validates JWT on protected routes
5. **Admin Routes**: Double-checked (frontend + backend)
6. **Input Validation**: Mongoose schemas + MongoDB ID validation

## Performance Considerations

1. **MongoDB Indexes**: Unique index on user email
2. **React Optimization**: Lazy loading could be added for admin routes
3. **API Calls**: Centralized in service layer (easy to add caching)
4. **Frontend Build**: Production build minifies and optimizes

## Future Architecture Improvements

- Add Redis for session management
- Implement refresh tokens
- Add request rate limiting
- Add input validation library (Joi/Yup)
- Add API versioning (/api/v1/)
- Separate admin API from user API
- Add logging service (Winston/Bunyan)
- Add health check endpoints
- Implement WebSockets for real-time order tracking
