"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    image: "/sliderImage/image1.png",
    title: "Trusted Online Pharmacy",
    subtitle: "Quality medicines delivered to your door",
  },
  {
    image: "/sliderImage/image2.png",
    title: "Fast & Secure Delivery",
    subtitle: "Your health, our priority",
  },
  {
    image: "/sliderImage/image3.png",
    title: "Genuine Medicines",
    subtitle: "100% authentic and certified",
  },
  {
    image: "/sliderImage/image4.png",
    title: "Affordable Healthcare",
    subtitle: "Best prices, best care",
  },
];

export default function Banner() {
  return (
    <div className="w-full h-[60vh]">
      <Swiper
        spaceBetween={30}
        centeredSlides
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative w-full h-full">
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Text Overlay */}
            <div className="relative z-10 flex h-full items-center">
              <div className="max-w-4xl px-6 text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
