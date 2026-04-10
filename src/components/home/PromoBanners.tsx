"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const promos = [
  {
    title: "Vitamins & Supplements",
    subtitle: "Strengthen Your Immunity",
    discount: "Up to 35% off",
    bg: "bg-gradient-to-br from-teal-500 to-emerald-600",
    textColor: "text-white",
    badgeClass: "bg-white/20 text-white border-white/30",
    cta: "Shop Vitamins",
    emoji: "💊",
    pattern: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)",
  },
  {
    title: "Personal Care",
    subtitle: "Your Daily Beauty Essentials",
    discount: "Buy 2, Get 1 Free",
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    textColor: "text-white",
    badgeClass: "bg-white/20 text-white border-white/30",
    cta: "Shop Now",
    emoji: "✨",
    pattern: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 60%)",
  },
  {
    title: "Sports Nutrition",
    subtitle: "Fuel Your Performance",
    discount: "New Arrivals",
    bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    textColor: "text-white",
    badgeClass: "bg-white/20 text-white border-white/30",
    cta: "Explore",
    emoji: "🏋️",
    pattern: "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12) 0%, transparent 60%)",
  },
];

export default function PromoBanners() {
  return (
    <section className="py-10 bg-muted/30 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promos.map((promo) => (
            <div
              key={promo.title}
              className={`relative overflow-hidden rounded-2xl p-6 ${promo.bg} cursor-pointer group transition-transform hover:scale-[1.02] shadow-lg`}
              style={{ backgroundImage: `${promo.pattern}, ${promo.bg}` }}
            >
              <div className="relative z-10 flex flex-col gap-3 h-full">
                <Badge variant="outline" className={`self-start text-xs px-3 py-1 border ${promo.badgeClass}`}>
                  {promo.discount}
                </Badge>
                <div>
                  <p className={`text-sm opacity-80 ${promo.textColor}`}>{promo.subtitle}</p>
                  <h3 className={`text-xl font-bold mt-1 ${promo.textColor}`}>{promo.title}</h3>
                </div>
                <Button
                  size="sm"
                  className="self-start bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mt-auto text-xs font-semibold"
                >
                  {promo.cta}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              {/* Decorative emoji */}
              <div className="absolute right-4 bottom-4 text-5xl opacity-20 group-hover:opacity-30 transition-opacity select-none pointer-events-none">
                {promo.emoji}
              </div>
              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}