"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GiPill, GiSyringe, GiMedicinePills } from "react-icons/gi";
import { Button } from "@/components/ui/button";

const floatingItems = [
  { icon: <GiPill />, size: 6, x: 10, y: 20, delay: 0 },
  { icon: <GiSyringe />, size: 8, x: 70, y: 30, delay: 1 },
  { icon: <GiMedicinePills />, size: 10, x: 40, y: 80, delay: 2 },
  { icon: <GiPill />, size: 5, x: 85, y: 60, delay: 0.5 },
  { icon: <GiSyringe />, size: 7, x: 20, y: 70, delay: 1.5 },
];

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div
      className="relative flex flex-col justify-center items-center min-h-screen
      bg-gradient-to-br from-green-50 via-emerald-100 to-green-50
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
      text-foreground dark:text-white px-5 overflow-hidden"
    >
      {/* Floating Medicine Icons */}
      {floatingItems.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute text-emerald-400 dark:text-blue-400`}
          style={{ fontSize: `${item.size}rem`, top: `${item.y}%`, left: `${item.x}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 3 + item.delay, ease: "easeInOut", delay: item.delay }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* 404 Text */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-8xl md:text-[10rem] font-extrabold text-emerald-500 dark:text-blue-500 mb-6"
      >
        404
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold mb-3 text-center"
      >
        Oops! Medicine Not Found
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-md mb-6"
      >
        The medicine or page you are looking for might have been removed, renamed, or does not exist.
        Please check your search or go back to the homepage to continue browsing medicines.
      </motion.p>

      {/* Go Home Button */}
      <Button
        onClick={() => router.push("/")}
        className="bg-emerald-500 dark:bg-blue-500 hover:bg-emerald-600 dark:hover:bg-blue-600 px-6 py-3 font-semibold transition-all"
      >
        Go Back Home
      </Button>
    </div>
  );
}
