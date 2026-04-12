"use client";

import { useState } from "react";
import { Send, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Newsletter() {
  const [email,       setEmail]       = useState("");
  const [name,        setName]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [subscribed,  setSubscribed]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast.info("You're already subscribed! 🎉");
        setSubscribed(true);
        return;
      }
      if (!res.ok) throw new Error(data.message || "Subscription failed");
      setSubscribed(true);
      toast.success("You're subscribed! Welcome to the LifeLine family 💊");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-emerald-600 dark:bg-emerald-800">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Stay Healthy, Stay Updated</h2>
        <p className="text-white/80 text-sm mb-8 leading-relaxed">
          Subscribe for exclusive health tips, flash sale alerts, and special discounts delivered to your inbox.
        </p>

        {subscribed ? (
          <div className="flex items-center justify-center gap-3 bg-white/20 rounded-2xl px-6 py-4">
            <CheckCircle className="w-6 h-6 text-white" />
            <p className="text-white font-semibold">You're subscribed — thank you! 🎉</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50 sm:w-44 flex-shrink-0"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50"
            />
            <Button type="submit" disabled={submitting}
              className="bg-white hover:bg-white/90 text-emerald-700 font-bold px-6 flex-shrink-0">
              {submitting ? "…" : <><Send className="w-4 h-4 mr-1" /> Subscribe</>}
            </Button>
          </form>
        )}

        <p className="text-white/50 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}