"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FaShippingFast, FaUserFriends } from "react-icons/fa";
import { MdOutlineLocalPharmacy } from "react-icons/md";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function HowItWorksSection() {
  const steps = [
    { icon: FaShippingFast, title: "Fast Shipping", desc: "Get your medicines delivered in record time.", gradient: "from-[#e6f9fb] to-[#ccefff]" },
    { icon: MdOutlineLocalPharmacy, title: "Verified Medicines", desc: "All products are genuine and certified.", gradient: "from-[#fff0f5] to-[#ffd6e0]" },
    { icon: FaUserFriends, title: "Customer Support", desc: "24/7 expert support for your health needs.", gradient: "from-[#e6ffe6] to-[#ccffcc]" },
  ];

  return (
    <SectionContainer className=" bg-amber-100/10 dark:bg-gray-800">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
        How it Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className={`p-6 text-center bg-gradient-to-br ${step.gradient} dark:from-gray-800 dark:to-gray-700 
                            rounded-lg hover:shadow-lg transition-shadow`}
              >
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Icon className="text-5xl text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
