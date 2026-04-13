"use client";

import Logo from "@/components/shared/NamePlate";
import { SignupForm } from "@/components/signup-form";
import { motion } from "framer-motion";

const steps = [
  { n: "1", title: "Create Account",    desc: "Fill in your details" },
  { n: "2", title: "Browse & Shop",     desc: "Thousands of products" },
  { n: "3", title: "Fast Delivery",     desc: "To your doorstep" },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2740 0%, #1B3A5C 50%, #0F3320 100%)" }}>
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #2E7D32, transparent)", top: "-20%", right: "-10%" }} />
        <div className="absolute w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #C2703A, transparent)", bottom: "-10%", left: "-5%" }} />
        <div className="absolute w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #3A6EA5, transparent)", top: "30%", left: "20%" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative min-h-screen flex">
        {/* ── LEFT: Branding Panel ─────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-[42%] p-12 justify-between">

          {/* Hero text */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#C2703A" }}>Join 50,000+ users</p>
              <h1 className="text-5xl font-black text-white leading-tight mb-4">
                Start Your<br />
                <span style={{ color: "#C2703A" }}>Health Journey</span>
              </h1>
              <p className="text-white/60 text-base leading-relaxed">
                Create your account and access the best pharmacy experience — medicines, supplements, and wellness products delivered to your door.
              </p>
            </motion.div>

            {/* How it works */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">How it works</p>
              {steps.map(({ n, title, desc }, i) => (
                <motion.div key={n} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0" style={{ background: "#C2703A", color: "#FFF" }}>{n}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{title}</p>
                    <p className="text-white/50 text-xs">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4">
              {[
                { value: "50K+",  label: "Happy Customers" },
                { value: "10K+",  label: "Products" },
                { value: "4.9★",  label: "Rating" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-2xl font-black" style={{ color: "#C2703A" }}>{value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>

            {/* Seller promo */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(46,125,50,0.3), rgba(27,58,92,0.3))", border: "1px solid rgba(46,125,50,0.3)" }}>
              <p className="text-white font-bold text-sm mb-1">🏪 Register as a Seller</p>
              <p className="text-white/60 text-xs">List your pharmacy products and reach thousands of customers across the country.</p>
            </motion.div>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} LifeLine · Trusted Healthcare</p>
        </div>

        {/* ── RIGHT: Signup Form ───────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto"
          style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}>
          <div className="w-full max-w-lg py-8">


            {/* Glass card */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-3xl p-1" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))" }}>
              <div className="rounded-[22px]" style={{ background: "rgba(255,255,255,0.97)" }}>
                <SignupForm />
              </div>
            </motion.div>

            <p className="text-center text-white/30 text-xs mt-5">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-white/50 hover:text-white transition-colors underline">Terms</a>{" "}
              &{" "}
              <a href="#" className="text-white/50 hover:text-white transition-colors underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
