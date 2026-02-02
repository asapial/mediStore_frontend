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
            <SectionContainer className="">
                <Navbar1></Navbar1>
                {children}
            </SectionContainer>
        </div>
    )
}
