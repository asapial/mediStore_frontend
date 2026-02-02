import Footer from '@/components/shared/Footer';
import { Navbar1 } from '@/components/shared/navbar1';
import { userService } from '@/services/user.service';
import React from 'react'

export default async function Layout({ children }: { children: React.ReactNode }) {
    const { data: userData } = await userService.getSession(); // server-only
    const userRole = userData?.user?.role;

    return (
        <div>
            <div className='max-w-7xl mx-auto'>
                <Navbar1 userRole={userRole} />
            </div>
            {children}
            <div className=''>
                <Footer></Footer>
            </div>
        </div>
    );
}