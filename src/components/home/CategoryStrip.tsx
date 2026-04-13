"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets, Stethoscope, FlaskConical, Wind } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets, Stethoscope, FlaskConical, Wind,
};
const COLOR_PALETTE = [
  { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50", hsl: "142,55%,45%" },
  { color: "text-sky-500",     bg: "bg-sky-50 dark:bg-sky-950/50",         hsl: "199,89%,45%" },
  { color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/50",   hsl: "258,90%,65%" },
  { color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-950/50",       hsl: "351,83%,55%" },
  { color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/50",     hsl: "38,92%,50%"  },
  { color: "text-teal-500",    bg: "bg-teal-50 dark:bg-teal-950/50",       hsl: "173,58%,40%" },
  { color: "text-pink-500",    bg: "bg-pink-50 dark:bg-pink-950/50",       hsl: "330,81%,60%" },
  { color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-950/50",   hsl: "21,90%,50%"  },
  { color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/50",       hsl: "217,91%,60%" },
];
const DEFAULT_ICONS = [Pill, Leaf, Baby, Sparkles, Dumbbell, Heart, PawPrint, Apple, Droplets];

interface Category { id: string; name: string; icon?: string; isFeatured: boolean; }

export default function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(d => {
        const all: Category[] = d.data || d || [];
        const featured = all.filter(c => c.isFeatured);
        const toShow = (featured.length >= 9 ? featured : all).slice(0, 9);
        setCategories(toShow);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-8 sm:py-10 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4">
          {categories.map(({ id, name, icon }, i) => {
            const palette   = COLOR_PALETTE[i % COLOR_PALETTE.length];
            const isEmoji   = icon ? /\p{Emoji}/u.test(icon) && !ICON_MAP[icon] : false;
            const IconComp  = (!icon || isEmoji) ? null : (ICON_MAP[icon] ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length]);

            return (
              <Link
                key={id}
                href={`/shop?categoryId=${id}`}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                {/* Icon bubble */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${palette.bg} flex items-center justify-center
                  transition-all duration-200 group-hover:scale-110 group-hover:shadow-md
                  border border-transparent group-hover:border-border`}>

                  {isEmoji ? (
                    /* Emoji icon from DB */
                    <span className="text-2xl sm:text-3xl leading-none select-none">{icon}</span>
                  ) : IconComp ? (
                    /* Lucide icon name from DB */
                    <IconComp className={`w-5 h-5 sm:w-6 sm:h-6 ${palette.color}`} />
                  ) : (
                    /* First-letter fallback */
                    <span className={`text-base sm:text-lg font-black ${palette.color}`}>
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground
                  transition-colors text-center leading-tight line-clamp-2">
                  {name}
                </span>
              </Link>
            );
          })}

          {/* Loading skeletons */}
          {categories.length === 0 && Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-muted animate-pulse" />
              <div className="h-3 w-10 sm:w-12 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}