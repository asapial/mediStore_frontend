"use client";

import { motion } from "framer-motion";
import { GiPill } from "react-icons/gi";

interface LoadingPageProps {
  text: string;
}

export default function MedicineLoadingPage({ text  }: LoadingPageProps) {
  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen
      bg-gradient-to-br from-green-50 via-emerald-100 to-green-50
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
      text-foreground dark:text-white relative overflow-hidden"
    >
      {/* Floating Capsules */}
      <motion.div
        className="absolute top-20 left-10 text-2xl text-green-400 dark:text-blue-400"
        animate={{ y: [0, -15, 0], rotate: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <GiPill />
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-12 text-3xl text-green-300 dark:text-blue-500"
        animate={{ y: [0, -20, 0], rotate: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <GiPill />
      </motion.div>

      {/* Main Loader */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="text-7xl text-emerald-500 dark:text-blue-500 mb-6"
      >
        <GiPill />
      </motion.div>

      {/* Dynamic Loading Text */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold mb-2 text-center"
      >
        Loading your {text || "💊MediStore"}...
      </motion.h1>

      {/* <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-md"
      >
        Please wait while we fetch your {text.toLowerCase()} details.
      </motion.p> */}

      {/* Animated Dots */}
      <motion.div
        className="flex mt-6 gap-2"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
      >
        <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-blue-500"></span>
        <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-blue-500 delay-150"></span>
        <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-blue-500 delay-300"></span>
      </motion.div>
    </div>
  );
}
