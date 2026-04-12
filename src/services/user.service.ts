import type { NextRequest } from "next/server";

const AUTH_URL = process.env.backendBaseUrl || "http://localhost:5000";

export const userService = {
  /**
   * For Server Components, Route Handlers, and Server Actions.
   * Uses `next/headers` (dynamic import so it's excluded from Edge bundle).
   */
  getSession: async function () {
    try {
      // Dynamically import so the Edge Runtime does not fail when
      // user.service.ts is imported by middleware (proxy.ts).
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();

      const res = await fetch(`${AUTH_URL}/api/auth/me`, {
        headers: { Cookie: cookieStore.toString() },
        cache: "no-store",
      });

      const session = await res.json();

      if (session === null) {
        return { data: null, error: { message: "Session is missing." } };
      }

      return { data: session, error: null };
    } catch (err) {
      console.error(err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  /**
   * For Middleware (Edge Runtime).
   * Reads the cookie header directly from the NextRequest — no next/headers needed.
   */
  getSessionForMiddleware: async function (request: NextRequest) {
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/me`, {
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
      });

      if (!res.ok) {
        return { data: null, error: { message: "Unauthorized" } };
      }

      const data = await res.json();

      if (!data?.user) {
        return { data: null, error: { message: "Session is missing." } };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
};