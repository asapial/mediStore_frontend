"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaUndo, FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
interface ReturnRequest {
  id: string; reason: string; status: ReturnStatus; adminNote?: string; createdAt: string;
  user: { name: string; email: string };
  order: { id: string; status: string; address: string; createdAt: string };
}

const statusStyle: Record<ReturnStatus, string> = {
  REQUESTED: "badge-pending", APPROVED: "badge-approved",
  REJECTED: "badge-rejected", COMPLETED: "badge-active",
};
const statusColor: Record<ReturnStatus, string> = {
  REQUESTED: "#C2703A", APPROVED: "#2E7D32", REJECTED: "#C62828", COMPLETED: "#3A6EA5",
};

export default function SellerReturnsPage() {
  const [returns,  setReturns]  = useState<ReturnRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<ReturnStatus | "ALL">("ALL");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      // Sellers see the global returns endpoint (admin-accessible),
      // filtered to only show orders they fulfil.
      // For now, show all returns visible to admin endpoint.
      const res  = await fetch("/api/returns", { credentials: "include" });
      const data = await res.json();
      setReturns(data.data || []);
    } catch { toast.error("Failed to load returns"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReturns(); }, []);

  const allStatuses: ReturnStatus[] = ["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"];
  const filtered = filter === "ALL" ? returns : returns.filter(r => r.status === filter);
  const count = (s: ReturnStatus | "ALL") => s === "ALL" ? returns.length : returns.filter(r => r.status === s).length;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#3A6EA5" }}>
          <FaUndo className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Return Requests</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Monitor return & refund requests for your orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(["ALL", ...allStatuses] as const).map(t => (
          <div key={t} className="medi-card p-5 text-center">
            <p className="text-3xl font-black" style={{ color: t === "ALL" ? "#1B3A5C" : statusColor[t as ReturnStatus] }}>
              {count(t)}
            </p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{t}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", ...allStatuses] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : statusColor[f as ReturnStatus]) : "#F5EDE3",
              color:      filter === f ? "#FFFFFF" : "#5C4033",
              border:     "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading returns…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaUndo className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#3A6EA5" }} />
          <p style={{ color: "#8A6650" }}>No {filter !== "ALL" ? filter.toLowerCase() : ""} returns found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((ret, i) => (
              <motion.div key={ret.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="font-bold text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{ret.order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={statusStyle[ret.status]}>{ret.status}</span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: "#8A6650" }}>
                      Customer: <strong style={{ color: "#5C4033" }}>{ret.user.name}</strong> · {ret.user.email}
                    </p>
                    <p className="text-xs mb-2" style={{ color: "#8A6650" }}>
                      <FaClock className="inline mr-1" style={{ fontSize: 10 }} />
                      Submitted {new Date(ret.createdAt).toLocaleDateString()}
                    </p>
                    <div className="rounded-lg p-3 text-sm"
                      style={{ background: "#F5EDE3", border: "1px solid #DDD0C4" }}>
                      <strong style={{ color: "#5C4033" }}>Reason: </strong>
                      <span style={{ color: "#5C4033" }}>{ret.reason}</span>
                    </div>
                    {ret.adminNote && (
                      <div className="mt-2 rounded-lg p-2.5 text-sm"
                        style={{
                          background: ret.status === "APPROVED" || ret.status === "COMPLETED" ? "#E8F5E9" : "#FFEBEE",
                          color: ret.status === "APPROVED" || ret.status === "COMPLETED" ? "#2E7D32" : "#C62828",
                        }}>
                        <strong>Admin note: </strong>{ret.adminNote}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-3xl mt-1">
                    {ret.status === "APPROVED" || ret.status === "COMPLETED"
                      ? <FaCheckCircle style={{ color: "#2E7D32" }} />
                      : ret.status === "REJECTED"
                      ? <FaTimesCircle style={{ color: "#C62828" }} />
                      : <FaClock style={{ color: "#C2703A" }} />}
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
