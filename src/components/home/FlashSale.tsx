"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Timer, Flame, Zap, Star } from "lucide-react";
import { toast } from "sonner";

interface FlashSaleItem {
  id: string; discountPrice: number; originalPrice: number; saleStock: number; soldCount: number;
  endAt: string;
  medicine: { id: string; name: string; image?: string; manufacturer: string; categoryId?: string };
  seller: { id: string; name: string };
}

function useCountdown(endAt: string) {
  const calc = () => {
    const diff = new Date(endAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const iv = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(iv);
  }, [endAt]);
  return t;
}

function CountdownSegment({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span key={val} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}
        className="font-black text-xl leading-none min-w-[2.2rem] text-center py-1 px-2 rounded-lg bg-white/20 text-white">
        {String(val).padStart(2, "0")}
      </motion.span>
      <span className="text-[9px] text-white/60 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SaleCard({ item, index }: { item: FlashSaleItem; index: number }) {
  const t = useCountdown(item.endAt);
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);

  const pct = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);
  const remaining = item.saleStock - item.soldCount;
  const stockPct  = item.saleStock > 0 ? Math.round((remaining / item.saleStock) * 100) : 0;
  const outOfStock = remaining <= 0 || t.expired;

  const addToCart = async () => {
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: item.medicine.id, quantity: 1 }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed");
      setAdded(true);
      toast.success(`${item.medicine.name} added to cart!`);
      setTimeout(() => setAdded(false), 3000);
    } catch (e: any) {
      toast.error(e.message || "Please log in to add to cart");
    } finally { setAdding(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 transition-shadow hover:shadow-2xl cursor-pointer group">

      {/* Discount badge */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.08 + 0.3, type: "spring" }}
        className="absolute top-2 left-2 z-10 font-black text-white text-xs px-2.5 py-1 rounded-full shadow-lg"
        style={{ background: "linear-gradient(135deg,#ff4444,#ff6b35)" }}>
        -{pct}%
      </motion.div>

      {/* Urgency badge */}
      {remaining <= 5 && remaining > 0 && (
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
          🔥 {remaining} left!
        </motion.div>
      )}

      {/* Image */}
      <div className="relative h-40 bg-white/5 overflow-hidden">
        {item.medicine.image
          ? <img src={item.medicine.image} alt={item.medicine.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-6xl">💊</div>}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-black text-sm">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h4 className="font-bold text-white text-sm line-clamp-1 leading-snug">{item.medicine.name}</h4>
        <p className="text-white/50 text-xs mt-0.5 truncate">{item.seller.name}</p>

        {/* Price */}
        <div className="flex items-end gap-2 mt-2">
          <span className="text-white font-black text-xl">${item.discountPrice.toFixed(2)}</span>
          <span className="text-white/40 text-xs line-through pb-0.5">${item.originalPrice.toFixed(2)}</span>
          <span className="ml-auto text-orange-300 text-xs font-bold">Save ${(item.originalPrice - item.discountPrice).toFixed(2)}</span>
        </div>

        {/* Stock bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-white/50 mb-1">
            <span>Sold: {item.soldCount}</span>
            <span>{remaining} remaining</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <motion.div className="h-1.5 rounded-full"
              style={{ background: stockPct < 20 ? "#ff4444" : "linear-gradient(90deg,#ff6b35,#ffd700)" }}
              initial={{ width: 0 }} animate={{ width: `${100 - stockPct}%` }} transition={{ duration: 1, delay: index * 0.1 }} />
          </div>
        </div>

        {/* Countdown */}
        {!t.expired && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Timer className="w-3 h-3 text-orange-300 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <CountdownSegment val={t.h} label="hr" />
              <span className="text-white/40 font-black text-base pb-3">:</span>
              <CountdownSegment val={t.m} label="min" />
              <span className="text-white/40 font-black text-base pb-3">:</span>
              <CountdownSegment val={t.s} label="sec" />
            </div>
          </div>
        )}

        {/* Add to cart button */}
        <motion.button
          onClick={addToCart}
          disabled={outOfStock || adding}
          whileTap={!outOfStock ? { scale: 0.95 } : {}}
          className="w-full mt-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={added
            ? { background: "#2E7D32", color: "#FFF" }
            : outOfStock
            ? { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
            : { background: "rgba(255,255,255,0.95)", color: "#b91c1c" }}>
          <ShoppingCart className="w-3.5 h-3.5" />
          {adding ? "Adding…" : added ? "✓ Added!" : outOfStock ? "Sold Out" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function FlashSale() {
  const [sales,    setSales]   = useState<FlashSaleItem[]>([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flash-sales/active")
      .then(r => r.json())
      .then(d => setSales(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && sales.length === 0) return null;

  return (
    <section className="py-14 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b,#7c2d12)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.4 }}
            className="absolute rounded-full"
            style={{ background: "#FF6B35", width: 80 + i * 40, height: 80 + i * 40, top: `${10 + i * 11}%`, left: `${i * 13}%` }} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-300" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white">Flash Sale</h2>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  LIVE
                </motion.span>
              </div>
              <p className="text-white/60 text-sm">⚡ Limited-time deals — grab before they're gone!</p>
            </div>
          </motion.div>
          <motion.a href="/shop" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border border-white/30 hover:bg-white/10 transition-colors">
            View All <Zap className="w-3.5 h-3.5" />
          </motion.a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/10 animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {sales.map((s, i) => <SaleCard key={s.id} item={s} index={i} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}