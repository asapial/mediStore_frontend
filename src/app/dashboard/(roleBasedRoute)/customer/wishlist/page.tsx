"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaTrash, FaShoppingCart, FaHeartBroken } from "react-icons/fa";

interface Medicine {
  id: string; name: string; price: number; image?: string; stock: number;
  manufacturer: string; seller?: { name: string }; category?: { name: string };
}
interface WishlistItem { id: string; addedAt: string; medicine: Medicine; }
interface WishlistData { id: string; items: WishlistItem[]; }

export default function CustomerWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [loading, setLoading]   = useState(true);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/wishlist", { credentials: "include" });
      const data = await res.json();
      setWishlist(data.data);
    } catch { toast.error("Failed to load wishlist"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const remove = async (medicineId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${medicineId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Removed from wishlist");
      fetch_();
    } catch { toast.error("Failed to remove"); }
  };

  const clear = async () => {
    if (!confirm("Clear entire wishlist?")) return;
    try {
      await fetch("/api/wishlist/clear", { method: "DELETE", credentials: "include" });
      toast.success("Wishlist cleared");
      fetch_();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C62828" }}>
            <FaHeart className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Wishlist</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>
              {wishlist?.items?.length ?? 0} saved item{wishlist?.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {(wishlist?.items?.length ?? 0) > 0 && (
          <button onClick={clear} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
            style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #C62828" }}>
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading wishlist…</p>
      ) : !wishlist?.items?.length ? (
        <div className="text-center py-20 medi-card">
          <FaHeartBroken className="mx-auto text-5xl mb-4 opacity-20" style={{ color: "#C62828" }} />
          <p className="text-lg font-semibold" style={{ color: "#8A6650" }}>Your wishlist is empty</p>
          <p className="text-sm mt-1" style={{ color: "#8A6650" }}>Browse medicines and click the heart icon to save them.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {wishlist.items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className="medi-card overflow-hidden group">
                <div className="relative h-36">
                  {item.medicine.image
                    ? <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: "#EEE4D9" }}>💊</div>
                  }
                  <button onClick={() => remove(item.medicine.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "#FFEBEE", color: "#C62828" }}>
                    <FaTrash style={{ fontSize: 12 }} />
                  </button>
                  <span className={item.medicine.stock > 0 ? "badge-instock" : "badge-lowstock"}
                    style={{ position: "absolute", top: 8, left: 8 }}>
                    {item.medicine.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-0.5 truncate" style={{ color: "#1B3A5C" }}>{item.medicine.name}</h3>
                  <p className="text-xs mb-1" style={{ color: "#8A6650" }}>{item.medicine.manufacturer}</p>
                  <p className="text-xs mb-3" style={{ color: "#8A6650" }}>By {item.medicine.seller?.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black" style={{ color: "#C2703A" }}>${item.medicine.price.toFixed(2)}</span>
                    {item.medicine.stock > 0 && (
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: "#1B3A5C", color: "#FFFFFF" }}>
                        <FaShoppingCart style={{ fontSize: 10 }} /> Add to Cart
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] mt-2" style={{ color: "#8A6650" }}>
                    Saved {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
