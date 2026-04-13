"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaLayerGroup, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaSearch, FaStar } from "react-icons/fa";

interface Category { id: string; name: string; isFeatured?: boolean; _count?: { medicines: number } }

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [newCat,     setNewCat]     = useState("");
  const [creating,   setCreating]   = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [editName,   setEditName]   = useState("");
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [search,     setSearch]     = useState("");

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/categories", { credentials: "include" });
      const data = await res.json();
      setCategories(data.data || []);
    } catch { toast.error("Failed to load categories"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCats(); }, []);

  const create = async () => {
    if (!newCat.trim()) { toast.error("Category name required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCat.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Category created");
      setNewCat(""); fetchCats();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setCreating(false); }
  };

  const update = async (id: string) => {
    if (!editName.trim()) { toast.error("Category name required"); return; }
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Category updated"); setEditId(null); fetchCats();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const toggleFeatured = async (cat: Category) => {
    try {
      await fetch(`/api/admin/categories/${cat.id}/featured`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      toast.success(cat.isFeatured ? "Removed from featured" : "Marked as featured");
      fetchCats();
    } catch { toast.error("Failed to toggle featured"); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? All attached medicines will lose this category.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Category deleted"); fetchCats();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setDeleting(null); }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaLayerGroup className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Manage Categories</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{ color: "#1B3A5C" }}>{categories.length}</p>
          <p className="text-xs font-semibold uppercase mt-1" style={{ color: "#8A6650" }}>Total</p>
        </div>
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{ color: "#2E7D32" }}>
            {categories.filter(c => (c._count?.medicines ?? 0) > 0).length}
          </p>
          <p className="text-xs font-semibold uppercase mt-1" style={{ color: "#8A6650" }}>Active</p>
        </div>
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{ color: "#C2703A" }}>
            {categories.filter(c => (c._count?.medicines ?? 0) === 0).length}
          </p>
          <p className="text-xs font-semibold uppercase mt-1" style={{ color: "#8A6650" }}>Empty</p>
        </div>
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{ color: "#C2703A" }}>
            {categories.filter(c => c.isFeatured).length} / 9
          </p>
          <p className="text-xs font-semibold uppercase mt-1" style={{ color: "#8A6650" }}>Featured Strip</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="medi-card p-6 h-fit">
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaPlus style={{ color: "#C2703A" }} /> Add Category
          </h2>
          <input value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && create()}
            placeholder="Category name (press Enter)"
            className="w-full border rounded-lg px-3 py-2.5 text-sm mb-3"
            style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
          <button onClick={create} disabled={creating || !newCat.trim()}
            className="medi-btn-accent w-full disabled:opacity-60">
            {creating ? "Creating…" : "Add Category"}
          </button>

          {/* Quick stats list */}
          {categories.length > 0 && (
            <div className="mt-6 border-t pt-4" style={{ borderColor: "#DDD0C4" }}>
              <p className="text-xs font-semibold uppercase mb-3" style={{ color: "#8A6650" }}>Top by Medicines</p>
              {[...categories]
                .sort((a, b) => (b._count?.medicines ?? 0) - (a._count?.medicines ?? 0))
                .slice(0, 5)
                .map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: "#EEE4D9" }}>
            <span className="truncate" style={{ color: "#5C4033" }}>
  {c.name}
</span>
                    <span className="font-bold" style={{ color: "#1B3A5C" }}>{c._count?.medicines ?? 0}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Categories list */}
        <div className="lg:col-span-2">
          {/* Search */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-3" style={{ color: "#8A6650", fontSize: 12 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full border rounded-xl pl-8 pr-4 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
          </div>

          {loading ? (
            <p className="text-center py-12" style={{ color: "#8A6650" }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 medi-card">
              <FaLayerGroup className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
              <p style={{ color: "#8A6650" }}>No categories found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.map((cat, i) => (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }} className="medi-card p-4 flex items-center gap-4">
                    {/* Color dot */}
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: `hsl(${(i * 47) % 360}, 55%, 45%)` }}>
                      {cat.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      {editId === cat.id ? (
                        <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") update(cat.id); if (e.key === "Escape") setEditId(null); }}
                          className="w-full border rounded-lg px-3 py-1.5 text-sm"
                          style={{ borderColor: "#C2703A", background: "#FFF", color: "#5C4033" }} />
                      ) : (
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{cat.name}</p>
                          <p className="text-xs" style={{ color: "#8A6650" }}>
                            {cat._count?.medicines ?? 0} medicine{(cat._count?.medicines ?? 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Featured toggle */}
                      <button onClick={() => toggleFeatured(cat)} title={cat.isFeatured ? "Remove from category strip" : "Show in category strip"}
                        className="p-2 rounded-lg transition-colors" style={{ background: cat.isFeatured ? "#FFF8E1" : "#F5EDE3", color: cat.isFeatured ? "#F59E0B" : "#8A6650" }}>
                        <FaStar className={cat.isFeatured ? "text-amber-400" : "text-muted-foreground/40"} />
                      </button>
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => update(cat.id)}
                            className="p-2 rounded-lg" style={{ background: "#E8F5E9", color: "#2E7D32" }}><FaSave /></button>
                          <button onClick={() => setEditId(null)}
                            className="p-2 rounded-lg" style={{ background: "#F5EDE3", color: "#8A6650" }}><FaTimes /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                            className="p-2 rounded-lg" style={{ background: "#E3F0FB", color: "#3A6EA5" }}><FaEdit /></button>
                          <button onClick={() => del(cat.id, cat.name)}
                            disabled={deleting === cat.id}
                            className="p-2 rounded-lg disabled:opacity-40"
                            style={{ background: "#FFEBEE", color: "#C62828" }}><FaTrash /></button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
