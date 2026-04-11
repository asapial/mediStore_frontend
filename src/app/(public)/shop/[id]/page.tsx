"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart, Heart, Star, ChevronLeft, Package, User, Tag, Truck,
  Shield, ArrowRight, Plus, Minus, CheckCircle, AlertCircle,
} from "lucide-react";

interface Category { id: string; name: string; }
interface Review { id: string; rating: number; comment?: string; user?: { name: string; image?: string }; createdAt: string; }
interface Medicine {
  id: string; name: string; description: string; image: string; price: number;
  stock: number; manufacturer: string; expiryDate?: string; dosage?: string;
  category: Category; seller: { id: string; name: string; email: string };
  reviews?: Review[];
}

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
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
  const [tab,      setTab]      = useState<"description" | "details" | "reviews">("description");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/medicines/${id}`)
      .then(r => r.json())
      .then(d => setMedicine(d.data || null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!medicine) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST", credentials: "include",
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
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Added to wishlist!");
    } catch (e: any) { toast.error(e.message || "Login required"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5EDE3" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "#1B3A5C", borderTopColor: "transparent" }} />
        <p style={{ color: "#8A6650" }}>Loading product…</p>
      </div>
    </div>
  );

  if (!medicine) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: "#F5EDE3" }}>
      <p className="text-6xl mb-4">💊</p>
      <h2 className="text-2xl font-black mb-2" style={{ color: "#1B3A5C" }}>Product Not Found</h2>
      <a href="/shop" className="mt-4 px-6 py-2.5 rounded-xl font-bold text-white" style={{ background: "#1B3A5C" }}>Back to Shop</a>
    </div>
  );

  const avgRating = medicine.reviews?.length
    ? medicine.reviews.reduce((s, r) => s + r.rating, 0) / medicine.reviews.length : 0;
  const outOfStock = medicine.stock === 0;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#F5EDE3,#EEE4D9)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "#8A6650" }}>
          <a href="/shop" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Shop
          </a>
          <span>/</span>
          <span style={{ color: "#1B3A5C" }}>{medicine.name}</span>
        </div>

        {/* Main product layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg" style={{ border: "1px solid #DDD0C4" }}>
            <div className="h-80 md:h-96 flex items-center justify-center relative overflow-hidden">
              {medicine.image
                ? <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover" />
                : <span className="text-9xl">💊</span>}
              {medicine.stock > 0 && medicine.stock <= 10 && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#FFF3E0", color: "#C2703A" }}>
                  ⚠️ Only {medicine.stock} left!
                </div>
              )}
              {outOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-black px-6 py-3 rounded-xl text-lg">Out of Stock</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            {/* Category + name */}
            <span className="text-xs font-semibold px-3 py-1 rounded-full inline-block w-fit mb-3" style={{ background: "#F5EDE3", color: "#8A6650" }}>
              {medicine.category.name}
            </span>
            <h1 className="text-3xl font-black leading-tight mb-2" style={{ color: "#1B3A5C" }}>{medicine.name}</h1>
            <p className="text-sm mb-1" style={{ color: "#8A6650" }}>by {medicine.manufacturer}</p>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRow rating={avgRating} />
                <span className="text-sm font-semibold" style={{ color: "#5C4033" }}>{avgRating.toFixed(1)}</span>
                <span className="text-xs" style={{ color: "#8A6650" }}>({medicine.reviews?.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black" style={{ color: "#C2703A" }}>${medicine.price.toFixed(2)}</span>
              <span className="text-sm" style={{ color: medicine.stock > 0 ? "#2E7D32" : "#C62828" }}>
                {medicine.stock > 0 ? `✓ In Stock (${medicine.stock})` : "✗ Out of Stock"}
              </span>
            </div>

            {/* Quantity + Add to cart */}
            {!outOfStock && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: "#DDD0C4" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Minus className="w-4 h-4" style={{ color: "#5C4033" }} />
                  </button>
                  <span className="w-12 text-center font-bold" style={{ color: "#1B3A5C" }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(medicine.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" style={{ color: "#5C4033" }} />
                  </button>
                </div>
                <button onClick={handleAddToCart} disabled={adding}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white transition-all disabled:opacity-70 hover:opacity-90"
                  style={{ background: inCart ? "#2E7D32" : "#1B3A5C" }}>
                  {inCart ? <CheckCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {adding ? "Adding…" : inCart ? "Added to Cart ✓" : "Add to Cart"}
                </button>
                <button onClick={handleWishlist}
                  className="w-12 h-12 rounded-xl flex items-center justify-center border hover:bg-red-50 transition-colors"
                  style={{ borderColor: "#DDD0C4" }}>
                  <Heart className="w-5 h-5 text-red-400" />
                </button>
              </div>
            )}

            {/* Info chips */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: <Truck className="w-4 h-4" />, label: "Free Delivery", sub: "On orders $50+" },
                { icon: <Shield className="w-4 h-4" />, label: "Authentic", sub: "Verified seller" },
                { icon: <Package className="w-4 h-4" />, label: "Returns", sub: "7-day policy" },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl" style={{ background: "#FFF", border: "1px solid #EEE4D9" }}>
                  <div className="flex justify-center mb-1" style={{ color: "#1B3A5C" }}>{icon}</div>
                  <p className="text-xs font-bold" style={{ color: "#1B3A5C" }}>{label}</p>
                  <p className="text-[10px]" style={{ color: "#8A6650" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Seller info */}
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#FFF", border: "1px solid #EEE4D9" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E3F0FB" }}>
                <User className="w-5 h-5" style={{ color: "#3A6EA5" }} />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: "#1B3A5C" }}>{medicine.seller.name}</p>
                <p className="text-[11px]" style={{ color: "#8A6650" }}>{medicine.seller.email}</p>
              </div>
              <span className="ml-auto text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Verified Seller</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ border: "1px solid #DDD0C4" }}>
          <div className="flex border-b" style={{ borderColor: "#EEE4D9" }}>
            {(["description", "details", "reviews"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-6 py-4 text-sm font-bold capitalize transition-colors"
                style={tab === t
                  ? { color: "#1B3A5C", borderBottom: "2px solid #1B3A5C" }
                  : { color: "#8A6650" }}>
                {t === "reviews" ? `Reviews (${medicine.reviews?.length || 0})` : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "description" && (
              <p className="leading-relaxed" style={{ color: "#5C4033" }}>{medicine.description || "No description available for this product."}</p>
            )}
            {tab === "details" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["Manufacturer", medicine.manufacturer],
                  ["Category", medicine.category.name],
                  ["Sold by", medicine.seller.name],
                  ["Stock", `${medicine.stock} units`],
                  ...(medicine.dosage ? [["Dosage", medicine.dosage]] : []),
                  ...(medicine.expiryDate ? [["Expiry", new Date(medicine.expiryDate).toLocaleDateString()]] : []),
                  ["Product ID", medicine.id.slice(0, 12) + "…"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: "#EEE4D9" }}>
                    <span className="text-sm font-semibold" style={{ color: "#8A6650" }}>{k}</span>
                    <span className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "reviews" && (
              medicine.reviews?.length ? (
                <div className="space-y-4">
                  {/* Rating summary */}
                  <div className="flex items-center gap-6 mb-6 p-4 rounded-2xl" style={{ background: "#F5EDE3" }}>
                    <div className="text-center">
                      <p className="text-5xl font-black" style={{ color: "#C2703A" }}>{avgRating.toFixed(1)}</p>
                      <StarRow rating={avgRating} />
                      <p className="text-xs mt-1" style={{ color: "#8A6650" }}>{medicine.reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map(s => {
                        const cnt = medicine.reviews!.filter(r => r.rating === s).length;
                        const pct = medicine.reviews!.length ? (cnt / medicine.reviews!.length) * 100 : 0;
                        return (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span style={{ color: "#8A6650", minWidth: 8 }}>{s}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 rounded-full" style={{ background: "#DDD0C4" }}>
                              <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ color: "#8A6650", minWidth: 20 }}>{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {medicine.reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl" style={{ background: "#F9F5F1", border: "1px solid #EEE4D9" }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#1B3A5C", color: "#FFF" }}>
                          {r.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{r.user?.name || "Anonymous"}</p>
                          <p className="text-xs" style={{ color: "#8A6650" }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-auto"><StarRow rating={r.rating} /></div>
                      </div>
                      {r.comment && <p className="text-sm" style={{ color: "#5C4033" }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p style={{ color: "#8A6650" }}>No reviews yet. Be the first to review!</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
