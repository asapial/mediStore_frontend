"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  BiCartAlt,
  BiCapsule,
  BiFirstAid,
  BiPulse,
  BiCheckShield,
  BiSupport,
} from "react-icons/bi";
import { FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";
import gsap from "gsap";
import SectionContainer from "@/utils/SectionContainer";



export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    // Floating icons
    iconsRef.current.forEach((el, i) => {
      gsap.to(el, {
        y: -20,
        x: i % 2 === 0 ? 10 : -10,
        repeat: -1,
        yoyo: true,
        duration: 4 + i,
        ease: "sine.inOut",
      });
    });
  }, []);

  const floatingIcons = [
    { Icon: BiCapsule, top: "12%", left: "8%", size: "3rem" },
    { Icon: BiFirstAid, top: "28%", left: "82%", size: "2.5rem" },
    { Icon: BiPulse, top: "62%", left: "18%", size: "3.2rem" },
  ];

  return (
    <SectionContainer
      className="
      relative overflow-hidden py-32 px-6
      bg-[radial-gradient(circle_at_top,_#e6f9fb,_transparent_60%)]
      dark:bg-[radial-gradient(circle_at_top,_#0c1a3f,_#020617_60%)]
      text-gray-900 dark:text-gray-100"
    >
      {/* Glow blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="
            inline-flex items-center gap-2 mb-4 px-4 py-1 text-sm font-semibold rounded-full
            bg-teal-100 text-teal-700
            dark:bg-teal-900/40 dark:text-teal-300"
          >
            💊 Trusted Online Medicine Shop
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight mb-6"
          >
            Your Health,
            <br />
            <span
              className="
              text-transparent bg-clip-text
              bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600
              drop-shadow-[0_0_20px_rgba(45,212,191,0.35)]
              "
            >
              Delivered with Care
            </span>
          </motion.h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-10">
            MediStore is your reliable platform for OTC medicines and healthcare
            essentials. Browse, order, and get fast delivery from verified sellers.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="
              relative overflow-hidden
              bg-gradient-to-r from-teal-600 to-blue-600
              text-white font-semibold px-8 py-4 rounded-xl
              shadow-lg shadow-teal-500/30
              hover:scale-105 transition
              dark:shadow-teal-500/40
              "
            >
              Shop Medicines
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="
              px-8 py-4 rounded-xl border-2
              hover:bg-teal-50 dark:hover:bg-white/10
              transition
              "
            >
              Explore Categories
            </Button>
          </div>

          {/* Trust cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <BiCheckShield className="text-2xl text-teal-500" />,
                title: "100% Genuine",
                desc: "Verified sellers",
              },
              {
                icon: <FaTruck className="text-2xl text-blue-500" />,
                title: "Fast Delivery",
                desc: "Cash on delivery",
              },
              {
                icon: <BiSupport className="text-2xl text-purple-500" />,
                title: "24/7 Support",
                desc: "Always available",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="
                group flex gap-3 p-4 rounded-2xl
                bg-white/70 dark:bg-white/5
                backdrop-blur-md
                border border-white/20
                hover:-translate-y-1 hover:shadow-xl
                transition"
              >
                {item.icon}
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="relative hidden lg:block">
          <div
            className="
            relative w-full h-[420px] rounded-3xl
            bg-gradient-to-br from-teal-400/20 to-blue-600/20
            backdrop-blur-xl shadow-2xl
            flex items-center justify-center
            "
          >
            <BiCartAlt className="text-[180px] text-teal-500/40" />
          </div>
        </div>
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, top, left, size }, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) iconsRef.current[i] = el;
          }}
          className="absolute text-teal-400 dark:text-teal-300"
          style={{ top, left, fontSize: size }}
        >
          <Icon />
        </div>
      ))}
    </SectionContainer>
  );
}
