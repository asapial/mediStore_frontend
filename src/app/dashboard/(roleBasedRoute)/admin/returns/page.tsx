"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaUndo, FaCheckCircle, FaTimesCircle, FaUser } from "react-icons/fa";

type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
interface ReturnRequest {
  id: string; reason: string; status: ReturnStatus; adminNote?: string; createdAt: string;
  user: { name: string; email: string };
  order: { id: string; status: string; address: string; createdAt: string };
}

const tabColors: Record<ReturnStatus, string> = {
  REQUESTED: "#C2703A", APPROVED: "#2E7D32", REJECTED: "#C62828", COMPLETED: "#3A6EA5",
};

export default function AdminReturnsPage() {
  const [returns,   setReturns]   = useState<ReturnRequest[]>([]);
  const [tab,       setTab]       = useState<ReturnStatus>("REQUESTED");
  const [loading,   setLoading]   = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [acting,    setActing]    = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/returns", { credentials: "include" });
      const data = await res.json();
      setReturns(data.data || []);
    } catch { toast.error("Failed to load returns"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id: string, status: ReturnStatus) => {
    setActing(id);
    try {
      const res = await fetch(`/api/returns/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Return ${status.toLowerCase()}`);
      setReviewing(null); setAdminNote(""); fetchAll();
    } catch { toast.error("Update failed"); }
    finally { setActing(null); }
  };

  const tabs: ReturnStatus[] = ["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"];
  const filtered = returns.filter(r => r.status === tab);
  const count = (s: ReturnStatus) => returns.filter(r => r.status === s).length;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#3A6EA5" }}>
          <FaUndo className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Return & Refund Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Review and process customer return requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {tabs.map(t => (
          <div key={t} className="medi-card p-5 text-center">
            <p className="text-3xl font-black" style={{ color: tabColors[t] }}>{count(t)}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{t}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: tab === t ? tabColors[t] : "#F5EDE3",
              color: tab === t ? "#FFF" : "#5C4033",
              border: `1px solid ${tabColors[t]}`,
            }}>
            {t} ({count(t)})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaUndo className="mx-auto text-4xl mb-3 opacity-20" style={{ color: tabColors[tab] }} />
          <p style={{ color: "#8A6650" }}>No {tab.toLowerCase()} returns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((ret, i) => (
              <motion.div key={ret.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card p-5">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUser style={{ color: "#3A6EA5", fontSize: 12 }} />
                      <span className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{ret.user.name}</span>
                      <span className="text-xs" style={{ color: "#8A6650" }}>{ret.user.email}</span>
                      <span className={`badge-${ret.status.toLowerCase()}`}>{ret.status}</span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: "#8A6650" }}>
                      Order #{ret.order.id.slice(-8).toUpperCase()} · {new Date(ret.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm" style={{ color: "#5C4033" }}>{ret.reason}</p>
                    {ret.adminNote && (
                      <div className="mt-2 rounded-lg p-2.5 text-sm"
                        style={{ background: ret.status === "APPROVED" || ret.status === "COMPLETED" ? "#E8F5E9" : "#FFEBEE",
                          color: ret.status === "APPROVED" || ret.status === "COMPLETED" ? "#2E7D32" : "#C62828" }}>
                        <strong>Note: </strong>{ret.adminNote}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {ret.status === "REQUESTED" && (
                      reviewing === ret.id ? (
                        <div className="space-y-2 min-w-[220px]">
                          <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                            placeholder="Admin note…" className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                            style={{ borderColor: "#DDD0C4", background: "#FFF" }} />
                          <div className="flex gap-2">
                            <button disabled={!!acting} onClick={() => updateStatus(ret.id, "APPROVED")}
                              className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                              style={{ background: "#2E7D32", color: "#FFF" }}>
                              <FaCheckCircle className="inline mr-1" /> Approve
                            </button>
                            <button disabled={!!acting} onClick={() => updateStatus(ret.id, "REJECTED")}
                              className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                              style={{ background: "#C62828", color: "#FFF" }}>
                              <FaTimesCircle className="inline mr-1" /> Reject
                            </button>
                          </div>
                          <button onClick={() => setReviewing(null)} className="text-xs w-full text-center" style={{ color: "#8A6650" }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setReviewing(ret.id)} className="medi-btn-primary text-sm">
                          Review
                        </button>
                      )
                    )}
                    {ret.status === "APPROVED" && (
                      <button onClick={() => updateStatus(ret.id, "COMPLETED")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold"
                        style={{ background: "#3A6EA5", color: "#FFF" }}>
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
