"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCcw,
  Ban,
  Clock,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function RefundPolicyPage() {
  return (
    <SectionContainer className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-16">
      <div className=" space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Refund & Cancellation Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our policy ensures transparency and fairness for all customers.
          </p>
        </motion.div>

        <Card className="p-8 md:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border shadow-xl space-y-8">
          <Section
            icon={<RefreshCcw className="h-6 w-6 text-primary" />}
            title="Refund Eligibility"
          >
            Refunds are applicable only for damaged, expired, or incorrect
            products. Requests must be raised within 48 hours of delivery.
          </Section>

          <Separator />

          <Section
            icon={<Ban className="h-6 w-6 text-primary" />}
            title="Non-Refundable Items"
          >
            Opened medicines, prescription drugs, and perishable healthcare
            items are not eligible for refund under any circumstances.
          </Section>

          <Separator />

          <Section
            icon={<Clock className="h-6 w-6 text-primary" />}
            title="Cancellation Policy"
          >
            Orders can be cancelled before dispatch. Once shipped, cancellation
            requests will not be accepted.
          </Section>

          <Separator />

          <Section
            icon={<AlertTriangle className="h-6 w-6 text-primary" />}
            title="Refund Processing Time"
          >
            Approved refunds are processed within 7–10 business days to the
            original payment method.
          </Section>

          <Separator />

          <Section
            icon={<Mail className="h-6 w-6 text-primary" />}
            title="Support"
          >
            For refund or cancellation queries, contact us at{" "}
            <span className="font-medium text-primary">
              support@yourdomain.com
            </span>
          </Section>
        </Card>
      </div>
    </SectionContainer>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex gap-4"
    >
      <div>{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {children}
        </p>
      </div>
    </motion.div>
  );
}
