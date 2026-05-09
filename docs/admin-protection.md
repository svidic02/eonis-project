# Admin Protection

This document explains how admin routes are protected in the WOT-projekat application using role-based access control.

## Overview

Admin protection ensures that only users with the `isAdmin: true` flag can access administrative functions. Protection is enforced on **both** frontend and backend:

- **Frontend:** UX protection (redirects non-admins)
- **Backend:** Security protection (validates admin role)

**Both layers are necessary** - frontend for user experience, backend for actual security.

---

## Admin Middleware

### Backend: `admin.mid.js`

This middleware checks if the authenticated user has admin privileges.

**File:** `backend/src/middleware/admin.mid.js`

```javascript
import { UNAUTHORIZED } from "../constants/httpStatus.js";

export default (req, res, next) => {
  if (!req.user) {
    return res.status(UNAUTHORIZED).send("Not authenticated");
  }

  if (!req.user.isAdmin) {
    return res.status(403).send("Admin access required");
  }

  next();
};
```

**How it works:**

1. **Check authentication** - Ensures `req.user` exists (set by `auth.mid.js`)
2. **Check admin flag** - Verifies `req.user.isAdmin === true`
3. **Allow or deny:**
   - If admin → Call `next()` to proceed to route handler
   - If not admin → Return 403 Forbidden

**Key points:**
- Must run **after** `auth.mid.js` (depends on `req.user`)
- Returns 403 (Forbidden) not 401 (Unauthorized) for non-admins
- Stateless - checks token payload, no database query needed

---

## Middleware Chain Order

Admin routes require **both** authentication and authorization middleware:

```javascript
router.use(auth);      // Step 1: Validate JWT token, set req.user
router.use(admin);     // Step 2: Check req.user.isAdmin

// Now all routes in this router are admin-protected
```

**Order is critical:**
```
Request → auth middleware → admin middleware → route handler
```

**Why this order?**
- `auth.mid.js` must run first to set `req.user`
- `admin.mid.js` depends on `req.user.isAdmin`

---

## Protected Admin Routes

### Admin Router: `admin.router.js`

All routes in this file are protected with both middleware.

**File:** `backend/src/routers/admin.router.js` (lines 15-17)

```javascript
import auth from "../middleware/auth.mid.js";
import admin from "../middleware/admin.mid.js";

const router = Router();

// Apply to ALL routes in this router
router.use(auth);
router.use(admin);

// All routes below are now admin-protected
router.get("/users", handler(async (req, res) => {
  const users = await UserModel.find();
  res.send(users);
}));
```

**Routes protected:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/foods` - Add food
- `PUT /api/admin/foods/:foodId` - Update food
- `DELETE /api/admin/foods/:foodId` - Delete food
- `GET /api/admin/orders` - View all orders

---

### Individual Route Protection

For routers with mixed public/admin routes, apply middleware to specific routes:

**File:** `backend/src/routers/food.router.js`

```javascript
import authMid from "../middleware/auth.mid.js";
import adminMid from "../middleware/admin.mid.js";

// Public route - no middleware
router.get("/", handler(async (req, res) => {
  const foods = await FoodModel.find({});
  res.send(foods);
}));

// Admin route - both middleware
router.put("/:foodId", authMid, adminMid, handler(async (req, res) => {
  // Only admins can update foods
  const meal = await FoodModel.findByIdAndUpdate(foodId, updatedMeal);
  res.send(meal);
}));

// Admin route - both middleware
router.delete("/:foodId", authMid, adminMid, handler(async (req, res) => {
  // Only admins can delete foods
  await FoodModel.findByIdAndDelete(foodId);
  res.send(result);
}));

// Admin route - both middleware
router.post("/addFood", authMid, adminMid, handler(async (req, res) => {
  // Only admins can add foods
  const result = await FoodModel.create(newMeal);
  res.send(result);
}));
```

**Pattern:**
```javascript
router.METHOD("/path", authMid, adminMid, handler(async (req, res) => {
  // Route logic
}));
```

---

### User Router Protection

**File:** `backend/src/routers/user.router.js`

```javascript
import authMid from "../middleware/auth.mid.js";
import adminMid from "../middleware/admin.mid.js";

// Public routes - no middleware
router.post("/login", handler(async (req, res) => { ... }));
router.post("/register", handler(async (req, res) => { ... }));

// Admin routes - both middleware
router.get("/", authMid, adminMid, handler(async (req, res) => {
  // Only admins can view all users
  const users = await UserModel.find();
  res.send(users);
}));

router.get("/user/:id", authMid, adminMid, handler(async (req, res) => {
  // Only admins can view any user
  const user = await UserModel.findById(id);
  res.send(user);
}));

router.put("/user/:id", authMid, adminMid, handler(async (req, res) => {
  // Only admins can update any user
  const user = await UserModel.findByIdAndUpdate(id, updatedUser);
  res.send(generateTokenResponse(user));
}));

router.delete("/user/:id", authMid, adminMid, handler(async (req, res) => {
  // Only admins can delete users
  await UserModel.findByIdAndDelete(id);
  res.send(result);
}));
```

---

## Request Flow Examples

### Example 1: Admin Accessing Protected Route

```
Admin User (isAdmin: true)
    ↓
