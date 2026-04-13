"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaEdit, FaArrowLeft, FaUpload, FaImage, FaBoxes,
  FaTag, FaInfoCircle, FaSave,
} from "react-icons/fa";

interface Category { id: string; name: string }
interface MedicineForm {
  id: string; name: string; description: string; price: number;
  discountPrice: number | null;
  stock: number; manufacturer: string; image: string; categoryId: string;
  requiresPrescription?: boolean;
}

const FIELD = { borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" };
const LBL   = { color: "#5C4033" };
const CLS   = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40]";

export default function UpdateMedicinePage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [form,       setForm]       = useState<MedicineForm | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/medicines/${id}`).then(r => r.json()),
      fetch("/api/admin/categories", { credentials: "include" }).then(r => r.json()),
    ]).then(([medData, catData]) => {
      const d = medData.data;
      setForm({
        id:                   d.id,
        name:                 d.name ?? "",
        description:          d.description ?? "",
        price:                d.price ?? 0,
        discountPrice:        d.discountPrice ?? null,
        stock:                d.stock ?? 0,
        manufacturer:         d.manufacturer ?? "",
        image:                d.image ?? "",
        categoryId:           d.categoryId ?? "",
        requiresPrescription: d.requiresPrescription ?? false,
      });
      setCategories(catData.data || []);
    }).catch(() => toast.error("Failed to load"));
  }, [id]);

  const uploadImage = async (file: File) => {
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch("https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e", { method: "POST", body: fd });
      const data = await res.json();
      setForm(p => p ? { ...p, image: data.data.url } : p);
      toast.success("Image uploaded");
    } catch { toast.error("Image upload failed"); }
    finally { setImgLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/medicines/${id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, description: form.description,
          price: Number(form.price),
          discountPrice: form.discountPrice !== null ? Number(form.discountPrice) : null,
          stock: Number(form.stock),
          manufacturer: form.manufacturer, image: form.image,
          categoryId: form.categoryId,
          requiresPrescription: form.requiresPrescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Medicine updated!");
      router.push("/dashboard/seller/medicines");
    } catch (err: any) { toast.error(err.message || "Update failed"); }
    finally { setLoading(false); }
  };

  if (!form) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <p style={{ color: "#8A6650" }}>Loading medicine…</p>
    </div>
  );

  const field = (key: keyof MedicineForm, v: any) =>
    setForm(p => p ? { ...p, [key]: v } : p);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/dashboard/seller/medicines")}
          className="p-2 rounded-xl" style={{ background: "#F5EDE3", color: "#5C4033" }}>
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaEdit className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Update Medicine</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Edit medicine details, pricing and inventory</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="medi-card p-6">
          <p className="flex items-center gap-2 font-bold mb-4" style={{ color: "#1B3A5C" }}>
            <FaInfoCircle style={{ color: "#C2703A" }} /> Basic Information
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={LBL}>Medicine Name *</label>
              <input value={form.name} onChange={e => field("name", e.target.value)}
                className={CLS} style={FIELD} placeholder="e.g., Paracetamol 500mg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LBL}>Manufacturer *</label>
              <input value={form.manufacturer} onChange={e => field("manufacturer", e.target.value)}
                className={CLS} style={FIELD} placeholder="e.g., Square Pharmaceuticals" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={LBL}>Description</label>
              <textarea value={form.description} onChange={e => field("description", e.target.value)}
                rows={3} className={`${CLS} resize-none`} style={FIELD}
                placeholder="Describe dosage, uses, side effects…" />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="medi-card p-6">
          <p className="flex items-center gap-2 font-bold mb-4" style={{ color: "#1B3A5C" }}>
            <FaTag style={{ color: "#C2703A" }} /> Pricing & Inventory
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={LBL}>Price ($) *</label>
              <input type="number" min={0} step={0.01} value={form.price}
                onChange={e => field("price", e.target.value)}
                className={CLS} style={FIELD} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LBL}>
                Discount Price ($) <span className="font-normal opacity-60">(optional)</span>
              </label>
              <input type="number" min={0} step={0.01}
                value={form.discountPrice ?? ""}
                onChange={e => field("discountPrice", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 9.99"
                className={CLS} style={FIELD} />
              {form.discountPrice != null && form.discountPrice > 0 && form.discountPrice < form.price && (
                <p className="text-[10px] mt-0.5" style={{ color: "#2E7D32" }}>
                  🏷 {Math.round(((form.price - form.discountPrice) / form.price) * 100)}% off
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LBL}>Stock (units) *</label>
              <input type="number" min={0} value={form.stock}
                onChange={e => field("stock", e.target.value)}
                className={CLS} style={FIELD} />
              <p className="text-xs mt-1" style={{ color: form.stock < 10 ? "#C62828" : "#8A6650" }}>
                {form.stock === 0 ? "⚠ Out of stock" : form.stock < 10 ? "⚠ Low stock" : "✓ In stock"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LBL}>Category *</label>
              <select value={form.categoryId} onChange={e => field("categoryId", e.target.value)}
                className={CLS} style={FIELD}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Prescription toggle */}
          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input type="checkbox" checked={!!form.requiresPrescription}
              onChange={e => field("requiresPrescription", e.target.checked)}
              className="accent-[#C2703A] w-4 h-4" />
            <span className="text-sm font-semibold" style={{ color: "#5C4033" }}>
              Requires Prescription
            </span>
            <span className="text-xs" style={{ color: "#8A6650" }}>(prescription-only medicines)</span>
          </label>
        </div>

        {/* Section 3: Image */}
        <div className="medi-card p-6">
          <p className="flex items-center gap-2 font-bold mb-4" style={{ color: "#1B3A5C" }}>
            <FaImage style={{ color: "#C2703A" }} /> Medicine Image
          </p>
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed transition-colors hover:border-[#C2703A]"
                style={{ borderColor: "#DDD0C4" }}>
                <FaUpload style={{ color: "#C2703A" }} />
                <span className="text-sm" style={{ color: "#8A6650" }}>
                  {imgLoading ? "Uploading…" : "Click to replace image"}
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </label>
              <p className="text-xs mt-2" style={{ color: "#8A6650" }}>Or paste URL:</p>
              <input value={form.image} onChange={e => field("image", e.target.value)}
                placeholder="https://example.com/medicine.jpg"
                className={`${CLS} mt-1`} style={FIELD} />
            </div>
            {form.image && (
              <div className="flex justify-center">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border" style={{ borderColor: "#DDD0C4" }}>
                  <img src={form.image} alt="preview" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button onClick={handleSubmit} disabled={loading || imgLoading}
            className="medi-btn-primary flex items-center gap-2 px-8 disabled:opacity-60">
            <FaSave /> {loading ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={() => router.push("/dashboard/seller/medicines")}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "#F5EDE3", color: "#5C4033", border: "1px solid #DDD0C4" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
