"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaFileMedical, FaCheckCircle, FaTimesCircle, FaClock, FaUser } from "react-icons/fa";

type RxStatus = "PENDING" | "APPROVED" | "REJECTED";
interface Prescription {
  id: string;
  imageUrl: string;
  notes?: string;
  status: RxStatus;
  adminNote?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const tabs: RxStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const tabColors: Record<RxStatus, string> = {
  PENDING:  "#C2703A",
  APPROVED: "#2E7D32",
  REJECTED: "#C62828",
};

export default function AdminPrescriptionPage() {
  const [allRx,      setAllRx]      = useState<Prescription[]>([]);
  const [tab,        setTab]        = useState<RxStatus>("PENDING");
  const [loading,    setLoading]    = useState(true);
  const [reviewing,  setReviewing]  = useState<string | null>(null);
  const [adminNote,  setAdminNote]  = useState("");
  const [actionId,   setActionId]   = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/prescriptions", { credentials: "include" });
      const data = await res.json();
      setAllRx(data.data || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const review = async (id: string, status: RxStatus) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/prescriptions/${id}/review`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Prescription ${status.toLowerCase()}`);
      setReviewing(null); setAdminNote("");
      fetchAll();
    } catch { toast.error("Review failed"); }
    finally { setActionId(null); }
  };

  const filtered = allRx.filter(r => r.status === tab);
  const count = (s: RxStatus) => allRx.filter(r => r.status === s).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C62828" }}>
          <FaFileMedical className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Prescription Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Review, approve, or reject customer prescriptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: tab === t ? tabColors[t] : "#F5EDE3",
              color:      tab === t ? "#FFFFFF"    : "#5C4033",
              border:     `1px solid ${tabColors[t]}`,
            }}
          >
            {t} ({count(t)})
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {tabs.map(t => (
          <div key={t} className="medi-card p-5 text-center">
            <p className="text-3xl font-black" style={{ color: tabColors[t] }}>{count(t)}</p>
            <p className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "#8A6650" }}>{t}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading prescriptions…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaFileMedical className="mx-auto text-4xl mb-3 opacity-20" style={{ color: tabColors[tab] }} />
          <p style={{ color: "#8A6650" }}>No {tab.toLowerCase()} prescriptions.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((rx, i) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="medi-card overflow-hidden"
              >
                <div className="relative h-44">
                  <img
                    src={rx.imageUrl}
                    alt="Prescription"
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=Prescription"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="text-xs" style={{ color: "#3A6EA5" }} />
                    <span className="text-sm font-semibold" style={{ color: "#1B3A5C" }}>{rx.user.name}</span>
                    <span className="text-xs" style={{ color: "#8A6650" }}>{rx.user.email}</span>
                  </div>
                  {rx.notes && <p className="text-sm mb-3" style={{ color: "#5C4033" }}>{rx.notes}</p>}

                  {rx.status === "PENDING" && (
                    <>
                      {reviewing === rx.id ? (
                        <div className="space-y-3">
                          <textarea
                            rows={2}
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            placeholder="Admin note (optional)"
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                            style={{ borderColor: "#DDD0C4", background: "#FFF" }}
                          />
                          <div className="flex gap-2">
                            <button
                              disabled={actionId === rx.id}
                              onClick={() => review(rx.id, "APPROVED")}
                              className="flex-1 py-1.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                              style={{ background: "#2E7D32", color: "#FFF" }}
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              disabled={actionId === rx.id}
                              onClick={() => review(rx.id, "REJECTED")}
                              className="flex-1 py-1.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                              style={{ background: "#C62828", color: "#FFF" }}
                            >
                              <FaTimesCircle /> Reject
                            </button>
                          </div>
                          <button onClick={() => { setReviewing(null); setAdminNote(""); }}
                            className="text-xs w-full text-center" style={{ color: "#8A6650" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewing(rx.id)}
                          className="medi-btn-primary w-full flex items-center justify-center gap-2 text-sm"
                        >
                          <FaClock /> Review
                        </button>
                      )}
                    </>
                  )}
                  {rx.status !== "PENDING" && rx.adminNote && (
                    <div
                      className="rounded-lg p-3 text-sm"
                      style={{ background: rx.status === "APPROVED" ? "#E8F5E9" : "#FFEBEE", color: rx.status === "APPROVED" ? "#2E7D32" : "#C62828" }}
                    >
                      <strong>Note: </strong>{rx.adminNote}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