Request: GET /api/admin/users
Headers: { access_token: "eyJ..." }
    ↓
┌─────────────────────────────────┐
│ auth.mid.js                     │
│ - Token found ✅                │
│ - Token verified ✅             │
│ - Sets req.user = {             │
│     id: "123",                  │
│     email: "admin@test.com",    │
│     isAdmin: true               │
│   }                             │
│ - Calls next() ✅               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ admin.mid.js                    │
│ - req.user exists ✅            │
│ - req.user.isAdmin is true ✅   │
│ - Calls next() ✅               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Route handler                   │
│ - Executes logic                │
│ - Returns user data             │
└─────────────────────────────────┘
    ↓
Response: 200 OK
{ users: [...] }
```

---

### Example 2: Regular User Accessing Admin Route

```
Regular User (isAdmin: false)
    ↓
Request: GET /api/admin/users
Headers: { access_token: "eyJ..." }
    ↓
┌─────────────────────────────────┐
│ auth.mid.js                     │
│ - Token found ✅                │
│ - Token verified ✅             │
│ - Sets req.user = {             │
│     id: "456",                  │
│     email: "user@test.com",     │
│     isAdmin: false              │
│   }                             │
│ - Calls next() ✅               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ admin.mid.js                    │
│ - req.user exists ✅            │
│ - req.user.isAdmin is false ❌  │
│ - Returns 403 Forbidden         │
└─────────────────────────────────┘
    ↓
Response: 403 Forbidden
"Admin access required"

(Route handler never runs)
```

---

### Example 3: Guest User Accessing Admin Route

```
Guest User (no token)
    ↓
Request: GET /api/admin/users
Headers: {} (no access_token)
    ↓
┌─────────────────────────────────┐
│ auth.mid.js                     │
│ - No token found ❌             │
│ - Returns 401 Unauthorized      │
└─────────────────────────────────┘
    ↓
Response: 401 Unauthorized

(admin.mid.js never runs)
(Route handler never runs)
```

---

## Frontend Admin Protection

### AdminRoute Component

Prevents non-admin users from accessing admin pages in the UI.

**File:** `frontend/src/components/AdminRoute/AdminRoute.js`

```javascript
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // If not logged in or not admin, redirect to home
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is admin, render the protected component
  return children;
}
```

**Usage in Routes** (`AppRoutes.js`):
```javascript
<Route
  path="/users"
  element={
    <AdminRoute>
      <UsersPage />
    </AdminRoute>
  }
/>

<Route
  path="/meals"
  element={
    <AdminRoute>
      <MealsPage />
    </AdminRoute>
  }
/>
```

**How it works:**
1. Checks if `user` exists (logged in)
2. Checks if `user.isAdmin === true`
3. If not admin → Redirects to home page
4. If admin → Renders the admin page

**Important:** This is **UX protection only**. Backend must still validate admin role!

---

## Creating Admin Users

By default, registered users have `isAdmin: false`. To create an admin:

### Method 1: Directly in MongoDB

```bash
# Connect to MongoDB
mongosh "your_connection_string"

# Switch to database
use wot-food-ordering

# Update user to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

### Method 2: Temporarily Modify Registration

In `backend/src/routers/user.router.js` (lines 52-59):

```javascript
const newUser = {
  name,
  email: email.toLowerCase(),
  password: hashedPassword,
  address,
  isAdmin: true  // ← Add this temporarily
};
```

1. Add `isAdmin: true`
2. Register your admin account through the UI
3. Remove the modification
4. Restart server

### Method 3: Admin Creation Endpoint (Not Implemented)

You could add a super-admin endpoint:

```javascript
router.post("/admin/create-admin", superAdminAuth, handler(async (req, res) => {
  const user = await UserModel.findById(userId);
  user.isAdmin = true;
  await user.save();
  res.send(generateTokenResponse(user));
}));
```

---

## Security Vulnerabilities Fixed

### ❌ Before Protection

**Vulnerable endpoints:**
```javascript
// user.router.js - ANYONE could do these:
router.get("/", handler(async (req, res) => {
  const users = await UserModel.find();  // Exposed all users + passwords!
  res.send(users);
}));

router.put("/user/:id", handler(async (req, res) => {
  const isAdmin = req.body.isAdmin;  // Users could make themselves admin!
  // Update user...
}));

router.delete("/user/:id", handler(async (req, res) => {
  await UserModel.findByIdAndDelete(id);  // Anyone could delete users!
}));

// food.router.js - ANYONE could do these:
router.put("/:foodId", handler(async (req, res) => {
  // Update food - no auth required!
}));

router.delete("/:foodId", handler(async (req, res) => {
  // Delete food - no auth required!
}));
```

**Risks:**
- Privilege escalation (users making themselves admin)
- Data exposure (viewing all users with password hashes)
- Data manipulation (anyone updating/deleting data)

---

### ✅ After Protection

