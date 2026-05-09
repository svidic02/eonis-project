# Authentication

This document explains how JWT-based authentication works in the WOT-projekat application.

## Overview

WOT-projekat uses **JWT (JSON Web Tokens)** for stateless authentication. The authentication flow involves:

1. User logs in with credentials
2. Backend generates a JWT token containing user info
3. Frontend stores token in localStorage
4. Token is automatically sent with every API request
5. Backend validates token on protected routes

## JWT Token Structure

A JWT token has three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[        Header         ].[                Payload                 ].[      Signature      ]
```

### 1. Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
Specifies the algorithm (HMAC SHA256) and token type.

### 2. Payload (User Data)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "isAdmin": false,
  "iat": 1695211200,
  "exp": 1697803200
}
```
Contains user information and metadata:
- `id` - User's MongoDB ObjectId
- `email` - User's email address
- `isAdmin` - Boolean flag for admin privileges
- `iat` (issued at) - Token creation timestamp
- `exp` (expiration) - Token expiration timestamp (30 days)

### 3. Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```
Cryptographic signature created using:
- Header + Payload
- Your secret key (`JWT_SECRET` from `.env`)

**Security:** The signature proves the token was created by your server and hasn't been tampered with.

---

## Authentication Flow

### 1. User Registration

```
┌─────────────┐                           ┌─────────────┐
│   Frontend  │                           │   Backend   │
└─────────────┘                           └─────────────┘
       │                                          │
       │  POST /api/users/register                │
       │  { name, email, password, address }      │
       ├─────────────────────────────────────────>│
       │                                          │
       │                           Check if user exists
       │                                          │
       │                           Hash password with bcrypt
       │                                          │
       │                           Save user to MongoDB
       │                                          │
       │                           Generate JWT token:
       │                           JWT.sign({id, email, isAdmin})
       │                                          │
       │  Response:                               │
       │  { id, email, name, address,             │
       │    isAdmin, token }                      │
       │<─────────────────────────────────────────┤
       │                                          │
  Store in localStorage                           │
  key: "user"                                     │
  value: JSON with token                          │
       │                                          │
```

**Backend Code** (`user.router.js` lines 35-62):
```javascript
const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);

const newUser = {
  name,
  email: email.toLowerCase(),
  password: hashedPassword,
  address,
};

const result = await UserModel.create(newUser);
res.send(generateTokenResponse(result));
```

**Frontend Code** (`userService.js` lines 12-16):
```javascript
export const register = async (registerData) => {
  const { data } = await axios.post("api/users/register", registerData);
  localStorage.setItem("user", JSON.stringify(data)); // Store token
  return data;
};
```

---

### 2. User Login

```
┌─────────────┐                           ┌─────────────┐
│   Frontend  │                           │   Backend   │
└─────────────┘                           └─────────────┘
       │                                          │
       │  POST /api/users/login                   │
       │  { email, password }                     │
       ├─────────────────────────────────────────>│
       │                                          │
       │                           Find user by email
       │                                          │
       │                           Compare password with bcrypt
       │                                          │
       │                           if valid:
       │                             Generate JWT token
       │                           else:
       │                             Return 400 error
       │                                          │
       │  Response:                               │
       │  { id, email, name, address,             │
       │    isAdmin, token }                      │
       │<─────────────────────────────────────────┤
       │                                          │
  Store in localStorage                           │
       │                                          │
```

**Backend Code** (`user.router.js` lines 20-32):
```javascript
const user = await UserModel.findOne({ email });

if (user && (await bcrypt.compare(password, user.password))) {
  res.send(generateTokenResponse(user));
  return;
}

res.status(BAD_REQUEST).send("Username or password is invalid.");
```

**Token Generation** (`user.router.js` lines 134-153):
```javascript
const generateTokenResponse = (user) => {
  const token = JWT.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,    // Secret key from .env
    { expiresIn: "30d" }       // Token expires in 30 days
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,                     // JWT token included in response
  };
};
```

---

### 3. Authenticated Requests

Every subsequent request automatically includes the JWT token.

```
┌─────────────┐                           ┌─────────────┐
│   Frontend  │                           │   Backend   │
└─────────────┘                           └─────────────┘
       │                                          │
  User makes request                              │
       │                                          │
  Axios interceptor runs:                         │
  - Gets token from localStorage                  │
  - Adds to headers                               │
       │                                          │
       │  GET /api/orders/create                  │
       │  Headers: {                              │
       │    access_token: "eyJhbGc..."            │
       │  }                                       │
       ├─────────────────────────────────────────>│
       │                                          │
       │                           auth.mid.js runs:
       │                           - Extract token from header
       │                           - Verify with JWT_SECRET
       │                           - If valid: set req.user
       │                           - If invalid: return 401
       │                                          │
       │                           Route handler runs with req.user
       │                                          │
       │  Response: { order data }                │
       │<─────────────────────────────────────────┤
       │                                          │
```

**Frontend Interceptor** (`authInterceptor.js` lines 3-15):
```javascript
axios.interceptors.request.use(
  (req) => {
    const user = localStorage.getItem("user");           // Get user from storage
    const token = user && JSON.parse(user).token;        // Extract token
    if (token) {
      req.headers["access_token"] = token;               // Add to headers
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Backend Middleware** (`auth.mid.js` lines 4-20):
```javascript
export default (req, res, next) => {
  const token = req.headers.access_token;        // Extract token from header

  if (!token) {
    return res.status(UNAUTHORIZED).send();      // No token = 401
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify signature
    // decoded = { id: "123", email: "user@example.com", isAdmin: false }

    req.user = decoded;                          // Attach user info to request
  } catch (error) {
    return res.status(UNAUTHORIZED).send();      // Invalid token = 401
  }

  next();                                        // Token valid, continue
};
```

---

### 4. User Logout

```
┌─────────────┐
│   Frontend  │
└─────────────┘
       │
  User clicks "Logout"
       │
  Remove user from localStorage
       │
  Redirect to home page
       │
