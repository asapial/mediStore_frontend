"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaTag, FaPlus, FaToggleOn, FaToggleOff, FaTrash, FaPercent, FaDollarSign, FaUser } from "react-icons/fa";

interface Coupon {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number;
  minOrderAmt: number; maxUses: number; usedCount: number; isActive: boolean;
  expiresAt?: string; createdAt: string;
  seller?: { name: string; email: string } | null;
  usages: { userId: string }[];
}

export default function AdminCouponsPage() {
  const [coupons,  setCoupons]  = useState<Coupon[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
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
    setSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), type, value: Number(value), minOrderAmt: Number(minAmt || 0), maxUses: Number(maxUses), expiresAt: expires || undefined }),
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
    try { await fetch(`/api/coupons/${id}/toggle`, { method: "PATCH", credentials: "include" }); toast.success("Toggled!"); fetch_(); }
    catch { toast.error("Failed"); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await fetch(`/api/coupons/${id}`, { method: "DELETE", credentials: "include" }); toast.success("Deleted!"); fetch_(); }
    catch { toast.error("Failed"); }
  };

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.seller?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const totalSavings = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaTag className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Coupon Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Platform-wide and seller coupon oversight</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Coupons",  val: coupons.length,                           color: "#1B3A5C" },
          { label: "Active",         val: coupons.filter(c => c.isActive).length,   color: "#2E7D32" },
          { label: "Total Uses",     val: totalSavings,                             color: "#C2703A" },
        ].map(s => (
          <div key={s.label} className="medi-card p-5 text-center">
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs uppercase font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create form */}
        <form onSubmit={handleCreate} className="medi-card p-6 space-y-4 h-fit">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaPlus style={{ color: "#C2703A" }} /> New Platform Coupon
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Code</label>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="MEDISTORE20"
              className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono uppercase tracking-widest font-bold"
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
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Value</label>
              <input type="number" min="0" value={value} onChange={e => setValue(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Min. Order</label>
              <input type="number" min="0" value={minAmt} onChange={e => setMinAmt(e.target.value)} placeholder="0"
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
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Expiry Date</label>
            <input type="date" value={expires} onChange={e => setExpires(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
          </div>
          <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Creating…" : "Create Coupon"}
          </button>
        </form>

        {/* Table */}
        <div className="medi-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>All Coupons ({filtered.length})</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code / seller…"
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033", width: 200 }} />
          </div>
          {loading ? <p className="text-center py-12" style={{ color: "#8A6650" }}>Loading…</p> : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #DDD0C4" }}>
                    {["Code", "Type / Value", "Uses", "Seller", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-bold uppercase tracking-wide" style={{ color: "#8A6650" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }} style={{ borderBottom: "1px solid #EEE4D9" }}>
                        <td className="py-3 pr-4 font-mono font-black text-sm" style={{ color: "#1B3A5C" }}>{c.code}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1">
                            {c.type === "PERCENTAGE" ? <FaPercent style={{ color: "#C2703A", fontSize: 10 }} /> : <FaDollarSign style={{ color: "#C2703A", fontSize: 10 }} />}
                            <span style={{ color: "#C2703A" }} className="font-bold">
                              {c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-xs" style={{ color: "#5C4033" }}>{c.usedCount}/{c.maxUses}</td>
                        <td className="py-3 pr-4 text-xs" style={{ color: "#8A6650" }}>
                          {c.seller ? <span className="flex items-center gap-1"><FaUser style={{ fontSize: 9 }} />{c.seller.name}</span> : "Platform"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={c.isActive ? "badge-approved" : "badge-paused"}>{c.isActive ? "Active" : "Inactive"}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button onClick={() => toggleCoupon(c.id)} title="Toggle">
                              {c.isActive ? <FaToggleOn style={{ color: "#2E7D32", fontSize: 18 }} /> : <FaToggleOff style={{ color: "#888", fontSize: 18 }} />}
                            </button>
                            <button onClick={() => deleteCoupon(c.id)} title="Delete">
                              <FaTrash style={{ color: "#C62828", fontSize: 13 }} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
