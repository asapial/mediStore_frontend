"use client";

import { Card, CardContent } from "@/components/ui/card";
import SectionContainer from "@/utils/SectionContainer";
import { motion } from "framer-motion";
import { BiBadgeCheck } from "react-icons/bi";

export function PartnersSection() {
  const partners = [
    { name: "Brand 1", logo: "https://via.placeholder.com/150x80?text=Brand+1" },
    { name: "Brand 2", logo: "https://via.placeholder.com/150x80?text=Brand+2" },
    { name: "Brand 3", logo: "https://via.placeholder.com/150x80?text=Brand+3" },
    { name: "Brand 4", logo: "https://via.placeholder.com/150x80?text=Brand+4" },
    { name: "Brand 5", logo: "https://via.placeholder.com/150x80?text=Brand+5" },
  ];

  return (
    <SectionContainer className=" bg-amber-100/10 dark:bg-gray-900">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
        Our Trusted Partners
      </h2>
      <div className="flex flex-wrap justify-center gap-8 items-center">
        {partners.map((partner, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 120 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg 
                         bg-gradient-to-br from-white to-[#e6f9fb] dark:from-gray-800 dark:to-gray-700
                         shadow-sm hover:shadow-lg transition-shadow"
            >
              <CardContent className="flex flex-col items-center gap-2">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                  <BiBadgeCheck className="text-blue-600 dark:text-blue-400" />
                  <span>{partner.name}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
