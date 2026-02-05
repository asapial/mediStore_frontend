import { betterAuth } from "better-auth";
export const auth = betterAuth({
        trustedOrigins: ["https://medi-store-frontend-khaki.vercel.app", "http://localhost:3000"],
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