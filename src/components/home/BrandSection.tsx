"use client";

import { Card, CardContent } from "@/components/ui/card";
import SectionContainer from "@/utils/SectionContainer";
import { motion } from "framer-motion";
import { BiBadgeCheck } from "react-icons/bi";
import { FaGlobe, FaHeartbeat, FaPills, FaCapsules } from "react-icons/fa";

export function PartnersSection() {
  const partners = [
    { name: "HealthPlus", logo: "./homeImage/trustedPartners/HealthPlus.jpg", tagline: "Trusted Healthcare Solutions", icon: FaHeartbeat },
    { name: "MediCorp", logo: "./homeImage/trustedPartners/Mediacorp_flat_logo_(2015).svg", tagline: "Global Pharmacy Network", icon: FaGlobe },
    { name: "PharmaMax", logo: "./homeImage/trustedPartners/pharmaMax.jpg", tagline: "Quality Medicines Guaranteed", icon: FaPills },
    { name: "WellnessWay", logo: "./homeImage/trustedPartners/wellnessWay.png", tagline: "Your Health, Our Priority", icon: FaCapsules },
    // { name: "CureAll", logo: "https://via.placeholder.com/150x80?text=CureAll", tagline: "Reliable Pharma Partners", icon: FaHeartbeat },
  ];

  return (
    <SectionContainer className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-16">
      <h2 className="text-3xl font-extrabold mb-12 text-center text-gray-900 dark:text-white">
        Our Trusted Partners
      </h2>

      <div className="flex flex-wrap justify-center gap-8 items-center">
        {partners.map((partner, i) => {
          const Icon = partner.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl
                           bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800
                           shadow-md hover:shadow-2xl transition-shadow hover:scale-105 cursor-pointer"
              >
                <CardContent className="flex flex-col items-center gap-3">
                  {/* Partner Icon */}
                  <Icon className="text-4xl text-blue-500 dark:text-teal-400 mb-1" />

                  {/* Partner Logo */}
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-20 object-contain  transition-all duration-300 rounded-md"
                  />

                  {/* Name + Verified Badge */}
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                    <BiBadgeCheck className="text-blue-600 dark:text-teal-400" />
                    <span>{partner.name}</span>
                  </div>

                  {/* Tagline */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {partner.tagline}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
