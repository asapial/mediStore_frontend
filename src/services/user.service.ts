import { env } from "@/env";
import { cookies } from "next/headers"

const baseUrl=env.backendBaseUrl;
const getSession=async ()=>{

    try {
        
        const cookieStore = await cookies();

        console.log(cookieStore.toString());

        const res= await fetch(`${baseUrl}/api/auth/me`,{

            headers:{
                Cookie: cookieStore.toString()
            },
            cache:"no-store",
            // credentials:"include"
        })
        
        const session= await res.json();

        return {data:session, error:null};
    } catch (error) {
        // console.log(error);
        return {data:null, error: "Could not fetch session"};
    }
}


export const userService={
    getSession
}