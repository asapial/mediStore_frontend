"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.includes("@")) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-800 dark:via-teal-800 dark:to-emerald-900 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute left-1/4 top-0 w-32 h-32 rounded-full bg-white/5" />

      <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Get Health Tips & Exclusive Offers
        </h2>
        <p className="text-emerald-100 text-base mb-8 max-w-xl mx-auto leading-relaxed">
          Subscribe to our newsletter and get 10% off your first order, plus weekly health tips from our team of pharmacists.
        </p>

        {submitted ? (
          <div className="bg-white/20 backdrop-blur border border-white/30 rounded-2xl px-8 py-5 inline-block">
            <p className="text-white font-bold text-lg">✅ You're subscribed!</p>
            <p className="text-emerald-100 text-sm mt-1">Check your email for your 10% discount code.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-white/20 backdrop-blur border-white/30 text-white placeholder:text-emerald-200 focus-visible:ring-white/50 flex-1 h-12 rounded-xl"
            />
            <Button
              onClick={handleSubmit}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold h-12 px-6 rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              Subscribe
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        <p className="text-emerald-200 text-xs mt-4">
          🔒 No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}