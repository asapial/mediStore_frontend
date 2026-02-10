import { betterAuth } from "better-auth";

export const auth = betterAuth({
    baseURL: "https://medistorebackend-jet.vercel.app",
    secret: process.env.BETTER_AUTH_SECRET!,
    user: {
        additionalFields: {
            role: {
                type: ["CUSTOMER", "SELLER", "ADMIN"],
                required: false,
                defaultValue: 'CUSTOMER',
                input: false,
            }
        }
    },
});