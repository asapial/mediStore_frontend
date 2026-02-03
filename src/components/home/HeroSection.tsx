"use client";

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
import SectionContainer from "@/utils/SectionContainer";

export default function HeroSection() {
  const floatingIcons = [
    { Icon: BiCapsule, top: "15%", left: "10%", size: "3rem", delay: 0 },
    { Icon: BiFirstAid, top: "30%", left: "80%", size: "2.5rem", delay: 1 },
    { Icon: BiPulse, top: "60%", left: "20%", size: "3.2rem", delay: 2 },
  ];

  return (
    <SectionContainer
      className="relative overflow-hidden py-32 px-6
      bg-gradient-to-br from-[#e6f9fb] via-white to-[#dff4f3]
      dark:from-[#0c1a3f] dark:via-[#0a1430] dark:to-[#061028]
      text-gray-900 dark:text-gray-100"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Left Content */}
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-4 px-4 py-1 text-sm font-semibold rounded-full
            bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
          >
            💊 Trusted Online Medicine Shop
          </motion.span>

          <motion.h1
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight mb-6"
          >
            Your Health, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
              Delivered with Care
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8"
          >
            MediStore is your reliable platform for OTC medicines and healthcare
            essentials. Browse, order, and get fast delivery from verified sellers —
            all from the comfort of your home.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#0c206d] to-[#00a4a4]
              text-white font-semibold px-8 py-4 rounded-xl shadow-lg
              hover:scale-105 transition-transform"
            >
              Shop Medicines
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-xl border-2"
            >
              Explore Categories
            </Button>
          </motion.div>

          {/* Trust Highlights */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <BiCheckShield className="text-2xl text-teal-600" />,
                title: "100% Genuine",
                desc: "Verified & trusted sellers",
              },
              {
                icon: <FaTruck  className="text-2xl text-blue-600" />,
                title: "Fast Delivery",
                desc: "Cash on delivery available",
              },
              {
                icon: <BiSupport className="text-2xl text-purple-600" />,
                title: "24/7 Support",
                desc: "We’re here to help",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl
                bg-white/70 dark:bg-white/5 backdrop-blur shadow-sm"
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

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative hidden lg:block"
        >
          <div
            className="relative w-full h-[420px] rounded-3xl
            bg-gradient-to-br from-teal-400/20 to-blue-600/20
            backdrop-blur shadow-2xl flex items-center justify-center"
          >
            <BiCartAlt className="text-[180px] text-teal-500/40" />
          </div>
        </motion.div>
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-teal-400 dark:text-teal-300"
          style={{ top, left, fontSize: size }}
          animate={{ y: ["0%", "-12%", "0%"], x: ["0%", "6%", "0%"] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        >
          <Icon />
        </motion.div>
      ))}
    </SectionContainer>
  );
}
