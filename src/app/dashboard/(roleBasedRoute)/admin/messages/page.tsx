"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mail, Trash2, ArchiveX, CheckCircle, Send, X, Eye, Clock, Filter, RefreshCw,
} from "lucide-react";

interface ContactMsg {
  id: string; name: string; email: string; subject?: string; message: string;
  status: "UNREAD" | "READ" | "ARCHIVED"; adminReply?: string; repliedAt?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  UNREAD:   { bg: "#FFF3E0", text: "#C2703A", border: "#C2703A" },
  READ:     { bg: "#E8F5E9", text: "#2E7D32", border: "#2E7D32" },
  ARCHIVED: { bg: "#EEE4D9", text: "#8A6650", border: "#8A6650" },
};

export default function AdminMessagesPage() {
  const [msgs,      setMsgs]      = useState<ContactMsg[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<"ALL" | "UNREAD" | "READ" | "ARCHIVED">("ALL");
  const [selected,  setSelected]  = useState<ContactMsg | null>(null);
  const [reply,     setReply]     = useState("");
  const [replying,  setReplying]  = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/contact/admin/messages", { credentials: "include" })
      .then(r => r.json()).then(d => setMsgs(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/contact/admin/${id}/status`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setMsgs(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Marked as ${newStatus.toLowerCase()}`);
    }
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    const res = await fetch(`/api/contact/admin/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      setMsgs(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Message deleted");
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) { toast.error("Write a reply first"); return; }
    setReplying(true);
    try {
      const res = await fetch(`/api/contact/admin/${selected.id}/reply`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Reply sent via email!");
      setMsgs(prev => prev.map(m => m.id === selected.id ? { ...m, adminReply: reply, status: "READ" } : m));
      setSelected(prev => prev ? { ...prev, adminReply: reply, status: "READ" } : null);
      setReply("");
    } catch (e: any) { toast.error(e.message); }
    finally { setReplying(false); }
  };

  const openMsg = async (msg: ContactMsg) => {
    setSelected(msg);
    setReply("");
    if (msg.status === "UNREAD") await markStatus(msg.id, "READ");
  };

  const filtered = msgs.filter(m => filter === "ALL" || m.status === filter);
  const unreadCount = msgs.filter(m => m.status === "UNREAD").length;

  const stats = [
    { label: "Total",    val: msgs.length,                           color: "#1B3A5C" },
    { label: "Unread",   val: unreadCount,                           color: "#C2703A" },
    { label: "Read",     val: msgs.filter(m=>m.status==="READ").length,     color: "#2E7D32" },
    { label: "Archived", val: msgs.filter(m=>m.status==="ARCHIVED").length, color: "#8A6650" },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center relative" style={{ background: "#1B3A5C" }}>
            <Mail className="text-white text-lg w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center" style={{ background: "#C2703A", color: "#FFF" }}>{unreadCount}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Contact Messages</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Manage and reply to customer inquiries</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold"
          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs font-semibold uppercase mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(["ALL", "UNREAD", "READ", "ARCHIVED"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-colors"
            style={filter === f ? { background: "#1B3A5C", color: "#FFF", borderColor: "#1B3A5C" } : { background: "#FFF", color: "#5C4033", borderColor: "#DDD0C4" }}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Message list */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="medi-card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="medi-card p-10 text-center">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
              <p style={{ color: "#8A6650" }}>No messages</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map(msg => {
                const sc = STATUS_COLORS[msg.status];
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => openMsg(msg)} className="medi-card p-4 cursor-pointer transition-all"
                    style={selected?.id === msg.id ? { borderColor: "#1B3A5C", borderWidth: 2 } : msg.status === "UNREAD" ? { borderLeft: "3px solid #C2703A" } : {}}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {msg.status === "UNREAD" && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#C2703A" }} />}
                          <p className="font-bold text-sm truncate" style={{ color: "#1B3A5C" }}>{msg.name}</p>
                        </div>
                        <p className="text-xs truncate" style={{ color: "#8A6650" }}>{msg.email}</p>
                        {msg.subject && <p className="text-xs font-semibold truncate mt-0.5" style={{ color: "#5C4033" }}>{msg.subject}</p>}
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: "#8A6650" }}>{msg.message}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{msg.status}</span>
                        <span className="text-[10px]" style={{ color: "#8A6650" }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="medi-card p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-black text-lg" style={{ color: "#1B3A5C" }}>{selected.name}</h2>
                  <p className="text-sm" style={{ color: "#8A6650" }}>{selected.email}</p>
                  {selected.subject && <p className="text-xs font-semibold mt-1" style={{ color: "#C2703A" }}>Subject: {selected.subject}</p>}
                  <p className="text-xs mt-1" style={{ color: "#8A6650" }}>
                    <Clock className="inline w-3 h-3 mr-1" />
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: STATUS_COLORS[selected.status].bg, color: STATUS_COLORS[selected.status].text }}>
                    {selected.status}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="rounded-2xl p-4 mb-5 whitespace-pre-wrap text-sm" style={{ background: "#F5EDE3", color: "#5C4033" }}>
                {selected.message}
              </div>

              {/* Previous reply */}
              {selected.adminReply && (
                <div className="rounded-2xl p-4 mb-5" style={{ background: "#E8F5E9", border: "1px solid #2E7D32" }}>
                  <p className="text-xs font-bold mb-1" style={{ color: "#2E7D32" }}>✓ Reply sent {selected.repliedAt ? new Date(selected.repliedAt).toLocaleString() : ""}</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "#5C4033" }}>{selected.adminReply}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-5">
                {selected.status !== "READ"     && <button onClick={() => markStatus(selected.id, "READ")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border" style={{ borderColor: "#2E7D32", color: "#2E7D32" }}><Eye className="w-3.5 h-3.5" />Mark Read</button>}
                {selected.status !== "ARCHIVED" && <button onClick={() => markStatus(selected.id, "ARCHIVED")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border" style={{ borderColor: "#8A6650", color: "#8A6650" }}><ArchiveX className="w-3.5 h-3.5" />Archive</button>}
                {selected.status !== "UNREAD"   && <button onClick={() => markStatus(selected.id, "UNREAD")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border" style={{ borderColor: "#C2703A", color: "#C2703A" }}><Mail className="w-3.5 h-3.5" />Mark Unread</button>}
                <button onClick={() => deleteMsg(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ml-auto" style={{ borderColor: "#C62828", color: "#C62828" }}><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </div>

              {/* Reply form */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#1B3A5C" }}>
                  <Send className="inline w-3.5 h-3.5 mr-1" />Reply via Email to {selected.email}
                </label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
                  placeholder="Write your reply here…"
                  className="w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
                <button onClick={sendReply} disabled={replying || !reply.trim()}
                  className="w-full mt-3 py-2.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-all"
                  style={{ background: "#1B3A5C" }}>
                  <Send className="w-4 h-4" />
                  {replying ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="medi-card h-full min-h-64 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
                <p style={{ color: "#8A6650" }}>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
