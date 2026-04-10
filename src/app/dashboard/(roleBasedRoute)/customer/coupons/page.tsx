"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaTag, FaCheckCircle, FaTimesCircle, FaPercent, FaDollarSign } from "react-icons/fa";

interface Coupon {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number;
  minOrderAmt: number; maxUses: number; usedCount: number; isActive: boolean;
  expiresAt?: string;
}

export default function CustomerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code,    setCode]    = useState("");
  const [total,   setTotal]   = useState("");
  const [result,  setResult]  = useState<{ discount: number; finalTotal: number; coupon: Coupon } | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/coupons", { credentials: "include" });
      const data = await res.json();
      setCoupons((data.data || []).filter((c: Coupon) => c.isActive));
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !total) { toast.error("Enter code and order total"); return; }
    setApplying(true);
    try {
      const res  = await fetch("/api/coupons/apply", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal: Number(total) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
      toast.success(`Saved $${data.data.discount.toFixed(2)}!`);
    } catch (err: any) { toast.error(err.message || "Invalid coupon"); setResult(null); }
    finally { setApplying(false); }
  };

  const isExpired = (date?: string) => date ? new Date(date) < new Date() : false;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaTag className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Coupons & Promo Codes</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Apply codes for instant savings</p>
        </div>
      </div>

      {/* Coupon Validator */}
      <div className="medi-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Apply a Coupon</h2>
        <form onSubmit={handleApply} className="flex flex-wrap gap-3">
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="COUPON CODE" className="border rounded-lg px-4 py-2.5 text-sm font-mono font-bold uppercase tracking-widest flex-1 min-w-[160px]"
            style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }} />
          <input type="number" value={total} onChange={e => setTotal(e.target.value)}
            placeholder="Order Total ($)" className="border rounded-lg px-4 py-2.5 text-sm flex-1 min-w-[140px]"
            style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
          <button type="submit" disabled={applying} className="medi-btn-accent disabled:opacity-60">
            {applying ? "Checking…" : "Apply Code"}
          </button>
        </form>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl p-5 flex flex-wrap items-center gap-4"
              style={{ background: "#E8F5E9", border: "1px solid #2E7D32" }}>
              <FaCheckCircle style={{ color: "#2E7D32", fontSize: 28 }} />
              <div className="flex-1">
                <p className="font-bold text-lg" style={{ color: "#2E7D32" }}>Code Applied! 🎉</p>
                <p className="text-sm" style={{ color: "#5C4033" }}>
                  You save <strong>${result.discount.toFixed(2)}</strong> with <strong>{result.coupon.code}</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#8A6650" }}>New Total</p>
                <p className="text-2xl font-black" style={{ color: "#1B3A5C" }}>${result.finalTotal.toFixed(2)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Available Coupons */}
      <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Available Coupons</h2>
      {loading ? (
        <p className="text-center py-10" style={{ color: "#8A6650" }}>Loading…</p>
      ) : coupons.length === 0 ? (
        <p className="text-center py-10" style={{ color: "#8A6650" }}>No public coupons available right now.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #243F63 100%)", color: "#F5EDE3" }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {c.type === "PERCENTAGE" ? <FaPercent style={{ color: "#C2703A" }} /> : <FaDollarSign style={{ color: "#C2703A" }} />}
                    <span className="text-xs uppercase tracking-widest opacity-70">
                      {c.type === "PERCENTAGE" ? "Percentage Off" : "Fixed Discount"}
                    </span>
                  </div>
                  {isExpired(c.expiresAt) ? (
                    <span className="badge-rejected">Expired</span>
                  ) : (
                    <span className="badge-approved">Active</span>
                  )}
                </div>
                <p className="text-3xl font-black mb-1" style={{ color: "#C2703A" }}>
                  {c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}
                </p>
                <p className="text-xs opacity-70">
                  {c.minOrderAmt > 0 ? `Min. order $${c.minOrderAmt}` : "No minimum order"}
                </p>
              </div>
              <div className="px-5 pb-4 flex items-center justify-between">
                <span className="font-mono font-black text-sm tracking-widest border border-dashed rounded-lg px-3 py-1.5 cursor-pointer"
                  style={{ borderColor: "rgba(245,237,227,0.4)", color: "#F5EDE3" }}
                  onClick={() => { setCode(c.code); toast.success("Code copied!"); }}>
                  {c.code}
                </span>
                <span className="text-xs opacity-60">{c.usedCount}/{c.maxUses} used</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
