# API Endpoints

Complete reference for all REST API endpoints in the WOT-projekat backend.

**Base URL:** `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the `access_token` header:

```
Headers:
  access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format

**Success Response:**
```json
{
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## User Endpoints

### POST `/api/users/login`

Authenticate a user and receive a JWT token.

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```
"Username or password is invalid."
```

---

### POST `/api/users/register`

Register a new user account.

**Authentication:** None (Public)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "address": "123 Main St"
}
```

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```
"User already exists!"
```

---

## Food Endpoints

### GET `/api/foods`

Get all food items.

**Authentication:** None (Public)

**Success Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "price": 12.99,
    "tags": ["Pizza", "Italian", "Vegetarian"],
    "imageUrl": "https://example.com/pizza.jpg",
    "cookTime": "20-30 min",
    "createdAt": "2023-09-20T10:30:00.000Z",
    "updatedAt": "2023-09-20T10:30:00.000Z"
  }
]
```

---

### GET `/api/foods/search/:searchTerm`

Search foods by name (case-insensitive).

**Authentication:** None (Public)

**URL Parameters:**
- `searchTerm` (string) - Search query

**Example:** `/api/foods/search/pizza`

**Success Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "price": 12.99,
    "tags": ["Pizza", "Italian"],
    "imageUrl": "https://example.com/pizza.jpg",
    "cookTime": "20-30 min"
  }
]
```

---

### GET `/api/foods/tags`

Get all food tags with counts.

**Authentication:** None (Public)

**Success Response (200):**
```json
[
  {
    "name": "All",
    "count": 25
  },
  {
    "name": "Pizza",
    "count": 8
  },
  {
    "name": "Italian",
    "count": 6
  }
]
```

---

### GET `/api/foods/tag/:tag`

Get all foods with a specific tag.

**Authentication:** None (Public)

**URL Parameters:**
- `tag` (string) - Tag name

**Example:** `/api/foods/tag/Pizza`

**Success Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "price": 12.99,
    "tags": ["Pizza", "Italian"],
    "imageUrl": "https://example.com/pizza.jpg",
    "cookTime": "20-30 min"
  }
]
```

---

### GET `/api/foods/:foodId`

Get a single food item by ID.

**Authentication:** None (Public)

**URL Parameters:**
- `foodId` (string) - MongoDB ObjectId

**Example:** `/api/foods/507f1f77bcf86cd799439011`

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Margherita Pizza",
  "price": 12.99,
  "tags": ["Pizza", "Italian"],
  "imageUrl": "https://example.com/pizza.jpg",
  "cookTime": "20-30 min"
}
```

---

## Order Endpoints

### POST `/api/orders/create`

Create a new order for the current user.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "John Doe",
  "address": "123 Main St, City, 12345",
  "totalPrice": 25.98,
  "items": [
    {
      "food": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Margherita Pizza",
        "price": 12.99,
        "imageUrl": "https://example.com/pizza.jpg"
      },
      "quantity": 2,
      "price": 25.98
    }
  ]
}
```

**Success Response (200):**
```json
{
  "id": "507f191e810c19729de860ea",
  "name": "John Doe",
  "address": "123 Main St, City, 12345",
  "totalPrice": 25.98,
  "items": [ ... ],
  "status": "NEW",
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2023-09-20T10:30:00.000Z"
}
```

**Error Response (400):**
```
"Cart Is Empty!"
```

**Error Response (401):**
```
Unauthorized (no token or invalid token)
```

---

### GET `/api/orders/newOrderForCurrentUser`

Get the current user's active (unpaid) order.

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "id": "507f191e810c19729de860ea",
  "name": "John Doe",
  "address": "123 Main St",
  "totalPrice": 25.98,
  "items": [ ... ],
  "status": "NEW",
  "user": "507f1f77bcf86cd799439011"
}
```

**Error Response (400):**
```
Bad Request (no active order found)
```

---

### PUT `/api/orders/pay`

Mark an order as paid with PayPal payment ID.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "paymentId": "PAYID-M123456789012345678901234"
}
```

**Success Response (200):**
```json
"507f191e810c19729de860ea"
```
(Returns the order ID)

**Error Response (400):**
```
"Order Not Found!"
```

---

### GET `/api/orders`

Get all orders (unprotected - should be admin-only in production).

**Authentication:** None (Public) ⚠️

**Success Response (200):**
```json
[
  {
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "address": "123 Main St",
    "totalPrice": 25.98,
    "items": [ ... ],
    "status": "PAYED",
    "user": "507f1f77bcf86cd799439011",
    "paymentId": "PAYID-M123456",
    "createdAt": "2023-09-20T10:30:00.000Z"
  }
]
```

---

## Admin Endpoints

All admin endpoints require both authentication and admin role.

### GET `/api/admin/users`

Get all users.

**Authentication:** Required (Admin)

**Success Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "address": "123 Main St",
    "isAdmin": false,
    "password": "$2a$10$...",
    "createdAt": "2023-09-20T10:30:00.000Z"
  }
]
```

