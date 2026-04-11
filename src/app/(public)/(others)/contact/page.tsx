"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Send, CheckCircle, MessageSquare,
  Clock, Shield, HeadphonesIcon, ChevronRight,
} from "lucide-react";

const FIELD = "w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/80 backdrop-blur-sm transition-all";

export default function ContactPage() {
  const [form,       setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [sending,    setSending]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Name, email and message are required"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to send");
      setSubmitted(true);
      toast.success("Message sent! We'll reply within 24 hours.");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#F5EDE3 0%,#EEE4D9 100%)" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#1B3A5C,#0F2740)" }} className="py-20 px-4 text-center text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-5"
              style={{ background: "#C2703A", width: 80 + i * 60, height: 80 + i * 60, top: `${10 + i * 12}%`, left: `${5 + i * 18}%` }} />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-semibold" style={{ background: "rgba(194,112,58,0.3)", color: "#F5C49D" }}>
            <HeadphonesIcon className="w-3.5 h-3.5" /> 24/7 Support Available
          </div>
          <h1 className="text-5xl font-black mb-4 leading-tight">We'd Love to<br /><span style={{ color: "#C2703A" }}>Hear From You</span></h1>
          <p className="text-white/70 max-w-lg mx-auto text-base">Our dedicated pharmacy support team is ready to help with orders, prescriptions, and any questions.</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* Info cards row */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: <Mail className="w-6 h-6" />, title: "Email Us", value: "support@medistore.com", sub: "We reply within 24 hours" },
            { icon: <Phone className="w-6 h-6" />, title: "Call Us", value: "+880 1234 567 890", sub: "Mon–Sat, 9AM–7PM" },
            { icon: <MapPin className="w-6 h-6" />, title: "Visit Us", value: "Dhaka, Bangladesh", sub: "Level 5, Medix Tower" },
          ].map(({ icon, title, value, sub }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="bg-white rounded-3xl p-6 text-center shadow-sm hover:shadow-lg transition-all" style={{ border: "1px solid #DDD0C4" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F5EDE3", color: "#C2703A" }}>
                {icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8A6650" }}>{title}</p>
              <p className="font-bold" style={{ color: "#1B3A5C" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#8A6650" }}>{sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Contact info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-7 shadow-sm" style={{ border: "1px solid #DDD0C4" }}>
              <h2 className="text-xl font-black mb-1" style={{ color: "#1B3A5C" }}>Customer Support</h2>
              <p className="text-sm mb-6" style={{ color: "#8A6650" }}>We aim to respond to all inquiries within 24 hours on business days.</p>

              {[
                { icon: <Clock className="w-4 h-4" />, label: "Response time", value: "Within 24 hours" },
                { icon: <Shield className="w-4 h-4" />, label: "Data security", value: "Your info stays private" },
                { icon: <MessageSquare className="w-4 h-4" />, label: "Support channels", value: "Email, Phone, Chat" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F5EDE3", color: "#C2703A" }}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>{label}</p>
                    <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Quick links */}
            <div className="bg-white rounded-3xl p-7 shadow-sm" style={{ border: "1px solid #DDD0C4" }}>
              <h3 className="font-bold mb-4" style={{ color: "#1B3A5C" }}>Common Questions</h3>
              {["How to track my order?", "Return & refund policy", "Prescription upload help", "How to cancel an order?"].map(q => (
                <div key={q} className="flex items-center justify-between py-2.5 border-b cursor-pointer hover:text-emerald-600 transition-colors"
                  style={{ borderColor: "#EEE4D9", color: "#5C4033" }}>
                  <span className="text-sm">{q}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#8A6650" }} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: "1px solid #DDD0C4" }}>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#E8F5E9" }}>
                    <CheckCircle className="w-10 h-10" style={{ color: "#2E7D32" }} />
                  </div>
                  <h3 className="text-2xl font-black mb-2" style={{ color: "#1B3A5C" }}>Message Sent!</h3>
                  <p style={{ color: "#8A6650" }}>Thank you for reaching out. We'll reply to <strong>{form.email}</strong> within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white" style={{ background: "#1B3A5C" }}>
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#F5EDE3", color: "#C2703A" }}>
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black" style={{ color: "#1B3A5C" }}>Send a Message</h2>
                      <p className="text-xs" style={{ color: "#8A6650" }}>Fill in the form and we'll get back to you soon</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Full Name *</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Your full name" className={FIELD} style={{ borderColor: "#DDD0C4" }} required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Email Address *</label>
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="your@email.com" className={FIELD} style={{ borderColor: "#DDD0C4" }} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Subject</label>
                      <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="e.g., Order issue, Medicine inquiry…" className={FIELD} style={{ borderColor: "#DDD0C4" }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Message *</label>
                      <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Describe your inquiry in detail…" rows={6}
                        className={`${FIELD} resize-none`} style={{ borderColor: "#DDD0C4" }} required />
                    </div>
                    <button type="submit" disabled={sending}
                      className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#1B3A5C,#C2703A)" }}>
                      <Send className="w-4 h-4" />
                      {sending ? "Sending…" : "Send Message"}
                    </button>
                    <p className="text-xs text-center" style={{ color: "#8A6650" }}>
                      By submitting this form, you agree that we may store your information to respond to your inquiry.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
