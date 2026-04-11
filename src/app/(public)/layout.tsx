export const dynamic = 'force-dynamic';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/shared/Navbar';
import { userService } from '@/services/user.service';
import React from 'react'
import { AutoAmbientBg } from '@/components/background/Ambientbackgrounds';

export default async function Layout({ children }: { children: React.ReactNode }) {
    await userService.getSession();

    return (
        <>
            {/*
              Ambient background — fixed, z-index: -1
              Particles are rendered behind ALL page content automatically.
              No z-index tricks needed on children — normal flow wins.
            */}
            <AutoAmbientBg />

            {/* Page content — normal flow, always above z:-1 bg */}
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
