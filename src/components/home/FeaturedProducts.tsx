"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Star, Heart, Pill, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Medicine {
  id: string; name: string; description: string; image?: string; price: number;
  stock: number; manufacturer: string;
  category: { id: string; name: string };
  seller: { id: string; name: string };
  reviews: { rating: number }[];
}

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function MedCard({ med, isLoggedIn }: { med: Medicine; isLoggedIn: boolean }) {
  const rating = avgRating(med.reviews);
  const outOfStock = med.stock === 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't navigate when clicking inside the link
    if (!isLoggedIn) { toast.error("Please log in to add to cart"); return; }
    try {
      const res = await fetch("/api/cart", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: med.id, quantity: 1 }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed");
      toast.success("Added to cart!");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Link
      href={`/shop/${med.id}`}
      className="bg-background border border-border rounded-2xl overflow-hidden group hover:shadow-lg
        transition-all hover:-translate-y-1 block"
    >
      {/* Image */}
      <div className="relative h-44 bg-muted/30 flex items-center justify-center overflow-hidden">
        {med.image
          ? <img src={med.image} alt={med.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          : <Pill className="w-16 h-16 text-muted-foreground/30" />}
        <div className="absolute top-2 left-2">
          <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px]">Featured</Badge>
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{med.category.name} · {med.seller.name}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1">{med.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{med.manufacturer}</p>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({med.reviews.length})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-600">${med.price.toFixed(2)}</span>
          {isLoggedIn ? (
            <Button size="sm" onClick={addToCart} disabled={outOfStock}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-7 px-3">
              <ShoppingCart className="w-3 h-3 mr-1" /> Add
            </Button>
          ) : (
            <button
              onClick={e => { e.preventDefault(); toast.error("Please log in to add to cart"); }}
              className="flex items-center gap-1 px-3 h-7 rounded-md text-xs font-medium border border-border text-muted-foreground cursor-not-allowed"
              title="Login required"
            >
              <Lock className="w-3 h-3" /> Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts() {
  const [medicines,   setMedicines]   = useState<Medicine[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);

  useEffect(() => {
    // Check session
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d?.user) setIsLoggedIn(true); })
      .catch(() => {});

    fetch("/api/medicines/featured")
      .then(r => r.json())
      .then(d => setMedicines(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && medicines.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 bg-muted/20 dark:bg-muted/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked by our pharmacists</p>
          </div>
          <a href="/shop" className="text-sm font-semibold text-emerald-600 hover:underline shrink-0">View all →</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_,i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <div className="h-44 bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            : medicines.map(m => <MedCard key={m.id} med={m} isLoggedIn={isLoggedIn} />)}
        </div>
      </div>
    </section>
  );
}