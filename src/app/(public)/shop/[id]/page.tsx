"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart, Heart, Star, ChevronLeft, Package, User,
  Truck, Shield, Plus, Minus, CheckCircle, Lock,
} from "lucide-react";

interface Category { id: string; name: string; }
interface Review {
  id: string; rating: number; comment?: string;
  user?: { name: string; image?: string }; createdAt: string;
}
interface Medicine {
  id: string; name: string; description: string; image: string; price: number;
  stock: number; manufacturer: string; expiryDate?: string; dosage?: string;
  category: Category; seller: { id: string; name: string; email: string };
  reviews?: Review[];
}

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [adding,   setAdding]   = useState(false);
  const [inCart,   setInCart]   = useState(false);
  const [tab, setTab] = useState<"description" | "details" | "reviews">("description");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json()).then(d => { if (d?.user) setIsLoggedIn(true); }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/medicines/${id}`)
      .then(r => r.json())
      .then(d => setMedicine(d.data || null))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Add to Cart (fixed endpoint: /api/cart/add) ────────────────────────────
  const handleAddToCart = async () => {
    if (!medicine) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: medicine.id, quantity: qty }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Add to cart failed");
      toast.success(`${qty}x ${medicine.name} added to cart!`);
      setInCart(true);
    } catch (e: any) {
      toast.error(e.message || "Please log in to add to cart");
    } finally { setAdding(false); }
  };

  const handleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Added to wishlist!");
    } catch (e: any) { toast.error(e.message || "Login required"); }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading product…</p>
      </div>
    </div>
  );

  if (!medicine) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background">
      <p className="text-6xl mb-4">💊</p>
      <h2 className="text-2xl font-black mb-2 text-primary">Product Not Found</h2>
      <a href="/shop" className="mt-4 px-6 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground">
        Back to Shop
      </a>
    </div>
  );

  const avgRating = medicine.reviews?.length
    ? medicine.reviews.reduce((s, r) => s + r.rating, 0) / medicine.reviews.length : 0;
  const outOfStock = medicine.stock === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
          <a href="/shop" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Shop
          </a>
          <span>/</span>
          <span className="text-primary font-medium">{medicine.name}</span>
        </div>

        {/* Main layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">

          {/* ── Image card ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border">
            <div className="h-80 md:h-96 flex items-center justify-center relative overflow-hidden">
              {medicine.image
                ? <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover" />
                : <span className="text-9xl">💊</span>}
              {medicine.stock > 0 && medicine.stock <= 10 && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold
                  bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  ⚠️ Only {medicine.stock} left!
                </div>
              )}
              {outOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-black px-6 py-3 rounded-xl text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Details ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <span className="text-xs font-semibold px-3 py-1 rounded-full inline-block w-fit mb-3
              bg-secondary text-muted-foreground">
              {medicine.category.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-2 text-primary">{medicine.name}</h1>
            <p className="text-sm mb-1 text-muted-foreground">by {medicine.manufacturer}</p>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRow rating={avgRating} />
                <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({medicine.reviews?.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-accent">${medicine.price.toFixed(2)}</span>
              <span className={`text-sm font-semibold ${medicine.stock > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"}`}>
                {medicine.stock > 0 ? `✓ In Stock (${medicine.stock})` : "✗ Out of Stock"}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            {!outOfStock && (
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                        <Minus className="w-4 h-4 text-foreground" />
                      </button>
                      <span className="w-12 text-center font-bold text-primary">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(medicine.stock, q + 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                        <Plus className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold
                        text-white transition-all disabled:opacity-70 hover:opacity-90
                        ${inCart ? "bg-emerald-600" : "bg-primary"}`}>
                      {inCart ? <CheckCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                      {adding ? "Adding…" : inCart ? "Added to Cart ✓" : "Add to Cart"}
                    </button>
                    <button onClick={handleWishlist}
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-border
                        hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Heart className="w-5 h-5 text-red-400" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toast.error("Please log in to add to cart")}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold
                        bg-muted text-muted-foreground cursor-not-allowed"
                      title="Login required">
                      <Lock className="w-5 h-5" /> Login to Add to Cart
                    </button>
                    <button
                      onClick={() => toast.error("Please log in to save to wishlist")}
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-border
                        text-muted-foreground cursor-not-allowed"
                      title="Login required">
                      <Lock className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Info chips */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 mb-5">
              {[
                { icon: <Truck className="w-4 h-4" />, label: "Free Delivery", sub: "On orders $50+" },
                { icon: <Shield className="w-4 h-4" />, label: "Authentic",     sub: "Verified seller" },
                { icon: <Package className="w-4 h-4" />, label: "Returns",      sub: "7-day policy"   },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-card border border-border">
                  <div className="flex justify-center mb-1 text-primary">{icon}</div>
                  <p className="text-xs font-bold text-primary">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Seller info */}
            <div className="rounded-xl p-3 flex items-center gap-3 bg-card border border-border">
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                bg-blue-100 dark:bg-blue-900/30">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary">{medicine.seller.name}</p>
                <p className="text-[11px] text-muted-foreground">{medicine.seller.email}</p>
              </div>
              <span className="ml-auto text-[10px] px-2 py-1 rounded-full font-bold
                bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                Verified Seller
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-card rounded-3xl overflow-hidden border border-border">
          <div className="flex border-b border-border overflow-x-auto">
            {(["description", "details", "reviews"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 sm:px-6 py-4 text-sm font-bold capitalize transition-colors whitespace-nowrap ${
                  tab === t
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {t === "reviews"
                  ? `Reviews (${medicine.reviews?.length || 0})`
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Description */}
            {tab === "description" && (
              <p className="leading-relaxed text-foreground">
                {medicine.description || "No description available for this product."}
              </p>
            )}

            {/* Details */}
            {tab === "details" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["Manufacturer", medicine.manufacturer],
                  ["Category",    medicine.category.name],
                  ["Sold by",     medicine.seller.name],
                  ["Stock",       `${medicine.stock} units`],
                  ...(medicine.dosage     ? [["Dosage", medicine.dosage]]                                     : []),
                  ...(medicine.expiryDate ? [["Expiry", new Date(medicine.expiryDate).toLocaleDateString()]]  : []),
                  ["Product ID",  medicine.id.slice(0, 12) + "…"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5 border-b border-border">
                    <span className="text-sm font-semibold text-muted-foreground">{k}</span>
                    <span className="text-sm font-bold text-primary">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {tab === "reviews" && (
              medicine.reviews?.length ? (
                <div className="space-y-4">
                  {/* Rating summary */}
                  <div className="flex items-center gap-6 mb-6 p-4 rounded-2xl bg-secondary">
                    <div className="text-center">
                      <p className="text-5xl font-black text-accent">{avgRating.toFixed(1)}</p>
                      <StarRow rating={avgRating} />
                      <p className="text-xs mt-1 text-muted-foreground">{medicine.reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map(s => {
                        const cnt = medicine.reviews!.filter(r => r.rating === s).length;
                        const pct = medicine.reviews!.length ? (cnt / medicine.reviews!.length) * 100 : 0;
                        return (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground w-2">{s}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 rounded-full bg-border">
                              <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-muted-foreground w-5 text-right">{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review cards */}
                  {medicine.reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-muted/40 border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center
                          font-bold text-sm bg-primary text-primary-foreground">
                          {r.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{r.user?.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto"><StarRow rating={r.rating} /></div>
                      </div>
                      {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
