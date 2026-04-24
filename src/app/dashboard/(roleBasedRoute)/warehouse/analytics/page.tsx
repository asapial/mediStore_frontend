"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaSpinner, FaBoxes, FaExchangeAlt, FaExclamationTriangle, FaThermometerHalf, FaFileInvoice, FaCheckCircle } from "react-icons/fa";

interface Analytics {
  totalSkus: number; totalUnits: number;
  fulfillment: Record<string, number>;
  expiryAlerts: number; transfers: number;
  grns: number; tempAlerts7d: number;
  topMedicines: { medicine: { id: string; name: string }; quantity: number }[];
}

const CARDS = [
  { key: "totalSkus",    label: "Unique SKUs",       icon: FaBoxes,           color: "#0EA5E9" },
  { key: "totalUnits",   label: "Total Stock Units",  icon: FaCheckCircle,     color: "#10B981" },
  { key: "transfers",    label: "Stock Transfers",    icon: FaExchangeAlt,     color: "#7C3AED" },
  { key: "grns",         label: "GRNs Processed",     icon: FaFileInvoice,     color: "#C2703A" },
  { key: "expiryAlerts", label: "Expiry Alerts",      icon: FaExclamationTriangle, color: "#EF4444" },
  { key: "tempAlerts7d", label: "Temp Alerts (7d)",   icon: FaThermometerHalf, color: "#F59E0B" },
];

const FULFILL_COLORS: Record<string, string> = {
  PENDING: "#F59E0B", PICKED: "#0EA5E9", PACKED: "#7C3AED", DISPATCHED: "#10B981"
};

export default function WarehouseAnalyticsPage() {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; city: string }[]>([]);
  const [whId,       setWhId]       = useState("");
  const [stats,      setStats]      = useState<Analytics | null>(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    fetch("/api/warehouses", { credentials: "include" })
      .then(r => r.json()).then(d => {
        setWarehouses(d.data || []);
        if (d.data?.[0]) setWhId(d.data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!whId) return;
    setLoading(true);
    fetch(`/api/warehouse-analytics/${whId}`, { credentials: "include" })
      .then(r => r.json()).then(d => setStats(d.data))
      .finally(() => setLoading(false));
  }, [whId]);

  const totalFulfillment = Object.values(stats?.fulfillment || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
            <FaChartLine className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Warehouse Analytics</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Performance metrics & insights</p>
          </div>
        </div>
        <select value={whId} onChange={e => setWhId(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm font-semibold"
          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} — {w.city}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="text-4xl animate-spin" style={{ color: "#0EA5E9" }} />
        </div>
      ) : stats ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {CARDS.map(({ key, label, icon: Icon, color }) => (
              <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="medi-card p-5 text-center cursor-default">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${color}18` }}>
                  <Icon style={{ color, fontSize: 22 }} />
                </div>
                <p className="text-3xl font-black" style={{ color }}>{(stats as any)[key] ?? 0}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: "#8A6650" }}>{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Fulfillment breakdown */}
            <div className="medi-card p-6">
              <h2 className="font-bold text-lg mb-5" style={{ color: "#1B3A5C" }}>
                Fulfillment Breakdown
                <span className="text-sm font-normal ml-2" style={{ color: "#8A6650" }}>({totalFulfillment} tasks)</span>
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.fulfillment || {}).map(([s, count]) => (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: FULFILL_COLORS[s] || "#8A6650" }}>{s}</span>
                      <span className="text-xs font-bold" style={{ color: "#1B3A5C" }}>{count}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F5EDE3" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalFulfillment) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ background: FULFILL_COLORS[s] || "#8A6650" }} />
                    </div>
                  </div>
                ))}
                {!Object.keys(stats.fulfillment || {}).length && (
                  <p className="text-center py-6 text-sm" style={{ color: "#8A6650" }}>No fulfillment data yet</p>
                )}
              </div>
            </div>

            {/* Top medicines */}
            <div className="medi-card p-6">
              <h2 className="font-bold text-lg mb-5" style={{ color: "#1B3A5C" }}>Top Stocked Medicines</h2>
              <div className="space-y-3">
                {stats.topMedicines.map((item, i) => {
                  const max = stats.topMedicines[0]?.quantity || 1;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                            style={{ background: "#0EA5E922", color: "#0EA5E9" }}>{i + 1}</span>
                          <span className="text-sm font-medium truncate" style={{ color: "#1B3A5C" }}>{item.medicine.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: "#10B981" }}>{item.quantity}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F5EDE3" }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.quantity / max) * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          style={{ background: "#10B981" }} />
                      </div>
                    </div>
                  );
                })}
                {!stats.topMedicines.length && (
                  <p className="text-center py-6 text-sm" style={{ color: "#8A6650" }}>No stock data yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center py-20" style={{ color: "#8A6650" }}>Select a warehouse to load analytics</p>
      )}
    </div>
  );
}
