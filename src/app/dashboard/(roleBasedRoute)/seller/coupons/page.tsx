"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaTag, FaPlus, FaToggleOn, FaToggleOff, FaTrash, FaPercent, FaDollarSign } from "react-icons/fa";

interface Coupon {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number;
  minOrderAmt: number; maxUses: number; usedCount: number; isActive: boolean;
  expiresAt?: string; createdAt: string;
}

export default function SellerCouponsPage() {
  const [coupons,  setCoupons]  = useState<Coupon[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [code,     setCode]     = useState("");
  const [type,     setType]     = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value,    setValue]    = useState("");
  const [minAmt,   setMinAmt]   = useState("");
  const [maxUses,  setMaxUses]  = useState("100");
  const [expires,  setExpires]  = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/coupons", { credentials: "include" });
      const data = await res.json();
      setCoupons(data.data || []);
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) { toast.error("Code and value are required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(), type, value: Number(value),
          minOrderAmt: Number(minAmt || 0), maxUses: Number(maxUses),
          expiresAt: expires || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Coupon created!");
      setCode(""); setValue(""); setMinAmt(""); setMaxUses("100"); setExpires("");
      fetch_();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const toggleCoupon = async (id: string) => {
    try {
      await fetch(`/api/coupons/${id}/toggle`, { method: "PATCH", credentials: "include" });
      toast.success("Toggled!"); fetch_();
    } catch { toast.error("Failed"); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Deleted!"); fetch_();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaTag className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Coupons</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Create and manage promotional discount codes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create form */}
        <form onSubmit={handleCreate} className="medi-card p-6 space-y-4 h-fit">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaPlus style={{ color: "#C2703A" }} /> New Coupon
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Code</label>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., SAVE20" className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono uppercase tracking-widest font-bold"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>
                Value ({type === "PERCENTAGE" ? "%" : "$"})
              </label>
              <input type="number" min="0" value={value} onChange={e => setValue(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Min. Order ($)</label>
              <input type="number" min="0" value={minAmt} onChange={e => setMinAmt(e.target.value)}
                placeholder="0"
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Max Uses</label>
              <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Expiry Date (optional)</label>
            <input type="date" value={expires} onChange={e => setExpires(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
          </div>
          <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Creating…" : "Create Coupon"}
          </button>
        </form>

        {/* Coupons grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading…</p>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16 medi-card">
              <FaTag className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#C2703A" }} />
              <p style={{ color: "#8A6650" }}>No coupons yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {coupons.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: c.isActive
                        ? "linear-gradient(135deg, #1B3A5C 0%, #243F63 100%)"
                        : "linear-gradient(135deg, #555 0%, #333 100%)",
                      color: "#F5EDE3", opacity: c.isActive ? 1 : 0.65,
                    }}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {c.type === "PERCENTAGE" ? <FaPercent style={{ color: "#C2703A", fontSize: 12 }} /> : <FaDollarSign style={{ color: "#C2703A", fontSize: 12 }} />}
                          <span className="text-xs opacity-70">{c.type}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleCoupon(c.id)} title="Toggle">
                            {c.isActive ? <FaToggleOn style={{ color: "#2E7D32", fontSize: 20 }} /> : <FaToggleOff style={{ color: "#888", fontSize: 20 }} />}
                          </button>
                          <button onClick={() => deleteCoupon(c.id)} title="Delete">
                            <FaTrash style={{ color: "#C62828", fontSize: 14 }} />
                          </button>
                        </div>
                      </div>
                      <p className="text-2xl font-black mb-1" style={{ color: "#C2703A" }}>
                        {c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}
                      </p>
                      <p className="font-mono font-bold text-sm tracking-widest">{c.code}</p>
                    </div>
                    <div className="px-5 pb-4 flex justify-between text-xs opacity-70">
                      <span>{c.usedCount}/{c.maxUses} used</span>
                      {c.expiresAt && <span>Expires {new Date(c.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
