"use client";

import { useEffect, useState } from "react";

interface Feature { id: string; title: string; description: string; icon: string; }

const FALLBACK: Feature[] = [
  { id:"f1", title:"Free Shipping",      description:"On all orders over $30",    icon:"🚚" },
  { id:"f2", title:"Licensed Pharmacy",  description:"Verified & certified store", icon:"🏥" },
  { id:"f3", title:"24/7 Support",       description:"Dedicated health advisors",  icon:"💬" },
  { id:"f4", title:"Secure Payments",    description:"100% encrypted transactions",icon:"🔒" },
];

export default function FeaturesStrip() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    fetch("/api/platform-features?isActive=true")
      .then(r => r.json())
      .then(d => { setFeatures(d.data || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const items = loaded && features.length > 0 ? features : FALLBACK;

  return (
    <section className="py-6 sm:py-8 border-y border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((f) => (
            <div key={f.id} className="flex items-start gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}