"use client"
import Banner from "@/components/home/banner";
import { BlogSection } from "@/components/home/BlogSecion";
import { PartnersSection } from "@/components/home/BrandSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import { FAQSection } from "@/components/home/FAQSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { CTASection } from "@/components/home/PromoSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

import SectionContainer from "@/utils/SectionContainer";



export default function Home() {
  return (
    <div className="">
      {/* <Banner></Banner> */}
  <HeroSection />
  <CategoriesSection />
  <FeaturedProducts />
  <HowItWorksSection />
  <TestimonialsSection />
  <BlogSection />
  <PartnersSection />
  <FAQSection />
  {/* <CTASection /> */}
  <NewsletterSection />
    </div>
  );
}
