"use client"
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import FlashSale from "@/components/home/FlashSale";
import Footer from "@/components/home/Footer";
import HealthBlog from "@/components/home/HealthBlog";
import HeroBanner from "@/components/home/HeroBanner";
import Newsletter from "@/components/home/Newsletter";
import PromoBanners from "@/components/home/PromoBanners";
import Testimonials from "@/components/home/Testimonials";
import Navbar from "@/components/shared/Navbar";

import SectionContainer from "@/utils/SectionContainer";



export default function Home() {
  return (
    <div className="">

      <div className="min-h-screen bg-background text-foreground">
        {/* Header & Navigation */}
        <Navbar />

        {/* Main hero slider */}
        <HeroBanner />

        {/* Category icon strip */}
        <CategoryStrip />

        {/* Promo banner trio */}
        <PromoBanners />

        {/* Service/features strip */}
        <FeaturesStrip />

        {/* Featured / tabbed products */}
        <FeaturedProducts />

        {/* Flash sale countdown */}
        <FlashSale />

        {/* Health blog posts */}
        <HealthBlog />

        {/* Customer reviews */}
        <Testimonials />

        {/* Email newsletter CTA */}
        <Newsletter />

        {/* Site footer */}
        <Footer />
      </div>
    </div>
  );
}
