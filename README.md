# WOT-projekat

A full-stack food ordering web application with separate admin and user interfaces.

## Tech Stack

**Frontend:** React, React Router, Axios, PayPal SDK, Leaflet Maps
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT Authentication
**Security:** bcryptjs, JWT middleware, role-based access control

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB instance

### Backend
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:
```bash
npm run dev   # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start     # Runs on http://localhost:3000
```

## Features

### Implemented ✅
- **User Authentication:** Register, login, JWT-based auth with protected routes
- **Browse & Order:** Search foods, filter by tags, shopping cart, checkout with map integration
- **Payment:** PayPal integration for order processing
- **Admin Panel:** Manage users, foods, orders, and view tags (protected routes)
- **UI/UX:** Dark mode, loading states, toast notifications, responsive design
- **Security:** Password hashing, JWT middleware, admin role verification

### Planned 🚧
- User order history page
- Food rating and favorites system
- Order tracking with status updates
- User profile editing and picture uploads
- Tag management (add/edit/delete)
- Enhanced food descriptions and UI improvements

## Documentation

> **Note:** Detailed documentation is planned to be added in the `docs/` folder:
> - `docs/getting-started.md` - Detailed installation and setup
> - `docs/architecture.md` - System design and folder structure
> - `docs/api-endpoints.md` - Complete API reference
> - `docs/authentication.md` - JWT flow and middleware explanation
> - `docs/admin-protection.md` - Security implementation details

## References

- [CodeWithNasir - Admin Dashboard Tutorial](https://www.youtube.com/watch?v=H9Vp0G--u-Y&list=PLpaspowtqj-f9-5g2Rc1dWm1n2_nNfIl6&index=15&ab_channel=CodeWithNasir)

## License

This project is for educational purposes.
