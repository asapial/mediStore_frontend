"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaPills, FaPlus, FaEdit, FaTrash, FaSearch,
  FaBoxes, FaExclamationTriangle, FaEye,
} from "react-icons/fa";

interface Batch {
  id: string; batchNumber: string; quantity: number;
  expiryDate: string; purchaseDate: string;
}
interface Medicine {
  id: string; name: string; description: string;
  price: number; stock: number; manufacturer: string;
  image?: string | null;
  category: { name: string };
  batches?: Batch[];
}

const stockBadge = (stock: number) => {
  if (stock === 0) return <span className="badge-rejected">Out of Stock</span>;
  if (stock < 10)  return <span className="badge-lowstock">Low Stock</span>;
  return <span className="badge-instock">In Stock</span>;
};

const daysUntil = (d: string) =>
  Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);

export default function SellerMedicinesPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches,   setBatches]   = useState<Batch[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [medRes, btRes] = await Promise.all([
      fetch("/api/medicines/own",   { credentials: "include" }),
      fetch("/api/batches/my",      { credentials: "include" }),
    ]);
    const [medData, btData] = await Promise.all([medRes.json(), btRes.json()]);
    setMedicines(medData.data || []);
    setBatches(btData.data   || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this medicine? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/seller/medicines/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Medicine deleted");
      setMedicines(p => p.filter(m => m.id !== id));
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  // Merge batch data into medicines
  const medWithBatches = medicines.map(m => ({
    ...m,
    batches: batches.filter(b => (b as any).medicineId === m.id),
  }));

  const filtered = medWithBatches.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = medicines.reduce((s, m) => s + m.stock, 0);
  const lowStock   = medicines.filter(m => m.stock < 10 && m.stock > 0).length;
  const outStock   = medicines.filter(m => m.stock === 0).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaPills className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Medicines</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Manage your inventory with batch tracking</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard/seller/addMedicine")}
          className="medi-btn-accent flex items-center gap-2">
          <FaPlus /> Add Medicine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {[
          { label: "Total Medicines", val: medicines.length,  color: "#1B3A5C" },
          { label: "Low Stock",       val: lowStock,           color: "#C2703A" },
          { label: "Out of Stock",    val: outStock,           color: "#C62828" },
        ].map(s => (
          <div key={s.label} className="medi-card p-5 text-center">
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-3" style={{ color: "#8A6650" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, manufacturer, category…"
          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
          style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
      </div>

      {/* Warning banner */}
      {lowStock + outStock > 0 && (
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{ background: "#FFF3E0", border: "1px solid #C2703A" }}>
          <FaExclamationTriangle style={{ color: "#C2703A" }} />
          <p className="text-sm font-semibold" style={{ color: "#C2703A" }}>
            {outStock > 0 ? `${outStock} out-of-stock` : ""}{outStock > 0 && lowStock > 0 ? " · " : ""}{lowStock > 0 ? `${lowStock} low-stock` : ""} medicine{outStock + lowStock !== 1 ? "s" : ""} need attention
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaPills className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No medicines found.</p>
          <button onClick={() => router.push("/dashboard/seller/addMedicine")}
            className="medi-btn-accent mt-4">Add your first medicine</button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((med, i) => (
              <motion.div key={med.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">
                {/* Medicine row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
                    style={{ background: "#EEE4D9" }}>
                    {med.image
                      ? <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold" style={{ color: "#1B3A5C" }}>{med.name}</h3>
                      {stockBadge(med.stock)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs mt-1" style={{ color: "#8A6650" }}>
                      <span>Category: <strong style={{ color: "#5C4033" }}>{med.category?.name}</strong></span>
                      <span>Price: <strong style={{ color: "#C2703A" }}>${med.price.toFixed(2)}</strong></span>
                      <span>Stock: <strong style={{ color: med.stock === 0 ? "#C62828" : med.stock < 10 ? "#C2703A" : "#2E7D32" }}>{med.stock} units</strong></span>
                      <span>Mfr: <strong style={{ color: "#5C4033" }}>{med.manufacturer}</strong></span>
                      {med.batches && med.batches.length > 0 && (
                        <span style={{ color: "#3A6EA5" }}>
                          <FaBoxes className="inline mr-1" />
                          {med.batches.length} batch{med.batches.length > 1 ? "es" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {med.batches && med.batches.length > 0 && (
                      <button onClick={() => setExpanded(expanded === med.id ? null : med.id)}
                        className="p-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: expanded === med.id ? "#1B3A5C" : "#F5EDE3", color: expanded === med.id ? "#FFF" : "#5C4033", border: "1px solid #DDD0C4" }}
                        title="View batches">
                        <FaBoxes />
                      </button>
                    )}
                    <button onClick={() => router.push(`/dashboard/seller/updateMedicine/${med.id}`)}
                      className="p-2 rounded-lg transition"
                      style={{ background: "#E3F0FB", color: "#3A6EA5", border: "1px solid #3A6EA5" }}
                      title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(med.id)}
                      disabled={deleting === med.id}
                      className="p-2 rounded-lg transition disabled:opacity-50"
                      style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #C62828" }}
                      title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Stock visual bar */}
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (med.stock / Math.max(totalStock / medicines.length || 1, 1)) * 100)}%`,
                          background: med.stock === 0 ? "#C62828" : med.stock < 10 ? "#C2703A" : "#2E7D32",
                        }} />
                    </div>
                    <span className="text-xs" style={{ color: "#8A6650" }}>{med.stock} units</span>
                  </div>
                </div>

                {/* Batch detail panel */}
                {expanded === med.id && med.batches && med.batches.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="border-t px-4 pb-4 pt-3" style={{ borderColor: "#DDD0C4", background: "#FAFAFA" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8A6650" }}>
                      <FaBoxes className="inline mr-1" /> Batch Inventory
                    </p>
                    <div className="space-y-2">
                      {med.batches.map(b => {
                        const days = daysUntil(b.expiryDate);
                        const expired  = days < 0;
                        const critical = !expired && days <= 30;
                        const warning  = !expired && !critical && days <= 60;
                        return (
                          <div key={b.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2"
                            style={{ background: "#EEE4D9" }}>
                            <span className="font-mono font-bold" style={{ color: "#1B3A5C" }}>{b.batchNumber}</span>
                            <span style={{ color: "#5C4033" }}>Qty: {b.quantity}</span>
                            <span style={{ color: expired ? "#C62828" : critical ? "#C2703A" : "#2E7D32" }}>
                              Expires: {new Date(b.expiryDate).toLocaleDateString()}
                              {expired ? " ✗" : critical ? " ⚠" : " ✓"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
