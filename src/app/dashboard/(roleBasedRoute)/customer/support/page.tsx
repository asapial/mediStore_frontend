"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeadset, FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaPaperPlane } from "react-icons/fa";

interface Ticket {
  id: string; name: string; email: string; subject?: string; message: string;
  status: "UNREAD" | "READ" | "ARCHIVED"; adminReply?: string; repliedAt?: string; createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
  UNREAD:   { bg: "#FFF8E1", color: "#C2703A", icon: <FaClock />,        label: "Open" },
  READ:     { bg: "#E3F0FB", color: "#3A6EA5", icon: <FaCheckCircle />,  label: "In Review" },
  ARCHIVED: { bg: "#F5EDE3", color: "#8A6650", icon: <FaTimesCircle />,  label: "Resolved" },
};

export default function CustomerSupportPage() {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/contact/my", { credentials: "include" });
      const data = await res.json();
      setTickets(data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // Pre-fill from session
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json()).then(d => {
        const u = d?.data || d?.user || d;
        if (u) setForm(f => ({ ...f, name: u.name || "", email: u.email || "" }));
      }).catch(() => {});
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error("Message is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Support ticket submitted! We'll get back to you soon.");
      setShowForm(false);
      setForm(f => ({ ...f, subject: "", message: "" }));
      fetchTickets();
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaHeadset className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Help & Support</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Create and track your support tickets</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="medi-btn-accent flex items-center gap-2">
          <FaPlus /> {showForm ? "Cancel" : "New Ticket"}
        </button>
      </div>

      {/* New Ticket Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="medi-card p-6 mb-6 space-y-4 overflow-hidden">
            <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Submit New Support Ticket</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Your Name", name: "name", type: "text", required: true },
                { label: "Email Address", name: "email", type: "email", required: true },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>{f.label} *</label>
                  <input type={f.type} value={(form as any)[f.name]}
                    onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    required={f.required}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Subject</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Issue with my order, Prescription rejected…"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue in detail…" rows={4} required
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
                style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
            </div>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
              style={{ background: "#1B3A5C", color: "#FFF" }}>
              {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} Submit Ticket
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Tickets", value: tickets.length, color: "#1B3A5C" },
          { label: "Open", value: tickets.filter(t => t.status === "UNREAD").length, color: "#C2703A" },
          { label: "Resolved", value: tickets.filter(t => t.status === "ARCHIVED").length, color: "#2E7D32" },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} /></div>
      ) : tickets.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaHeadset className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No support tickets yet</p>
          <button onClick={() => setShowForm(true)} className="medi-btn-accent mt-4">Create Your First Ticket</button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, i) => {
            const s = STATUS_STYLE[ticket.status];
            return (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">
                <button onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ background: s.bg, color: s.color }}>
                        {s.icon} {s.label}
                      </span>
                      <span className="text-xs" style={{ color: "#8A6650" }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold text-sm truncate" style={{ color: "#1B3A5C" }}>
                      {ticket.subject || "General Inquiry"}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#8A6650" }}>{ticket.message}</p>
                  </div>
                  {ticket.adminReply && (
                    <span className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0"
                      style={{ background: "#E8F5E9", color: "#2E7D32" }}>Reply received</span>
                  )}
                </button>
                {expanded === ticket.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-5 pb-5 border-t" style={{ borderColor: "#EEE4D9" }}>
                    <div className="pt-4 space-y-4">
                      <div className="p-3 rounded-xl text-sm" style={{ background: "#F5EDE3" }}>
                        <p className="text-xs font-bold mb-1" style={{ color: "#8A6650" }}>YOUR MESSAGE</p>
                        <p style={{ color: "#1B3A5C" }}>{ticket.message}</p>
                      </div>
                      {ticket.adminReply && (
                        <div className="p-3 rounded-xl text-sm" style={{ background: "#E8F5E9" }}>
                          <p className="text-xs font-bold mb-1" style={{ color: "#2E7D32" }}>
                            SUPPORT REPLY · {ticket.repliedAt ? new Date(ticket.repliedAt).toLocaleString() : ""}
                          </p>
                          <p style={{ color: "#1B3A5C" }}>{ticket.adminReply}</p>
                        </div>
                      )}
                      {!ticket.adminReply && (
                        <p className="text-xs text-center" style={{ color: "#8A6650" }}>
                          ⏳ Awaiting response from our support team. We typically respond within 24 hours.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
