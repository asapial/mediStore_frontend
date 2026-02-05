import { createAuthClient } from "better-auth/react"
import { customSessionClient } from "better-auth/client/plugins";
// import type { auth } from "@/lib/auth";
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "https://medistorebackend-mu.vercel.app",
    // baseURL: "http://localhost:5000",
   baseURL: typeof window !== "undefined" ? window.location.origin : "",
    fetchOptions:{
        credentials:"include"
    },
    //  plugins: [customSessionClient<typeof auth>()],

    

})

