# Menu Bloom - Manager Guide

## 🎯 Overview
You now have full control over your restaurant's digital menu and table management through the Manager Dashboard.

## 🔐 Login
- URL: `http://localhost:8080/manager/login`
- Credentials: `manager@democafe.local` / `password123`

---

## 📱 Dashboard Tabs

### 1️⃣ **Live Floor Map** (نقشه زنده)
- Real-time view of all tables
- See table status: Available (green), Occupied (red), Reserved (yellow)
- Monitor customer activity

### 2️⃣ **Orders** (سفارشات)
- View all pending, confirmed, and completed orders
- Update order status (pending → confirmed → ready → delivered)
- Track order timing and items

### 3️⃣ **Analytics** (آنالیتیکس)
- Sales metrics and revenue
- Popular items analysis
- Peak hours data
- Table turnover metrics

### 4️⃣ **Menu Management** (مدیریت منو) ⭐ **NEW**
**Full menu item CRUD operations:**
- ➕ **Add Items**: Click "افزودن آیتم جدید"
  - Name (نام محصول)
  - Description (توضیحات)
  - Price in Toman (قیمت)
  - Category: coffee, tea, pastry, cold, food, dessert
  - Image URL (optional)
  - Vibes: energy, relaxing, cold, hungry, sweet, savory
  - Available toggle (موجود/ناموجود)
- ✏️ **Edit**: Click pencil icon on any item
- 🗑️ **Delete**: Click trash icon to remove
- 🔍 **Search**: Filter menu items in real-time

### 5️⃣ **Table Management** (مدیریت میزها) ⭐ **NEW**
**Manage your restaurant tables:**
- ➕ **Add Tables**: Click "افزودن میز جدید"
  - Table Number (شماره میز)
  - Capacity (ظرفیت - number of people)
  - Position (موقعیت - X,Y coordinates for floor map)
- ✏️ **Edit**: Modify table details
- 🗑️ **Delete**: Remove tables
- 📊 **Status**: View current status (available/occupied/reserved)

### 6️⃣ **QR Generator** (ساخت QR)
- Generate QR codes for each table
- Customers scan QR → directed to your menu with table number
- Format: `/demo-cafe/customer?table=5`

---

## 👥 Customer Flow

### How Customers Are Identified:
1. **QR Code Scan**: Each table has unique QR code
2. **URL Parameters**: QR redirects to `/demo-cafe/customer?table=5`
3. **Session Tracking**: Customer's table number stored in browser
4. **Order Association**: All orders linked to table number
5. **Real-time Updates**: Manager sees orders appear instantly via WebSocket

### Customer Journey:
```
Scan QR → Browse Menu → Build Order → Customize Items → 
Add to Cart → Choose Payment → Place Order → Manager Notified
```

---

## 🔄 Order Lifecycle

### 1. **Customer Places Order**
- Order created with status: `pending`
- Appears in Manager Dashboard "Orders" tab
- Real-time notification via Socket.io

### 2. **Kitchen Receives**
- Kitchen staff views orders in Kitchen Display System
- Updates status: `pending` → `confirmed` → `preparing`

### 3. **Order Ready**
- Kitchen marks: `preparing` → `ready`
- Customer/Staff notified

### 4. **Delivered**
- Status: `ready` → `delivered`
- Order complete

---

## 💳 Payment Methods

### 1. **Counter Payment (پرداخت در صندوق)**
- Customer marks "Pay at Counter"
- Goes to cashier
- Manager clicks "Confirm Payment" in dashboard
- Order marked as paid

### 2. **Zarrinpal Gateway (پرداخت آنلاین)**
- Customer redirected to Zarrinpal
- Pays online (sandbox mode for testing)
- Auto-verified and confirmed
- Order marked as paid

---

## 🏢 Multi-Tenant Architecture

### How It Works:
- Each restaurant has unique **slug**: `demo-cafe`
- All API requests include `X-Restaurant-Id` header
- Data isolated per restaurant
- URLs: `/demo-cafe/customer`, `/demo-cafe/manager`

### Your Restaurant:
- **Slug**: `demo-cafe`
- **ID**: `692f8e9cc1fe341f4d453fe7`
- **Name**: Demo Café

---

## 🛠️ Backend APIs Available

### Menu APIs:
- `GET /api/v1/menu` - List menu items
- `POST /api/v1/menu` - Create item
- `PUT /api/v1/menu/:id` - Update item
- `DELETE /api/v1/menu/:id` - Delete item

### Table APIs:
- `GET /api/v1/tables` - List tables
- `POST /api/v1/tables` - Create table
- `PUT /api/v1/tables/:id/status` - Update status
- `DELETE /api/v1/tables/:id` - Delete table

### Order APIs:
- `GET /api/v1/orders` - List orders
- `PUT /api/v1/orders/:id/status` - Update order status
- `GET /api/v1/orders/table/:tableId` - Get table orders

### Payment APIs:
- `POST /api/v1/payment/request` - Request payment
- `POST /api/v1/payment/verify` - Verify payment
- `POST /api/v1/payment/counter/confirm` - Confirm counter payment

---

## 🎨 UI Features

### Menu Management:
- **Grid view** with images
- **Category badges** (coffee, tea, etc.)
- **Availability toggle** (موجود/ناموجود)
- **Vibe tags** for mood-based filtering
- **Search** functionality
- **Real-time updates**

### Table Management:
- **Card layout** showing table details
- **Status badges** (available/occupied/reserved)
- **Capacity display** (👥 4 people)
- **Position coordinates** for floor map
- **QR code reference**

---

## 🚀 Next Steps

### To Test Full Flow:
1. **Add Menu Items** (if seed data is insufficient)
2. **Add/Verify Tables** exist
3. **Generate QR Code** for table 1
4. **Open Customer View**: `http://localhost:8080/demo-cafe/customer?table=1`
5. **Browse Menu** as customer
6. **Place Order**
7. **Watch Order** appear in Manager Dashboard
8. **Update Status** through order lifecycle
9. **Test Payment** flows

### Tips:
- Use **Menu Management** tab to quickly add items
- Use **Tables** tab to set up your floor layout
- **QR Generator** creates printable codes for each table
- **Analytics** shows performance metrics over time

---

## 📞 Support

If you need to:
- Add more users → Seed script or `/api/v1/auth/register`
- Change restaurant settings → Database directly (future: Settings UI)
- View raw data → MongoDB Compass on `localhost:27017/menubloom`

---

**Enjoy managing your digital restaurant! 🎉**
