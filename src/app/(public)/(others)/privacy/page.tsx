"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  User,
  Database,
  Share2,
  Lock,
  RefreshCcw,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer
      className="
        min-h-screen
        bg-gradient-to-br from-blue-50 via-teal-50 to-indigo-50
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
        py-16
      "
    >
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect,
            use, and protect your personal information.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Main Card */}
        <Card
          className="
            p-8 md:p-10
            bg-white/80 backdrop-blur
            dark:bg-slate-900/80
            border border-slate-200 dark:border-slate-800
            shadow-xl hover:shadow-2xl transition-shadow
            space-y-10
          "
        >
          <PolicySection
            icon={<ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="1. Information We Collect"
          >
            We may collect personal information such as your name, email address,
            phone number, delivery address, and order history. This information
            is collected when you register, place an order, or contact support.
          </PolicySection>

          <Separator className="border-teal-200 dark:border-teal-700" />

          <PolicySection
            icon={<User className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="2. How We Use Your Information"
          >
            Your information is used to process orders, deliver products,
            communicate updates, improve our services, and ensure platform
            security.
          </PolicySection>

          <Separator className="border-teal-200 dark:border-teal-700" />

          <PolicySection
            icon={<Database className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="3. Data Storage & Security"
          >
            We store your data securely using industry-standard practices. Access
            to personal data is restricted and protected against unauthorized
            use, alteration, or disclosure.
          </PolicySection>

          <Separator className="border-teal-200 dark:border-teal-700" />

          <PolicySection
            icon={<Share2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="4. Data Sharing"
          >
            We do not sell or rent your personal data. Information may only be
            shared with trusted service providers when necessary to operate our
            platform (e.g., delivery or payment processing).
          </PolicySection>

          <Separator className="border-teal-200 dark:border-teal-700" />

          <PolicySection
            icon={<Lock className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="5. Your Rights"
          >
            You have the right to access, update, or delete your personal
            information. You may also request to restrict or object to certain
            data processing activities.
          </PolicySection>

          <Separator className="border-teal-200 dark:border-teal-700" />

          <PolicySection
            icon={<RefreshCcw className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="6. Policy Updates"
          >
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated revision date.
          </PolicySection>

          <Separator className="border-teal-200 dark:border-teal-700" />

          <PolicySection
            icon={<Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
            title="7. Contact Us"
          >
            If you have any questions or concerns about this Privacy Policy,
            please contact us at{" "}
            <span className="font-medium text-teal-600 dark:text-teal-400">
              support@medistore.com
            </span>
            .
          </PolicySection>
        </Card>
      </div>
    </SectionContainer>
  );
}

/* ---------------- Sub Component ---------------- */

function PolicySection({
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
      className="flex gap-4 hover:bg-teal-50 dark:hover:bg-slate-800 p-4 rounded-xl transition-colors"
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
