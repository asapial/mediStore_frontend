"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BiStar } from "react-icons/bi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function TestimonialsSection() {
  const testimonials = [
    { name: "John Doe", text: "Great service and fast delivery. Highly recommend MediStore!" },
    { name: "Jane Smith", text: "Excellent customer support and genuine products." },
    { name: "Ali Khan", text: "Fast shipping and very reliable pharmacy." },
  ];

  return (
    <SectionContainer className="bg-blue-100/50 dark:bg-gray-900 py-16 px-6">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
        What Our Customers Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.8, type: "spring", stiffness: 120 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card className="bg-gradient-to-br from-white to-[#e6f9fb] dark:from-gray-800 dark:to-gray-700 
                             hover:shadow-lg transition-shadow rounded-lg p-6">
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 italic">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  {/* Animated star */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center gap-1"
                  >
                    <BiStar className="text-yellow-400 text-xl" />
                    <p className="font-bold text-gray-800 dark:text-gray-100">{t.name}</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
