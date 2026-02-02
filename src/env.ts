import { createEnv } from "@t3-oss/env-nextjs"
import * as Z from "zod";

export const env = createEnv({
    server: {
        backendBaseUrl: Z.url(),
        frontendBaseUrl: Z.url()
    },

    client: {},
    runtimeEnv: {
        backendBaseUrl: process.env.backendBaseUrl,
        frontendBaseUrl: process.env.frontendBaseUrl
    }
})