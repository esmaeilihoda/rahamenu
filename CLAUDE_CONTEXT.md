# Menu Bloom - Project Context for Claude

## Overview
Menu Bloom is a modern restaurant management web application with dual interfaces for customers and managers. Built for cafes/restaurants to provide interactive digital menus and real-time management.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Context API (CartContext)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation

## Current Features

### Customer View (`/customer`)
- **Vibe Selector**: Filter menu by mood (energy, relaxing, cold, hungry)
- **Menu Feed**: Instagram-style scrollable menu cards with images
- **Smart Builder**: Customize drinks (milk type, sweetness, add-ons)
- **Cart System**: Full cart with item management and pricing
- **Digital Bell**: Call waiter feature
- **Payment Options**: Self-service or table payment modes

### Manager Dashboard (`/manager`)
- **Live Floor Map**: Real-time table status monitoring (empty/browsing/ordered/alert)
- **Menu 86 Control**: Toggle item availability (sold out management)
- **QR Generator**: Generate table-specific QR codes
- **Persian/RTL Support**: Right-to-left UI for Persian language

### Landing Page (`/`)
- Role selection (Customer vs Manager)

## Project Structure
```
src/
├── components/
│   ├── customer/          # Customer-facing components
│   │   ├── CartSheet.tsx
│   │   ├── DigitalBell.tsx
│   │   ├── MenuCard.tsx
│   │   ├── SmartBuilder.tsx
│   │   └── VibeSelector.tsx
│   ├── manager/           # Manager dashboard components
│   │   ├── LiveFloorMap.tsx
│   │   ├── Menu86Control.tsx
│   │   └── QRGenerator.tsx
│   └── ui/                # shadcn/ui components (40+ components)
├── context/
│   └── CartContext.tsx    # Global cart state
├── data/
│   └── menuData.ts        # Menu items & table data
├── pages/
│   ├── CustomerView.tsx
│   ├── ManagerDashboard.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
└── lib/
    └── utils.ts           # Utility functions (cn, etc.)
```

## Data Models

### MenuItem
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'pastry' | 'cold';
  vibes: string[];        // ['energy', 'relaxing', 'cold', 'hungry']
  image: string;
  available: boolean;
  pairing?: string;       // Suggested pairing item
}
```

### CartItem
```typescript
{
  menuItem: MenuItem;
  quantity: number;
  milk: string;           // e.g., 'Whole Milk', 'Oat Milk'
  sweetness: number;      // 0-100
  addOns: string[];       // e.g., ['Extra Shot', 'Whipped Cream']
  totalPrice: number;
}
```

### TableData
```typescript
{
  id: number;
  status: 'empty' | 'browsing' | 'ordered' | 'alert';
  guests?: number;
  orderTime?: string;
}
```

## Current Limitations / Areas for Improvement
1. **No Backend**: All data is hardcoded (menuData.ts)
2. **No Authentication**: Manager dashboard is publicly accessible
3. **No Real-Time Updates**: Floor map doesn't update automatically
4. **No Order Management**: Orders can't be tracked/processed
5. **No Payment Integration**: Payment is simulated only
6. **No Kitchen Display**: No way for kitchen to see orders
7. **Limited Analytics**: No reporting or insights
8. **Single Restaurant**: Not multi-tenant

## Design Philosophy
- **Mobile-First**: Optimized for phone use
- **Minimalist**: Clean, modern aesthetic
- **Fast Interactions**: Animations and smooth transitions
- **Bilingual**: Persian (Farsi) with RTL support + English fallbacks
- **Instagram-Inspired**: Visual, card-based menu browsing

## Development Goals
[You can list your specific goals here when using this with Claude]

---

## How to Use This Document with Claude

1. **Copy this entire document** to Claude (https://claude.ai)
2. **Add your specific request** at the end, like:

```
Based on the Menu Bloom project above, generate a detailed prompt for GitHub Copilot to implement:
[YOUR FEATURE REQUEST]

The prompt should include:
- Exact file paths to create/modify
- Complete implementation requirements
- UI/UX specifications
- Integration with existing components/context
- Edge cases to handle
- Code structure and patterns to follow
```

3. **Copy Claude's generated prompt** back to GitHub Copilot
4. **Paste it here** and let me implement it!

## Example Features You Could Request
- Order history and tracking system
- Real-time WebSocket updates for floor map
- Manager authentication with role-based access
- Kitchen display system (KDS)
- Revenue analytics dashboard
- Table reservation system
- Loyalty points program
- Multi-language support expansion
- Staff shift management
- Inventory tracking system
- Customer feedback/rating system
- SMS/Email notifications
- Split bill functionality
- Dietary filters (vegan, gluten-free, etc.)
- Seasonal menu rotation system
