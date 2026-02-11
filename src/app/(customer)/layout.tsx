import Footer from '@/components/shared/Footer';
import { Navbar1 } from '@/components/shared/navbar1';
import { userService } from '@/services/user.service';
import { cookies } from 'next/headers';
import React from 'react'

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data } = await userService.getSession();
    let authenticated = false;
    let role: Role | null = null;

    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get("__Secure-better-auth.session_token") || (await cookieStore).get("better-auth.session_token");

    if (sessionToken && data) {
        authenticated = true;
        role = data.user.role as Role;
    }

    return (
        <div>
            <div className=" max-w-7xl mx-auto">
                <Navbar1 authenticated={authenticated} userRole={role} />
            </div>
            {children}
            <Footer></Footer>
        </div>
    )
}
