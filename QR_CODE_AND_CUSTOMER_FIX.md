# QR Code and Customer Page Fixes

## Issues Fixed

### 1. QR Code Generation URLs
**Problem**: QR codes were generating localhost URLs (`http://localhost:5173/demo-cafe/customer?table=1`) instead of production URLs

**Solution**: Updated `src/components/manager/QRGenerator.tsx` to:
- Detect production domain from `window.location.hostname`
- Use environment variable `VITE_PRODUCTION_URL` if available
- Default to `http://localhost:5173` for development
- Update both QR code generation and URL display

**Changes**:
- Lines 6-18: Added `getBaseUrl()` function to determine correct base URL
- Line 19: Use `baseUrl` in QR code URL generation
- Line 35: Use `baseUrl` in copy-to-clipboard function
- Line 122: Display production URL in the UI instead of hardcoded localhost

### 2. Customer Page "Restaurant Context Required" Error
**Problem**: Customer pages were failing with "Restaurant context required" error because unauthenticated customers didn't have JWT tokens or restaurant_id in localStorage

**Solution**: Updated `src/lib/api.ts` to:
- Extract restaurant slug from URL path when no JWT token exists
- For URLs like `/demo-cafe/customer`, extract `demo-cafe` as the restaurant identifier
- Send extracted slug as `X-Restaurant-Id` header

**Changes**:
- Lines 20-27: Added URL path parsing logic to extract restaurant slug
- This allows the backend tenant middleware to resolve the restaurant from the URL path

## How It Works Now

### Customer Journey:
1. Manager generates QR code for table (e.g., Table 5)
2. QR code encodes: `https://rahamenu.vercel.app/demo-cafe/customer?table=5`
3. Customer scans QR code
4. Frontend extracts `demo-cafe` from URL path
5. Sends API request with header: `X-Restaurant-Id: demo-cafe`
6. Backend tenant middleware resolves to correct restaurant
7. Customer sees the menu for demo-cafe

### URL Routing:
- QR codes link to: `https://rahamenu.vercel.app/:restaurantSlug/customer?table=X`
- This matches route: `/:restaurantSlug/customer` in App.tsx
- Restaurant slug is extracted from URL and sent to backend

## Environment Configuration
No new environment variables required. The system now auto-detects:
- Production domain from `window.location.hostname`
- Restaurant slug from URL path
- Can optionally use `VITE_PRODUCTION_URL` env var for explicit control

## Testing
1. Access manager dashboard: https://rahamenu.vercel.app/manager
2. Generate QR code for any table
3. Verify URL shows: `https://rahamenu.vercel.app/demo-cafe/customer?table=X`
4. Scan or manually open the QR URL
5. Verify customer page loads menu without "restaurant context required" error
6. Verify menu items display correctly

## Files Changed
- `src/components/manager/QRGenerator.tsx`
- `src/lib/api.ts`

## Deployment
Changes are already deployed to production:
- Frontend: https://rahamenu.vercel.app
- Backend: https://rahamenu.onrender.com
