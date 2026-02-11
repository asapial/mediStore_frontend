<p align="center">
  <img src="public/logo/medistore-high-resolution-logo-transparent.png" alt="MediStore Logo" width="250" />
</p>

<h1 align="center">💊 MediStore Frontend</h1>

<p align="center">
  A modern, full-featured <strong>online medicine e-commerce platform</strong> built with <strong>Next.js 16</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS 4</strong>.
</p>

<p align="center">
  <a href="https://medi-store-frontend-khaki.vercel.app/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-00b894?style=for-the-badge" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

<p align="center">
  MediStore provides a seamless shopping experience for customers, a powerful dashboard for sellers to manage medicines and orders, and a comprehensive admin panel for platform-wide management.
</p>

## 🌐 Live Demo

The application is live and accessible at the following URL:

> **[https://medi-store-frontend-khaki.vercel.app/](https://medi-store-frontend-khaki.vercel.app/)**

---

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Authentication & Authorization](#-authentication--authorization)
- [Route Architecture](#-route-architecture)
- [UI Components](#-ui-components)
- [API Proxy & Backend Integration](#-api-proxy--backend-integration)
- [Animations](#-animations)
- [Deployment](#-deployment)
- [Scripts](#-scripts)
- [License](#-license)

---

## ✨ Features

### 🛒 Customer Features
- **Product Browsing** — Browse medicines by category, brand, and search
- **Shopping Cart** — Add/remove medicines, adjust quantities
- **Checkout Flow** — Complete order placement with a streamlined checkout
- **Order Tracking** — View order history and individual order details
- **User Profile** — View and manage account information

### 🏪 Seller Features
- **Seller Dashboard** — Overview of sales, orders, and medicine inventory with parallel slots (`@medicines`, `@orders`)
- **Add Medicine** — Create new medicine listings
- **Update Medicine** — Edit existing medicine details
- **Order Management** — View and manage incoming orders

### 🛡️ Admin Features
- **Admin Dashboard** — Platform-wide overview with charts and statistics (powered by **Recharts**)
- **User Management** — View and manage all registered users
- **Order Management** — Monitor and manage all orders across the platform
- **Category Management** — Create and manage medicine categories

### 🌐 Public Pages
- **Home Page** — Hero section, featured products, categories, brands, testimonials, blog, FAQ, newsletter, and promotional banners
- **Shop** — Full product listing and browsing
- **Login / Register** — Secure user authentication with animated Lottie visuals
- **Static Pages** — Contact, FAQ, Privacy Policy, Refund Policy, Shipping Policy, Terms & Conditions
- **404 Page** — Custom "Not Found" page

### 🎨 Design & UX
- **Dark / Light Mode** — System-aware theme toggling via `next-themes`
- **Responsive Design** — Mobile-first layout with responsive navigation and sidebar
- **Smooth Animations** — Powered by **Framer Motion** and **GSAP**
- **Lottie Animations** — Animated JSON visuals on login and registration pages
- **Toast Notifications** — User feedback with **Sonner**
- **Image Carousels** — Embla Carousel with autoplay for hero/slider sections

---

## 🛠️ Tech Stack

| Category            | Technology                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| **Framework**       | [Next.js 16](https://nextjs.org/) (App Router)                            |
| **Language**        | [TypeScript 5](https://www.typescriptlang.org/)                           |
| **Styling**         | [Tailwind CSS 4](https://tailwindcss.com/) + [tw-animate-css](https://github.com/magicuidesign/tw-animate-css) |
| **UI Components**   | [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)                |
| **Authentication** | [Better Auth](https://www.better-auth.com/)                               |
| **Env Validation**  | [@t3-oss/env-nextjs](https://env.t3.gg/)                                 |
| **Animations**      | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lottie React](https://lottiereact.com/) |
| **Charts**          | [Recharts](https://recharts.org/)                                         |
| **Carousel**        | [Embla Carousel](https://www.embla-carousel.com/) + [Swiper](https://swiperjs.com/) |
| **Icons**           | [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) |
| **Notifications**   | [Sonner](https://sonner.emilkowal.dev/)                                   |
| **Theming**         | [next-themes](https://github.com/pacocoursey/next-themes)                |
| **React**           | React 19                                                                  |

---

## 📁 Project Structure

```
mediStore_frontend/
├── public/                     # Static assets
│   ├── homeImage/              # Home page images
│   ├── logo/                   # Brand logos
│   ├── sliderImage/            # Carousel / slider images
│   └── capsule.png             # Decorative asset
│
├── src/
│   ├── animation/              # Lottie JSON animation files
│   │   ├── Login.json          # Login page animation
│   │   └── Registration.json   # Registration page animation
│   │
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (ThemeProvider + Toaster)
│   │   ├── globals.css         # Global styles & Tailwind directives
│   │   ├── loading.tsx         # Global loading state
│   │   ├── not-found.tsx       # Custom 404 page
│   │   │
│   │   ├── (public)/           # Public route group (no auth required)
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── layout.tsx      # Public layout (Navbar + Footer)
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Registration page
│   │   │   ├── shop/           # Shop / product listing
│   │   │   ├── profile/        # User profile
│   │   │   └── (others)/       # Static info pages
│   │   │       ├── contact/
│   │   │       ├── faq/
│   │   │       ├── privacy/
│   │   │       ├── refundPolicy/
│   │   │       ├── shipingPolicy/
│   │   │       └── terms/
│   │   │
│   │   ├── (customer)/         # Customer route group (auth required)
│   │   │   ├── layout.tsx      # Customer layout
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── orders/         # Order history & details
│   │   │       ├── page.tsx    # Orders list
│   │   │       └── [id]/       # Individual order detail
│   │   │
│   │   ├── seller/             # Seller route group (auth required)
│   │   │   ├── layout.tsx      # Seller layout (Sidebar)
│   │   │   ├── dashboard/      # Seller dashboard
│   │   │   ├── addMedicine/    # Add new medicine
│   │   │   ├── updateMedicine/ # Update existing medicine
│   │   │   └── (dashboard)/    # Parallel routes
│   │   │       ├── @medicines/ # Medicines slot
│   │   │       └── @orders/    # Orders slot
│   │   │
│   │   └── (admin)/            # Admin route group (auth required)
│   │       └── admin/
│   │           ├── page.tsx    # Admin dashboard (charts & stats)
│   │           ├── layout.tsx  # Admin layout (Sidebar)
│   │           ├── users/      # User management
│   │           ├── orders/     # Order management
│   │           └── categories/ # Category management
│   │
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components (24 components)
│   │   │   ├── accordion.tsx   ├── button.tsx    ├── card.tsx
│   │   │   ├── dialog.tsx      ├── dropdown-menu.tsx
│   │   │   ├── input.tsx       ├── label.tsx     ├── select.tsx
│   │   │   ├── sheet.tsx       ├── sidebar.tsx   ├── table.tsx
│   │   │   ├── navigation-menu.tsx              └── ...more
│   │   │
│   │   ├── home/               # Homepage section components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── BrandSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── BlogSecion.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── NewsletterSection.tsx
│   │   │   ├── PromoSection.tsx
│   │   │   ├── banner.tsx
│   │   │   └── themeToggleSwitch.tsx
│   │   │
│   │   ├── shared/             # Shared layout components
│   │   │   ├── navbar1.tsx     # Main navigation bar
│   │   │   ├── Footer.tsx      # Site footer
│   │   │   ├── LoadingPage.tsx # Loading skeleton
│   │   │   ├── app-sidebar.tsx # Dashboard sidebar
│   │   │   ├── SidebarHeader.tsx
│   │   │   └── SidebarUserCard.tsx
│   │   │
│   │   ├── login-form.tsx      # Login form component
│   │   ├── signup-form.tsx     # Registration form component
│   │   ├── search-form.tsx     # Search bar component
│   │   └── version-switcher.tsx
│   │
│   ├── hooks/
│   │   └── use-mobile.ts       # Custom hook for mobile detection
│   │
│   ├── lib/
│   │   ├── auth.ts             # Server-side auth configuration
│   │   ├── auth-client.ts      # Client-side auth (Better Auth)
│   │   └── utils.ts            # Utility functions (cn helper)
│   │
│   ├── provider/
│   │   └── themeProvider.tsx    # next-themes ThemeProvider wrapper
│   │
│   ├── services/
│   │   └── user.service.ts     # User session service (server-side)
│   │
│   ├── utils/
│   │   └── SectionContainer.tsx # Reusable section wrapper
│   │
│   ├── env.ts                  # Environment variable validation (Zod)
│   └── proxy.ts                # Route protection middleware
│
├── .env                        # Environment variables
├── components.json             # Shadcn UI configuration
├── next.config.ts              # Next.js configuration (API rewrites)
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## 📌 Prerequisites

- **Node.js** — v20.0.0 or higher
- **npm** — v10.0.0 or higher (or use `yarn` / `pnpm` / `bun`)
- **Backend API** — A running instance of the MediStore Backend (see [Backend Integration](#-api-proxy--backend-integration))

---

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mediStore_frontend.git
   cd mediStore_frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#-environment-variables))

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Backend API base URL
backendBaseUrl=https://your-backend-url.com

# Frontend base URL (used by Better Auth)
frontendBaseUrl=https://your-frontend-url.com

# Better Auth URL
BETTER_AUTH_URL=https://your-frontend-url.com

# Public backend URL (client-side access)
NEXT_PUBLIC_backendBaseUrl=https://your-backend-url.com
```

| Variable                     | Description                                          | Required |
| ---------------------------- | ---------------------------------------------------- | -------- |
| `backendBaseUrl`             | Base URL of the MediStore backend API                | ✅ Yes   |
| `frontendBaseUrl`            | Base URL of this frontend application                | ✅ Yes   |
| `BETTER_AUTH_URL`            | URL for Better Auth session management               | ✅ Yes   |
| `NEXT_PUBLIC_backendBaseUrl` | Public backend URL accessible from the client        | ✅ Yes   |

> **Note:** Environment variables are validated at runtime using `@t3-oss/env-nextjs` with Zod schemas in `src/env.ts`.

---

## ▶️ Running the Project

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

---

## 🔒 Authentication & Authorization

MediStore uses **[Better Auth](https://www.better-auth.com/)** for authentication, with session management handled server-side through cookies.

### Authentication Flow

1. **Client-side**: `authClient` is initialized in `src/lib/auth-client.ts` using `createAuthClient` from `better-auth/react`
2. **Server-side**: Sessions are verified by forwarding cookies to the backend's `/api/auth/me` endpoint via `src/services/user.service.ts`
3. **Route Protection**: The middleware in `src/proxy.ts` intercepts requests to protected routes and enforces role-based access

### User Roles

| Role         | Accessible Routes                                      | Restricted From                        |
| ------------ | ------------------------------------------------------ | -------------------------------------- |
| **CUSTOMER** | `/cart`, `/checkout`, `/orders`, `/profile`             | `/admin/*`, `/seller/*`                |
| **SELLER**   | `/seller/dashboard`, `/seller/addMedicine`, `/seller/*` | `/admin/*`, `/cart`, `/orders`          |
| **ADMIN**    | `/admin/*`, `/admin/users`, `/admin/orders`             | `/seller/*`, `/cart`, `/checkout`       |

### Protected Routes (Middleware Matcher)

```
/cart, /checkout, /orders/*, /profile, /seller/*, /admin/*
```

Unauthenticated users are redirected to `/login`. Users accessing routes outside their role are redirected to their respective dashboard.

---

## 🗂️ Route Architecture

MediStore uses **Next.js App Router** with **route groups** to organize pages by access level:

| Route Group    | Path Prefix | Description                             | Auth Required |
| -------------- | ----------- | --------------------------------------- | ------------- |
| `(public)`     | `/`         | Home, shop, login, register, info pages | ❌ No         |
| `(customer)`   | `/`         | Cart, checkout, orders                  | ✅ Yes        |
| `(admin)`      | `/admin`    | Admin dashboard, users, orders, categories | ✅ Yes     |
| `seller`       | `/seller`   | Seller dashboard, medicine management   | ✅ Yes        |

### Parallel Routes (Seller Dashboard)

The seller dashboard at `seller/(dashboard)` uses Next.js **parallel routes** with named slots:
- `@medicines` — Displays medicine inventory
- `@orders` — Displays order overview

Both render simultaneously in the seller dashboard layout.

---

## 🧩 UI Components

### Shadcn UI Components (`src/components/ui/`)

The project uses **24 Shadcn UI components** built on top of Radix UI primitives:

| Component        | Component         | Component          |
| ---------------- | ----------------- | ------------------ |
| Accordion        | Alert             | Avatar             |
| Badge            | Breadcrumb        | Button             |
| Card             | Dialog            | Dropdown Menu      |
| Field            | Input             | Label              |
| Navigation Menu  | Scroll Area       | Select             |
| Separator        | Sheet             | Sidebar            |
| Skeleton         | Sonner (Toast)    | Spinner            |
| Table            | Textarea          | Tooltip            |

### Homepage Sections (`src/components/home/`)

The home page is composed of **12 modular section components**:

- `HeroSection` — Main hero banner with call-to-action
- `FeaturedProducts` — Highlighted medicine products
- `CategoriesSection` — Browse by medicine category
- `BrandSection` — Featured pharmaceutical brands
- `TestimonialsSection` — Customer reviews and testimonials
- `BlogSecion` — Health and wellness blog posts
- `FAQSection` — Frequently asked questions (accordion)
- `HowItWorksSection` — Step-by-step guide
- `NewsletterSection` — Email subscription form
- `PromoSection` — Promotional banners
- `banner` — Top announcement banner
- `themeToggleSwitch` — Dark/light mode toggle

### Shared Components (`src/components/shared/`)

- `navbar1` — Main responsive navigation bar
- `Footer` — Site-wide footer
- `LoadingPage` — Full-page loading skeleton
- `app-sidebar` — Collapsible dashboard sidebar (admin & seller)
- `SidebarHeader` — Sidebar header with branding
- `SidebarUserCard` — User info card in sidebar

---

## 🔄 API Proxy & Backend Integration

MediStore Frontend acts as a **proxy** to the backend API using Next.js **rewrites** configured in `next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: "/api/auth/:path*",
      destination: `${process.env.backendBaseUrl}/api/auth/:path*`,
    },
    {
      source: "/api/:path*",
      destination: `${process.env.backendBaseUrl}/api/:path*`,
    },
  ];
}
```

This means:
- All requests to `/api/*` on the frontend are forwarded to the backend
- Auth-specific routes (`/api/auth/*`) are matched first for priority
- The backend URL is configured via the `backendBaseUrl` environment variable
- No API routes exist in the frontend itself — all data comes from the external backend

---

## 🎬 Animations

MediStore uses three animation libraries for a rich, interactive experience:

| Library          | Usage                                           |
| ---------------- | ----------------------------------------------- |
| **Framer Motion** | Page transitions, component mount/unmount animations, hover effects |
| **GSAP**          | Complex timeline animations, scroll-triggered effects |
| **Lottie React**  | JSON-based vector animations on login & registration pages |

Lottie animation files are stored in `src/animation/`:
- `Login.json` (~227 KB) — Animated visual on the login page
- `Registration.json` (~53 KB) — Animated visual on the registration page

---

## 🚢 Deployment

### Vercel (Recommended) — Currently Deployed ✅

This project is **live and deployed** on **[Vercel](https://vercel.com)**:

🔗 **Production URL:** [https://medi-store-frontend-khaki.vercel.app/](https://medi-store-frontend-khaki.vercel.app/)

**To deploy your own instance:**

1. Fork this repository
2. Import the project on [Vercel](https://vercel.com/new)
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

> **Note:** Ensure your hosting platform supports Node.js and Next.js server-side rendering.

---

## 📜 Scripts

| Script         | Command           | Description                    |
| -------------- | ----------------- | ------------------------------ |
| `dev`          | `npm run dev`     | Start development server       |
| `build`        | `npm run build`   | Create production build         |
| `start`        | `npm run start`   | Start production server         |
| `lint`         | `npm run lint`    | Run ESLint for code quality     |

---

## 📄 License

This project is private and not licensed for public distribution.

---

<p align="center">
  Built with ❤️ by <strong>Md Abu Syeed Abdullah</strong>
</p>