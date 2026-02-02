"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BiMailSend } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";

export default function NewsletterSection() {
  return (
    <SectionContainer className="bg-purple-100/30 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BiMailSend className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Stay Updated</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Subscribe to our newsletter to get the latest updates, exclusive offers, and health tips directly to your inbox.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto"
        >
          <Input
            placeholder="Enter your email"
            className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          />
          <Button
            className="bg-gradient-to-r from-[#fafdff] via-[#0c206d] to-[#00a4a4] text-white hover:scale-105 transition-transform duration-300"
          >
            Subscribe
          </Button>
        </motion.div>

        {/* Optional benefits or features below input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 flex flex-col sm:flex-row justify-center gap-6 text-gray-700 dark:text-gray-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <BiMailSend className="text-blue-600 dark:text-blue-400" />
            <span>Exclusive Offers</span>
          </div>
          <div className="flex items-center gap-2">
            <BiMailSend className="text-blue-600 dark:text-blue-400" />
            <span>Health Tips</span>
          </div>
          <div className="flex items-center gap-2">
            <BiMailSend className="text-blue-600 dark:text-blue-400" />
            <span>Product Updates</span>
          </div>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
