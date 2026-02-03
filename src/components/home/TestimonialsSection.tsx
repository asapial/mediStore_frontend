"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BiStar } from "react-icons/bi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "John Doe",
      text: "Great service and fast delivery. Highly recommend MediStore!",
      rating: 5,
      role: "Verified Customer",
    },
    {
      name: "Jane Smith",
      text: "Excellent customer support and genuine products.",
      rating: 5,
      role: "Loyal Customer",
    },
    {
      name: "Ali Khan",
      text: "Fast shipping and very reliable online pharmacy.",
      rating: 4,
      role: "Regular Customer",
    },
  ];

  return (
    <SectionContainer className="relative py-20 bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12"
      >
        What Our Customers Say
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 120 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
              {/* Background floating glow */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200/20 dark:bg-cyan-400/20 blur-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
              />
              <CardContent className="relative z-10 p-6 flex flex-col items-center gap-4 text-center">
                <p className="text-gray-700 dark:text-gray-300 italic text-sm md:text-base">
                  "{t.text}"
                </p>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(t.rating)].map((_, idx) => (
                    <BiStar
                      key={idx}
                      className="text-yellow-400 text-xl md:text-2xl animate-pulse"
                    />
                  ))}
                </div>

                {/* Customer Name & Role */}
                <p className="mt-3 font-semibold text-gray-800 dark:text-gray-100">
                  {t.name}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.role}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