**Error Response (401):**
```
Unauthorized (no token)
```

**Error Response (403):**
```
"Admin access required"
```

---

### GET `/api/admin/users/:id`

Get a specific user by ID.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string) - MongoDB ObjectId

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "address": "123 Main St",
  "isAdmin": false
}
```

**Error Response (400):**
```
"Invalid user ID"
```

---

### PUT `/api/admin/users/:id`

Update a user.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string) - MongoDB ObjectId

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "address": "456 New Street",
  "isAdmin": false
}
```

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "address": "456 New Street",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (404):**
```
"User not found"
```

---

### DELETE `/api/admin/users/:id`

Delete a user.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string) - MongoDB ObjectId

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Error Response (400):**
```
"User couldn't be deleted!"
```

---

### POST `/api/admin/foods`

Add a new food item.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "price": 12.99,
  "tags": ["Pizza", "Italian", "Vegetarian"],
  "cookTime": "20-30 min",
  "imageUrl": "https://example.com/pizza.jpg"
}
```

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Margherita Pizza",
  "price": 12.99,
  "tags": ["Pizza", "Italian", "Vegetarian"],
  "cookTime": "20-30 min",
  "imageUrl": "https://example.com/pizza.jpg",
  "createdAt": "2023-09-20T10:30:00.000Z"
}
```

---

### PUT `/api/admin/foods/:foodId`

Update a food item.

**Authentication:** Required (Admin)

**URL Parameters:**
- `foodId` (string) - MongoDB ObjectId

**Request Body:**
```json
{
  "name": "Updated Pizza",
  "price": 14.99,
  "tags": ["Pizza", "Italian"],
  "cookTime": "25-35 min"
}
```

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Updated Pizza",
  "price": 14.99,
  "tags": ["Pizza", "Italian"],
  "cookTime": "25-35 min",
  "imageUrl": "https://example.com/pizza.jpg"
}
```

**Error Response (404):**
```
"Meal not found"
```

---

### DELETE `/api/admin/foods/:foodId`

Delete a food item.

**Authentication:** Required (Admin)

**URL Parameters:**
- `foodId` (string) - MongoDB ObjectId

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Margherita Pizza"
}
```

**Error Response (400):**
```
"Food couldn't be deleted!"
```

---

### GET `/api/admin/orders`

Get all orders.

**Authentication:** Required (Admin)

**Success Response (200):**
```json
[
  {
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "address": "123 Main St",
    "totalPrice": 25.98,
    "items": [ ... ],
    "status": "PAYED",
    "user": "507f1f77bcf86cd799439011",
    "paymentId": "PAYID-M123456",
    "createdAt": "2023-09-20T10:30:00.000Z"
  }
]
```

---

## Status Codes

| Code | Meaning                  |
|------|--------------------------|
| 200  | OK                       |
| 400  | Bad Request              |
| 401  | Unauthorized (no token)  |
| 403  | Forbidden (not admin)    |
| 404  | Not Found                |
| 500  | Internal Server Error    |

## Order Status Values

| Status    | Description                          |
|-----------|--------------------------------------|
| NEW       | Order created, awaiting payment      |
| PAYED     | Payment received                     |
| SHIPPED   | Order shipped (not yet implemented)  |
| CANCELED  | Order canceled (not yet implemented) |
| REFUNDED  | Order refunded (not yet implemented) |

## Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get all foods:**
```bash
curl http://localhost:5000/api/foods
```

**Create order (authenticated):**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "access_token: YOUR_JWT_TOKEN" \
  -d '{ "name": "John", "address": "123 St", "totalPrice": 25, "items": [...] }'
```

**Get all users (admin):**
```bash
curl http://localhost:5000/api/admin/users \
  -H "access_token: ADMIN_JWT_TOKEN"
```

## Testing with Postman

1. Create a new request
2. Set method (GET, POST, PUT, DELETE)
3. Set URL: `http://localhost:5000/api/...`
4. Add headers:
   - `Content-Type: application/json`
   - `access_token: YOUR_JWT_TOKEN` (for protected routes)
5. Add request body (JSON) for POST/PUT requests
6. Send request

## Notes

- All timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are 24-character hex strings
- JWT tokens expire in 30 days
- Password hashing uses bcryptjs with 10 salt rounds
- CORS is enabled for `http://localhost:3000`
