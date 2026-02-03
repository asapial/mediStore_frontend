"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FaShippingFast, FaUserFriends } from "react-icons/fa";
import { MdOutlineLocalPharmacy } from "react-icons/md";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: FaShippingFast,
      title: "Fast Shipping",
      desc: "Get your medicines delivered in record time with our reliable logistics partners.",
      gradient: "from-[#e6f9fb] to-[#ccefff]",
    },
    {
      icon: MdOutlineLocalPharmacy,
      title: "Verified Medicines",
      desc: "All products are genuine, certified, and sourced from trusted manufacturers.",
      gradient: "from-[#fff0f5] to-[#ffd6e0]",
    },
    {
      icon: FaUserFriends,
      title: "Customer Support",
      desc: "24/7 expert support to answer your queries and assist with your health needs.",
      gradient: "from-[#e6ffe6] to-[#ccffcc]",
    },
  ];

  return (
    <SectionContainer className="relative py-20 bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Section Header */}
      <div className="text-center mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-slate-900 dark:text-white"
        >
          How It Works
        </motion.h2>
        <p className="mt-4 max-w-xl mx-auto text-slate-600 dark:text-slate-300">
          Ordering medicines online has never been easier. Follow these simple steps to get started.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.3, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className={`relative p-8 text-center rounded-xl shadow-lg hover:shadow-2xl transition-shadow 
                bg-gradient-to-br ${step.gradient}`}
              >
                {/* Floating Glow Circle */}
                {/* <motion.div
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white/20 dark:bg-white/10"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
                /> */}

                <CardContent className="relative z-10 flex flex-col items-center gap-4">
                  {/* Step Icon */}
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/70  shadow-lg">
                    <Icon className="text-5xl text-blue-600 dark:text-cyan-400" />
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-semibold text-slate-900 ">{step.title}</h3>

                  {/* Step Description */}
                  <p className="text-sm text-slate-700 ">{step.desc}</p>

                  {/* Step Number Badge */}
                  <span className="mt-2 inline-block bg-blue-100 dark:bg-cyan-900 text-blue-700 dark:text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                    Step {idx + 1}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