**Protected endpoints:**
```javascript
// user.router.js
router.get("/", authMid, adminMid, handler(async (req, res) => {
  // Only admins can view all users
  const users = await UserModel.find();
  res.send(users);
}));

router.put("/user/:id", authMid, adminMid, handler(async (req, res) => {
  // Only admins can update users
  // isAdmin can only be changed by admins
}));

router.delete("/user/:id", authMid, adminMid, handler(async (req, res) => {
  // Only admins can delete users
}));

// food.router.js
router.put("/:foodId", authMid, adminMid, handler(async (req, res) => {
  // Only admins can update foods
}));

router.delete("/:foodId", authMid, adminMid, handler(async (req, res) => {
  // Only admins can delete foods
}));
```

---

## Testing Admin Protection

### Test 1: Admin Access (Should Succeed)

```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Access admin endpoint
curl http://localhost:5000/api/admin/users \
  -H "access_token: $TOKEN"

# Expected: 200 OK with user list
```

---

### Test 2: Regular User Access (Should Fail)

```bash
# Login as regular user
TOKEN=$(curl -s -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# Try to access admin endpoint
curl http://localhost:5000/api/admin/users \
  -H "access_token: $TOKEN"

# Expected: 403 Forbidden
# "Admin access required"
```

---

### Test 3: No Token (Should Fail)

```bash
# Access admin endpoint without token
curl http://localhost:5000/api/admin/users

# Expected: 401 Unauthorized
```

---

## Best Practices

### 1. Always Use Both Middleware

```javascript
// ✅ Correct
router.delete("/user/:id", authMid, adminMid, handler(async (req, res) => {
  // Protected
}));

// ❌ Wrong - missing auth
router.delete("/user/:id", adminMid, handler(async (req, res) => {
  // admin.mid.js will fail because req.user doesn't exist
}));
```

---

### 2. Protect Frontend AND Backend

```javascript
// ✅ Correct - Both protected
Frontend: <AdminRoute><UsersPage /></AdminRoute>
Backend: router.get("/users", authMid, adminMid, handler(...))

// ❌ Wrong - Frontend only
Frontend: <AdminRoute><UsersPage /></AdminRoute>
Backend: router.get("/users", handler(...))
// User can still call API directly!
```

---

### 3. Validate Admin Flag from Token

```javascript
// ✅ Correct - Trust the token
if (req.user.isAdmin) {
  // Allow access
}

// ❌ Wrong - Don't query database
const user = await UserModel.findById(req.user.id);
if (user.isAdmin) {
  // Unnecessary database query
}
```

The `isAdmin` flag in the JWT token is **trusted** because:
- Token is signed and verified
- Can't be tampered with
- No need to query database

---

### 4. Prevent Self-Privilege Escalation

If you allow users to edit their own profile:

```javascript
router.put("/profile", authMid, handler(async (req, res) => {
  const userId = req.user.id;
  const { name, address } = req.body;

  // ✅ Correct - Don't allow isAdmin change
  const updatedUser = {
    name,
    address,
    // isAdmin NOT included - can't be changed by user
  };

  // ❌ Wrong - User could set isAdmin: true
  const updatedUser = req.body;  // Includes isAdmin!

  await UserModel.findByIdAndUpdate(userId, updatedUser);
}));
```

---

## Common Issues

### Issue 1: "Not authenticated" on admin route

**Cause:** `auth.mid.js` not running before `admin.mid.js`

**Solution:** Ensure correct order:
```javascript
router.use(auth);   // Must be first
router.use(admin);  // Must be second
```

---

### Issue 2: 403 Forbidden for admin user

**Cause:** User's `isAdmin` flag is `false` in database or old token

**Solution:**
1. Check database: `db.users.findOne({ email: "admin@example.com" })`
2. Verify `isAdmin: true` in database
3. Log out and log in again to get new token
4. Decode token at jwt.io to verify `isAdmin: true` in payload

---

### Issue 3: Frontend shows admin pages, but API fails

**Cause:** Backend routes not protected

**Solution:** Add middleware to backend routes:
```javascript
router.get("/admin-data", authMid, adminMid, handler(...))
```

---

### Issue 4: Token has `isAdmin: true` but database has `false`

**Cause:** Database updated after token was issued

**Solution:** Log out and log in again. The new token will reflect current database state.

---

## Monitoring Admin Actions

For production, consider logging admin actions:

```javascript
router.delete("/users/:id", authMid, adminMid, handler(async (req, res) => {
  const adminId = req.user.id;
  const adminEmail = req.user.email;
  const targetUserId = req.params.id;

  // Log the action
  console.log(`[ADMIN ACTION] ${adminEmail} (${adminId}) deleted user ${targetUserId}`);

  await UserModel.findByIdAndDelete(targetUserId);
  res.send(result);
}));
```

This helps with:
- Audit trails
- Debugging
- Security monitoring
- Compliance

---

## Summary

**Admin protection requires:**
1. ✅ JWT authentication (`auth.mid.js`)
2. ✅ Admin authorization (`admin.mid.js`)
3. ✅ Correct middleware order
4. ✅ Frontend route protection (`AdminRoute`)
5. ✅ Backend route protection (middleware)
6. ✅ Secure admin user creation
7. ✅ Testing both admin and non-admin access

**Security principle:** Never trust the client. Always validate on the server.
