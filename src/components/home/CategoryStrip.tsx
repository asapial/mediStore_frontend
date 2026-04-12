"use client";

import { useEffect, useState } from "react";
import { Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets, Stethoscope, FlaskConical, Wind } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets, Stethoscope, FlaskConical, Wind,
};
const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  Medicines:       { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  Herbs:           { color: "text-green-500",   bg: "bg-green-50 dark:bg-green-950/50"   },
  "Baby Care":     { color: "text-sky-500",     bg: "bg-sky-50 dark:bg-sky-950/50"      },
  Baby:            { color: "text-sky-500",     bg: "bg-sky-50 dark:bg-sky-950/50"      },
  Beauty:          { color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-950/50"    },
  Sports:          { color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-950/50"},
  "Personal Care": { color: "text-pink-500",    bg: "bg-pink-50 dark:bg-pink-950/50"    },
  Pets:            { color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/50"  },
  Grocery:         { color: "text-red-500",     bg: "bg-red-50 dark:bg-red-950/50"      },
  Supplements:     { color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/50"},
};
const DEFAULT_ICONS = [Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets];

interface Category { id: string; name: string; icon?: string; color?: string; isFeatured: boolean; }

export default function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(d => {
        const all: Category[] = d.data || d || [];
        // Show featured first (up to 9), fallback to first 9
        const featured = all.filter(c => c.isFeatured);
        const toShow = (featured.length >= 9 ? featured : all).slice(0, 9);
        setCategories(toShow);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {categories.map(({ id, name, icon }, i) => {
            const IconComp = (icon && ICON_MAP[icon]) || DEFAULT_ICONS[i % DEFAULT_ICONS.length];
            const styles   = COLOR_MAP[name] || { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" };
            return (
              <a key={id} href={`/shop?category=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-2.5 group cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl ${styles.bg} flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md border border-transparent group-hover:border-border`}>
                  <IconComp className={`w-6 h-6 ${styles.color}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                  {name}
                </span>
              </a>
            );
          })}
          {/* Loading skeletons */}
          {categories.length === 0 && Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse" />
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}