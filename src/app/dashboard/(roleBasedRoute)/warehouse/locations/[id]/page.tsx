"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaWarehouse, FaBoxes, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

interface LocationStock {
  id: string; quantity: number; minThreshold: number;
  medicine: { id: string; name: string; manufacturer: string };
  storageBin?: { binCode: string };
  batches?: { batchNumber: string; expiryDate: string; quantity: number }[];
}

interface WarehouseDetail {
  id: string; name: string; address: string; city: string;
  isActive: boolean; latitude?: number; longitude?: number;
  locationStocks: LocationStock[];
}

const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [location, setLocation] = useState<WarehouseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("ALL");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/warehouses/${id}`, { credentials: "include" })
      .then(r => r.json()).then(d => setLocation(d.data))
      .catch(() => toast.error("Failed to load location"))
      .finally(() => setLoading(false));
  }, [id]);

  const stocks = location?.locationStocks || [];
  const filtered = stocks.filter(s => {
    const matchSearch = !search || s.medicine.name.toLowerCase().includes(search.toLowerCase());
    if (expiryFilter === "LOW") return matchSearch && s.quantity <= s.minThreshold && s.quantity > 0;
    if (expiryFilter === "OUT") return matchSearch && s.quantity === 0;
    return matchSearch;
  });

  const lowStock = stocks.filter(s => s.quantity > 0 && s.quantity <= s.minThreshold).length;
  const outOfStock = stocks.filter(s => s.quantity === 0).length;

  if (loading) return (
    <div className="medi-page flex justify-center py-20">
      <FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} />
    </div>
  );

  if (!location) return (
    <div className="medi-page text-center py-20" style={{ color: "#C62828" }}>Location not found.</div>
  );

  return (
    <div className="medi-page">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/warehouse/locations")}
          className="p-2 rounded-xl transition" style={{ background: "#EEE4D9", color: "#5C4033" }}>
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaWarehouse className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>{location.name}</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>{location.address}, {location.city}</p>
          </div>
        </div>
        <span className="ml-auto px-3 py-1 rounded-xl text-xs font-bold"
          style={{ background: location.isActive ? "#E8F5E9" : "#FFEBEE", color: location.isActive ? "#2E7D32" : "#C62828" }}>
          {location.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: "Total Items", value: stocks.length, color: "#1B3A5C" },
          { label: "Healthy", value: stocks.filter(s => s.quantity > s.minThreshold).length, color: "#2E7D32" },
          { label: "Low Stock", value: lowStock, color: "#C2703A" },
          { label: "Out of Stock", value: outOfStock, color: "#C62828" },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine…"
          className="flex-1 min-w-48 border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
        {["ALL", "LOW", "OUT"].map(f => (
          <button key={f} onClick={() => setExpiryFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition"
            style={{ background: expiryFilter === f ? "#1B3A5C" : "#EEE4D9", color: expiryFilter === f ? "#FFF" : "#5C4033" }}>
            {f === "ALL" ? "All" : f === "LOW" ? "Low Stock" : "Out of Stock"}
          </button>
        ))}
      </div>

      {/* Stock Table */}
      <div className="medi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#F5EDE3" }}>
              <tr>
                {["Medicine", "Bin", "Qty", "Min Threshold", "Status"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A6650" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10" style={{ color: "#8A6650" }}>No stock data matches your filter</td></tr>
              ) : filtered.map((s, i) => {
                const isOut = s.quantity === 0;
                const isLow = !isOut && s.quantity <= s.minThreshold;
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: "1px solid #F5EDE3", background: isOut ? "#FFF5F5" : isLow ? "#FFFDE7" : "transparent" }}>
                    <td className="py-3 px-4">
                      <p className="font-semibold" style={{ color: "#1B3A5C" }}>{s.medicine.name}</p>
                      <p className="text-xs" style={{ color: "#8A6650" }}>{s.medicine.manufacturer}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: "#5C4033" }}>
                      {s.storageBin?.binCode || "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-base" style={{ color: isOut ? "#C62828" : isLow ? "#C2703A" : "#2E7D32" }}>
                      {s.quantity}
                    </td>
                    <td className="py-3 px-4" style={{ color: "#8A6650" }}>{s.minThreshold}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ background: isOut ? "#FFEBEE" : isLow ? "#FFF8E1" : "#E8F5E9", color: isOut ? "#C62828" : isLow ? "#C2703A" : "#2E7D32" }}>
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
