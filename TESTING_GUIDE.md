# Testing the Complete Customer → Manager Flow

## 🎯 Quick Test Guide

### Step 1: Generate QR Code
1. Open Manager Dashboard: `http://localhost:8080/manager`
2. Click **"ساخت QR"** tab
3. Enter table number (e.g., **1**)
4. Real QR code will be generated!
5. Click **"دانلود PNG"** to save QR image
6. OR click copy button to copy the URL

### Step 2: Test as Customer
**Option A: Use QR Code** (Recommended)
- Scan the generated QR code with your phone camera
- Should open: `http://localhost:8080/demo-cafe/customer?table=1`

**Option B: Direct URL**
- Open in browser: `http://localhost:8080/demo-cafe/customer?table=1`
- Replace `1` with any table number you want

### Step 3: Place an Order
1. Customer view shows **"میز 1"** (or your table number) in header
2. Browse menu items (should load from backend now)
3. Click an item → Customize it (milk, sweetness, add-ons)
4. Add to cart
5. Click **"مشاهده سبد"** (View Cart) at bottom
6. Click **"تکمیل سفارش"** (Complete Order)
7. Choose payment method

### Step 4: See Order in Manager Dashboard
1. Go back to Manager Dashboard
2. Click **"سفارشات"** (Orders) tab
3. You should see the order with:
   - **Table number**: Table 1
   - **Items**: What customer ordered
   - **Status**: Pending (yellow badge)
   - **Total amount**: Calculated price

### Step 5: Update Order Status
Click status buttons to move order through lifecycle:
- **Pending** → **Confirmed** → **Preparing** → **Ready** → **Served**

---

## 🐛 Troubleshooting

### "No orders showing"
✅ **Fixed!** The issue was:
- Frontend was sending `tableId: "1"` (string)
- Backend expected `tableNumber: 1` (integer)
- Now correctly sends `tableNumber` as integer

### "Table shows 'میز ؟' instead of table number"
✅ **Fixed!** Customer view now reads `?table=X` from URL

### "QR code doesn't scan"
✅ **Fixed!** Now generates real QR codes using `qrcode` library
- Scans directly to customer page with table number
- Downloads as PNG for printing

### "Order doesn't update table status"
The backend automatically:
1. Creates order with `tableNumber`
2. Updates table status to `'ordered'`
3. Emits Socket.io event for real-time updates
4. Manager dashboard receives the update

---

## 📊 Expected Flow

```
Customer Scans QR (Table 5)
    ↓
Opens: /demo-cafe/customer?table=5
    ↓
Views Menu → Adds Items → Places Order
    ↓
Frontend sends: { tableNumber: 5, items: [...] }
    ↓
Backend creates order + updates table status
    ↓
Socket.io emits: 'order:created' event
    ↓
Manager Dashboard updates in real-time
    ↓
Shows: "Table 5 - Pending Order - 3 items - $45.00"
```

---

## 🎨 What's Now Working

### Customer Side:
✅ Dynamic table number from URL  
✅ Proper API integration with backend  
✅ Correct order submission format  
✅ Menu items loaded from database  

### Manager Side:
✅ Real QR code generation with qrcode library  
✅ Scannable QR codes that open correct URL  
✅ Download QR as PNG  
✅ Copy customer URL to clipboard  
✅ Orders appear with correct table numbers  
✅ Real-time order updates via Socket.io  

### Backend Integration:
✅ `tableNumber` sent as integer  
✅ Orders linked to correct table  
✅ Table status updates automatically  
✅ Real-time WebSocket events  

---

## 📱 Testing on Phone

1. **Print QR Code**: Download PNG and print it
2. **Scan with Camera**: Open native camera app
3. **Auto-opens Browser**: Should detect QR and open link
4. **Place Order**: Complete the flow on phone
5. **Check Desktop**: See order appear in manager dashboard

---

## 🔧 Key URLs

- **Manager Login**: `http://localhost:8080/manager/login`
- **Manager Dashboard**: `http://localhost:8080/manager`
- **Customer (Table 1)**: `http://localhost:8080/demo-cafe/customer?table=1`
- **Customer (Table 5)**: `http://localhost:8080/demo-cafe/customer?table=5`

---

## 💡 Pro Tips

1. **Test Multiple Tables**: Generate QR for tables 1-10
2. **Print & Laminate**: Download QR codes and print for physical use
3. **Real-time Updates**: Keep manager dashboard open while testing customer flow
4. **Socket.io Events**: Check browser console for real-time event logs
5. **Mobile Testing**: Test on actual phone for best results

---

**All critical issues fixed! The system now works end-to-end.** 🎉
