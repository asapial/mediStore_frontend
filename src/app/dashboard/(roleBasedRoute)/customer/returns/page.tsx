"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaUndo, FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
interface ReturnRequest {
  id: string; reason: string; status: ReturnStatus; adminNote?: string;
  createdAt: string; order: { id: string; status: string; address: string; createdAt: string };
}

const statusStyle: Record<ReturnStatus, string> = {
  REQUESTED: "badge-pending", APPROVED: "badge-approved",
  REJECTED: "badge-rejected", COMPLETED: "badge-active",
};

export default function CustomerReturnsPage() {
  const [returns,   setReturns]   = useState<ReturnRequest[]>([]);
  const [orders,    setOrders]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [orderId,   setOrderId]   = useState("");
  const [reason,    setReason]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const [retRes, ordRes] = await Promise.all([
        fetch("/api/returns/my", { credentials: "include" }),
        fetch("/api/orders/my", { credentials: "include" }),
      ]);
      const retData = await retRes.json();
      const ordData = await ordRes.json();
      setReturns(retData.data || []);
      setOrders((ordData.data || []).filter((o: any) => o.status === "DELIVERED"));
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReturns(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !reason) { toast.error("Select an order and enter a reason"); return; }
    setSubmitting(true);
    try {
      const res  = await fetch("/api/returns", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Return request submitted");
      setOrderId(""); setReason("");
      fetchReturns();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#3A6EA5" }}>
          <FaUndo className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Returns & Refunds</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Request returns for delivered orders</p>
        </div>
      </div>

      {/* Submit form */}
      <div className="medi-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#1B3A5C" }}>
          <FaBoxOpen style={{ color: "#C2703A" }} /> Submit Return Request
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Delivered Order</label>
            <select value={orderId} onChange={e => setOrderId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required>
              <option value="">Select a delivered order…</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  Order #{o.id.slice(-8).toUpperCase()} — {new Date(o.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Reason for Return</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Describe the issue (wrong item, damaged, etc.)…"
              className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
          </div>
          <button type="submit" disabled={submitting} className="medi-btn-primary flex items-center gap-2 disabled:opacity-60">
            <FaUndo /> {submitting ? "Submitting…" : "Submit Return"}
          </button>
        </form>
      </div>

      {/* Returns list */}
      <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>My Return Requests</h2>
      {loading ? (
        <p className="text-center py-10" style={{ color: "#8A6650" }}>Loading…</p>
      ) : returns.length === 0 ? (
        <p className="text-center py-10" style={{ color: "#8A6650" }}>No return requests yet.</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {returns.map((ret, i) => (
              <motion.div key={ret.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="medi-card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FaClock style={{ color: "#8A6650", fontSize: 12 }} />
                      <span className="text-xs" style={{ color: "#8A6650" }}>
                        Submitted {new Date(ret.createdAt).toLocaleDateString()}
                      </span>
                      <span className={statusStyle[ret.status]}>{ret.status}</span>
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#1B3A5C" }}>
                      Order #{ret.order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm" style={{ color: "#5C4033" }}>{ret.reason}</p>
                    {ret.adminNote && (
                      <div className="mt-3 rounded-lg p-3 text-sm"
                        style={{
                          background: ret.status === "APPROVED" ? "#E8F5E9" : "#FFEBEE",
                          color: ret.status === "APPROVED" ? "#2E7D32" : "#C62828",
                        }}>
                        <strong>Admin note: </strong>{ret.adminNote}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-3xl">
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
