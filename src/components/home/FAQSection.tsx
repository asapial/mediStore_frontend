"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SectionContainer from "@/utils/SectionContainer";
import { motion } from "framer-motion";
import { BiQuestionMark, BiTime, BiCheckCircle, BiMoney } from "react-icons/bi";

export function FAQSection() {
  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Delivery usually takes 2-5 business days depending on location. We provide tracking details so you can monitor your order in real time.",
      icon: BiTime,
    },
    {
      question: "Are all medicines genuine?",
      answer: "Yes! All products are certified and sourced from trusted manufacturers. Each item is carefully inspected before dispatch.",
      icon: BiCheckCircle,
    },
    {
      question: "Can I return a product?",
      answer: "Yes, you can return unopened products within 7 days of delivery. For returns, contact our support team and follow the return instructions.",
      icon: BiCheckCircle,
    },
    {
      question: "Do you offer prescription medicines?",
      answer: "Yes, we provide prescription medicines. Please upload a valid prescription during checkout for the required products.",
      icon: BiCheckCircle,
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept multiple payment methods including credit/debit cards, mobile wallets, and cash on delivery (where available).",
      icon: BiMoney,
    },
  ];

  return (
    <SectionContainer className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-16 px-4">
      <h2 className="text-3xl font-extrabold mb-12 text-center text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>

      <div className="max-w-3xl mx-auto space-y-4">
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => {
            const Icon = faq.icon || BiQuestionMark;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 120 }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="flex items-center gap-3 text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-teal-400 transition-colors">
                    <Icon className="text-blue-600 dark:text-teal-400 text-2xl" />
                    <span>{faq.question}</span>
                  </AccordionTrigger>

                  <AccordionContent className="text-gray-700 dark:text-gray-300 px-5 py-3 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>
      </div>

      {/* Optional background shapes */}
      <motion.div
        className="absolute rounded-full bg-blue-100 dark:bg-gray-800 opacity-10 w-60 h-60 top-10 right-10 pointer-events-none"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full bg-blue-100 dark:bg-gray-800 opacity-10 w-72 h-72 bottom-10 left-8 pointer-events-none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </SectionContainer>
  );
}
