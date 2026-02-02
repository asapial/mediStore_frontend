"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BiShoppingBag } from "react-icons/bi";

export function CTASection() {
  return (
    <section className="relative py-16 px-6 text-center  overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#fafdff] via-[#0c206d] to-[#00a4a4] opacity-90"
        animate={{ x: [-50, 50, -50] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h2 className="text-3xl font-bold mb-4 text-white dark:text-gray-100">
          Ready to Order Your Medicines?
        </h2>
        <p className="mb-6 text-lg text-white dark:text-gray-200">
          Fast, reliable, and genuine products delivered to your doorstep.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-white text-blue-600 font-bold px-6 py-3 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
            <BiShoppingBag className="text-xl" />
            Shop Now
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
