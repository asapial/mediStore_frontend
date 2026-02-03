"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  MapPin,
  Clock,
  PackageCheck,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function ShippingPolicyPage() {
  return (
    <SectionContainer className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-16 px-4">
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Shipping & Delivery Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Reliable and transparent delivery for your healthcare needs.
          </p>
        </motion.div>

        <Card className="p-8 md:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border shadow-xl space-y-8">
          <Section
            icon={<Truck className="h-6 w-6 text-primary" />}
            title="Delivery Coverage"
          >
            We deliver across all major cities and selected rural areas.
            Availability may vary based on location.
          </Section>

          <Separator />

          <Section
            icon={<Clock className="h-6 w-6 text-primary" />}
            title="Delivery Time"
          >
            Standard delivery takes 2–5 business days depending on your address
            and product availability.
          </Section>

          <Separator />

          <Section
            icon={<PackageCheck className="h-6 w-6 text-primary" />}
            title="Order Tracking"
          >
            Once shipped, tracking details will be shared via SMS or email for
            real-time updates.
          </Section>

          <Separator />

          <Section
            icon={<MapPin className="h-6 w-6 text-primary" />}
            title="Address Accuracy"
          >
            Customers are responsible for providing accurate delivery details.
            Incorrect addresses may cause delays or cancellation.
          </Section>

          <Separator />

          <Section
            icon={<Mail className="h-6 w-6 text-primary" />}
            title="Support"
          >
            For shipping-related assistance, email us at{" "}
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
