import { env } from "@/env";
import { cookies, headers } from "next/headers"
import { auth } from "@/lib/auth"

const baseUrl = env.backendBaseUrl;
const getSession = async () => {

    try {

        const cookieStore = await cookies();

        console.log("Cookie Store :",cookieStore.toString());

        const res= await fetch(`${baseUrl}/api/auth/get-session`,{


            headers:{
                Cookie: cookieStore.toString()
            },
            cache:"no-store",
            credentials:"include"
        })

        const session= await res.json();


        return { data: session, error: null };
    } catch (error) {
        // console.log(error);
        return { data: null, error: "Could not fetch session" };
    }
}


export const userService = {
    getSession
}