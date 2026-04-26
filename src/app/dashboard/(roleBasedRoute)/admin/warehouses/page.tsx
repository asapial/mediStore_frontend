"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWarehouse, FaPlus, FaSpinner, FaMapMarkerAlt,
  FaUserCog, FaCheck, FaTimes, FaSearch, FaUser,
  FaMap, FaThLarge, FaTrash, FaBell, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Leaflet must be loaded only on the client — no SSR
const WarehouseMap = dynamic(() => import("@/components/WarehouseMap"), { ssr: false });

type Warehouse = {
  id: string; name: string; address: string; city: string;
  lat: number; lng: number; phone?: string; isActive: boolean;
  manager: { id: string; name: string; email: string };
  _count?: { locationStocks: number; fulfillmentTasks: number };
};

type LocationRequest = {
  id: string; status: "PENDING" | "APPROVED" | "REJECTED";
  address?: string; city?: string; lat?: number; lng?: number; phone?: string;
  note?: string; adminNote?: string; createdAt: string;
  warehouse: { id: string; name: string; city: string };
  requestedBy: { id: string; name: string; email: string };
  reviewedBy?: { name: string };
};

type UserSuggestion = {
  id: string; name: string; email: string; image?: string | null; role: string;
};

// ── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

// ── Manager email autocomplete ────────────────────────────────────────────────
function ManagerSearch({
  onSelect,
  selectedUser,
  onClear,
}: {
  onSelect: (u: UserSuggestion) => void;
  selectedUser: UserSuggestion | null;
  onClear: () => void;
}) {
  const [query,       setQuery]       = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [open,        setOpen]        = useState(false);
  const [searching,   setSearching]   = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(query, 280);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (debounced.length < 2) { setSuggestions([]); setOpen(false); return; }
    setSearching(true);
    fetch(`/api/admin/users/search?email=${encodeURIComponent(debounced)}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setSuggestions(d.data || []); setOpen(true); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [debounced]);

  const pick = (u: UserSuggestion) => {
    onSelect(u);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "#7C3AED", SELLER: "#C2703A", WAREHOUSE: "#0EA5E9", CUSTOMER: "#2E7D32",
  };

  if (selectedUser) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border"
        style={{ borderColor: "#0EA5E9", background: "#F0F9FF" }}>
        {selectedUser.image
          ? <img src={selectedUser.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          : <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: "#0EA5E9" }}>
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "#1B3A5C" }}>{selectedUser.name}</p>
          <p className="text-xs truncate" style={{ color: "#8A6650" }}>{selectedUser.email}</p>
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
          style={{ background: (ROLE_COLORS[selectedUser.role] || "#888") + "20", color: ROLE_COLORS[selectedUser.role] || "#888" }}>
          {selectedUser.role}
        </span>
        <button type="button" onClick={onClear}
          className="text-gray-400 hover:text-red-500 transition-colors ml-1 flex-shrink-0">
          <FaTimes size={12} />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <FaSearch className="absolute left-3 top-2.5" style={{ color: "#8A6650", fontSize: 12 }} />
        {searching
          ? <FaSpinner className="absolute right-3 top-2.5 animate-spin" style={{ color: "#0EA5E9", fontSize: 12 }} />
          : null}
        <input
          type="text"
          placeholder="Search manager by email…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="w-full border rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E940]"
          style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }}
          required
        />
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
            style={{ border: "1px solid #DDD0C4", background: "#FFF" }}>
            {suggestions.map(u => (
              <button key={u.id} type="button" onClick={() => pick(u)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F0F9FF] transition-colors">
                {u.image
                  ? <img src={u.image} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                      style={{ background: "#0EA5E9" }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1B3A5C" }}>{u.name}</p>
                  <p className="text-xs truncate" style={{ color: "#8A6650" }}>{u.email}</p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: (ROLE_COLORS[u.role] || "#888") + "20", color: ROLE_COLORS[u.role] || "#888" }}>
                  {u.role}
                </span>
              </button>
            ))}
          </motion.div>
        )}
        {open && suggestions.length === 0 && query.length >= 2 && !searching && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 rounded-xl px-4 py-3 text-xs shadow-xl"
            style={{ border: "1px solid #DDD0C4", background: "#FFF", color: "#8A6650" }}>
            <FaUser className="inline mr-2" /> No users found for &quot;{query}&quot;
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminWarehousesPage() {
  const [warehouses,    setWarehouses]    = useState<Warehouse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [selectedManager, setSelectedManager] = useState<UserSuggestion | null>(null);
  const [view, setView] = useState<"map" | "list" | "requests">("map");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [locationRequests, setLocationRequests] = useState<LocationRequest[]>([]);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "", address: "", city: "", lat: "", lng: "",
    phone: "", country: "Bangladesh",
  });

  const load = () => {
    setLoading(true);
    fetch("/api/warehouses", { credentials: "include" })
      .then(r => r.json()).then(d => setWarehouses(d.data || []))
      .finally(() => setLoading(false));
  };

  const loadRequests = useCallback(() => {
    fetch("/api/warehouses/location-requests/all", { credentials: "include" })
      .then(r => r.json())
      .then(d => setLocationRequests(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); loadRequests(); }, [loadRequests]);

  const reviewRequest = async (reqId: string, action: "APPROVED" | "REJECTED") => {
    setReviewing(reqId);
    try {
      const res = await fetch(`/api/warehouses/location-requests/${reqId}/review`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: rejectNote[reqId] || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success(action === "APPROVED" ? "✅ Location approved & applied!" : "❌ Request rejected");
      loadRequests();
      if (action === "APPROVED") load(); // refresh warehouse list with new location
    } catch (e: any) { toast.error(e.message); }
    finally { setReviewing(null); }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) { toast.error("Please select a manager"); return; }
    setSubmitting(true);
    const res = await fetch("/api/warehouses", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        managerId: selectedManager.id,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      }),
    });
    const d = await res.json();
    if (res.ok) {
      toast.success("Warehouse created!");
      setShowForm(false);
      setSelectedManager(null);
      setForm({ name: "", address: "", city: "", lat: "", lng: "", phone: "", country: "Bangladesh" });
      load();
    } else {
      toast.error(d.message);
    }
    setSubmitting(false);
  };

  const toggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/warehouses/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const d = await res.json();
    if (res.ok) { toast.success(d.message); load(); } else toast.error(d.message);
  };

  const removeWarehouse = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/warehouses/${id}`, {
        method: "DELETE", credentials: "include",
      });
      const d = await res.json();
      if (res.ok) {
        toast.success("Warehouse removed & manager role reverted to Customer");
        setWarehouses(prev => prev.filter(w => w.id !== id));
      } else {
        toast.error(d.message || "Failed to delete warehouse");
      }
    } finally {
      setDeleting(null);
    }
  };

  // Fields without managerId (handled separately)
  const FIELDS: { key: keyof typeof form; label: string; placeholder: string; type?: string; required?: boolean }[] = [
    { key: "name",    label: "Warehouse Name", placeholder: "Central Warehouse",   required: true },
    { key: "city",    label: "City",           placeholder: "Dhaka",               required: true },
    { key: "address", label: "Address",        placeholder: "123 Industrial Area", required: true },
    { key: "lat",     label: "Latitude",       placeholder: "23.8103", type: "number", required: true },
    { key: "lng",     label: "Longitude",      placeholder: "90.4125", type: "number", required: true },
    { key: "phone",   label: "Phone",          placeholder: "+880..." },
    { key: "country", label: "Country",        placeholder: "Bangladesh" },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
            <FaWarehouse className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Warehouse Network</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Manage all warehouse locations</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="medi-btn-primary flex items-center gap-2">
          <FaPlus /> Add Warehouse
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit}
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="medi-card p-6 mb-8">
            <h2 className="font-bold text-lg mb-5" style={{ color: "#1B3A5C" }}>New Warehouse</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Standard fields */}
              {FIELDS.map(({ key, label, placeholder, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>{label}</label>
                  <input
                    type={type || "text"} required={required} placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E940]"
                    style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }}
                  />
                </div>
              ))}

              {/* Manager email search — spans 2 cols on large screens */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>
                  Manager <span className="text-red-500">*</span>
                </label>
                <ManagerSearch
                  selectedUser={selectedManager}
                  onSelect={setSelectedManager}
                  onClear={() => setSelectedManager(null)}
                />
                {!selectedManager && (
                  <p className="text-[10px] mt-1" style={{ color: "#8A6650" }}>
                    Type at least 2 characters to search by email
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting || !selectedManager} className="medi-btn-accent flex items-center gap-2 disabled:opacity-60">
                {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} Create Warehouse
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSelectedManager(null); }}
                className="medi-btn-secondary flex items-center gap-2">
                <FaTimes /> Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: "Total",    value: warehouses.length,                       color: "#0EA5E9" },
          { label: "Active",   value: warehouses.filter(w => w.isActive).length,  color: "#10B981" },
          { label: "Inactive", value: warehouses.filter(w => !w.isActive).length, color: "#EF4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: "#8A6650" }}>{label} Warehouses</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold" style={{ color: "#8A6650" }}>
          {warehouses.length} warehouse{warehouses.length !== 1 ? "s" : ""} in network
        </p>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F5EDE3" }}>
          {(["map", "list", "requests"] as const).map(v => {
            const pendingCount = locationRequests.filter(r => r.status === "PENDING").length;
            return (
              <button key={v} onClick={() => setView(v)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative"
                style={view === v ? { background: "#0EA5E9", color: "#FFF" } : { color: "#5C4033" }}>
                {v === "map" ? <FaMap /> : v === "list" ? <FaThLarge /> : <FaBell />}
                {v === "map" ? "Map View" : v === "list" ? "List View" : "Location Requests"}
                {v === "requests" && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background: "#EF4444", color: "#FFF" }}>{pendingCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map — always render so Bangladesh default view shows */}
      {!loading && view === "map" && (
        <motion.div
          key="map"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="relative mb-6 rounded-2xl overflow-hidden shadow-lg"
          style={{ height: 480, border: "1px solid #DDD0C4" }}
        >
          <WarehouseMap warehouses={warehouses} />
          {warehouses.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
              style={{ background: "rgba(255,255,255,0.92)", border: "1px solid #DDD0C4" }}>
              <FaMap style={{ color: "#0EA5E9", fontSize: 13 }} />
              <span className="text-xs font-semibold" style={{ color: "#5C4033" }}>
                No warehouses yet — map centred on Bangladesh
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* List — loading spinner */}
      {view === "list" && loading && (
        <div className="flex justify-center py-20">
          <FaSpinner className="text-4xl animate-spin" style={{ color: "#0EA5E9" }} />
        </div>
      )}

      {/* List — warehouse cards */}
      {view === "list" && !loading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {warehouses.map(w => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }} className="medi-card p-5 flex flex-col gap-3">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: w.isActive ? "#0EA5E922" : "#EF444422" }}>
                    <FaWarehouse style={{ color: w.isActive ? "#0EA5E9" : "#EF4444", fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{w.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "#8A6650" }}>
                      <FaMapMarkerAlt style={{ fontSize: 10 }} /> {w.city}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{
                    background: w.isActive ? "#10B98122" : "#EF444422",
                    color: w.isActive ? "#10B981" : "#EF4444",
                  }}>
                  {w.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <p className="text-xs" style={{ color: "#8A6650" }}>{w.address}</p>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#5C4033" }}>
                <FaUserCog style={{ color: "#7C3AED", fontSize: 12 }} />
                <span>{w.manager.name}</span>
                <span style={{ color: "#DDD0C4" }}>·</span>
                <span style={{ color: "#8A6650" }}>{w.manager.email}</span>
              </div>

              {w._count && (
                <div className="flex gap-3">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#0EA5E918", color: "#0EA5E9" }}>
                    {w._count.locationStocks} SKUs
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#D9770618", color: "#D97706" }}>
                    {w._count.fulfillmentTasks} tasks
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg font-mono" style={{ background: "#F5EDE3", color: "#8A6650" }}>
                    {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button onClick={() => toggle(w.id, w.isActive)}
                  className="flex-1 text-xs font-bold py-2 rounded-xl transition-all"
                  style={{
                    background: w.isActive ? "#EF444415" : "#10B98115",
                    color: w.isActive ? "#EF4444" : "#10B981",
                    border: `1px solid ${w.isActive ? "#EF444430" : "#10B98130"}`,
                  }}>
                  {w.isActive ? "Deactivate" : "Activate"}
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={deleting === w.id}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
                      style={{ background: "#EF444410", color: "#EF4444", border: "1px solid #EF444430" }}>
                      {deleting === w.id
                        ? <FaSpinner className="animate-spin" style={{ fontSize: 11 }} />
                        : <FaTrash style={{ fontSize: 11 }} />
                      }
                      Remove
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Warehouse?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete <strong>{w.name}</strong> and revert
                        the manager&apos;s role from <strong>WAREHOUSE → CUSTOMER</strong>.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeWarehouse(w.id)}
                        className="bg-red-500 hover:bg-red-600 text-white">
                        Yes, Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
          {!warehouses.length && (
            <p className="col-span-3 text-center py-20" style={{ color: "#8A6650" }}>
              No warehouses created yet. Add your first one above.
            </p>
          )}
        </div>
      )}

      {/* ── Location Requests Panel ───────────────────────────────────────── */}
      {view === "requests" && (
        <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Pending",  value: locationRequests.filter(r => r.status === "PENDING").length,  color: "#C2703A" },
              { label: "Approved", value: locationRequests.filter(r => r.status === "APPROVED").length, color: "#2E7D32" },
              { label: "Rejected", value: locationRequests.filter(r => r.status === "REJECTED").length, color: "#C62828" },
            ].map(s => (
              <div key={s.label} className="medi-card p-4 text-center">
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {locationRequests.length === 0 ? (
            <div className="medi-card text-center py-16">
              <FaBell className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
              <p style={{ color: "#8A6650" }}>No location change requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {locationRequests.map((req, i) => {
                const isPending  = req.status === "PENDING";
                const isApproved = req.status === "APPROVED";
                const statusStyle = isPending
                  ? { bg: "#FFF8E1", color: "#C2703A", label: "⏳ PENDING" }
                  : isApproved
                    ? { bg: "#E8F5E9", color: "#2E7D32", label: "✅ APPROVED" }
                    : { bg: "#FFEBEE", color: "#C62828", label: "❌ REJECTED" };

                const changes: { label: string; value: string }[] = [];
                if (req.address) changes.push({ label: "Address", value: req.address });
                if (req.city)    changes.push({ label: "City",    value: req.city });
                if (req.lat)     changes.push({ label: "GPS",     value: `${req.lat}, ${req.lng}` });
                if (req.phone)   changes.push({ label: "Phone",   value: req.phone });

                return (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                    {/* Card header */}
                    <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3"
                      style={{ background: statusStyle.bg, borderBottom: "1px solid #EEE4D9" }}>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <FaWarehouse style={{ color: "#0EA5E9", fontSize: 13 }} />
                          <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                            {req.warehouse.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: statusStyle.color + "20", color: statusStyle.color }}>
                            {statusStyle.label}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "#8A6650" }}>
                          {req.warehouse.city} · Requested by <strong>{req.requestedBy.name}</strong> ({req.requestedBy.email})
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                          {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Proposed changes */}
                    <div className="px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8A6650" }}>
                        Proposed Changes
                      </p>
                      {changes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {changes.map(c => (
                            <div key={c.label} className="rounded-xl p-3" style={{ background: "#F9F6F2", border: "1px solid #EEE4D9" }}>
                              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8A6650" }}>{c.label}</p>
                              <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{c.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs italic mb-3" style={{ color: "#8A6650" }}>No field changes — note only</p>
                      )}

                      {req.note && (
                        <div className="px-4 py-2 rounded-xl text-xs mb-3" style={{ background: "#EEE4D9", color: "#5C4033" }}>
                          <strong>Manager note:</strong> {req.note}
                        </div>
                      )}
                      {req.adminNote && (
                        <div className="px-4 py-2 rounded-xl text-xs mb-3" style={{ background: "#E8F0FB", color: "#1B3A5C" }}>
                          <strong>Admin note:</strong> {req.adminNote}
                          {req.reviewedBy && <span style={{ color: "#8A6650" }}> · by {req.reviewedBy.name}</span>}
                        </div>
                      )}
                    </div>

                    {/* Actions — only for PENDING */}
                    {isPending && (
                      <div className="px-5 py-4 border-t space-y-3" style={{ borderColor: "#EEE4D9", background: "#FAFAFA" }}>
                        {/* Optional rejection note */}
                        <input
                          placeholder="Admin note (optional — required for rejection)"
                          value={rejectNote[req.id] || ""}
                          onChange={e => setRejectNote(p => ({ ...p, [req.id]: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2 text-xs focus:outline-none"
                          style={{ borderColor: "#DDD0C4" }}
                        />
                        <div className="flex gap-3">
                          <button onClick={() => reviewRequest(req.id, "APPROVED")}
                            disabled={reviewing === req.id}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                            style={{ background: "#2E7D32", color: "#FFF" }}>
                            {reviewing === req.id
                              ? <FaSpinner className="animate-spin" />
                              : <FaCheckCircle />}
                            Approve & Apply
                          </button>
                          <button onClick={() => reviewRequest(req.id, "REJECTED")}
                            disabled={reviewing === req.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                            style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #C6282830" }}>
                            {reviewing === req.id
                              ? <FaSpinner className="animate-spin" />
                              : <FaTimesCircle />}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
