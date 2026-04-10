"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaPills, FaTag, FaImage, FaBell, FaBoxes,
  FaUpload, FaCheckCircle, FaStore,
} from "react-icons/fa";

type Category = { id: string; name: string };

const FIELD_STYLE = {
  borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033",
};
const LABEL_STYLE = { color: "#5C4033" };
const INPUT_CLS = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40]";
const SECTION_HDR = "flex items-center gap-2 font-bold text-base mb-4";

export default function AddMedicinePage() {
  /* ─── categories ────────────────────────────────────────────────── */
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
      .catch(() => {});
  }, []);

  /* ─── medicine fields ───────────────────────────────────────────── */
  const [med, setMed] = useState({
    name: "", description: "", price: "", stock: "",
    manufacturer: "", categoryId: "", image: "",
  });

  /* ─── image upload ─────────────────────────────────────────────── */
  const [imgUploading, setImgUploading] = useState(false);

  const uploadImage = async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch("https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e", { method: "POST", body: fd });
      const data = await res.json();
      setMed(p => ({ ...p, image: data.data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Image upload failed"); }
    finally { setImgUploading(false); }
  };

  /* ─── optional stock alert ──────────────────────────────────────── */
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState("10");

  /* ─── optional initial batch ────────────────────────────────────── */
  const [batchEnabled, setBatchEnabled] = useState(false);
  const [batch, setBatch] = useState({
    batchNumber: "", quantity: "100", expiryDate: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  });

  /* ─── submission ────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!med.name || !med.price || !med.stock || !med.categoryId) {
      toast.error("Name, price, stock and category are required");
      return;
    }
    if (batchEnabled && (!batch.batchNumber || !batch.expiryDate)) {
      toast.error("Batch number and expiry date are required for batch");
      return;
    }
    setLoading(true);
    try {
      /* 1. Create medicine */
      const medRes  = await fetch("/api/seller/medicines", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...med,
          price: Number(med.price),
          stock: Number(med.stock),
        }),
      });
      const medData = await medRes.json();
      if (!medRes.ok) throw new Error(medData.message || "Failed to add medicine");
      const medicineId: string = medData.data?.id;
      toast.success("Medicine added successfully!");

      /* 2. Optionally create stock alert */
      if (alertEnabled && medicineId) {
        try {
          const alRes = await fetch("/api/stock-alerts", {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medicineId, threshold: Number(alertThreshold), isActive: true }),
          });
          if (alRes.ok) toast.success("Stock alert configured");
          else toast.error("Stock alert could not be saved (medicine added)");
        } catch { toast.error("Stock alert error (medicine added)"); }
      }

      /* 3. Optionally create initial batch */
      if (batchEnabled && medicineId) {
        try {
          const btRes = await fetch("/api/batches", {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              medicineId,
              batchNumber:  batch.batchNumber,
              quantity:     Number(batch.quantity),
              expiryDate:   batch.expiryDate,
              purchaseDate: batch.purchaseDate,
            }),
          });
          if (btRes.ok) toast.success("Initial batch recorded");
          else toast.error("Batch could not be saved (medicine added)");
        } catch { toast.error("Batch error (medicine added)"); }
      }

      setDone(true);
      /* Reset form */
      setMed({ name: "", description: "", price: "", stock: "", manufacturer: "", categoryId: "", image: "" });
      setAlertEnabled(false); setAlertThreshold("10");
      setBatchEnabled(false); setBatch({ batchNumber: "", quantity: "100", expiryDate: "", purchaseDate: new Date().toISOString().slice(0, 10) });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ─── UI ────────────────────────────────────────────────────────── */
  return (
    <div className="medi-page">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaStore className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Add New Medicine</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>List a medicine, configure stock alerts & record the first batch</p>
        </div>
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl p-4 mb-6"
          style={{ background: "#E8F5E9", border: "1px solid #2E7D32" }}>
          <FaCheckCircle style={{ color: "#2E7D32", fontSize: 20 }} />
          <p className="font-semibold text-sm" style={{ color: "#2E7D32" }}>
            Medicine added! You can add another one below.
          </p>
          <button className="ml-auto text-xs underline" style={{ color: "#2E7D32" }}
            onClick={() => setDone(false)}>Dismiss</button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Basic Info ─────────────────────────────────── */}
        <div className="medi-card p-6">
          <p className={SECTION_HDR} style={{ color: "#1B3A5C" }}>
            <FaPills style={{ color: "#C2703A" }} /> Basic Information
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Medicine Name *</label>
              <input value={med.name} onChange={e => setMed(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Paracetamol 500mg"
                className={INPUT_CLS} style={FIELD_STYLE} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Manufacturer *</label>
              <input value={med.manufacturer} onChange={e => setMed(p => ({ ...p, manufacturer: e.target.value }))}
                placeholder="e.g., Square Pharmaceuticals"
                className={INPUT_CLS} style={FIELD_STYLE} required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Description</label>
              <textarea value={med.description} onChange={e => setMed(p => ({ ...p, description: e.target.value }))}
                placeholder="Briefly describe the medicine, uses, and dosage..."
                rows={3} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} />
            </div>
          </div>
        </div>

        {/* ── Section 2: Pricing & Inventory ───────────────────────── */}
        <div className="medi-card p-6">
          <p className={SECTION_HDR} style={{ color: "#1B3A5C" }}>
            <FaTag style={{ color: "#C2703A" }} /> Pricing & Inventory
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Price ($) *</label>
              <input type="number" min="0" step="0.01" value={med.price}
                onChange={e => setMed(p => ({ ...p, price: e.target.value }))}
                placeholder="12.50" className={INPUT_CLS} style={FIELD_STYLE} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Stock Qty *</label>
              <input type="number" min="0" value={med.stock}
                onChange={e => setMed(p => ({ ...p, stock: e.target.value }))}
                placeholder="500" className={INPUT_CLS} style={FIELD_STYLE} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Category *</label>
              <select value={med.categoryId} onChange={e => setMed(p => ({ ...p, categoryId: e.target.value }))}
                className={INPUT_CLS} style={FIELD_STYLE} required>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 3: Image ─────────────────────────────────────── */}
        <div className="medi-card p-6">
          <p className={SECTION_HDR} style={{ color: "#1B3A5C" }}>
            <FaImage style={{ color: "#C2703A" }} /> Medicine Image
          </p>
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-semibold mb-2" style={LABEL_STYLE}>Upload Image (JPEG/PNG)</label>
              <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed transition-colors hover:border-[#C2703A]"
                style={{ borderColor: "#DDD0C4" }}>
                <FaUpload style={{ color: "#C2703A" }} />
                <span className="text-sm" style={{ color: "#8A6650" }}>
                  {imgUploading ? "Uploading…" : "Click to choose image"}
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </label>
              <p className="text-xs mt-2" style={{ color: "#8A6650" }}>Or paste an image URL:</p>
              <input value={med.image} onChange={e => setMed(p => ({ ...p, image: e.target.value }))}
                placeholder="https://example.com/medicine.jpg"
                className={`${INPUT_CLS} mt-1`} style={FIELD_STYLE} />
            </div>
            {med.image && (
              <div className="flex justify-center">
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#DDD0C4", width: 140, height: 140 }}>
                  <img src={med.image} alt="preview" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Stock Alert (optional) ────────────────────── */}
        <div className="medi-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className={SECTION_HDR + " mb-0"} style={{ color: "#1B3A5C" }}>
              <FaBell style={{ color: alertEnabled ? "#C62828" : "#8A6650" }} /> Low-Stock Alert
              <span className="ml-2 text-xs font-normal" style={{ color: "#8A6650" }}>(optional)</span>
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold" style={{ color: "#5C4033" }}>Enable</span>
              <div onClick={() => setAlertEnabled(p => !p)}
                className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                style={{ background: alertEnabled ? "#2E7D32" : "#DDD0C4" }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: alertEnabled ? "translateX(20px)" : "none" }} />
              </div>
            </label>
          </div>
          {alertEnabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>
                Alert Threshold (units) — get notified when stock falls below this
              </label>
              <input type="number" min="1" value={alertThreshold}
                onChange={e => setAlertThreshold(e.target.value)}
                className={INPUT_CLS} style={FIELD_STYLE} />
            </motion.div>
          )}
          {!alertEnabled && (
            <p className="text-sm" style={{ color: "#8A6650" }}>
              Enable to automatically receive notifications when stock falls below a set threshold.
            </p>
          )}
        </div>

        {/* ── Section 5: First Batch (optional) ────────────────────── */}
        <div className="medi-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className={SECTION_HDR + " mb-0"} style={{ color: "#1B3A5C" }}>
              <FaBoxes style={{ color: batchEnabled ? "#2E7D32" : "#8A6650" }} /> Record Initial Batch
              <span className="ml-2 text-xs font-normal" style={{ color: "#8A6650" }}>(optional)</span>
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold" style={{ color: "#5C4033" }}>Enable</span>
              <div onClick={() => setBatchEnabled(p => !p)}
                className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                style={{ background: batchEnabled ? "#2E7D32" : "#DDD0C4" }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: batchEnabled ? "translateX(20px)" : "none" }} />
              </div>
            </label>
          </div>
          {batchEnabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Batch Number *</label>
                  <input value={batch.batchNumber} onChange={e => setBatch(p => ({ ...p, batchNumber: e.target.value }))}
                    placeholder="e.g., BATCH-2024-001"
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Quantity</label>
                  <input type="number" min="1" value={batch.quantity}
                    onChange={e => setBatch(p => ({ ...p, quantity: e.target.value }))}
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Expiry Date *</label>
                  <input type="date" value={batch.expiryDate}
                    onChange={e => setBatch(p => ({ ...p, expiryDate: e.target.value }))}
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Purchase Date</label>
                  <input type="date" value={batch.purchaseDate}
                    onChange={e => setBatch(p => ({ ...p, purchaseDate: e.target.value }))}
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
              </div>
            </motion.div>
          )}
          {!batchEnabled && (
            <p className="text-sm" style={{ color: "#8A6650" }}>
              Enable to log the first physical batch of this medicine with expiry tracking.
            </p>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={loading || imgUploading}
            className="medi-btn-primary disabled:opacity-60 flex items-center gap-2 px-8">
            {loading ? "Saving…" : "Add Medicine"}
            {alertEnabled && <FaBell style={{ fontSize: 12 }} />}
            {batchEnabled && <FaBoxes style={{ fontSize: 12 }} />}
          </button>
          <p className="text-xs" style={{ color: "#8A6650" }}>
            {alertEnabled && batchEnabled ? "Will create medicine + alert + batch"
              : alertEnabled ? "Will create medicine + stock alert"
              : batchEnabled ? "Will create medicine + initial batch"
              : "Will create medicine listing only"}
          </p>
        </div>
      </form>
    </div>
  );
}
