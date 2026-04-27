# 💊 MediStore Frontend

> **A production-grade, multi-role pharmacy e-commerce web application built with Next.js 16, React 19, and a unified light pharmacy design system — featuring real-time order tracking, multi-warehouse fulfillment dashboards, and role-based navigation.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Application Architecture](#application-architecture)
- [User Roles & Dashboard Routes](#user-roles--dashboard-routes)
- [System Workflow](#system-workflow)
- [Page Reference](#page-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)

---

## Overview

MediStore Frontend is a Next.js 15 App Router application that serves four distinct user roles — **Customer**, **Seller**, **Admin**, and **Warehouse Manager** — each with a fully isolated, role-specific dashboard. The app features a public-facing pharmacy storefront, AI chatbot, real-time order tracking, multi-seller cart checkout, and a complete warehouse operations suite.

---

## Tech Stack

| Layer             | Technology                                          |
|-------------------|-----------------------------------------------------|
| Framework         | Next.js 16 (App Router)                             |
| UI Library        | React 19                                            |
| Language          | TypeScript                                          |
| Styling           | Vanilla CSS (custom design system via `globals.css`)|
| Animations        | Framer Motion                                       |
| Icons             | React Icons (Font Awesome 6 set)                    |
| Notifications     | Sonner (toast notifications)                        |
| Auth              | Better Auth (session cookies, `credentials: include`)|
| Maps/Geo          | GPS coordinate picker (custom)                      |
| Charts            | Recharts                                            |
| PDF Viewer        | PDF.js / Cloudinary proxy                           |
| HTTP              | Native `fetch` with `credentials: include`          |

---

## Design System

All pages share a unified **Light Pharmacy Theme** defined in `globals.css`.

### Color Palette

| Token       | Hex       | Usage                              |
|-------------|-----------|------------------------------------|
| Navy        | `#1B3A5C` | Primary headings, key data         |
| Amber       | `#C2703A` | CTAs, prices, highlights           |
| Steel Blue  | `#3A6EA5` | Info states, links                 |
| Cream       | `#F5EDE3` | Page backgrounds, soft containers  |
| Warm Tan    | `#8A6650` | Secondary text, labels             |
| Border      | `#DDD0C4` | Card borders, dividers             |
| Green       | `#2E7D32` | Success, delivered, credits        |
| Sky Blue    | `#0EA5E9` | Dispatch, active states            |
| Purple      | `#7C3AED` | In-transit, packing states         |

### Core CSS Classes

```css
.medi-page   /* Page wrapper — cream background, max-width, padding */
.medi-card   /* White card — rounded-2xl, border, subtle shadow      */
```

### Component Patterns

- **Stat Grid** — `2×4` metric cards at top of every dashboard page
- **Filter Pill Tabs** — Rounded pill buttons with live counts
- **Status Badges** — Color-coded `px-3 py-1 rounded-full` pills
- **Gradient Card Headers** — `linear-gradient(90deg, {color}10, #FFF)`
- **Status Hint Bar** — Thin colored bar below card header
- **Expandable Rows** — Framer Motion `height: 0 → auto` animations
- **Action Footer** — Sticky bottom row with CTA buttons

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MediStore Frontend                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Public Routes                       │   │
│  │  / (home) · /medicines · /blogs · /about · /auth     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Role-Based Dashboard                    │   │
│  │                                                      │   │
│  │  /dashboard/customer/*   → Customer portal          │   │
│  │  /dashboard/seller/*     → Seller portal            │   │
│  │  /dashboard/admin/*      → Admin control panel      │   │
│  │  /dashboard/warehouse/*  → WMS operations           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes (/api/*)              │   │
│  │          Proxy → Backend (localhost:4000)             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Roles & Dashboard Routes

### 🛒 Customer (`/dashboard/customer/`)

| Page           | Route                         | Purpose                                      |
|----------------|-------------------------------|----------------------------------------------|
| Overview       | `/customer` (index)           | Stats: orders, wallet, wishlist              |
| Orders         | `/customer/orders`            | Order history list                           |
| Tracking       | `/customer/tracking`          | Real-time multi-seller journey tracker       |
| Cart           | `/customer/cart`              | Cart management                              |
| Checkout       | `/customer/checkout`          | Address, coupon, payment                     |
| Wallet         | `/customer/wallet`            | Balance, transactions                        |
| Prescriptions  | `/customer/prescription`      | Upload & track prescriptions                 |
| Wishlist       | `/customer/wishlist`          | Saved medicines                              |
| Returns        | `/customer/returns`           | Return request form & history                |
| Coupons        | `/customer/coupons`           | Available discount codes                     |
| Search         | `/customer/search`            | Medicine search with filters                 |
| Notifications  | `/customer/notifications`     | In-app alerts                                |
| Subscription   | `/customer/subscription`      | Premium plan management                      |
| Support        | `/customer/support`           | Contact form                                 |
| Profile        | `/customer/profile`           | Account settings                             |

### 🏪 Seller (`/dashboard/seller/`)

| Page           | Route                         | Purpose                                      |
|----------------|-------------------------------|----------------------------------------------|
| Overview       | `/seller` (index)             | Revenue, orders, stock KPIs                  |
| Medicines      | `/seller/medicines`           | Medicine listing management                  |
| Add Medicine   | `/seller/addMedicine`         | Upload new medicine with image               |
| Edit Medicine  | `/seller/updateMedicine`      | Edit existing listing                        |
| Catalog        | `/seller/catalog`             | Full product catalog view                    |
| Orders         | `/seller/orders`              | Incoming order management                    |
| Batches        | `/seller/batches`             | Lot/batch tracking with expiry               |
| Stock Alerts   | `/seller/stock-alerts`        | Low-stock notifications                      |
| Flash Sales    | `/seller/flash-sale`          | Time-limited discount campaigns              |
| Coupons        | `/seller/coupons`             | Seller-specific coupon codes                 |
| Wallet         | `/seller/wallet`              | Earnings, withdrawal requests                |
| Returns        | `/seller/returns`             | Return requests management                   |
| License        | `/seller/license`             | Pharmacy license upload & status             |
| Subscription   | `/seller/subscription`        | Seller plan management                       |
| Analytics      | `/seller/analytics`           | Sales trends, revenue charts                 |
| Notifications  | `/seller/notifications`       | Alerts from admin/system                     |
| Profile        | `/seller/profile`             | Seller account settings                      |

### 🔧 Admin (`/dashboard/admin/`)

| Page              | Route                        | Purpose                                   |
|-------------------|------------------------------|-------------------------------------------|
| Overview          | `/admin` (index)             | Platform-wide KPIs                        |
| Users             | `/admin/users`               | User management, role assignment          |
| Orders            | `/admin/orders`              | All orders across platform                |
| Medicines         | `/admin/featured-products`   | Featured product curation                 |
| Categories        | `/admin/categories`          | Medicine category management              |
| License           | `/admin/license`             | Seller license review & approval          |
| Prescription      | `/admin/prescription`        | Prescription verification queue           |
| Flash Sales       | `/admin/flash-sale`          | Flash sale approval                       |
| Coupons           | `/admin/coupons`             | Platform-wide coupon management           |
| Banners           | `/admin/banners`             | Homepage banner CMS                       |
| Blogs             | `/admin/blogs`               | Health article CMS                        |
| Testimonials      | `/admin/testimonials`        | Customer testimonial management           |
| Platform Features | `/admin/platform-features`   | Feature highlight cards CMS               |
| Warehouses        | `/admin/warehouses`          | Warehouse creation & manager assignment   |
| Returns           | `/admin/returns`             | Return request approvals                  |
| Payouts           | `/admin/payouts`             | Seller withdrawal approvals               |
| Wallet            | `/admin/wallet`              | Wallet oversight                          |
| Newsletter        | `/admin/newsletter`          | Subscriber management                     |
| Messages          | `/admin/messages`            | Contact form inbox                        |
| Support           | `/admin/support`             | Support ticket management                 |
| Fraud Flags       | `/admin/fraud-flags`         | Suspicious activity review                |
| Audit Logs        | `/admin/audit-logs`          | System audit trail                        |
| Settings          | `/admin/platform-settings`   | Global platform configuration             |
| Profile           | `/admin/profile`             | Admin account settings                    |

### 🏭 Warehouse (`/dashboard/warehouse/`)

| Page        | Route                   | Purpose                                                    |
|-------------|-------------------------|------------------------------------------------------------|
| Overview    | `/warehouse/overview`   | Warehouse KPIs — pending, packed, dispatched counts        |
| Orders      | `/warehouse/orders`     | Incoming order queue with status breakdown                 |
| Routing     | `/warehouse/routing`    | Shipment leg management — receive from sellers, route legs |
| Packing     | `/warehouse/packing`    | Pick & pack — stage per-seller packages, create packing slip|
| Dispatch    | `/warehouse/dispatch`   | Dispatch packed orders, confirm customer delivery          |
| Fulfillment | `/warehouse/fulfillment`| Delivery history archive with seller credit timeline       |
| Inventory   | `/warehouse/inventory`  | Stock levels, search, medicine tracking                    |
| Locations   | `/warehouse/locations`  | Warehouse location/zone management                         |
| Bins        | `/warehouse/bins`       | Storage bin allocation                                     |
| Analytics   | `/warehouse/analytics`  | Operational performance charts                             |
| Expiry      | `/warehouse/expiry`     | Expiry date monitoring & alerts                            |
| Temperature | `/warehouse/temperature`| Cold chain temperature logging                             |
| Profile     | `/warehouse/profile`    | Warehouse manager account                                  |

---

## System Workflow

### 1. Customer Order Journey

```
[Public Storefront]
  Browse Medicines → Add to Cart → Apply Coupon
      ↓
[Checkout]
  Enter Address (GPS picker) → Select Payment Method
  SSLCommerz / Wallet → Order Placed
      ↓
[Customer Tracking: /customer/tracking]
  Per-seller journey visualization:
  ┌─────────────────────────────────────────────────────┐
  │  Order Placed → Seller Processing → Seller Shipped  │
  │  → At Origin WH → In Transit → At Dest WH          │
  │  → Packing → Out for Delivery → Delivered ✓         │
  └─────────────────────────────────────────────────────┘
  Animated progress bar + per-milestone timestamps
```

### 2. Warehouse Operations Workflow

```
[/warehouse/routing]
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  SELLER_PREPARING                                        │
│       │                                                  │
│  AWAITING_ORIGIN_WH ──────────────────────────────┐     │
│       │                                           │     │
│  [Same WH?] ──Yes──► AT_DEST_WH (skip transit)   │     │
│       │No                                         │     │
│  [Receive from Seller]                            │     │
│       │                                           │     │
│  AT_ORIGIN_WH                                     │     │
│       │                                           │     │
│  [Dispatch to Dest WH]                            │     │
│       │                                           │     │
│  IN_TRANSIT                                       │     │
│       │                                           │     │
│  [Confirm Arrival]                                │     │
│       │                                           │     │
│  AT_DEST_WH ◄─────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
       ↓
[/warehouse/packing]
  FulfillmentTask: PENDING → CONSOLIDATING
  Worker clicks "Mark Received" per seller package
  All packages received? → "Create Packing Slip" → PICKED
       ↓
[/warehouse/dispatch]
  PACKED → "Dispatch to Customer" → DISPATCHED
  "Mark Customer Received" → DELIVERED
  → Auto-credit seller wallets ✓
       ↓
[/warehouse/fulfillment]
  Read-only history — seller credits shown per order
```

### 3. Same-Warehouse Fast Path (Visual)

```
Routing Page Card (sameWH = true):
  ┌─────────────────────────────────────────────────┐
  │  🏬 Same Warehouse — No Transit                  │
  │  Dhaka WH · Seller ships → Receive → Pick & Pack│
  │                                                  │
  │  [🟠 Receive from Seller → Pick & Pack]          │
  └─────────────────────────────────────────────────┘
        ↓ (one click)
  Packing page shows the order immediately
```

---

## Page Reference

### Customer Tracking Page (`/customer/tracking`)
- Fetches `GET /api/orders/my` including `subOrders`, `shipmentLeg`, `fulfillmentTask`
- Per-seller `deriveJourney()` maps live status into 9 visual timeline steps
- Animated progress bar with % milestones (3% → 100%)
- Expandable per-seller panels with warehouse route summary
- Delivered orders show green "🎉 All sellers paid" banner

### Warehouse Routing Page (`/warehouse/routing`)
- Fetches `GET /api/shipment-legs/mine` for warehouse manager's legs
- Detects `sameWH = originWarehouseId === destWarehouseId`
- **Same-WH:** Single action — "Receive from Seller → Pick & Pack" (amber)
- **Multi-WH:** Origin actions: Confirm Receipt → Dispatch; Dest actions: Confirm Arrival
- Tab filters: All / Incoming / Ready to Dispatch / In Transit / Arrived

### Warehouse Packing Page (`/warehouse/packing`)
- Fetches fulfillment tasks with status `CONSOLIDATING` or `PICKED`
- Per-seller staging rows with individual "📥 Mark Received" buttons
- Progress bar shows `received / total` legs
- "📦 Create Packing Slip" button unlocks when all legs are `AT_DEST_WH`

### Warehouse Dispatch Page (`/warehouse/dispatch`)
- Fetches tasks with status `PACKED` or `DISPATCHED`
- Filter pills: All / Ready / Dispatched
- "Dispatch to Customer" (sky blue) → "Mark Customer Received" (green)
- Shows all seller credits on delivery confirmation

### Warehouse Fulfillment History (`/warehouse/fulfillment`)
- Read-only archive of `DELIVERED` tasks (newest first)
- Stat grid: delivered count, total revenue, sellers paid, warehouses
- Expandable order tracking timeline with dot connector

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MediStore Backend running on `http://localhost:4000`

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd mediStore_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on **http://localhost:3000**

### Development Scripts

```bash
npm run dev      # Start Next.js dev server with hot reload
npm run build    # Production build (TypeScript checked)
npm run start    # Serve production build
npm run lint     # ESLint check
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Better Auth
BETTER_AUTH_SECRET="same-secret-as-backend"
BETTER_AUTH_URL="http://localhost:3000"

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

> **Note:** All API calls use relative `/api/*` paths — Next.js rewrites proxy to the backend. No `NEXT_PUBLIC_API_URL` needed for browser-side calls.

---

## Project Structure

```
mediStore_frontend/
├── src/
│   ├── app/
│   │   ├── (public)/                  # Public storefront pages
│   │   │   ├── page.tsx               # Homepage (banners, flash sales, medicines)
│   │   │   ├── medicines/             # Browse all medicines
│   │   │   ├── blogs/                 # Health articles
│   │   │   ├── about/                 # About page
│   │   │   └── auth/                  # Login / Register
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Dashboard landing / role redirect
│   │   │   ├── layout.tsx             # Sidebar + header shell
│   │   │   │
│   │   │   ├── (commonRoute)/         # Shared across roles
│   │   │   │   └── notifications/
│   │   │   │
│   │   │   └── (roleBasedRoute)/
│   │   │       ├── customer/          # 14 customer pages
│   │   │       │   ├── tracking/      # ← Real-time order journey
│   │   │       │   ├── cart/
│   │   │       │   ├── checkout/
│   │   │       │   └── ...
│   │   │       │
│   │   │       ├── seller/            # 17 seller pages
│   │   │       │   ├── addMedicine/
│   │   │       │   ├── flash-sale/
│   │   │       │   └── ...
│   │   │       │
│   │   │       ├── admin/             # 23 admin pages
│   │   │       │   ├── license/       # ← PDF viewer with Cloudinary proxy
│   │   │       │   ├── warehouses/
│   │   │       │   └── ...
│   │   │       │
│   │   │       └── warehouse/         # 13 warehouse pages
│   │   │           ├── routing/       # ← Shipment leg management
│   │   │           ├── packing/       # ← Pick & pack workflow
│   │   │           ├── dispatch/      # ← Dispatch & deliver
│   │   │           ├── fulfillment/   # ← Delivery history
│   │   │           └── ...
│   │   │
│   │   ├── api/                       # Next.js API route handlers
│   │   ├── globals.css                # Design system tokens + medi-page/medi-card
│   │   ├── layout.tsx                 # Root layout (Sonner, fonts)
│   │   └── not-found.tsx              # Custom 404
│   │
│   └── components/                    # Shared UI components
│       ├── Sidebar/
│       ├── Header/
│       └── ...
│
├── public/                            # Static assets
└── package.json
```

---

## API Integration

All data fetching uses the browser's native `fetch` API with `credentials: include` to pass session cookies:

```typescript
// Standard pattern used across all warehouse/customer pages
const res = await fetch("/api/fulfillment/my-queue", {
  credentials: "include",
});
const data = await res.json();
```

### Route → API Mapping

| Frontend Page             | API Endpoint                                  |
|---------------------------|-----------------------------------------------|
| Customer tracking         | `GET /api/orders/my`                          |
| Warehouse routing         | `GET /api/shipment-legs/mine`                 |
| Warehouse packing         | `GET /api/fulfillment/my-queue`               |
| Warehouse dispatch        | `GET /api/fulfillment/my-queue`               |
| Fulfillment history       | `GET /api/fulfillment/my-queue`               |
| Confirm receipt (seller)  | `PATCH /api/shipment-legs/:id/receive-at-origin` |
| Dispatch inter-WH         | `PATCH /api/shipment-legs/:id/dispatch`        |
| Confirm dest arrival      | `PATCH /api/shipment-legs/:id/receive-at-dest` |
| Mark item received        | `PATCH /api/fulfillment/:id/receive-item`      |
| Create packing slip       | `PATCH /api/fulfillment/:id/pack`              |
| Dispatch to customer      | `PATCH /api/fulfillment/:id/dispatch`          |
| Mark delivered            | `PATCH /api/fulfillment/:id/deliver`           |

---

## Key Design Decisions

### Why Vanilla CSS over Tailwind?
The project uses a custom CSS design system (`medi-page`, `medi-card`) via `globals.css` to maintain full control over the pharmacy-themed aesthetics including warm cream backgrounds, navy headings, and amber CTAs — without the overhead of purging or configuration.

### Why Framer Motion?
All card expansions, page transitions, and status animations use Framer Motion for smooth `height: 0 → auto` animations that maintain layout stability without JavaScript hacks.

### Session-based Auth
Better Auth sessions are stored in HTTP-only cookies. All API calls use `credentials: include` to send these cookies. No JWT tokens are stored in localStorage.

### Same-Warehouse Detection
The frontend detects `originWarehouseId === destWarehouseId` per shipment leg and renders a simplified "one-click receive" UI, bypassing the multi-step routing flow entirely.

---

## License

MIT © MediStore Team