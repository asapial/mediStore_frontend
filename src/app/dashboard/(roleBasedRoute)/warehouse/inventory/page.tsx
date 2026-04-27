"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBoxes, FaSpinner, FaWarehouse, FaSearch,
  FaPlus, FaMinus, FaSave, FaBoxOpen, FaSync,
  FaExclamationTriangle, FaCheckCircle, FaPills,
} from "react-icons/fa";

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  price: number;
  image?: string;
  stock: number; // global seller stock
}

interface LocationStock {
  id: string;
  warehouseId: string;
  medicineId: string;
  quantity: number;
  updatedAt: string;
  medicine: Medicine;
}

interface WarehouseInfo {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
  _count: { locationStocks: number; fulfillmentTasks: number };
  manager: { name: string; email: string };
  locationStocks: LocationStock[];
}

export default function WarehouseInventoryPage() {
  const [warehouse, setWarehouse] = useState<WarehouseInfo | null>(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [deltas, setDeltas]       = useState<Record<string, number>>({});
  const [saving, setSaving]       = useState<string | null>(null);

  const fetchWarehouse = useCallback(() => {
    setLoading(true);
    fetch("/api/warehouses/my", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message || "Failed to load warehouse");
        setWarehouse(d.data);
      })
      .catch(e => toast.error(e.message || "Failed to load inventory"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchWarehouse(); }, [fetchWarehouse]);

  const setDelta = (stockId: string, v: number) =>
    setDeltas(p => ({ ...p, [stockId]: v }));

  const applyAdjust = async (stock: LocationStock) => {
    const delta = deltas[stock.id] ?? 0;
    if (delta === 0) { toast.info("No change to apply"); return; }
    setSaving(stock.id);
    try {
      const res = await fetch("/api/warehouses/stock/adjust", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: stock.warehouseId,
          medicineId:  stock.medicineId,
          delta,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Adjust failed");
      toast.success(`Stock ${delta > 0 ? "added" : "removed"}: ${Math.abs(delta)} units`);
      setDeltas(p => { const n = { ...p }; delete n[stock.id]; return n; });
      fetchWarehouse();
    } catch (e: any) {
      toast.error(e.message || "Failed to adjust stock");
    } finally {
      setSaving(null);
      setAdjusting(null);
    }
  };

  const stocks = warehouse?.locationStocks ?? [];
  const filtered = stocks.filter(s =>
    s.medicine.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.medicine.genericName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStock   = stocks.filter(s => s.quantity > 0 && s.quantity <= 10).length;
  const outOfStock = stocks.filter(s => s.quantity === 0).length;
  const totalUnits = stocks.reduce((a, s) => a + s.quantity, 0);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
            <FaBoxes className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>
              Warehouse Inventory
            </h1>
            {warehouse && (
              <p className="text-sm" style={{ color: "#8A6650" }}>
                <FaWarehouse className="inline mr-1" style={{ fontSize: 11 }} />
                {warehouse.name} · {warehouse.city}
              </p>
            )}
          </div>
        </div>
        <button onClick={fetchWarehouse}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "#0EA5E915", color: "#0EA5E9", border: "1px solid #0EA5E930" }}>
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <FaSpinner className="text-4xl animate-spin" style={{ color: "#0EA5E9" }} />
        </div>
      ) : !warehouse ? (
        <div className="medi-card text-center py-24">
          <FaWarehouse className="mx-auto text-6xl mb-4 opacity-20" style={{ color: "#1B3A5C" }} />
          <p className="font-semibold" style={{ color: "#8A6650" }}>No warehouse assigned to your account.</p>
          <p className="text-sm mt-1" style={{ color: "#8A6650" }}>Contact admin to create a warehouse.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {[
              { label: "Total SKUs",   val: stocks.length,           color: "#0EA5E9", icon: <FaBoxes /> },
              { label: "Total Units",  val: totalUnits,               color: "#1B3A5C", icon: <FaPills /> },
              { label: "Low Stock",    val: lowStock,                 color: "#F59E0B", icon: <FaExclamationTriangle /> },
              { label: "Out of Stock", val: outOfStock,               color: "#EF4444", icon: <FaBoxOpen /> },
            ].map(s => (
              <div key={s.label} className="medi-card p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-xs mt-1 font-semibold" style={{ color: "#8A6650" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Warehouse info card */}
          <div className="medi-card p-5 mb-6 flex flex-wrap gap-6 items-center"
            style={{ background: "linear-gradient(90deg, #0EA5E908, #FFF)", border: "1px solid #0EA5E930" }}>
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "#0EA5E9" }}>
                📍 Warehouse Details
              </p>
              <p className="font-bold" style={{ color: "#1B3A5C" }}>{warehouse.name}</p>
              <p className="text-xs" style={{ color: "#8A6650" }}>{warehouse.address}, {warehouse.city}</p>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Manager</p>
              <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{warehouse.manager.name}</p>
              <p className="text-xs" style={{ color: "#8A6650" }}>{warehouse.manager.email}</p>
            </div>
            <div className="flex gap-3 ml-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: warehouse.isActive ? "#10B98122" : "#EF444422",
                         color:      warehouse.isActive ? "#10B981"   : "#EF4444" }}>
                {warehouse.isActive ? "✅ ACTIVE" : "❌ INACTIVE"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "#0EA5E918", color: "#0EA5E9" }}>
                {warehouse._count.fulfillmentTasks} active tasks
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <FaSearch className="absolute left-4 top-3.5" style={{ color: "#8A6650", fontSize: 13 }} />
            <input
              type="text"
              placeholder="Search medicines by name or generic name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ border: "1px solid #DDD0C4", background: "#FFF",
                       color: "#1B3A5C" }}
            />
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="medi-card text-center py-20">
              <FaBoxes className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
              <p style={{ color: "#8A6650" }}>
                {search ? `No products match "${search}".` : "No products in this warehouse yet."}
              </p>
              <p className="text-xs mt-1" style={{ color: "#8A6650" }}>
                Products are added automatically when seller shipments are received.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map((stock, i) => {
                  const qty     = stock.quantity;
                  const delta   = deltas[stock.id] ?? 0;
                  const preview = qty + delta;
                  const isLow   = qty > 0 && qty <= 10;
                  const isEmpty = qty === 0;
                  const isOpen  = adjusting === stock.id;

                  return (
                    <motion.div key={stock.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="medi-card overflow-hidden">

                      {/* Medicine header */}
                      <div className="flex items-center gap-3 px-4 py-4"
                        style={{ borderBottom: "1px solid #EEE4D9",
                                 background: isEmpty ? "#FFF8F8" : isLow ? "#FFFBF0" : "#FAFBFF" }}>
                        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden"
                          style={{ background: "#EEE4D9" }}>
                          {stock.medicine.image
                            ? <img src={stock.medicine.image} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">💊</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: "#1B3A5C" }}>
                            {stock.medicine.name}
                          </p>
                          {stock.medicine.genericName && (
                            <p className="text-xs truncate" style={{ color: "#8A6650" }}>
                              {stock.medicine.genericName}
                            </p>
                          )}
                          <p className="text-xs font-semibold mt-0.5" style={{ color: "#C2703A" }}>
                            ৳{stock.medicine.price.toFixed(2)}
                          </p>
                        </div>
                        {/* Stock badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-black px-2.5 py-1 rounded-full"
                            style={{
                              background: isEmpty ? "#EF444422" : isLow ? "#F59E0B22" : "#10B98122",
                              color:      isEmpty ? "#EF4444"   : isLow ? "#F59E0B"   : "#10B981",
                            }}>
                            {isEmpty ? "OUT" : isLow ? "LOW" : "OK"}
                          </span>
                          {(isEmpty || isLow) && (
                            <FaExclamationTriangle style={{ color: isEmpty ? "#EF4444" : "#F59E0B", fontSize: 10 }} />
                          )}
                        </div>
                      </div>

                      {/* Quantity display */}
                      <div className="px-4 py-3 flex items-center justify-between"
                        style={{ borderBottom: "1px solid #EEE4D9" }}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>
                            This Warehouse Stock
                          </p>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-3xl font-black" style={{ color: "#1B3A5C" }}>{qty}</span>
                            <span className="text-sm" style={{ color: "#8A6650" }}>units</span>
                            {delta !== 0 && (
                              <span className="text-sm font-bold ml-1"
                                style={{ color: delta > 0 ? "#10B981" : "#EF4444" }}>
                                ({delta > 0 ? "+" : ""}{delta} → {preview})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "#8A6650" }}>Global Stock</p>
                          <p className="text-sm font-semibold" style={{ color: "#5C4033" }}>
                            {stock.medicine.stock} units
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#8A6650" }}>
                            Updated {new Date(stock.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Adjust panel */}
                      <div className="px-4 py-3">
                        {!isOpen ? (
                          <button onClick={() => setAdjusting(stock.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{ background: "#0EA5E910", color: "#0EA5E9", border: "1px solid #0EA5E930" }}>
                            <FaBoxes /> Adjust Stock
                          </button>
                        ) : (
                          <AnimatePresence>
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                              <p className="text-xs font-semibold mb-2" style={{ color: "#8A6650" }}>
                                Adjust quantity (+ add / − remove)
                              </p>
                              <div className="flex items-center gap-2 mb-3">
                                <button onClick={() => setDelta(stock.id, (deltas[stock.id] ?? 0) - 1)}
                                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold"
                                  style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
                                  <FaMinus />
                                </button>
                                <input
                                  type="number"
                                  value={deltas[stock.id] ?? 0}
                                  onChange={e => setDelta(stock.id, parseInt(e.target.value) || 0)}
                                  className="flex-1 text-center border rounded-lg py-2 text-sm font-bold focus:outline-none"
                                  style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}
                                />
                                <button onClick={() => setDelta(stock.id, (deltas[stock.id] ?? 0) + 1)}
                                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold"
                                  style={{ background: "#10B98115", color: "#10B981", border: "1px solid #10B98130" }}>
                                  <FaPlus />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => applyAdjust(stock)}
                                  disabled={saving === stock.id || delta === 0}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                                  style={{ background: "#0EA5E9", color: "#FFF" }}>
                                  {saving === stock.id
                                    ? <FaSpinner className="animate-spin" />
                                    : <FaSave />}
                                  Save
                                </button>
                                <button onClick={() => { setAdjusting(null); setDelta(stock.id, 0); }}
                                  className="px-3 py-2 rounded-xl text-xs font-bold"
                                  style={{ background: "#F5EDE3", color: "#5C4033" }}>
                                  Cancel
                                </button>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
