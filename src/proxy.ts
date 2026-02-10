// import { NextRequest, NextResponse } from "next/server";
// import { userService } from "./services/user.service";
// import { cookies } from "next/headers";

// // Middleware to protect routes based on uppercase user roles
// export async function proxy(request: NextRequest) {
//   let isAuthenticated = false;
//   let role: "CUSTOMER" | "SELLER" | "ADMIN" | null = null


//   console.log("Cookie header:", request.headers.get("cookie"))

//   // Get session from your auth service
//   const { data } = await userService.getSession();

//   console.log(data)

//     const cookieStore = cookies()
//     const sessionCookie = await request.cookies.getAll()
//     console.log("Session Cookie form the proxy ts :", sessionCookie);


//   if (data?.user?.role ) {
//     isAuthenticated = true;
//     role = data.user.role // ensure uppercase
//   }

//   const pathname = request.nextUrl.pathname;

//   // Skip middleware for verify-email route
//   if (pathname.startsWith("/verify-email")) {
//     return NextResponse.next();
//   }

//   // Check for session token in cookies
//   const sessionToken = request.cookies.get("__Secure-better-auth.session_data");
//       console.log("Session from proxy:", sessionToken)
  

//   //* User is not authenticated at all
//   // if (!sessionToken) {
//   //   return NextResponse.redirect(new URL("/login", request.url));
//   // }

//   // -------------------------
//   // CUSTOMER ROUTES
//   // -------------------------
//   const customerRoutes = ["/cart", "/checkout", "/orders", "/profile"];

//   if (role === "CUSTOMER") {
//     // Customers cannot access admin or seller routes
//     if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   // -------------------------
//   // SELLER ROUTES
//   // -------------------------
//   const sellerRoutes = ["/seller/dashboard", "/seller/medicines", "/seller/orders"];

//   if (role === "SELLER") {
//     // Sellers cannot access admin routes or customer-specific pages
//     if (pathname.startsWith("/admin") || pathname.startsWith("/cart") || pathname.startsWith("/orders") || pathname.startsWith("/profile")) {
//       return NextResponse.redirect(new URL("/seller/dashboard", request.url));
//     }
//   }

//   // -------------------------
//   // ADMIN ROUTES
//   // -------------------------
//   const adminRoutes = ["/admin", "/admin/users", "/admin/orders", "/admin/categories"];

//   if (role === "ADMIN") {
//     // Admin cannot access seller or customer routes
//     if (pathname.startsWith("/seller") || pathname.startsWith("/cart") || pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname.startsWith("/profile")) {
//       return NextResponse.redirect(new URL("/admin", request.url));
//     }
//   }

//   // -------------------------
//   // Default: allow access
//   // -------------------------
//   console.log("User role:", role, "Accessing:", pathname);
//   return NextResponse.next();
// }

// // -------------------------
// // Apply middleware only to protected routes
// // -------------------------
// export const config = {
//   matcher: [
//     "/cart",
//     "/checkout",
//     "/orders/:path*", // includes /orders and /orders/:id
//     "/profile",
//     "/seller/:path*", // all seller routes
//     "/admin/:path*",  // all admin routes
//   ],
// };


import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";
import { authClient } from "./lib/auth-client";

export async function proxy(request: NextRequest) {
    // const session = await auth.api.getSession({
    //     headers: await headers()
    // })

    
const { data, error } = await authClient.getSession()

    console.log("Session form the proxy :", data);

    	const sessionCookie = getSessionCookie(request);

      console.log("Session Cookie form the proxy : ",sessionCookie)

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    // if(!session) {
    //     return NextResponse.redirect(new URL("/login", request.url));
    // }

    return NextResponse.next();
}

export const config = {
  matcher: ["/seller/dashboard"], // Specify the routes the middleware applies to
};