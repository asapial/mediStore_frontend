import Footer from '@/components/shared/Footer';
import { Navbar1 } from '@/components/shared/navbar1';
import { userService } from '@/services/user.service';
import React from 'react'
function isSessionValid(expiresAt: string) {
    return new Date(expiresAt) > new Date();
}
type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export default async function Layout({ children }: { children: React.ReactNode }) {
    // const { data } = await userService.getSession(); // server-only
    // console.log(data)
    // let authenticated = false
    // const userRole = data?.user?.role;
    // let role: Role | null = null;
    // if (
    //     data?.session?.expiresAt &&
    //     isSessionValid(data.session.expiresAt)
    // ) {
    //     authenticated = true;
    //     role = data.user.role as Role;
    // }

    return (
        <div>
            <div className='max-w-7xl mx-auto'>
                <Navbar1  />
            </div>
            {children}
            <div className=''>
                <Footer></Footer>
            </div>
        </div>
    );
}