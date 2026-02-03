"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BiMailSend, BiCheckCircle, BiGift } from "react-icons/bi"; // ✅ BiCheckCircle exists
import SectionContainer from "@/utils/SectionContainer";

export default function NewsletterSection() {
  return (
    <SectionContainer className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-16 px-4">
      
      {/* Decorative floating icons */}
      <motion.div
        className="absolute top-10 left-10 text-purple-200 dark:text-purple-700 text-6xl opacity-10"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <BiMailSend />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-purple-200 dark:text-purple-700 text-6xl opacity-10"
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <BiGift />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <BiMailSend className="text-5xl text-purple-600 dark:text-purple-400" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Stay Updated
          </h2>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-8 text-md sm:text-lg">
          Subscribe to our newsletter to receive the latest health tips, exclusive offers, and updates about new medicines directly in your inbox.
        </p>

        {/* Input & Subscribe Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto"
        >
          <Input
            placeholder="Enter your email"
            className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 transition"
          />
          <Button
            className="bg-gradient-to-r from-purple-500 via-purple-700 to-purple-500 text-white font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Subscribe
          </Button>
        </motion.div>

        {/* Benefits / Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium"
        >
          <div className="flex items-center gap-2">
            <BiCheckCircle className="text-purple-600 dark:text-purple-400" />
            <span>Verified & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <BiGift className="text-purple-600 dark:text-purple-400" />
            <span>Exclusive Offers</span>
          </div>
          <div className="flex items-center gap-2">
            <BiMailSend className="text-purple-600 dark:text-purple-400" />
            <span>Health Tips & Updates</span>
          </div>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
