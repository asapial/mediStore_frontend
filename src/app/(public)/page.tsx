"use client"
import Banner from "@/components/home/banner";
import { Navbar1 } from "@/components/shared/navbar1";
import SectionContainer from "@/utils/SectionContainer";
import Image from "next/image";


export default function Home() {
  return (
    <SectionContainer className="">
      <Banner></Banner>
    </SectionContainer>
  );
}
