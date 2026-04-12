import { createAuthClient } from "better-auth/react"

import { nextCookies } from "better-auth/next-js";

// import type { auth } from "@/lib/auth";
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "https://medistorebackend-jet.vercel.app",
    // plugins: [nextCookies()]



})

