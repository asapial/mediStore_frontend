"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaCheck, FaSpinner } from "react-icons/fa";

type Alert = {
  id: string; batchNumber: string; daysLeft: number; severity: string;
  expiresAt: string; isResolved: boolean;
  medicine: { name: string };
  warehouse: { name: string; city: string };
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#EF4444", HIGH: "#F97316", MEDIUM: "#F59E0B", LOW: "#10B981"
};

export default function ExpiryMonitorPage() {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");

  const load = () => {
    setLoading(true);
    fetch("/api/expiry-alerts", { credentials: "include" })
      .then(r => r.json()).then(d => setAlerts(d.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    const res = await fetch(`/api/expiry-alerts/${id}/resolve`, { method: "PATCH", credentials: "include" });
    const d = await res.json();
    if (res.ok) { toast.success("Alert resolved"); load(); } else toast.error(d.message);
  };

  const filtered = filter === "ALL" ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#EF4444" }}>
            <FaExclamationTriangle className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Expiry Monitor</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Track medicines expiring in your warehouses</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: filter === s ? (SEV_COLOR[s] ?? "#1B3A5C") : "#F5EDE3", color: filter === s ? "#FFF" : "#5C4033" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#EF4444" }} /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="medi-card p-5 flex items-center justify-between gap-4 flex-wrap"
              style={{ borderLeft: `4px solid ${SEV_COLOR[alert.severity]}` }}>
              <div>
                <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{alert.medicine.name}</p>
                <p className="text-xs" style={{ color: "#8A6650" }}>
                  Batch: {alert.batchNumber} · {alert.warehouse.name}, {alert.warehouse.city}
                </p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: SEV_COLOR[alert.severity] }}>
                  Expires: {new Date(alert.expiresAt).toLocaleDateString()} ({alert.daysLeft} days left)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-2 py-1 rounded-full"
                  style={{ background: `${SEV_COLOR[alert.severity]}22`, color: SEV_COLOR[alert.severity] }}>
                  {alert.severity}
                </span>
                <button onClick={() => resolve(alert.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "#10B98122", color: "#10B981" }}>
                  <FaCheck /> Resolve
                </button>
              </div>
            </motion.div>
          ))}
          {!filtered.length && (
            <p className="text-center py-16" style={{ color: "#8A6650" }}>
              {filter === "ALL" ? "No active expiry alerts 🎉" : `No ${filter} alerts`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
