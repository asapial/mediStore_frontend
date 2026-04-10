export const dynamic = 'force-dynamic';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/shared/Navbar';
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

    let authenticated = false

    const userImage = data.user?.image || null;
    let role: Role | null = null;



    //   const cookieStore = cookies()
    //   const sessionToken = (await cookieStore).get("__Secure-better-auth.session_token") || (await cookieStore).get("better-auth.session_token")

    if (data?.user) {
        authenticated = true;
        role = data.user.role as Role;


    }

    return (
        <div>
            <div className='max-w-7xl mx-auto'>
                {/* <Navbar1  authenticated={authenticated} userRole={role}  userImage={userImage}/> */}

                {/* Header & Navigation */}
                <Navbar />
            </div>
            {children}
            <div className=''>
                {/* <Footer></Footer> */}
            </div>
            {/* Site footer */}
            <Footer />
        </div>
    );
}