```

**Frontend Code** (`userService.js` lines 18-20):
```javascript
export const logout = () => {
  localStorage.removeItem("user");  // Delete token from browser
};
```

**Note:** There's no backend logout endpoint because JWT is stateless. The token remains valid until expiration, but the frontend deletes it.

---

## Password Security

### Hashing with bcryptjs

Passwords are **never** stored in plain text. They are hashed using bcryptjs with 10 salt rounds.

**During Registration/Update:**
```javascript
const PASSWORD_HASH_SALT_ROUNDS = 10;
const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);
```

**Example:**
- Plain password: `"password123"`
- Hashed: `"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`

**During Login:**
```javascript
const isPasswordValid = await bcrypt.compare(password, user.password);
```

bcrypt automatically handles:
- Salt generation
- Hashing algorithm
- Comparison of plain text with hash

---

## JWT Secret Security

### What is JWT_SECRET?

The `JWT_SECRET` is a secret key used to:
1. **Sign tokens** - Create cryptographic signature when generating tokens
2. **Verify tokens** - Validate signature when receiving tokens

### Why It's Critical

**Without the secret, an attacker cannot:**
- Create valid tokens
- Modify token data (e.g., change `isAdmin: false` to `isAdmin: true`)
- Impersonate users

**If the secret is exposed:**
- Attackers can create tokens for any user
- Attackers can grant themselves admin privileges
- Your entire authentication system is compromised

### Best Practices

1. **Generate securely:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Store in `.env` file** (never commit to git)
3. **Use different secrets** for dev/staging/production
4. **Rotate periodically** (e.g., every 6 months)
5. **Use a strong secret** (64+ characters, random)

### Changing JWT_SECRET

If you change the secret:
- All existing tokens become **instantly invalid**
- All users will be **forcefully logged out**
- Users must log in again to get new tokens

```bash
# Old secret
JWT_SECRET=old_secret_12345

# Change to new secret
JWT_SECRET=new_secret_67890

# Restart server
npm run dev
```

Result: All tokens signed with `old_secret_12345` will fail verification.

---

## Token Storage

### Why localStorage?

**Advantages:**
- ✅ Persists across browser sessions
- ✅ Simple API
- ✅ Accessible from anywhere in frontend
- ✅ No server storage needed

**Disadvantages:**
- ❌ Vulnerable to XSS attacks
- ❌ Not accessible from server-side rendering
- ❌ No expiration (must manually delete)

**Alternative:** `sessionStorage` (clears when browser closes)

### Security Considerations

**XSS Risk:**
If an attacker injects malicious JavaScript:
```javascript
// Attacker's script
const token = localStorage.getItem("user");
// Send token to attacker's server
```

**Mitigation:**
- Sanitize all user inputs
- Use Content Security Policy (CSP)
- Avoid `dangerouslySetInnerHTML` in React
- Keep dependencies updated

---

## Token Expiration

Tokens expire after 30 days (`expiresIn: "30d"`).

**What happens when token expires:**
1. User makes request with expired token
2. Backend `jwt.verify()` throws error
3. Middleware returns 401 Unauthorized
4. User must log in again

**Checking expiration manually:**
```javascript
const decoded = jwt.decode(token);
const now = Date.now() / 1000;

if (decoded.exp < now) {
  console.log("Token expired");
}
```

---

## Middleware Chain

Protected routes use a **middleware chain**:

```javascript
router.post("/create", auth, handler(async (req, res) => {
  // auth middleware runs first
  // req.user is now available
  const userId = req.user.id;
  // ...
}));
```

**Order matters:**
1. `auth` middleware validates token and sets `req.user`
2. Route handler accesses `req.user`

---

## Testing Authentication

### Manually Test Login

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Response:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Protected Route

```bash
TOKEN="your_token_here"

curl http://localhost:5000/api/orders/newOrderForCurrentUser \
  -H "access_token: $TOKEN"
```

### Decode Token (for debugging)

Visit [jwt.io](https://jwt.io/) and paste your token to see the decoded payload.

**Warning:** Never paste production tokens into third-party websites!

---

## Common Authentication Errors

### 401 Unauthorized
**Cause:** No token or invalid token
**Solution:** Check if user is logged in, token exists in localStorage, and token hasn't expired

### 403 Forbidden
**Cause:** Token valid but user lacks permissions (e.g., not admin)
**Solution:** Check `isAdmin` flag in token payload

### "Username or password is invalid"
**Cause:** Wrong email or password
**Solution:** Verify credentials

### Token appears valid but fails verification
**Cause:** JWT_SECRET mismatch
**Solution:** Ensure backend is using the correct `.env` file

---

## Security Best Practices

1. **Always use HTTPS in production** - Prevents token interception
2. **Validate input** - Prevent injection attacks
3. **Rate limit login attempts** - Prevent brute force attacks
4. **Use strong passwords** - Enforce password requirements
5. **Keep JWT_SECRET secure** - Never expose or commit to git
6. **Set reasonable expiration** - Balance security vs. user experience
7. **Implement refresh tokens** (future) - More secure than long-lived tokens
8. **Monitor failed login attempts** - Detect potential attacks

---

## Future Improvements

- **Refresh tokens** - Short-lived access tokens + long-lived refresh tokens
- **Token blacklist** - Ability to revoke tokens before expiration
- **OAuth integration** - Google, Facebook login
- **Two-factor authentication** - Enhanced security
- **Password reset flow** - Email-based password recovery
- **Rate limiting** - Prevent brute force attacks
- **Session management** - Track active sessions per user
