"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaLayerGroup, FaPlus, FaTrash, FaExclamationTriangle, FaBoxes } from "react-icons/fa";

interface Batch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  purchaseDate: string;
  createdAt: string;
  medicine: { id: string; name: string; stock: number };
}

const daysUntil = (date: string) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);

export default function SellerBatchesPage() {
  const [batches,    setBatches]    = useState<Batch[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [medicines,  setMedicines]  = useState<any[]>([]);
  const [tab,        setTab]        = useState<"all" | "expiring">("all");
  const [submitting, setSubmitting] = useState(false);

  const [medicineId,  setMedicineId]  = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity,    setQuantity]    = useState(100);
  const [expiryDate,  setExpiryDate]  = useState("");
  const [purchaseDate,setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const endpoint = tab === "expiring" ? "/api/batches/expiring?days=60" : "/api/batches/my";
      const res  = await fetch(endpoint, { credentials: "include" });
      const data = await res.json();
      setBatches(data.data || []);
    } catch { toast.error("Failed to load batches"); }
    finally { setLoading(false); }
  };

  const fetchMeds = async () => {
    try {
      const res  = await fetch("/api/medicines/my", { credentials: "include" });
      const data = await res.json();
      setMedicines(data.data || []);
    } catch {}
  };

  useEffect(() => { fetchBatches(); fetchMeds(); }, [tab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineId || !batchNumber || !expiryDate) { toast.error("Fill required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, batchNumber, quantity, expiryDate, purchaseDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Batch added!");
      setMedicineId(""); setBatchNumber(""); setQuantity(100); setExpiryDate("");
      fetchBatches();
    } catch (err: any) { toast.error(err.message || "Failed to create"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this batch?")) return;
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Batch deleted");
      fetchBatches();
    } catch { toast.error("Delete failed"); }
  };

  const expiringSoon = batches.filter(b => daysUntil(b.expiryDate) <= 60);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#2E7D32" }}>
          <FaLayerGroup className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Medicine Batches</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Track batch inventory and expiry dates</p>
        </div>
      </div>

      {/* Expiry warning */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "#FFF3E0", border: "1px solid #C2703A" }}>
          <FaExclamationTriangle style={{ color: "#C2703A" }} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold" style={{ color: "#C2703A" }}>
            {expiringSoon.length} batch{expiringSoon.length > 1 ? "es" : ""} expiring within 60 days
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Batch Form */}
        <form onSubmit={handleCreate} className="medi-card p-6 space-y-4 h-fit">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaPlus style={{ color: "#C2703A" }} /> Add Batch
          </h2>
          {[
            { label: "Medicine",      content: (
              <select value={medicineId} onChange={e => setMedicineId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required>
                <option value="">Select medicine…</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            )},
            { label: "Batch Number",  content: (
              <input type="text" value={batchNumber} onChange={e => setBatchNumber(e.target.value)}
                placeholder="e.g., BATCH-2024-001"
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
            )},
            { label: "Quantity",      content: (
              <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
            )},
            { label: "Expiry Date",   content: (
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
            )},
            { label: "Purchase Date", content: (
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
            )},
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>{f.label}</label>
              {f.content}
            </div>
          ))}
          <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Adding…" : "Add Batch"}
          </button>
        </form>

        {/* Batches List */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {[["all", "All Batches", FaBoxes], ["expiring", "Expiring Soon", FaExclamationTriangle]].map(([v, label, Icon]: any) => (
              <button
                key={v} onClick={() => setTab(v)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tab === v ? "#1B3A5C" : "#F5EDE3",
                  color:      tab === v ? "#FFFFFF"  : "#5C4033",
                  border:     "1px solid #DDD0C4",
                }}
              >
                <Icon style={{ fontSize: 12 }} /> {label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading batches…</p>
          ) : batches.length === 0 ? (
            <div className="text-center py-16 medi-card">
              <FaLayerGroup className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#2E7D32" }} />
              <p style={{ color: "#8A6650" }}>No batches found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {batches.map((batch, i) => {
                  const days = daysUntil(batch.expiryDate);
                  const expired = days < 0;
                  const critical = days >= 0 && days <= 30;
                  const warning  = days > 30 && days <= 60;
                  return (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="medi-card p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm truncate" style={{ color: "#1B3A5C" }}>{batch.medicine.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded font-mono"
                            style={{ background: "#EEE4D9", color: "#5C4033" }}>
                            {batch.batchNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#8A6650" }}>
                          <span>Qty: <strong style={{ color: "#5C4033" }}>{batch.quantity}</strong></span>
                          <span>Expires: <strong style={{ color: expired ? "#C62828" : critical ? "#C2703A" : "#2E7D32" }}>
                            {new Date(batch.expiryDate).toLocaleDateString()}
                            {expired ? " (Expired)" : ` (${days}d)`}
                          </strong></span>
                          <span>Purchased: {new Date(batch.purchaseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={expired ? "badge-rejected" : critical ? "badge-pending" : warning ? "badge-paused" : "badge-approved"}>
                          {expired ? "Expired" : critical ? "Critical" : warning ? "Warning" : "Good"}
                        </span>
                        <button
                          onClick={() => handleDelete(batch.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition"
                        >
                          <FaTrash style={{ color: "#C62828", fontSize: 12 }} />
                        </button>
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
