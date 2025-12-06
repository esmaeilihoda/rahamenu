# Backend Setup Complete! 🚀

## What's Been Created

### Directory Structure
```
server/
├── src/
│   ├── config/           # Database & environment configuration
│   ├── models/           # Mongoose schemas (MenuItem, Order, Table, Restaurant, User)
│   ├── controllers/      # Business logic for API endpoints
│   ├── routes/           # Express route definitions
│   ├── middleware/       # Auth, validation, error handling
│   ├── services/         # WebSocket & notification services
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main Express server
├── package.json          # Server dependencies
├── tsconfig.json         # TypeScript configuration
└── .env.example          # Environment variables template
```

## Next Steps to Get Running

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Concurrently (Root Level)
```bash
cd ..
npm install
```

### 3. Set Up MongoDB
You have two options:

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Then start the service
mongod --dbpath /path/to/data/directory
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier M0)
4. Get your connection string
5. Whitelist your IP address

### 4. Create .env File
```bash
cd server
cp .env.example .env
```

Then edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/menu-bloom
# Or: mongodb+srv://username:password@cluster.mongodb.net/menu-bloom
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### 5. Start Development
From the **root directory**:
```bash
npm run dev
```

This will start:
- ✅ Frontend (Vite) on http://localhost:5173
- ✅ Backend (Express) on http://localhost:5000
- ✅ WebSocket server on http://localhost:5000

## API Endpoints Created

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/profile` - Update profile
- `PATCH /api/v1/auth/change-password` - Change password

### Menu Items
- `GET /api/v1/menu/:restaurantId` - Get all menu items
- `GET /api/v1/menu/item/:id` - Get single item
- `POST /api/v1/menu` - Create item (manager/admin)
- `PATCH /api/v1/menu/:id` - Update item (manager/admin)
- `PATCH /api/v1/menu/:id/availability` - Toggle 86'd (staff+)
- `DELETE /api/v1/menu/:id` - Delete item (admin)

### Orders
- `POST /api/v1/orders` - Create order (public)
- `GET /api/v1/orders/:restaurantId` - Get all orders (manager)
- `PATCH /api/v1/orders/:id/status` - Update status (staff+)
- `GET /api/v1/orders/table/:tableId` - Get table orders
- `DELETE /api/v1/orders/:id` - Cancel order (manager)

### Tables
- `GET /api/v1/tables/:restaurantId` - Get all tables (manager)
- `GET /api/v1/tables/single/:id` - Get single table
- `POST /api/v1/tables` - Create table (manager)
- `PATCH /api/v1/tables/:id/status` - Update status (staff+)
- `POST /api/v1/tables/:id/qr` - Generate QR code (manager)
- `POST /api/v1/tables/:id/call-waiter` - Call waiter (public)
- `DELETE /api/v1/tables/:id` - Delete table (admin)

## WebSocket Events

### Client → Server
- `join:table` - Join table room for updates
- `subscribe:restaurant` - Manager subscribes to restaurant
- `ping` - Health check

### Server → Client
- `order:created` - New order placed
- `order:updated` - Order status changed
- `order:cancelled` - Order cancelled
- `table:updated` - Table status changed
- `table:alert` - Digital bell pressed
- `menu:availability` - Item 86'd/un-86'd
- `server:shutdown` - Server shutting down

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Create First User (Register)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raha@menu.dev",
    "password": "password123",
    "name": "Manager User",
    "role": "manager"
  }'
```

## Edge Cases Handled

✅ **Database connection failures** - Exponential backoff retry (5 attempts)
✅ **Invalid ObjectIds** - Caught by Mongoose cast error handler
✅ **Concurrent order updates** - Mongoose optimistic locking
✅ **Missing environment variables** - Zod validation with clear errors
✅ **Socket disconnections** - Auto-reconnect on client side
✅ **Duplicate emails/table numbers** - Unique indexes in MongoDB
✅ **Invalid token/expired token** - JWT verification middleware
✅ **Rate limiting** - 100 requests per 15 minutes per IP
✅ **Graceful shutdown** - SIGTERM/SIGINT handlers

## Features Implemented

✅ Full REST API with TypeScript
✅ MongoDB with Mongoose ODM
✅ JWT authentication & authorization
✅ Role-based access control (admin/manager/staff)
✅ WebSocket real-time updates
✅ Request validation with Zod
✅ Error handling & logging
✅ Rate limiting & security headers (Helmet)
✅ CORS configuration
✅ Graceful shutdown
✅ Health check endpoint

## What's Next?

Now you can:
1. **Connect the frontend** to the backend API
2. **Seed initial data** (create restaurant, menu items, tables)
3. **Test order flow** end-to-end
4. **Add frontend WebSocket client** for real-time updates
5. **Deploy** to production (Heroku, Railway, Render, etc.)

Need help with any of these? Just ask! 🎉
