import Footer from '@/components/shared/Footer';
import { Navbar1 } from '@/components/shared/navbar1';
import { userService } from '@/services/user.service';
import { cookies, headers } from 'next/headers';
import React from 'react'


function isSessionValid(expiresAt: string) {
    return new Date(expiresAt) > new Date();
}
type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const { data } = await userService.getSession(); // server-only
    //     const data = await auth.api.getSession({
    //     headers: await headers()
    // })
    console.log("Data form the layout layer :",data)
    let authenticated = false
    const userRole = data?.user?.role;
    let role: Role | null = null;



  const cookieStore = cookies()
  const sessionToken = (await cookieStore).get("__Secure-better-auth.session_token")


    if (
        // data?.session?.expiresAt &&
        // isSessionValid(data.session.expiresAt)
        sessionToken && data
    ) {
        authenticated = true;
        role = data.user.role as Role;


    }

    return (
        <div>
            <div className='max-w-7xl mx-auto'>
                <Navbar1  authenticated={authenticated} userRole={role} />
            </div>
            {children}
            <div className=''>
                <Footer></Footer>
            </div>
        </div>
    );
}

   
