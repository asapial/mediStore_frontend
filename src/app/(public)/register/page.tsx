"use client"

import { SignupForm } from "@/components/signup-form"
import SectionContainer from "@/utils/SectionContainer"
import RegisterAnimationClient from "./RegisterAnimationClient"
import { motion } from "framer-motion"
import { FaClinicMedical } from "react-icons/fa"

export default function SignupPage() {
  return (
    <SectionContainer>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          grid min-h-[80vh] lg:grid-cols-2
          overflow-hidden rounded-3xl
          border border-border
          bg-background/80
          shadow-2xl backdrop-blur
        "
      >
        {/* ================= LEFT SIDE (FORM) ================= */}
        <div className="flex flex-col gap-6 p-6 md:p-10">
          {/* Brand */}
          {/* <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900">
              <FaClinicMedical className="text-emerald-600 dark:text-emerald-400 text-lg" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              MediStore
            </span>
          </div> */}

          {/* Form */}
          <div className="flex flex-1 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-lg"
            >
              <SignupForm />
            </motion.div>
          </div>
        </div>

        {/* ================= RIGHT SIDE (ANIMATION) ================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="
            relative hidden lg:flex
            items-center justify-center
            rounded-r-3xl
            bg-gradient-to-br
            from-emerald-50 via-emerald-100 to-emerald-200
            dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800
          "
        >
          {/* Soft Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.25),transparent_60%)]" />

          {/* Animation */}
          <RegisterAnimationClient />
        </motion.div>
      </motion.div>
    </SectionContainer>
  )
}
