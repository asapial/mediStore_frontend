"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaWarehouse, FaBoxes, FaExclamationTriangle, FaThermometerHalf,
  FaCheckCircle, FaSpinner, FaUser, FaMapMarkerAlt, FaPhone,
  FaBox, FaTruck, FaClock,
} from "react-icons/fa";

interface Warehouse {
  id: string; name: string; address: string; city: string;
  phone?: string; lat?: number; lng?: number; isActive: boolean;
  manager: { id: string; name: string; email: string };
  _count?: { locationStocks: number; fulfillmentTasks: number };
}

interface Stats {
  totalSkus: number; totalUnits: number;
  fulfillment: Record<string, number>;
  expiryAlerts: number; transfers: number;
  grns: number; tempAlerts7d: number;
  topMedicines: { medicine: { name: string; image?: string }; quantity: number }[];
}

const STAT_CARDS = [
  { key: "totalSkus",    label: "Total SKUs",      color: "#0EA5E9", icon: FaBoxes },
  { key: "totalUnits",   label: "Total Units",      color: "#10B981", icon: FaWarehouse },
  { key: "expiryAlerts", label: "Expiry Alerts",   color: "#EF4444", icon: FaExclamationTriangle },
  { key: "tempAlerts7d", label: "Temp Alerts (7d)",color: "#F59E0B", icon: FaThermometerHalf },
];

const FULFILL_COLOR: Record<string, string> = {
  PENDING: "#F59E0B", PICKED: "#0EA5E9", PACKED: "#7C3AED", DISPATCHED: "#10B981",
};
const FULFILL_ICON: Record<string, React.ReactNode> = {
  PENDING: <FaClock />, PICKED: <FaBox />, PACKED: <FaBoxes />, DISPATCHED: <FaTruck />,
};

export default function WarehouseOverviewPage() {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        // Use the dedicated /my endpoint — returns only the warehouse for the logged-in manager
        const whRes  = await fetch("/api/warehouses/my", { credentials: "include" });
        const whData = await whRes.json();
        if (!whData.success) { setError(whData.message || "No warehouse assigned to your account."); return; }
        const wh: Warehouse = whData.data;
        setWarehouse(wh);

        // Fetch analytics for this warehouse
        const aRes  = await fetch(`/api/warehouse-analytics/${wh.id}`, { credentials: "include" });
        const aData = await aRes.json();
        setStats(aData.data ?? null);
      } catch {
        setError("Failed to load warehouse data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: "#0EA5E9" }} />
        <p className="text-sm" style={{ color: "#8A6650" }}>Loading your warehouse...</p>
      </div>
    </div>
  );

  if (error || !warehouse) return (
    <div className="medi-page text-center py-24">
      <FaWarehouse className="text-5xl mx-auto mb-4 opacity-20" style={{ color: "#1B3A5C" }} />
      <p className="font-bold text-lg" style={{ color: "#1B3A5C" }}>{error || "Warehouse not found"}</p>
      <p className="text-sm mt-1" style={{ color: "#8A6650" }}>Contact admin to assign a warehouse to your account.</p>
    </div>
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
          <FaWarehouse className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Warehouse</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Your assigned warehouse overview</p>
        </div>
      </div>

      {/* Warehouse Info Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="medi-card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-black" style={{ color: "#1B3A5C" }}>{warehouse.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: warehouse.isActive ? "#E8F5E9" : "#FFEBEE",
                  color: warehouse.isActive ? "#2E7D32" : "#C62828",
                }}>
                {warehouse.isActive ? "● Active" : "○ Inactive"}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="flex-shrink-0 mt-0.5" style={{ color: "#C2703A", fontSize: 12 }} />
                <p className="text-sm" style={{ color: "#5C4033" }}>{warehouse.address}, {warehouse.city}</p>
              </div>
              {warehouse.phone && (
                <div className="flex items-center gap-2">
                  <FaPhone style={{ color: "#3A6EA5", fontSize: 12 }} />
                  <p className="text-sm" style={{ color: "#5C4033" }}>{warehouse.phone}</p>
                </div>
              )}
              {warehouse.lat && (
                <p className="text-xs font-mono" style={{ color: "#8A6650" }}>
                  GPS: {warehouse.lat?.toFixed(4)}, {warehouse.lng?.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* Manager info */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "#F5EDE3", border: "1px solid #DDD0C4" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
              style={{ background: "#0EA5E922", color: "#0EA5E9" }}>
              {warehouse.manager.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A6650" }}>Manager</p>
              <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{warehouse.manager.name}</p>
              <p className="text-xs" style={{ color: "#8A6650" }}>{warehouse.manager.email}</p>
            </div>
            <FaUser className="ml-2" style={{ color: "#0EA5E9", fontSize: 16 }} />
          </div>
        </div>

        {/* Quick counts */}
        {warehouse._count && (
          <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: "#EEE4D9" }}>
            <span className="text-xs px-3 py-1 rounded-lg font-semibold"
              style={{ background: "#0EA5E918", color: "#0EA5E9" }}>
              {warehouse._count.locationStocks} SKUs in stock
            </span>
            <span className="text-xs px-3 py-1 rounded-lg font-semibold"
              style={{ background: "#D9770618", color: "#D97706" }}>
              {warehouse._count.fulfillmentTasks} fulfillment tasks
            </span>
          </div>
        )}
      </motion.div>

      {/* Analytics */}
      {stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {STAT_CARDS.map(({ key, label, color, icon: Icon }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} className="medi-card p-4 text-center">
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
                {Object.entries(stats.fulfillment || {}).map(([status, cnt]) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-6 flex items-center justify-center"
                      style={{ color: FULFILL_COLOR[status] || "#8A6650" }}>
                      {FULFILL_ICON[status] || <FaBox />}
                    </span>
                    <span className="text-xs font-bold w-24" style={{ color: FULFILL_COLOR[status] || "#8A6650" }}>{status}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F5EDE3" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (cnt / Math.max(...Object.values(stats.fulfillment || { x: 1 }))) * 100)}%`,
                          background: FULFILL_COLOR[status] || "#8A6650",
                        }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right" style={{ color: "#1B3A5C" }}>{cnt}</span>
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
        <div className="medi-card text-center py-12" style={{ color: "#8A6650" }}>
          <FaCheckCircle className="mx-auto text-3xl mb-2 opacity-30" />
          Analytics not available for this warehouse yet.
        </div>
      )}
    </div>
  );
}
