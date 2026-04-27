import { NextRequest, NextResponse } from "next/server";
import { userService } from "./services/user.service";

// ─────────────────────────────────────────────────────────────────────────────
// Middleware — MediStore route protection
// All logic lives here. middleware.ts is a thin re-export shim only.
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  let isAuthenticated = false;
  let role: "ADMIN" | "SELLER" | "CUSTOMER" | "WAREHOUSE" | null = null;

  // ── Resolve session ────────────────────────────────────────────────────────
  const { data } = await userService.getSessionForMiddleware(request);

  if (data?.user?.role) {
    isAuthenticated = true;
    role = data.user.role as "ADMIN" | "SELLER" | "CUSTOMER" | "WAREHOUSE";
  }

  const pathname = request.nextUrl.pathname;

  // Role → default landing page after login
  const ROLE_HOME: Record<string, string> = {
    ADMIN:     "/dashboard/admin",
    SELLER:    "/dashboard/seller",
    CUSTOMER:  "/dashboard/customer/orders",
    WAREHOUSE: "/dashboard/warehouse/overview",
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH ROUTES  (/login, /register)
  // Already-authenticated users are sent to their dashboard.
  // ─────────────────────────────────────────────────────────────────────────
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isAuthRoute) {
    if (isAuthenticated && role) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BARE /dashboard
  // Unauthenticated → /login  |  authenticated → role-specific home
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname === "/dashboard") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(
      new URL(ROLE_HOME[role!] ?? "/login", request.url)
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALL /dashboard/* — require authentication
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES  — /dashboard/admin/*
  //
  //  Pages: /dashboard/admin  /dashboard/admin/users  /dashboard/admin/orders
  //         /dashboard/admin/categories  /dashboard/admin/prescription
  //         /dashboard/admin/coupons  /dashboard/admin/license
  //         /dashboard/admin/returns  /dashboard/admin/wallet
  //         /dashboard/admin/banners  /dashboard/admin/platform-features
  //         /dashboard/admin/featured-products  /dashboard/admin/flash-sale
  //         /dashboard/admin/blogs  /dashboard/admin/testimonials
  //         /dashboard/admin/newsletter  /dashboard/admin/messages
  //
  //  Only ADMIN may access these. Every other role is redirected home.
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(role ? ROLE_HOME[role] : "/", request.url)
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELLER ROUTES  — /dashboard/seller/*
  //
  //  Pages: /dashboard/seller  /dashboard/seller/addMedicine
  //         /dashboard/seller/medicines  /dashboard/seller/license
  //         /dashboard/seller/orders  /dashboard/seller/sub-orders
  //         /dashboard/seller/flash-sale  /dashboard/seller/coupons
  //         /dashboard/seller/subscription  /dashboard/seller/returns
  //         /dashboard/seller/stock-alerts  /dashboard/seller/batches
  //         /dashboard/seller/notifications  /dashboard/seller/updateMedicine
  //
  //  Only SELLER may access these.
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/seller")) {
    if (role !== "SELLER") {
      return NextResponse.redirect(
        new URL(role ? ROLE_HOME[role] : "/", request.url)
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER ROUTES  — /dashboard/customer/*
  //
  //  Pages: /dashboard/customer/orders  /dashboard/customer/cart
  //         /dashboard/customer/wishlist  /dashboard/customer/coupons
  //         /dashboard/customer/search  /dashboard/customer/prescription
  //         /dashboard/customer/subscription  /dashboard/customer/tracking
  //         /dashboard/customer/returns  /dashboard/customer/wallet
  //         /dashboard/customer/notifications  /dashboard/customer/checkout
  //
  //  Only CUSTOMER may access these.
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/customer")) {
    if (role !== "CUSTOMER") {
      return NextResponse.redirect(
        new URL(role ? ROLE_HOME[role] : "/", request.url)
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WAREHOUSE ROUTES  — /dashboard/warehouse/*
  //
  //  Pages: /dashboard/warehouse/overview    /dashboard/warehouse/analytics
  //         /dashboard/warehouse/orders      /dashboard/warehouse/fulfillment
  //         /dashboard/warehouse/packing     /dashboard/warehouse/dispatch
  //         /dashboard/warehouse/routing     /dashboard/warehouse/inbound
  //         /dashboard/warehouse/inventory   /dashboard/warehouse/bins
  //         /dashboard/warehouse/locations   /dashboard/warehouse/expiry
  //         /dashboard/warehouse/temperature
  //
  //  Only WAREHOUSE may access these.
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/warehouse")) {
    if (role !== "WAREHOUSE") {
      return NextResponse.redirect(
        new URL(role ? ROLE_HOME[role] : "/", request.url)
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Default — allow access
  // ─────────────────────────────────────────────────────────────────────────
  return NextResponse.next();
}

// ─────────────────────────────────────────────────────────────────────────────
// Matcher — only intercept routes that need protection.
// Static files, images, and public API routes are skipped automatically.
// ─────────────────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};