"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  UserCheck,
  ShoppingCart,
  CreditCard,
  Truck,
  ShieldAlert,
  RefreshCcw,
  Scale,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function TermsAndConditionsPage() {
  return (
    <SectionContainer
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50 via-slate-100 to-slate-200
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
        py-16 px-4
      "
    >
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Terms & Conditions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            These terms govern your access to and use of our platform. By using
            our services, you agree to comply with the conditions below.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Effective Date: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Content */}
        <Card
          className="
            p-8 md:p-10
            bg-white/80 backdrop-blur
            dark:bg-slate-900/80
            border border-slate-200 dark:border-slate-800
            shadow-xl
            space-y-10
          "
        >
          <TermSection
            icon={<FileText className="h-6 w-6 text-primary" />}
            title="1. Acceptance of Terms"
          >
            By accessing or using this platform, you acknowledge that you have
            read, understood, and agreed to be bound by these Terms and
            Conditions.
          </TermSection>

          <Separator />

          <TermSection
            icon={<UserCheck className="h-6 w-6 text-primary" />}
            title="2. User Eligibility"
          >
            You must be at least 18 years old to use our services. By using the
            platform, you confirm that all information you provide is accurate
            and complete.
          </TermSection>

          <Separator />

          <TermSection
            icon={<ShoppingCart className="h-6 w-6 text-primary" />}
            title="3. Orders & Product Information"
          >
            Product descriptions, pricing, and availability are subject to
            change without notice. We reserve the right to cancel or refuse any
            order at our discretion.
          </TermSection>

          <Separator />

          <TermSection
            icon={<CreditCard className="h-6 w-6 text-primary" />}
            title="4. Payments"
          >
            All payments must be completed through approved payment methods. We
            are not responsible for issues caused by third-party payment
            providers.
          </TermSection>

          <Separator />

          <TermSection
            icon={<Truck className="h-6 w-6 text-primary" />}
            title="5. Shipping & Delivery"
          >
            Delivery times are estimates and may vary due to external factors.
            We are not liable for delays beyond our control.
          </TermSection>

          <Separator />

          <TermSection
            icon={<ShieldAlert className="h-6 w-6 text-primary" />}
            title="6. Prohibited Use"
          >
            You agree not to misuse the platform, attempt unauthorized access,
            submit false information, or engage in activities that violate
            applicable laws or regulations.
          </TermSection>

          <Separator />

          <TermSection
            icon={<RefreshCcw className="h-6 w-6 text-primary" />}
            title="7. Modifications to Terms"
          >
            We reserve the right to update these Terms at any time. Continued use
            of the platform constitutes acceptance of the revised Terms.
          </TermSection>

          <Separator />

          <TermSection
            icon={<Scale className="h-6 w-6 text-primary" />}
            title="8. Limitation of Liability"
          >
            We shall not be liable for indirect, incidental, or consequential
            damages arising from your use of the platform.
          </TermSection>

          <Separator />

          <TermSection
            icon={<Mail className="h-6 w-6 text-primary" />}
            title="9. Contact Information"
          >
            For any questions regarding these Terms & Conditions, please contact
            us at{" "}
            <span className="font-medium text-primary">
              support@yourdomain.com
            </span>
            .
          </TermSection>
        </Card>
      </div>
    </SectionContainer>
  );
}

/* ---------------- Sub Component ---------------- */

function TermSection({
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
      transition={{ duration: 0.4 }}
      className="flex gap-4"
    >
      <div className="mt-1">{icon}</div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {children}
        </p>
      </div>
    </motion.div>
  );
}
