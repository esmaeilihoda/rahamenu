# Menu Bloom - Free Deployment Guide

Complete step-by-step guide to deploy your project for free using Vercel (frontend), Render (backend), and MongoDB Atlas (database).

---

## Part 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up Free"
3. Create account with email
4. Verify email

### 1.2 Create Free Cluster
1. After login, click "Create a Deployment"
2. Choose **M0 (Free Tier)**
3. Select your preferred region (e.g., `US East`)
4. Click "Create Deployment"
5. Wait 2-3 minutes for cluster to provision

### 1.3 Create Database User
1. In Atlas dashboard, go to **Security > Database Access**
2. Click "Add New Database User"
3. Choose "Username and Password" auth
4. Set:
   - Username: `menubloom_user` (or any name)
   - Password: (generate strong one - save it!)
5. Click "Add User"

### 1.4 Whitelist IP (Allow Access)
1. Go to **Security > Network Access**
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for free tier, set to `0.0.0.0/0`)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go back to **Databases** overview
2. Click "Connect" on your cluster
3. Choose "Drivers" 
4. Select "Node.js" and version "3.0 or later"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://menubloom_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Replace default database name if needed, e.g., add `/menubloom` before `?`:
   ```
   mongodb+srv://menubloom_user:your_password@cluster0.xxxxx.mongodb.net/menubloom?retryWrites=true&w=majority
   ```

**Save this connection string - you'll need it for backend!**

---

## Part 2: Prepare Backend for Deployment

### 2.1 Check `server/package.json`
Ensure these scripts exist:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

If you use `tsx` in production (not recommended), use:
```json
"start": "tsx src/index.ts"
```

### 2.2 Update `server/src/index.ts`
Make sure the port reads from environment:
```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2.3 Create `server/.env.production`
This is for local reference only:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://menubloom_user:your_password@cluster0.xxxxx.mongodb.net/menubloom?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_chars_long_here
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 2.4 Ensure CORS is Configured
In `server/src/index.ts`, your CORS setup should allow your frontend:
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
```

### 2.5 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Part 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Click "Sign Up"
3. Use GitHub account to sign up (recommended)
4. Authorize Render to access your repos

### 3.2 Connect GitHub Repository
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Click "Connect Account" next to GitHub
4. Select repository `rahamenu`
5. Choose branch `main`
6. Click "Connect"

### 3.3 Configure Web Service
Fill in the form:
- **Name**: `menubloom-api` (or `rahamenu-api`)
- **Environment**: `Node`
- **Build Command**: 
  ```
  cd server && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd server && npm start
  ```
- **Instance Type**: `Free`

### 3.4 Add Environment Variables
1. In the form, scroll to "Environment"
2. Add variables:
   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://menubloom_user:your_password@cluster0.xxxxx.mongodb.net/menubloom?retryWrites=true&w=majority
   JWT_SECRET = your_super_secret_key_minimum_32_chars_long_here
   CORS_ORIGIN = https://your-frontend-domain.vercel.app
   ```

### 3.5 Deploy
1. Click "Create Web Service"
2. Wait for build (3-5 minutes)
3. Once deployed, you'll see a URL like:
   ```
   https://menubloom-api.onrender.com
   ```
4. **Save this URL - you need it for frontend!**

### 3.6 Verify Backend is Running
1. Open `https://menubloom-api.onrender.com/api/v1/health` in browser
2. Should see JSON response
3. If 502 error, check Render logs for errors

---

## Part 4: Prepare Frontend for Deployment

### 4.1 Create `frontend/.env.production`
```
VITE_API_BASE_URL=https://menubloom-api.onrender.com/api/v1
VITE_RESTAURANT_ID=demo-cafe
```

Note: Replace `https://menubloom-api.onrender.com` with your actual Render URL.

### 4.2 Update `vite.config.ts`
Make sure it uses the env variable:
```typescript
export default defineConfig({
  // ... other config
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
```

### 4.3 Update API Client (`src/lib/api/index.ts` or similar)
Ensure it uses the env variable:
```typescript
const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  // ... rest of config
});
```

### 4.4 Push Changes
```bash
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

---

## Part 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### 5.2 Import Project
1. After login, click "Add New..."
2. Select "Project"
3. Select repository `rahamenu`
4. Click "Import"

### 5.3 Configure Project
In the import dialog:
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (or leave empty if root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5.4 Add Environment Variables
Before deploying, add:
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://menubloom-api.onrender.com/api/v1`
- **Name**: `VITE_RESTAURANT_ID`
- **Value**: `demo-cafe`

Click "Add" for each variable.

### 5.5 Deploy
1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Once done, you'll get a URL like:
   ```
   https://menubloom-xxxxx.vercel.app
   ```
4. **Save this URL - share with others!**

