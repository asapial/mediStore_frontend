"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SectionContainer from "@/utils/SectionContainer";
import { motion } from "framer-motion";
import { BiQuestionMark } from "react-icons/bi";

export function FAQSection() {
  const faqs = [
    { question: "How long does delivery take?", answer: "Delivery usually takes 2-5 business days depending on location. We provide tracking details so you can monitor your order in real time." },
    { question: "Are all medicines genuine?", answer: "Yes! All products are certified and sourced from trusted manufacturers. Each item is carefully inspected before dispatch." },
    { question: "Can I return a product?", answer: "Yes, you can return unopened products within 7 days of delivery. For returns, contact our support team and follow the return instructions." },
    { question: "Do you offer prescription medicines?", answer: "Yes, we provide prescription medicines. Please upload a valid prescription during checkout for the required products." },
    { question: "What payment methods are accepted?", answer: "We accept multiple payment methods including credit/debit cards, mobile wallets, and cash on delivery (where available)." },
  ];

  return (
    <SectionContainer className=" bg-sky-300/10 dark:bg-slate-800">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 120 }}
            >
              <AccordionItem value={`item-${i}`} className="mb-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                <AccordionTrigger className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <BiQuestionMark className="text-blue-600 dark:text-blue-400 text-xl" />
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </SectionContainer>
  );
}
