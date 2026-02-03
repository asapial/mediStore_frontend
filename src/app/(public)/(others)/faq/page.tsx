"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info } from "lucide-react";
import { BiHelpCircle } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse medicines, add them to your cart, and proceed to checkout. Once payment is completed, your order will be placed successfully.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Yes. You can cancel an order as long as it has not been delivered. Go to your orders page and click on 'Cancel Order'.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery usually takes 2–5 working days depending on your location.",
  },
  {
    question: "Are medicines authentic?",
    answer:
      "Absolutely. All medicines are sourced directly from licensed pharmacies and verified manufacturers.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support Cash on Delivery, Mobile Banking, and Card Payments.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionContainer className="min-h-screen p-6 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100 mb-3 px-4 py-1 rounded-full">
            Help Center
          </Badge>
          <div className="flex items-center justify-center gap-2">
            <BiHelpCircle className="text-emerald-600 dark:text-emerald-400 text-3xl" />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Find answers to common questions about orders, delivery, and payments
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="relative rounded-2xl shadow-md border border-emerald-100 bg-white/80 backdrop-blur-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800 dark:border-slate-700"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="text-emerald-500 dark:text-emerald-400" />
                        <h3 className="font-semibold text-slate-800 dark:text-gray-100">
                          {faq.question}
                        </h3>
                      </div>

                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-4"
                        >
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
