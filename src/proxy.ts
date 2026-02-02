import { NextRequest, NextResponse } from "next/server";
import { userService } from "./services/user.service";

// Middleware to protect routes based on uppercase user roles
export async function proxy(request: NextRequest) {
  let isAuthenticated = false;
  let role: "CUSTOMER" | "SELLER" | "ADMIN" | null = null;

  // Get session from your auth service
  const { data } = await userService.getSession();

  if (data) {
    isAuthenticated = true;
    role = data.user.role.toUpperCase(); // ensure uppercase
  }

  const pathname = request.nextUrl.pathname;

  // -------------------------
  // Redirect if not logged in
  // -------------------------
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // -------------------------
  // CUSTOMER ROUTES
  // -------------------------
  const customerRoutes = ["/cart", "/checkout", "/orders", "/profile"];

  if (role === "CUSTOMER") {
    // Customers cannot access admin or seller routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // -------------------------
  // SELLER ROUTES
  // -------------------------
  const sellerRoutes = ["/seller/dashboard", "/seller/medicines", "/seller/orders"];

  if (role === "SELLER") {
    // Sellers cannot access admin routes or customer-specific pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/cart") || pathname.startsWith("/orders") || pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/seller/dashboard", request.url));
    }
  }

  // -------------------------
  // ADMIN ROUTES
  // -------------------------
  const adminRoutes = ["/admin", "/admin/users", "/admin/orders", "/admin/categories"];

  if (role === "ADMIN") {
    // Admin cannot access seller or customer routes
    if (pathname.startsWith("/seller") || pathname.startsWith("/cart") || pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // -------------------------
  // Default: allow access
  // -------------------------
  console.log("User role:", role, "Accessing:", pathname);
  return NextResponse.next();
}

// -------------------------
// Apply middleware only to protected routes
// -------------------------
export const config = {
  matcher: [
    "/cart",
    "/checkout",
    "/orders/:path*", // includes /orders and /orders/:id
    "/profile",
    "/seller/:path*", // all seller routes
    "/admin/:path*",  // all admin routes
  ],
};
