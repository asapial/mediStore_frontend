import Footer from '@/components/shared/Footer';
import { Navbar1 } from '@/components/shared/navbar1';
import SectionContainer from '@/utils/SectionContainer';
import React from 'react'

export default function layout({
    children,

}: {
    children: React.ReactNode;

}) {
    return (
        <div>
            <div className=" max-w-7xl mx-auto">
                <Navbar1></Navbar1>
            </div>
            {children}
            <Footer></Footer>
        </div>
    )
}
