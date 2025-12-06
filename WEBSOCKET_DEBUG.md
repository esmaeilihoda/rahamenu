# WebSocket Connection Debugging

## Current Issue
WebSocket failing with CSP violations and "websocket error"

## Root Causes Identified

### 1. Browser Cache
The deployed index.html has the correct CSP:
```
connect-src 'self' https://rahamenu.onrender.com https://rahamenu.vercel.app wss://rahamenu.onrender.com wss://rahamenu.vercel.app https://gs-extension-embeds-final.vercel.app http://localhost:5173 ws://localhost:5173
```

But browser console shows OLD CSP being enforced. **Solution**: Hard refresh (Ctrl+Shift+R) or clear cache.

### 2. Backend WebSocket CORS Configuration
The backend Socket.IO server uses `env.SOCKET_CORS_ORIGIN` for CORS origin.

**Check on Render.com:**
1. Go to your service → Environment
2. Verify `SOCKET_CORS_ORIGIN = https://rahamenu.vercel.app`
3. If missing or wrong, add/fix it and save (triggers redeploy)

### 3. Socket.IO Connection URL
Frontend constructs socket URL from:
```typescript
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
```

With `VITE_API_URL = https://rahamenu.onrender.com/api/v1`, this becomes:
- Socket URL: `https://rahamenu.onrender.com`
- WebSocket upgrade: `wss://rahamenu.onrender.com/socket.io/`

Both URLs are in the CSP, so this should work.

### 4. Socket.IO Handshake Process
Socket.IO connects in this order:
1. HTTP polling to `https://rahamenu.onrender.com/socket.io/?EIO=4&transport=polling`
2. Upgrades to WebSocket: `wss://rahamenu.onrender.com/socket.io/?EIO=4&transport=websocket`

If polling fails, WebSocket never happens.

## Required Environment Variables

### On Render (Backend):
```
NODE_ENV=production
MONGODB_URI=<your-atlas-connection-string>
JWT_SECRET=this_is_a_secret_key_at_least_32_characters_long_ok
CLIENT_URL=https://rahamenu.vercel.app
CORS_ORIGIN=https://rahamenu.vercel.app
SOCKET_CORS_ORIGIN=https://rahamenu.vercel.app
```

### On Vercel (Frontend):
```
VITE_API_URL=https://rahamenu.onrender.com/api/v1
VITE_RESTAURANT_ID=demo-cafe
```

## Debugging Steps

### Step 1: Clear Browser Cache
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Right-click refresh button → "Empty Cache and Hard Reload"

### Step 2: Check Backend Environment
1. Go to Render dashboard
2. Click your service
3. Go to Environment tab
4. Verify all variables above are set
5. If you make changes, click "Save Changes" (triggers redeploy)
6. Wait 2-3 minutes for redeploy

### Step 3: Test Socket Connection Manually
After clearing cache and backend redeploy:
1. Open https://rahamenu.vercel.app/manager/login
2. Open DevTools → Network tab
3. Filter by "WS" (WebSocket)
4. Login
5. Look for connection to `wss://rahamenu.onrender.com/socket.io/`

**Expected**: Connection should upgrade from polling to websocket successfully

**If still failing**: Check Console tab for exact error - should show which URL is violating CSP

### Step 4: Verify Backend is Listening
The backend health check shows it's running, but verify WebSocket server:
```
https://rahamenu.onrender.com/socket.io/
```
Should return: `{"code":0,"message":"Transport unknown"}`

This confirms Socket.IO server is listening.

## Most Likely Issue
Based on the console output showing old CSP, the issue is **browser cache**. The fix is already deployed, browser just needs to load it.

After clearing cache:
- CSP will allow wss://rahamenu.onrender.com
- Socket.IO will connect successfully
- "قطع ارتباط" will change to "متصل"
