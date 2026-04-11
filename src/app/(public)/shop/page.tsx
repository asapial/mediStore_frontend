"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, ShoppingCart, Heart, Star, X, ChevronDown, Filter, Grid3X3, List,
} from "lucide-react";
import { toast } from "sonner";

interface Category { id: string; name: string; }
interface Medicine {
  id: string; name: string; description: string; image: string; price: number; stock: number;
  manufacturer: string; category: Category;
  seller: { id: string; name: string; email: string };
  reviews?: { rating: number }[];
  isFeatured?: boolean;
}

const avg = (reviews?: { rating: number }[]) =>
  reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

const addToCart = async (medicineId: string, name: string) => {
  try {
    const res = await fetch("/api/cart", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId, quantity: 1 }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed");
    toast.success(`${name} added to cart!`);
  } catch (e: any) { toast.error(e.message || "Login required to add to cart"); }
};

const addToWishlist = async (medicineId: string, name: string) => {
  try {
    const res = await fetch("/api/wishlist", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed");
    toast.success(`${name} added to wishlist!`);
  } catch (e: any) { toast.error(e.message || "Login required"); }
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [medicines,   setMedicines]   = useState<Medicine[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Initialize from URL params
  const [search,   setSearch]   = useState(searchParams.get("name") || "");
  const [catId,    setCatId]    = useState(searchParams.get("categoryId") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock,  setInStock]  = useState(false);
  const [featured, setFeatured] = useState(false);
  const [sortBy,   setSortBy]   = useState("newest");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json()).then(d => setCategories(d.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "/api/medicines?";
    if (search) url += `name=${encodeURIComponent(search)}&`;
    if (catId)  url += `categoryId=${catId}&`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        let list: Medicine[] = d.data?.medicines || d.data || [];
        if (inStock)   list = list.filter(m => m.stock > 0);
        if (featured)  list = list.filter(m => m.isFeatured);
        if (minPrice)  list = list.filter(m => m.price >= Number(minPrice));
        if (maxPrice)  list = list.filter(m => m.price <= Number(maxPrice));
        if (sortBy === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
        if (sortBy === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
        if (sortBy === "rating")     list = [...list].sort((a,b) => avg(b.reviews) - avg(a.reviews));
        setMedicines(list);
      })
      .finally(() => setLoading(false));
  }, [search, catId, inStock, featured, sortBy, minPrice, maxPrice]);

  const clearFilters = () => { setCatId(""); setMinPrice(""); setMaxPrice(""); setInStock(false); setFeatured(false); setSortBy("newest"); setSearch(""); };
  const activeFilters = [catId, minPrice, maxPrice, inStock, featured].filter(Boolean).length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#F5EDE3,#EEE4D9)" }}>
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg,#1B3A5C,#0F2740)" }} className="py-12 px-4 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Online Pharmacy</p>
        <h1 className="text-4xl font-black mb-3">Shop All Medicines</h1>
        <p className="text-white/70 text-sm mb-8">Trusted products · Verified sellers · Fast delivery</p>
        {/* Search bar */}
        <div className="max-w-xl mx-auto flex bg-white rounded-2xl overflow-hidden shadow-lg">
          <Search className="w-5 h-5 m-3.5 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search medicines, brands, categories…"
            className="flex-1 py-3 pr-4 text-sm text-gray-800 focus:outline-none bg-transparent" />
          {search && <button onClick={() => setSearch("")} className="pr-3 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="text-sm font-semibold" style={{ color: "#8A6650" }}>
            {loading ? "Loading…" : `${medicines.length} products found`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold relative"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }}>
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center" style={{ background: "#C2703A", color: "#FFF" }}>{activeFilters}</span>}
            </button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}>
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="flex border rounded-xl overflow-hidden" style={{ borderColor: "#DDD0C4" }}>
              <button onClick={() => setView("grid")} className="p-2" style={{ background: view === "grid" ? "#1B3A5C" : "#FFF", color: view === "grid" ? "#FFF" : "#8A6650" }}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className="p-2" style={{ background: view === "list" ? "#1B3A5C" : "#FFF", color: view === "list" ? "#FFF" : "#8A6650" }}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border p-5 mb-6" style={{ background: "#FFF", borderColor: "#DDD0C4" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm" style={{ color: "#1B3A5C" }}>Advanced Filters</h3>
                <button onClick={clearFilters} className="text-xs underline" style={{ color: "#C2703A" }}>Clear all</button>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#8A6650" }}>Category</label>
                  <select value={catId} onChange={e => setCatId(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4", color: "#5C4033" }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#8A6650" }}>Min Price ($)</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    placeholder="0" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4", color: "#5C4033" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#8A6650" }}>Max Price ($)</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    placeholder="9999" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4", color: "#5C4033" }} />
                </div>
                <div className="flex flex-col gap-3 justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5C4033" }}>
                    <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600" />
                    In Stock Only
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5C4033" }}>
                    <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
                      className="w-4 h-4 accent-amber-500" />
                    ⭐ Featured Only
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products grid */}
        {loading ? (
          <div className={`grid gap-5 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white animate-pulse" style={{ height: view === "grid" ? 320 : 130 }} />
            ))}
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: "#FFF" }}>
            <p className="text-5xl mb-4">💊</p>
            <p className="font-bold text-lg" style={{ color: "#1B3A5C" }}>No medicines found</p>
            <p className="text-sm mt-1" style={{ color: "#8A6650" }}>Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: "#1B3A5C", color: "#FFF" }}>Clear Filters</button>
          </div>
        ) : (
          <div className={`grid gap-5 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
            <AnimatePresence>
              {medicines.map((med, i) => {
                const rating = avg(med.reviews);
                const outOfStock = med.stock === 0;
                return view === "grid" ? (
                  <motion.div key={med.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all hover:-translate-y-1"
                    style={{ borderColor: "#EEE4D9" }}>
                    {/* Image */}
                    <a href={`/shop/${med.id}`} className="block relative h-48 bg-gray-50 overflow-hidden">
                      <img src={med.image || "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"} alt={med.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {outOfStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span></div>}
                      {med.isFeatured && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white">⭐ Featured</span>}
                      <button onClick={() => addToWishlist(med.id, med.name)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                        <Heart className="w-4 h-4 text-red-400" />
                      </button>
                    </a>
                    <div className="p-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F5EDE3", color: "#8A6650" }}>{med.category.name}</span>
                      <a href={`/shop/${med.id}`}>
                        <h3 className="font-bold text-sm mt-2 line-clamp-2 leading-snug hover:text-emerald-600 transition-colors" style={{ color: "#1B3A5C" }}>{med.name}</h3>
                      </a>
                      {rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold" style={{ color: "#8A6650" }}>{rating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-black text-base" style={{ color: "#C2703A" }}>${med.price.toFixed(2)}</span>
                        <span className="text-xs" style={{ color: med.stock > 0 ? "#2E7D32" : "#C62828" }}>
                          {med.stock > 0 ? `${med.stock} left` : "Sold out"}
                        </span>
                      </div>
                      <button onClick={() => addToCart(med.id, med.name)} disabled={outOfStock}
                        className="w-full mt-3 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ background: outOfStock ? "#EEE4D9" : "#1B3A5C", color: outOfStock ? "#8A6650" : "#FFF" }}>
                        <ShoppingCart className="w-4 h-4" />
                        {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={med.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex gap-4 bg-white rounded-2xl border p-4 hover:shadow-lg transition-all"
                    style={{ borderColor: "#EEE4D9" }}>
                    <a href={`/shop/${med.id}`} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={med.image || "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"} alt={med.name} className="w-full h-full object-cover" />
                    </a>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F5EDE3", color: "#8A6650" }}>{med.category.name}</span>
                          <a href={`/shop/${med.id}`}><h3 className="font-bold mt-1 line-clamp-1 hover:text-emerald-600 transition-colors" style={{ color: "#1B3A5C" }}>{med.name}</h3></a>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#8A6650" }}>{med.description}</p>
                        </div>
                        <span className="font-black text-lg flex-shrink-0" style={{ color: "#C2703A" }}>${med.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => addToCart(med.id, med.name)} disabled={outOfStock}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold disabled:opacity-50"
                          style={{ background: "#1B3A5C", color: "#FFF" }}>
                          <ShoppingCart className="w-3.5 h-3.5" />Add to Cart
                        </button>
                        <button onClick={() => addToWishlist(med.id, med.name)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold border"
                          style={{ borderColor: "#DDD0C4", color: "#8A6650" }}>
                          <Heart className="w-3.5 h-3.5" />Wishlist
                        </button>
                        <a href={`/shop/${med.id}`} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold border ml-auto"
                          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}>View Details</a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
