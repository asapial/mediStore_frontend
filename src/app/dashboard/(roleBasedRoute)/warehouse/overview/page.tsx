"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaWarehouse, FaBoxes, FaExchangeAlt, FaExclamationTriangle, FaThermometerHalf, FaCheckCircle, FaSpinner } from "react-icons/fa";

interface Stats {
  totalSkus: number; totalUnits: number;
  fulfillment: Record<string, number>;
  expiryAlerts: number; transfers: number;
  grns: number; tempAlerts7d: number;
  topMedicines: { medicine: { name: string; image?: string }; quantity: number }[];
}

const STAT_CARDS = [
  { key: "totalSkus",    label: "Total SKUs",       color: "#0EA5E9", icon: FaBoxes },
  { key: "totalUnits",   label: "Total Units",       color: "#10B981", icon: FaWarehouse },
  { key: "expiryAlerts", label: "Expiry Alerts",    color: "#EF4444", icon: FaExclamationTriangle },
  { key: "tempAlerts7d", label: "Temp Alerts (7d)", color: "#F59E0B", icon: FaThermometerHalf },
  { key: "transfers",    label: "Transfers",         color: "#7C3AED", icon: FaExchangeAlt },
  { key: "grns",         label: "GRNs Processed",   color: "#C2703A", icon: FaCheckCircle },
];

export default function WarehouseOverviewPage() {
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [stats, setStats]             = useState<Stats | null>(null);
  const [warehouses, setWarehouses]   = useState<{ id: string; name: string; city: string }[]>([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    fetch("/api/warehouses", { credentials: "include" })
      .then(r => r.json()).then(d => {
        setWarehouses(d.data || []);
        if (d.data?.[0]) setWarehouseId(d.data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!warehouseId) return;
    setLoading(true);
    fetch(`/api/warehouse-analytics/${warehouseId}`, { credentials: "include" })
      .then(r => r.json()).then(d => setStats(d.data))
      .finally(() => setLoading(false));
  }, [warehouseId]);

  const fulfillmentColors: Record<string, string> = {
    PENDING: "#F59E0B", PICKED: "#0EA5E9", PACKED: "#7C3AED", DISPATCHED: "#10B981"
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
            <FaWarehouse className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Warehouse Overview</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Real-time inventory & operations summary</p>
          </div>
        </div>
        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm font-semibold"
          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} — {w.city}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="text-4xl animate-spin" style={{ color: "#0EA5E9" }} /></div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {STAT_CARDS.map(({ key, label, color, icon: Icon }) => (
              <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="medi-card p-4 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${color}22` }}>
                  <Icon style={{ color, fontSize: 18 }} />
                </div>
                <p className="text-2xl font-black" style={{ color }}>{(stats as any)[key] ?? 0}</p>
                <p className="text-xs mt-1" style={{ color: "#8A6650" }}>{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Fulfillment breakdown */}
            <div className="medi-card p-6">
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Fulfillment Status</h2>
              <div className="space-y-3">
                {Object.entries(stats.fulfillment || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-24" style={{ color: fulfillmentColors[status] || "#8A6650" }}>{status}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F5EDE3" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.fulfillment || { x: 1 }))) * 100)}%`, background: fulfillmentColors[status] || "#8A6650" }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right" style={{ color: "#1B3A5C" }}>{count}</span>
                  </div>
                ))}
                {!Object.keys(stats.fulfillment || {}).length && (
                  <p className="text-sm text-center py-4" style={{ color: "#8A6650" }}>No fulfillment tasks yet</p>
                )}
              </div>
            </div>

            {/* Top medicines */}
            <div className="medi-card p-6">
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Top Stocked Medicines</h2>
              <div className="space-y-3">
                {stats.topMedicines.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: "#0EA5E922", color: "#0EA5E9" }}>{i + 1}</span>
                    <span className="flex-1 text-sm font-medium truncate" style={{ color: "#1B3A5C" }}>{item.medicine.name}</span>
                    <span className="text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: "#10B98122", color: "#10B981" }}>{item.quantity} units</span>
                  </div>
                ))}
                {!stats.topMedicines.length && (
                  <p className="text-sm text-center py-4" style={{ color: "#8A6650" }}>No stock recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20" style={{ color: "#8A6650" }}>Select a warehouse to view its overview</div>
      )}
    </div>
  );
}
