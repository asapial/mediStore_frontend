"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Banner {
  id: string; title: string; subtitle?: string; badge?: string;
  color: string; textColor: string; icon?: string; imageUrl?: string; link?: string;
}

const FALLBACK: Banner[] = [
  { id:"f1", title:"Vitamins & Supplements", subtitle:"Strengthen Your Immunity",  badge:"Up to 35% off", color:"#0d9488", textColor:"#fff", icon:"💊", link:"/shop" },
  { id:"f2", title:"Personal Care",          subtitle:"Your Daily Beauty Essentials",badge:"Buy 2 Get 1",   color:"#e11d48", textColor:"#fff", icon:"✨", link:"/shop" },
  { id:"f3", title:"Sports Nutrition",        subtitle:"Fuel Your Performance",       badge:"New Arrivals",  color:"#2563eb", textColor:"#fff", icon:"🏋️", link:"/shop" },
];

export default function PromoBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    fetch("/api/banners?isActive=true")
      .then(r => r.json())
      .then(d => { setBanners(d.data || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const items = loaded && banners.length > 0 ? banners : FALLBACK;

  return (
    <section className="py-8 sm:py-10 bg-muted/30 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {items.map((banner) => (
            <a key={banner.id} href={banner.link || "/shop"}
              className="relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer group transition-transform hover:scale-[1.02] shadow-lg block min-h-[140px] sm:min-h-0"
              style={{ background: banner.color }}>
              {/* BG pattern overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
              <div className="relative z-10 flex flex-col gap-3 h-full">
                {banner.badge && (
                  <Badge variant="outline" className="self-start text-xs px-3 py-1 border border-white/30 bg-white/20 text-white">
                    {banner.badge}
                  </Badge>
                )}
                <div>
                  {banner.subtitle && <p className="text-sm opacity-80 text-white">{banner.subtitle}</p>}
                  <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">{banner.title}</h3>
                </div>
                <Button size="sm" className="self-start bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mt-auto text-xs font-semibold">
                  Shop Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              {banner.imageUrl
                ? <img src={banner.imageUrl} alt="" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" />
                : <div className="absolute right-4 bottom-4 text-4xl sm:text-5xl opacity-20 group-hover:opacity-30 transition-opacity select-none pointer-events-none">{banner.icon}</div>}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-white/10" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}