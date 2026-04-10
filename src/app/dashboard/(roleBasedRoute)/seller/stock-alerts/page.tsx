"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaPlus, FaTrash, FaExclamationTriangle } from "react-icons/fa";

interface StockAlert {
  id: string;
  medicineId: string;
  threshold: number;
  isActive: boolean;
  medicine: { id: string; name: string; stock: number; image?: string };
}

export default function SellerStockAlertsPage() {
  const [alerts,     setAlerts]     = useState<StockAlert[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [medicines,  setMedicines]  = useState<any[]>([]);
  const [medicineId, setMedicineId] = useState("");
  const [threshold,  setThreshold]  = useState(10);
  const [isActive,   setIsActive]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/stock-alerts/my", { credentials: "include" });
      const data = await res.json();
      setAlerts(data.data || []);
    } catch { toast.error("Failed to load alerts"); }
    finally { setLoading(false); }
  };

  const fetchMeds = async () => {
    try {
      const res  = await fetch("/api/medicines/own", { credentials: "include" });
      const data = await res.json();
      setMedicines(data.data || []);
    } catch {}
  };

  useEffect(() => { fetchAlerts(); fetchMeds(); }, []);

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineId) { toast.error("Select a medicine"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, threshold, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Stock alert saved!");
      setMedicineId(""); setThreshold(10); setIsActive(true);
      fetchAlerts();
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (medicineId: string) => {
    if (!confirm("Delete this alert?")) return;
    try {
      const res = await fetch(`/api/stock-alerts/${medicineId}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Alert deleted");
      fetchAlerts();
    } catch { toast.error("Delete failed"); }
  };

  const triggered = alerts.filter(a => a.isActive && a.medicine.stock <= a.threshold);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C62828" }}>
          <FaBell className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Low Stock Alerts</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Set thresholds and monitor stock levels</p>
        </div>
      </div>

      {/* Triggered Banner */}
      {triggered.length > 0 && (
        <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "#FFEBEE", border: "1px solid #C62828" }}>
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" style={{ color: "#C62828" }} />
          <div>
            <p className="font-bold text-sm" style={{ color: "#C62828" }}>
              {triggered.length} medicine{triggered.length > 1 ? "s" : ""} below threshold!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#C62828" }}>
              {triggered.map(a => a.medicine.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleUpsert} className="medi-card p-6 space-y-4 h-fit">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaPlus style={{ color: "#C2703A" }} /> Set Alert
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Medicine</label>
            <select
              value={medicineId} onChange={e => setMedicineId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            >
              <option value="">Select medicine…</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name} (stock: {m.stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Threshold (units)</label>
            <input
              type="number" min={0} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5C4033" }}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-[#2E7D32]" />
            Active Alert
          </label>
          <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Saving…" : "Save Alert"}
          </button>
        </form>

        {/* Alerts Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading alerts…</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 medi-card">
              <FaBell className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#C62828" }} />
              <p style={{ color: "#8A6650" }}>No stock alerts configured.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {alerts.map((alert, i) => {
                  const isBreach = alert.medicine.stock <= alert.threshold;
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="medi-card p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={isBreach ? "badge-lowstock" : "badge-instock"}>
                          {isBreach ? "⚠ LOW STOCK" : "✓ OK"}
                        </span>
                        <button
                          onClick={() => handleDelete(alert.medicineId)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Delete alert"
                        >
                          <FaTrash style={{ color: "#C62828", fontSize: 12 }} />
                        </button>
                      </div>
                      <h3 className="font-bold text-sm mb-1" style={{ color: "#1B3A5C" }}>{alert.medicine.name}</h3>
                      <div className="text-xs space-y-1" style={{ color: "#8A6650" }}>
                        <p>Current stock: <strong style={{ color: isBreach ? "#C62828" : "#2E7D32" }}>{alert.medicine.stock}</strong></p>
                        <p>Alert threshold: <strong style={{ color: "#5C4033" }}>{alert.threshold}</strong></p>
                        <p>Status: {alert.isActive ? <span style={{ color: "#2E7D32" }}>Active</span> : <span style={{ color: "#8A6650" }}>Inactive</span>}</p>
                      </div>
                      {/* Stock bar */}
                      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (alert.medicine.stock / Math.max(alert.threshold * 3, 1)) * 100)}%`,
                            background: isBreach ? "#C62828" : "#2E7D32",
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
