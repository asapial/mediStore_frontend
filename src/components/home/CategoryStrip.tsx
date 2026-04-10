"use client";

import { Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets } from "lucide-react";

const categories = [
  { icon: Pill, label: "Medicines", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50", href: "/shop/medicines" },
  { icon: Leaf, label: "Herbs", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/50", href: "/shop/herbs" },
  { icon: Baby, label: "Baby Care", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/50", href: "/shop/baby" },
  { icon: Sparkles, label: "Beauty", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/50", href: "/shop/beauty" },
  { icon: Dumbbell, label: "Sports", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/50", href: "/shop/sports" },
  { icon: Heart, label: "Personal Care", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/50", href: "/shop/personal-care" },
  { icon: PawPrint, label: "Pets", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/50", href: "/shop/pets" },
  { icon: Apple, label: "Grocery", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/50", href: "/shop/grocery" },
  { icon: Droplets, label: "Supplements", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/50", href: "/shop/supplements" },
];

export default function CategoryStrip() {
  return (
    <section className="py-10 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {categories.map(({ icon: Icon, label, color, bg, href }) => (
            <a
              key={label}
              href={href}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md border border-transparent group-hover:border-border`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}