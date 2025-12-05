# Menu Bloom - Local Development Setup

## ✅ Prerequisites

- **Node.js 18+** and npm
- **MongoDB 6+** (local or Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone and Install

```powershell
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Variables Setup

**✅ ALREADY CONFIGURED!**

The environment files have been created for you:
- `server/.env` - Backend configuration with generated JWT secrets
- `.env` - Frontend configuration

**⚠️ Important:** You still need to:
1. Get a Zarrinpal Sandbox Merchant ID (see Zarrinpal Setup below)
2. Update `ZARRINPAL_MERCHANT_ID` in `server/.env`

### 3. Setup MongoDB

#### Option A: Local MongoDB (Recommended for Windows)

```powershell
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Install and start MongoDB as a Windows Service during installation
# Or start manually:
mongod --dbpath="C:\data\db"

# Verify MongoDB is running:
mongosh
# You should see the MongoDB shell prompt
```

Your `server/.env` is already configured with:
```
MONGODB_URI=mongodb://localhost:27017/menubloom
```

#### Option B: MongoDB Atlas (Cloud - No Installation)

1. Go to https://cloud.mongodb.com
2. Create free cluster (no credit card required)
3. Create database user
4. Add your IP to whitelist (or allow from anywhere for development)
5. Get connection string
6. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/menubloom
   ```

### 4. Setup Zarrinpal Sandbox

1. Visit https://sandbox.zarinpal.com
2. Register an account
3. Get your Merchant ID from the dashboard
4. Update `server/.env`:
   ```env
   ZARRINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

For local testing, payments will use the sandbox environment.

### 5. Build Backend and Seed Database

```powershell
# Build TypeScript backend
cd server
npm run build

# Seed database with demo data
node scripts/setup-local-db.js

# You should see:
# ✅ Restaurant created: کافه دمو (demo-cafe)
# ✅ Created 3 users
# ✅ Created 5 menu items
# ✅ Created 10 tables

cd ..
```

### 6. Run Development Servers

#### Open 2 separate PowerShell terminals:

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
# Server runs on http://localhost:5000
# You should see: "🚀 Menu Bloom Server Started"
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
# App runs on http://localhost:5173
# Vite will open browser automatically
```

### 7. Access Application

#### Customer View
- URL: http://localhost:5173/demo-cafe/customer?table=1
- Or: http://localhost:5173/customer?table=1

#### Manager Dashboard
- URL: http://localhost:5173/manager/login
- Email: `manager@democafe.local`
- Password: `password123`

#### Kitchen Display
- URL: http://localhost:5173/kitchen
- Email: `kitchen@democafe.local`
- Password: `password123`

## 🧪 Testing Payments

### Zarrinpal Sandbox Test Cards

When testing payment, use these sandbox credentials:

- **Card Number:** `5022291234567890`
- **CVV2:** Any 3 digits (e.g., `123`)
- **Expiry Date:** Any future date (e.g., `12/25`)
- **OTP:** `12345` (sandbox default)

The payment will redirect to sandbox.zarinpal.com and back to your app.

## 🔧 Troubleshooting

### MongoDB Connection Failed

```powershell
# Check if MongoDB is running:
mongosh

# If not running, start MongoDB:
# Windows Service:
net start MongoDB

# Or manually:
mongod --dbpath="C:\data\db"
```

### Port Already in Use

```powershell
# Find process using port 5000 (backend):
netstat -ano | findstr :5000

# Kill process (replace PID with the number from above):
taskkill /PID <PID> /F

# For frontend port 5173:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Environment Variables Not Loading

```powershell
# Verify .env files exist:
dir server\.env
dir .env

# Check content:
type server\.env
type .env

# If missing, regenerate secrets:
cd server
node scripts/generate-secrets.js
# Then copy secrets to server/.env
```

### Seed Script Fails

```powershell
# Make sure backend is built first:
cd server
npm run build

# Then run seed:
node scripts/setup-local-db.js

# If models not found, check that dist/ folder exists
dir dist\models
```

### Frontend Can't Connect to Backend

1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```
3. Restart frontend dev server after changing `.env`

## 📋 Development Commands

### Frontend (from root directory)
```powershell
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend (from server/ directory)
```powershell
npm run dev          # Start with nodemon (auto-restart)
npm run build        # Compile TypeScript to dist/
npm run start        # Run production build
npm run lint         # Run ESLint
npm run test         # Run tests (if configured)
```

## 🗂️ Project Structure

```
menu-bloom/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # UI components
│   ├── pages/             # Route pages
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities and API clients
├── server/
│   ├── src/               # Backend TypeScript source
│   │   ├── models/        # Mongoose models
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Express middleware
│   │   └── services/      # Business logic
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── scripts/           # Utility scripts
│   └── .env               # Backend environment variables
└── .env                   # Frontend environment variables
```

## 🎯 Generated Secrets

Your JWT secrets have been automatically generated:

```env
JWT_SECRET=379ecc4866973d0a05642e99d07ba3607104a7bb3d88735cf1b289e5d0956c2536f4ecdf47bf82218dd9fc9baa854a553b8e61f822bec78e64557953fb0e5147
JWT_REFRESH_SECRET=53e132a86ca1edc398c07d1c1304af909bbfe17c9d6ab9da89046f44cac944c90d0f7a5c3196c9521a75c05841379ae888c61b26a8206995b858dd76a18ae228
SESSION_SECRET=5056799dcef81d0ad2f49fe5129e4689562c5ad28f509e9c0fc9c085824da9709159b9d44b0215f5bf7a4eab5d3c2110c8b72ce891ec52f4cfdfaecf33a49af1
```

These are already in your `server/.env` file. Keep them secret!

## 📝 Demo Credentials

### Manager Account
- Email: `manager@democafe.local`
- Password: `password123`
- Access: Manager Dashboard, Orders, Analytics

### Kitchen Account
- Email: `kitchen@democafe.local`
- Password: `password123`
- Access: Kitchen Display only

### Admin Account
- Email: `admin@menubloom.local`
- Password: `password123`
- Access: Full system access

## ✅ Verification Checklist

- [ ] MongoDB running locally or Atlas connection working
- [ ] Backend starts successfully on port 5000
- [ ] Frontend starts successfully on port 5173
- [ ] Can login as manager at `/manager/login`
- [ ] Customer view loads at `/customer?table=1`
- [ ] Menu items display correctly
- [ ] Can add items to cart
- [ ] Orders appear in manager dashboard
- [ ] Socket.io connects (check browser console)

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check browser console for errors (F12)
5. Check backend terminal for error logs

## 🔐 Security Notes

- The generated secrets are secure for local development
- Never commit `.env` files to git (already in `.gitignore`)
- For production, regenerate all secrets
- Use real Zarrinpal merchant ID for production
- Enable HTTPS for production deployments

---

**Ready to start! Run `npm run dev` and `cd server && npm run dev` in separate terminals.**
