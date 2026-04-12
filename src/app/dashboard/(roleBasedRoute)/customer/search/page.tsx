"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaExchangeAlt, FaShoppingCart } from "react-icons/fa";
import Link from "next/link";

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  manufacturer: string;
  price: number;
  stock: number;
  image?: string;
  category?: { name: string };
  seller?: { name: string };
}

export default function AdvancedSearchPage() {
  const [results,      setResults]      = useState<Medicine[]>([]);
  const [alternatives, setAlternatives] = useState<{ source: any; alternatives: Medicine[] } | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [altLoading,   setAltLoading]   = useState(false);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  // Form state
  const [name,         setName]         = useState("");
  const [genericName,  setGenericName]  = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [minPrice,     setMinPrice]     = useState("");
  const [maxPrice,     setMaxPrice]     = useState("");
  const [inStock,      setInStock]      = useState(false);
  const [sortBy,       setSortBy]       = useState("newest");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlternatives(null);
    try {
      const params = new URLSearchParams();
      if (name)         params.set("name",         name);
      if (genericName)  params.set("genericName",  genericName);
      if (manufacturer) params.set("manufacturer", manufacturer);
      if (minPrice)     params.set("minPrice",     minPrice);
      if (maxPrice)     params.set("maxPrice",     maxPrice);
      if (inStock)      params.set("inStock",      "true");
      if (sortBy)       params.set("sortBy",       sortBy);

      const res  = await fetch(`/api/search?${params}`, { credentials: "include" });
      const data = await res.json();
      setResults(data.data || []);
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  const loadAlternatives = async (id: string) => {
    setAltLoading(true);
    setSelectedId(id);
    try {
      const res  = await fetch(`/api/search/alternatives/${id}`, { credentials: "include" });
      const data = await res.json();
      setAlternatives(data.data);
    } catch { toast.error("Failed to load alternatives"); }
    finally { setAltLoading(false); }
  };

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaSearch className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Advanced Search</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Search medicines & discover generic alternatives</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="medi-card p-6 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Medicine Name",  value: name,         set: setName },
            { label: "Generic Name",   value: genericName,  set: setGenericName },
            { label: "Manufacturer",   value: manufacturer, set: setManufacturer },
            { label: "Min Price ($)",  value: minPrice,     set: setMinPrice, type: "number" },
            { label: "Max Price ($)",  value: maxPrice,     set: setMaxPrice, type: "number" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>{f.label}</label>
              <input
                type={f.type || "text"}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5C4033" }}>
            <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}
              className="accent-[#2E7D32]" />
            In Stock Only
          </label>
          <button type="submit" className="medi-btn-primary flex items-center gap-2">
            <FaSearch /> {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>
            {results.length} Result{results.length !== 1 ? "s" : ""}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {results.map((med, i) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="medi-card overflow-hidden"
                >
                  <div className="h-36 bg-gray-100 relative">
                    {med.image ? (
                      <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: "#8A6650" }}>No Image</div>
                    )}
                    <span className={med.stock > 0 ? "badge-instock" : "badge-lowstock"} style={{ position: "absolute", top: 8, left: 8 }}>
                      {med.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: "#1B3A5C" }}>{med.name}</h3>
                    {med.genericName && <p className="text-xs mb-1" style={{ color: "#8A6650" }}>Generic: {med.genericName}</p>}
                    <p className="text-xs mb-2" style={{ color: "#8A6650" }}>{med.manufacturer}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold" style={{ color: "#C2703A" }}>${med.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        {med.genericName && (
                          <button
                            onClick={() => loadAlternatives(med.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: "#E3F0FB", color: "#3A6EA5", border: "1px solid #3A6EA5" }}
                          >
                            <FaExchangeAlt /> Alternatives
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Alternatives Panel */}
      {alternatives && (
        <div className="medi-card p-6">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaExchangeAlt style={{ color: "#3A6EA5" }} />
            Generic Alternatives for <em className="font-extrabold not-italic">{alternatives.source?.name}</em>
          </h2>
          <p className="text-sm mb-4" style={{ color: "#8A6650" }}>Generic: {alternatives.source?.genericName}</p>
          {altLoading ? (
            <p style={{ color: "#8A6650" }}>Loading alternatives…</p>
          ) : alternatives.alternatives.length === 0 ? (
            <p style={{ color: "#8A6650" }}>No alternatives found for this generic.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {alternatives.alternatives.map((alt, i) => (
                <motion.div
                  key={alt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-4 border"
                  style={{ borderColor: "#DDD0C4", background: "#F5EDE3" }}
                >
                  <h4 className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{alt.name}</h4>
                  <p className="text-xs" style={{ color: "#8A6650" }}>{alt.manufacturer}</p>
                  <p className="text-xs mt-1" style={{ color: "#8A6650" }}>By {alt.seller?.name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold" style={{ color: "#C2703A" }}>${alt.price.toFixed(2)}</span>
                    <span className={alt.stock > 0 ? "badge-instock" : "badge-lowstock"}>{alt.stock > 0 ? "In Stock" : "Out"}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
