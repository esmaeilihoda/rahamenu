# Authentication Setup Complete! 🔐

## What's Been Implemented

### ✅ Backend Authentication (Already Complete)
- JWT-based authentication with bcrypt password hashing (12 rounds)
- User model with role-based access control (admin/manager/staff)
- Auth middleware for protected routes
- Login, register, refresh token, logout endpoints

### ✅ Frontend Authentication (Just Added)

#### **New Files Created:**
```
src/
├── lib/api.ts                      # Axios client with interceptors
├── context/AuthContext.tsx         # Auth state management
├── hooks/useAuth.ts                # Auth hook
├── components/
│   ├── ProtectedRoute.tsx          # Route protection wrapper
│   └── manager/
│       └── LoginForm.tsx           # Login form component
└── pages/
    └── ManagerLogin.tsx            # Login page
```

#### **Modified Files:**
- `src/App.tsx` - Added AuthProvider and protected routes
- `src/pages/ManagerDashboard.tsx` - Added user info and logout button

## Features Implemented

### 🔐 Security Features
- ✅ JWT tokens with automatic refresh
- ✅ Axios interceptors for auth headers
- ✅ 401 handling with auto-redirect
- ✅ Token persistence in localStorage
- ✅ Multi-tab auth state sync
- ✅ Protected routes with role checking
- ✅ Auto-redirect if already logged in
- ✅ Password visibility toggle
- ✅ Form validation with Zod

### 🎨 UI/UX Features
- ✅ Beautiful login form with shadcn/ui
- ✅ Loading states on submit
- ✅ Error message display
- ✅ "Remember me" checkbox
- ✅ Persian/RTL support
- ✅ Smooth animations with Framer Motion
- ✅ User info in dashboard sidebar
- ✅ Logout button with icon

## How to Test

### 1. **Start the Backend Server**
```bash
cd server
npm install
# Make sure MongoDB is running
npm run dev
```

### 2. **Start the Frontend**
```bash
# In root directory
npm run dev:client
# Or use the combined command:
npm run dev
```

### 3. **Create a Test User**

Open your terminal and run:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@menubloom.com",
    "password": "password123",
    "name": "Test Manager",
    "role": "manager"
  }'
```

Or use a tool like Postman/Insomnia.

### 4. **Test Login Flow**

1. Go to `http://localhost:5173/manager` (will redirect to login)
2. Enter credentials:
   - **Email**: `manager@menubloom.com`
   - **Password**: `password123`
3. Click "ورود به پنل" (Login)
4. You should be redirected to the manager dashboard
5. See your name and email in the sidebar
6. Test logout button

### 5. **Test Protected Routes**

- Try accessing `/manager` without logging in → redirects to `/manager/login`
- Try accessing `/manager/login` while logged in → redirects to `/manager`
- Open multiple tabs → auth state syncs across tabs
- Refresh page → stays logged in (token persisted)

## API Endpoints Available

### Authentication
```
POST   /api/v1/auth/register        # Create new user
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/logout          # Logout (invalidate token)
GET    /api/v1/auth/me              # Get current user
PATCH  /api/v1/auth/profile         # Update profile
PATCH  /api/v1/auth/change-password # Change password
```

## Environment Variables

### Frontend (`.env`)
Create a `.env` file in the **root directory**:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Backend (Already exists as `server/.env`)
Make sure your `server/.env` has:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/menu-bloom
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

## Edge Cases Handled

✅ **Token expiry during active session**
   - Axios interceptor auto-refreshes token before expiry
   
✅ **Multiple tabs open**
   - localStorage events sync auth state across tabs
   
✅ **Network errors during login**
   - Error messages displayed to user
   - Can retry
   
✅ **Already logged in visiting login page**
   - Automatically redirects to dashboard
   
✅ **Unauthorized access attempts**
   - Protected routes redirect to login
   - Original destination saved for post-login redirect
   
✅ **Token invalidation**
   - Logout clears all tokens
   - Invalid tokens trigger auto-logout

## User Roles & Permissions

### Role Hierarchy
1. **admin** - Full access to everything
2. **manager** - Can access manager dashboard, manage menu, orders, tables
3. **staff** - Limited access (can update orders, call waiter, etc.)

### Route Protection Example
```tsx
// Requires any authenticated user
<ProtectedRoute>
  <SomePage />
</ProtectedRoute>

// Requires specific role (admin can access anyway)
<ProtectedRoute requiredRole="manager">
  <ManagerDashboard />
</ProtectedRoute>
```

## What's Next?

Now you can:
1. **Seed restaurant data** for your test manager
2. **Connect frontend components** to backend API
3. **Add more protected routes** (kitchen display, analytics, etc.)
4. **Implement refresh token rotation** for better security
5. **Add password reset flow** via email
6. **Add two-factor authentication** (2FA)

## Troubleshooting

### Login not working?
- Check backend is running on port 5000
- Check MongoDB is running
- Check `.env` files are configured
- Check browser console for errors
- Verify CORS settings

### Token not persisting?
- Check localStorage in DevTools
- Clear localStorage and try again
- Check for browser privacy settings blocking localStorage

### 401 Errors?
- Token might be expired (should auto-refresh)
- Clear localStorage and login again
- Check JWT_SECRET matches on backend

### CORS Errors?
- Make sure `CLIENT_URL` in server `.env` matches your frontend URL
- Check backend CORS configuration in `server/src/index.ts`

---

**🎉 Authentication is fully functional!** You can now securely access the manager dashboard.
