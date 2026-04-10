"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/utils/Progress";


const dealItems = [
  { id: 1, name: "Biotin 10,000 mcg Hair & Nail Gummies", brand: "HairPro", price: 9.99, originalPrice: 22.99, sold: 78, total: 100, emoji: "💇" },
  { id: 2, name: "Turmeric Curcumin with BioPerine 1500mg", brand: "HerbalMax", price: 14.49, originalPrice: 29.99, sold: 54, total: 80, emoji: "🌿" },
  { id: 3, name: "Pre-Workout Energy Powder - Fruit Punch", brand: "PowerFuel", price: 29.99, originalPrice: 54.99, sold: 38, total: 60, emoji: "⚡" },
  { id: 4, name: "Elderberry Zinc Immune Gummies Daily", brand: "ImmuneBoost", price: 11.99, originalPrice: 23.99, sold: 61, total: 90, emoji: "🫐" },
];

function useCountdown(targetHours: number) {
  const [timeLeft, setTimeLeft] = useState({ h: targetHours, m: 0, s: 0 });

  useEffect(() => {
    const end = Date.now() + targetHours * 3600 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHours]);

  return timeLeft;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-xl bg-foreground text-background flex items-center justify-center text-2xl font-black tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function FlashSale() {
  const { h, m, s } = useCountdown(8);

  return (
    <section className="py-12 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground">Flash Sale</h2>
              <p className="text-sm text-muted-foreground">Don't miss today's amazing deals!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground mr-2">Ends in:</span>
            <TimeBlock value={h} label="Hours" />
            <span className="text-2xl font-black text-foreground pb-4">:</span>
            <TimeBlock value={m} label="Mins" />
            <span className="text-2xl font-black text-foreground pb-4">:</span>
            <TimeBlock value={s} label="Secs" />
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealItems.map((item) => {
            const discountPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
            const soldPct = Math.round((item.sold / item.total) * 100);
            return (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-bold text-white bg-orange-500 rounded-full px-2 py-0.5">-{discountPct}%</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 font-semibold">{item.brand}</p>
                  <h3 className="text-sm font-semibold text-foreground leading-snug mt-1 line-clamp-2">{item.name}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-foreground">${item.price.toFixed(2)}</span>
                  <span className="text-xs line-through text-muted-foreground">${item.originalPrice.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Sold: <span className="font-semibold text-foreground">{item.sold}</span></span>
                    <span className="text-muted-foreground">Available: <span className="font-semibold text-foreground">{item.total - item.sold}</span></span>
                  </div>
                  <Progress value={soldPct} className="h-1.5 bg-orange-100 dark:bg-orange-950/40 [&>div]:bg-orange-500" />
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full h-8 text-xs font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:scale-105 transition-all">
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Add to Cart
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}