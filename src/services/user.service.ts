import { env } from "@/env";
import { cookies } from "next/headers";

const AUTH_URL = env.backendBaseUrl;

export const userService = {
  getSession: async function () {
    try {
      const cookieStore = await cookies();

      console.log("Cookie Store:",cookieStore.toString());

      const res = await fetch(`${AUTH_URL}/api/auth/me`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
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
};