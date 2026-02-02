"use client";

import { Button } from "@/components/ui/button";
import { BiCartAlt, BiCapsule, BiFirstAid, BiPulse} from "react-icons/bi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function HeroSection() {
  // Floating medicine icons configuration
  const floatingIcons = [
    { Icon: BiCapsule, top: "10%", left: "15%", size: "3rem", delay: 0 },
    { Icon: BiFirstAid, top: "25%", left: "70%", size: "2.5rem", delay: 1 },
    { Icon: BiPulse, top: "50%", left: "30%", size: "3.5rem", delay: 2 },
    // { Icon: BiHospital, top: "65%", left: "80%", size: "2rem", delay: 1.5 },
  ];

  return (
    <SectionContainer
      className="relative overflow-hidden py-40 px-6 text-center
      bg-[#e6f9fb] dark:bg-[#0c1a3f] text-gray-900 dark:text-gray-100"
    >
      {/* Animated Hero Text */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl font-extrabold mb-6"
      >
        Welcome to MediStore
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-lg max-w-2xl mx-auto mb-8"
      >
        Your trusted online pharmacy for all kinds of medicines and health care essentials.
      </motion.p>

      {/* Gradient Button */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#0c206d] via-[#0c206d] to-[#00a4a4]
                     text-white font-bold px-8 py-3 rounded-lg shadow-lg
                     hover:scale-105 transition-transform duration-300"
        >
          Shop Now
        </Button>
      </motion.div>

      {/* Background Cart Icon */}
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 12, opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute right-10 top-10 text-8xl text-gray-300 dark:text-gray-600 pointer-events-none"
      >
        <BiCartAlt />
      </motion.div>

      {/* Floating Medicine Icons */}
      {floatingIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-blue-400 dark:text-teal-400"
          style={{ top, left, fontSize: size }}
          animate={{ y: ["0%", "-10%", "0%"], x: ["0%", "5%", "0%"] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "mirror",
            delay,
            ease: "easeInOut",
          }}
        >
          <Icon />
        </motion.div>
      ))}

      {/* Optional Overlay Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute bg-white dark:bg-gray-700 opacity-5 rounded-full w-72 h-72 top-10 left-1/4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bg-white dark:bg-gray-700 opacity-5 rounded-full w-96 h-96 bottom-0 right-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </SectionContainer>
  );
}
