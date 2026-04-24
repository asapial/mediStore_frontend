"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaHeadset, FaSearch, FaReply, FaCheck, FaSpinner, FaFilter } from "react-icons/fa";

interface SupportTicket {
  id: string; name: string; email: string; subject?: string; message: string;
  status: "UNREAD" | "READ" | "ARCHIVED"; adminReply?: string; repliedAt?: string; createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  UNREAD:   { bg: "#FFF8E1", color: "#C2703A", label: "Open" },
  READ:     { bg: "#E3F0FB", color: "#3A6EA5", label: "In Review" },
  ARCHIVED: { bg: "#E8F5E9", color: "#2E7D32", label: "Resolved" },
};

export default function AdminSupportPage() {
  const [tickets, setTickets]   = useState<SupportTicket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending]   = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = filter !== "ALL" ? `/api/contact/admin/messages?status=${filter}` : "/api/contact/admin/messages";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setTickets(data.data || []);
    } catch { toast.error("Failed to load tickets"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const markStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/contact/admin/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Ticket marked as ${newStatus.toLowerCase()}`);
      fetchTickets();
    } catch { toast.error("Status update failed"); }
    finally { setUpdating(null); }
  };

  const sendReply = async (id: string) => {
    const reply = replyText[id];
    if (!reply?.trim()) { toast.error("Reply cannot be empty"); return; }
    setSending(id);
    try {
      const res = await fetch(`/api/contact/admin/${id}/reply`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Reply sent to customer via email");
      setReplyText(r => ({ ...r, [id]: "" }));
      setReplying(null);
      fetchTickets();
    } catch (err: any) { toast.error(err.message); }
    finally { setSending(null); }
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return !search || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || (t.subject || "").toLowerCase().includes(q);
  });

  const openCount     = tickets.filter(t => t.status === "UNREAD").length;
  const inReviewCount = tickets.filter(t => t.status === "READ").length;
  const resolvedCount = tickets.filter(t => t.status === "ARCHIVED").length;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaHeadset className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Help Desk Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Review and respond to customer support tickets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Open", value: openCount, color: "#C2703A" },
          { label: "In Review", value: inReviewCount, color: "#3A6EA5" },
          { label: "Resolved", value: resolvedCount, color: "#2E7D32" },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-3 text-xs" style={{ color: "#8A6650" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or subject…"
            className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
        </div>
        <div className="flex gap-2">
          {["ALL", "UNREAD", "READ", "ARCHIVED"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: filter === s ? "#1B3A5C" : "#EEE4D9", color: filter === s ? "#FFF" : "#5C4033" }}>
              {s === "UNREAD" ? "Open" : s === "READ" ? "In Review" : s === "ARCHIVED" ? "Resolved" : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaHeadset className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => {
            const s = STATUS_STYLE[ticket.status];
            const isExpanded = expanded === ticket.id;
            const isReplying = replying === ticket.id;
            return (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        <span className="text-xs" style={{ color: "#8A6650" }}>{new Date(ticket.createdAt).toLocaleString()}</span>
                        {ticket.adminReply && <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Replied</span>}
                      </div>
                      <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{ticket.subject || "General Inquiry"}</p>
                      <p className="text-xs" style={{ color: "#8A6650" }}>
                        From: <strong style={{ color: "#5C4033" }}>{ticket.name}</strong> &lt;{ticket.email}&gt;
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <button onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                        style={{ background: isExpanded ? "#1B3A5C" : "#EEE4D9", color: isExpanded ? "#FFF" : "#5C4033" }}>
                        {isExpanded ? "Collapse" : "View"}
                      </button>
                      {ticket.status !== "ARCHIVED" && (
                        <button onClick={() => markStatus(ticket.id, "ARCHIVED")} disabled={updating === ticket.id}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                          style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                          {updating === ticket.id ? <FaSpinner className="animate-spin" /> : <><FaCheck className="inline mr-1" />Resolve</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
                      <div className="p-3 rounded-xl text-sm" style={{ background: "#F5EDE3" }}>
                        <p className="text-xs font-bold mb-1" style={{ color: "#8A6650" }}>CUSTOMER MESSAGE</p>
                        <p style={{ color: "#1B3A5C" }}>{ticket.message}</p>
                      </div>
                      {ticket.adminReply && (
                        <div className="p-3 rounded-xl text-sm" style={{ background: "#E8F5E9" }}>
                          <p className="text-xs font-bold mb-1" style={{ color: "#2E7D32" }}>
                            YOUR REPLY · {ticket.repliedAt ? new Date(ticket.repliedAt).toLocaleString() : ""}
                          </p>
                          <p style={{ color: "#1B3A5C" }}>{ticket.adminReply}</p>
                        </div>
                      )}
                      {!isReplying ? (
                        <button onClick={() => { setReplying(ticket.id); markStatus(ticket.id, "READ"); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition"
                          style={{ background: "#E3F0FB", color: "#3A6EA5" }}>
                          <FaReply /> {ticket.adminReply ? "Send Another Reply" : "Reply to Customer"}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <textarea value={replyText[ticket.id] || ""} rows={3}
                            onChange={e => setReplyText(r => ({ ...r, [ticket.id]: e.target.value }))}
                            placeholder="Type your reply… (will be sent via email to customer)"
                            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
                            style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
                          <div className="flex gap-2">
                            <button onClick={() => sendReply(ticket.id)} disabled={sending === ticket.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                              style={{ background: "#1B3A5C", color: "#FFF" }}>
                              {sending === ticket.id ? <FaSpinner className="animate-spin" /> : <FaReply />} Send Reply
                            </button>
                            <button onClick={() => setReplying(null)}
                              className="px-4 py-2 rounded-xl text-sm font-bold"
                              style={{ background: "#EEE4D9", color: "#5C4033" }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
