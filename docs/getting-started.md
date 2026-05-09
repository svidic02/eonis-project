# Getting Started

This guide will help you set up the WOT-projekat food ordering application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for cloning the repository)

## Installation Steps

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd wot-project
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

This will install the following dependencies:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `express-async-handler` - Async error handling

#### Configure Environment Variables

Create a `.env` file in the `backend/` folder:

```bash
touch .env
```

Add the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**MONGO_URI examples:**
- Local: `mongodb://localhost:27017/wot-food-ordering`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/wot-food-ordering`

**JWT_SECRET:**
Generate a secure random string (32+ characters). You can use:

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: OpenSSL
openssl rand -base64 64
```

#### Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The backend server will start on `http://localhost:5000`

#### Verify Backend is Running

You should see:
```
Listening on port 5000
Database connected successfully
```

### 3. Frontend Setup

Open a new terminal window/tab.

#### Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `react` and `react-dom` - UI framework
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `@paypal/react-paypal-js` - PayPal integration
- `leaflet` and `react-leaflet` - Map components
- `react-toastify` - Toast notifications
- `react-switch` - Dark mode toggle
- `react-hook-form` - Form handling

#### Start the Frontend Development Server

```bash
npm start
```

The application will open automatically in your browser at `http://localhost:3000`

If it doesn't open automatically, navigate to `http://localhost:3000` manually.

## Initial Setup

### Creating an Admin User

By default, registered users are **not** admins. To create an admin user:

**Option 1: Directly in MongoDB**

1. Register a user through the application UI
2. Connect to MongoDB:
   ```bash
   # Local MongoDB
   mongosh

   # Or MongoDB Atlas
   mongosh "your_connection_string"
   ```
3. Update the user:
   ```javascript
   use wot-food-ordering  // or your database name
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { isAdmin: true } }
   )
   ```

**Option 2: Modify backend code temporarily**

In `backend/src/routers/user.router.js`, temporarily modify the register route (line 52-59):

```javascript
const newUser = {
  name,
  email: email.toLowerCase(),
  password: hashedPassword,
  address,
  isAdmin: true  // ← Add this temporarily
};
```

Register your admin account, then remove this modification.

### Seeding Initial Data (Optional)

If you want to populate the database with sample foods:

1. Check if `backend/src/data.js` exists with sample data
2. Create a seed script or manually insert data through the admin panel

## Troubleshooting

### Backend Issues

**"Cannot connect to MongoDB"**
- Verify your `MONGO_URI` is correct
- Ensure MongoDB is running (if using local installation)
- Check network connectivity (if using MongoDB Atlas)
- Verify IP whitelist in MongoDB Atlas

**"JWT_SECRET is not defined"**
- Ensure `.env` file exists in `backend/` folder
- Check that `.env` contains `JWT_SECRET=...`
- Restart the backend server after creating/modifying `.env`

**Port 5000 already in use**
- Another application is using port 5000
- Stop the other application or change the port in `backend/src/constants/ports.js`

### Frontend Issues

**"Cannot connect to backend / Network Error"**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure backend CORS is configured for `http://localhost:3000`

**Port 3000 already in use**
- React will prompt you to use another port (e.g., 3001)
- Type `Y` to accept

**"Module not found" errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Next Steps

- Read [Architecture](./architecture.md) to understand the project structure
- Read [Authentication](./authentication.md) to understand the auth flow
- Read [API Endpoints](./api-endpoints.md) for backend API reference
- Read [Admin Protection](./admin-protection.md) to understand security implementation

## Development Workflow

### Running Both Servers

You'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### Making Changes

- **Backend changes:** The server auto-reloads with nodemon
- **Frontend changes:** React hot-reloads automatically
- **Environment changes:** Restart the server manually

### Testing the Application

1. Open `http://localhost:3000`
2. Register a new user account
3. Browse foods and add items to cart
4. Complete checkout and payment flow
5. Make yourself admin (see "Creating an Admin User" above)
6. Access admin panel at `http://localhost:3000/users`, `/meals`, `/orders`, `/tags`

## Production Deployment

For production deployment instructions, refer to your hosting provider's documentation. General steps:

1. Build the frontend: `cd frontend && npm run build`
2. Set production environment variables
3. Use a process manager like PM2 for Node.js
4. Use a reverse proxy like Nginx
5. Set up SSL certificates
6. Configure MongoDB for production (Atlas recommended)

## Support

If you encounter issues not covered here, check:
- Project README.md
- Other documentation files in `docs/`
- GitHub Issues (if applicable)
