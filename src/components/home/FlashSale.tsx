"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Timer, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FlashSaleItem {
  id: string; discountPrice: number; originalPrice: number; saleStock: number; soldCount: number;
  endAt: string;
  medicine: { id: string; name: string; image?: string; manufacturer: string };
  seller: { id: string; name: string };
}

function useCountdown(endAt: string) {
  const calc = () => {
    const diff = new Date(endAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const iv = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(iv);
  }, [endAt]);
  return t;
}

function CountdownPart({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-white/20 rounded-lg px-2 py-1 font-black text-lg text-white leading-none min-w-[2.5rem] text-center">
        {String(val).padStart(2, "0")}
      </span>
      <span className="text-[9px] text-white/70 mt-1 uppercase">{label}</span>
    </div>
  );
}

function SaleCard({ item }: { item: FlashSaleItem }) {
  const t = useCountdown(item.endAt);
  const pct = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);
  const stockPct = Math.max(5, Math.round(((item.saleStock - item.soldCount) / item.saleStock) * 100));
  const addToCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: item.medicine.id, quantity: 1 }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed");
      toast.success("Added to cart!");
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all">
      <div className="relative h-36 bg-white/5 flex items-center justify-center overflow-hidden">
        {item.medicine.image
          ? <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover" />
          : <span className="text-5xl">💊</span>}
        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 text-white text-[10px] font-black">
          -{pct}%
        </Badge>
      </div>
      <div className="p-3">
        <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{item.medicine.name}</h4>
        <p className="text-white/60 text-xs mt-0.5">{item.seller.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white font-black text-base">${item.discountPrice.toFixed(2)}</span>
          <span className="text-white/50 text-xs line-through">${item.originalPrice.toFixed(2)}</span>
        </div>
        {/* Stock bar */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-white/60 mb-1">
            <span>Sold: {item.soldCount}</span><span>Left: {item.saleStock - item.soldCount}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div className="h-1.5 rounded-full bg-orange-400 transition-all" style={{ width: `${100 - stockPct}%` }} />
          </div>
        </div>
        {/* Countdown */}
        <div className="flex items-center gap-1 mt-2 justify-center">
          <CountdownPart val={t.h} label="hr" />
          <span className="text-white/50 font-black text-lg pb-3">:</span>
          <CountdownPart val={t.m} label="min" />
          <span className="text-white/50 font-black text-lg pb-3">:</span>
          <CountdownPart val={t.s} label="sec" />
        </div>
        <Button size="sm" onClick={addToCart} disabled={item.saleStock <= item.soldCount}
          className="w-full mt-2 bg-white hover:bg-white/90 text-red-600 font-bold text-xs h-8">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {item.saleStock <= item.soldCount ? "Sold Out" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}

export default function FlashSale() {
  const [sales,   setSales]   = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flash-sales/active")
      .then(r => r.json())
      .then(d => setSales(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && sales.length === 0) return null;

  return (
    <section className="py-12" style={{ background: "linear-gradient(135deg,#b91c1c,#7f1d1d)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Flash Sale</h2>
            <p className="text-sm text-white/70">Limited-time deals — grab before they're gone!</p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/10 animate-pulse h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sales.map(s => <SaleCard key={s.id} item={s} />)}
          </div>
        )}
      </div>
    </section>
  );
}