### 5.6 Update Backend CORS
Now that you have the frontend URL, update backend:
1. Go to Render dashboard
2. Select your `menubloom-api` service
3. Go to "Environment"
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   https://menubloom-xxxxx.vercel.app
   ```
5. Click "Save Changes"
6. Service will redeploy automatically

---

## Part 6: Seed Initial Data

### 6.1 Create Seed Script (Optional but Recommended)
Create `server/src/scripts/seed.ts`:
```typescript
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.model';
import { Vibe } from '../models/Vibe.model';
import { MenuItem } from '../models/MenuItem.model';

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Create or get demo restaurant
    let restaurant = await Restaurant.findOne({ slug: 'demo-cafe' });
    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: 'Demo Café',
        slug: 'demo-cafe',
        description: 'Demo restaurant for Menu Bloom',
      });
      console.log('✅ Created demo restaurant');
    }

    // Create vibes
    const vibes = [
      { key: 'energy', label: 'انرژی‌بخش', emoji: '⚡', restaurantId: restaurant._id },
      { key: 'relaxing', label: 'آرام‌بخش', emoji: '🧘', restaurantId: restaurant._id },
      { key: 'hungry', label: 'خوراکی', emoji: '🥐', restaurantId: restaurant._id },
      { key: 'cold-drink', label: 'نوشیدنی سرد', emoji: '❄️', restaurantId: restaurant._id },
    ];
    
    for (const vibe of vibes) {
      const exists = await Vibe.findOne({ key: vibe.key, restaurantId: restaurant._id });
      if (!exists) {
        await Vibe.create(vibe);
        console.log(`✅ Created vibe: ${vibe.label}`);
      }
    }

    // Create sample menu items
    const items = [
      {
        name: 'اسپرسو',
        description: 'قهوه اسپرسو ایتالیایی',
        price: 50000,
        category: 'coffee',
        vibes: ['energy'],
        available: true,
        restaurantId: restaurant._id,
      },
      {
        name: 'لته',
        description: 'کافی لته با شیر',
        price: 75000,
        category: 'coffee',
        vibes: ['energy', 'relaxing'],
        available: true,
        restaurantId: restaurant._id,
      },
    ];

    for (const item of items) {
      const exists = await MenuItem.findOne({ name: item.name, restaurantId: restaurant._id });
      if (!exists) {
        await MenuItem.create(item);
        console.log(`✅ Created menu item: ${item.name}`);
      }
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### 6.2 Add Seed Script to package.json
```json
{
  "scripts": {
    "seed": "tsx src/scripts/seed.ts"
  }
}
```

### 6.3 Run Seed Locally
```bash
cd server
MONGODB_URI="mongodb+srv://menubloom_user:your_password@cluster0.xxxxx.mongodb.net/menubloom?retryWrites=true&w=majority" npm run seed
```

---

## Part 7: Test Live Deployment

### 7.1 Test Backend
1. Open `https://menubloom-api.onrender.com/api/v1/health` in browser
2. Should see JSON health check response

### 7.2 Test Frontend
1. Open `https://menubloom-xxxxx.vercel.app` in browser
2. Login page should load
3. Try logging in (use your test credentials)
4. Verify menu loads
5. Test adding/editing menu items
6. Check that vibes appear

### 7.3 Common Issues & Fixes

**Issue: CORS error in browser console**
- Fix: Update `CORS_ORIGIN` in Render backend environment to match Vercel frontend URL

**Issue: 502 Bad Gateway on Render**
- Fix: Check Render logs for errors
- Ensure `MONGODB_URI` is correct
- Ensure server is listening on `process.env.PORT`

**Issue: Menu doesn't load on frontend**
- Fix: Check browser console for error
- Verify `VITE_API_BASE_URL` in Vercel environment
- Confirm backend is responding at that URL

**Issue: Backend times out on first request**
- Normal: Free Render instances spin down after 15 min of inactivity
- First request takes 30 seconds to wake up
- No issue - just wait, subsequent requests are fast

---

## Part 8: Share with Others

### 8.1 What to Share
Send this link: `https://menubloom-xxxxx.vercel.app`

### 8.2 Test Credentials
Create test user accounts or provide demo login info

### 8.3 Note About Free Tier
- Backend will "sleep" after 15 min inactivity (first request takes 30s)
- Database has 512MB storage (plenty for demo)
- Frontend is always-on (no sleep)

---

## Part 9: Optional - Custom Domain

### Vercel Custom Domain
1. In Vercel project settings
2. Go to "Domains"
3. Add your custom domain
4. Follow DNS setup instructions

### Render Custom Domain
1. In Render service settings
2. Add custom domain
3. Update CORS in backend to new domain

---

## Troubleshooting Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with correct password
- [ ] IP whitelist allows 0.0.0.0/0
- [ ] Backend repo pushed to GitHub
- [ ] Render connected to GitHub repo
- [ ] Backend environment variables set correctly
- [ ] Backend deployed successfully (check logs)
- [ ] Frontend `.env.production` has correct API URL
- [ ] Frontend repo pushed to GitHub
- [ ] Vercel connected to GitHub repo
- [ ] Frontend environment variables set correctly
- [ ] Frontend deployed successfully
- [ ] Backend CORS updated with frontend URL
- [ ] Initial data seeded in MongoDB
- [ ] Both frontend and backend URLs work in browser
- [ ] Login works
- [ ] Menu loads
- [ ] Can create/edit items
- [ ] Vibes appear and work

---

## Quick Reference URLs

After deployment, you'll have:
- **Frontend**: `https://menubloom-xxxxx.vercel.app`
- **Backend API**: `https://menubloom-api.onrender.com`
- **MongoDB Atlas**: `https://cloud.mongodb.com` (dashboard)
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Render Dashboard**: `https://dashboard.render.com`

---

## Next Steps

1. Follow Part 1-2 to set up MongoDB and prepare backend
2. Follow Part 3 to deploy backend to Render
3. Follow Part 4-5 to deploy frontend to Vercel
4. Follow Part 6 to seed initial data
5. Follow Part 7 to test everything
6. Follow Part 8 to share with others
