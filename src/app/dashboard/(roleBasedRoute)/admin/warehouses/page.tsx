"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaWarehouse, FaPlus, FaSpinner, FaMapMarkerAlt, FaUserCog, FaCheck, FaTimes } from "react-icons/fa";

type Warehouse = {
  id: string; name: string; address: string; city: string;
  lat: number; lng: number; phone?: string; isActive: boolean;
  manager: { id: string; name: string; email: string };
  _count?: { locationStocks: number; fulfillmentTasks: number };
};

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", city: "", lat: "", lng: "",
    phone: "", managerId: "", country: "Bangladesh",
  });

  const load = () => {
    setLoading(true);
    fetch("/api/warehouses", { credentials: "include" })
      .then(r => r.json()).then(d => setWarehouses(d.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await fetch("/api/warehouses", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) }),
    });
    const d = await res.json();
    if (res.ok) { toast.success("Warehouse created!"); setShowForm(false); load(); } else toast.error(d.message);
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

  const FIELDS: { key: keyof typeof form; label: string; placeholder: string; type?: string; required?: boolean }[] = [
    { key: "name",      label: "Warehouse Name", placeholder: "Central Warehouse",     required: true },
    { key: "city",      label: "City",           placeholder: "Dhaka",                 required: true },
    { key: "address",   label: "Address",        placeholder: "123 Industrial Area",   required: true },
    { key: "managerId", label: "Manager User ID", placeholder: "User CUID...",         required: true },
    { key: "lat",       label: "Latitude",       placeholder: "23.8103", type: "number", required: true },
    { key: "lng",       label: "Longitude",      placeholder: "90.4125", type: "number", required: true },
    { key: "phone",     label: "Phone",          placeholder: "+880..." },
    { key: "country",   label: "Country",        placeholder: "Bangladesh" },
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
            <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>New Warehouse</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {FIELDS.map(({ key, label, placeholder, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>{label}</label>
                  <input
                    type={type || "text"} required={required} placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="medi-btn-accent flex items-center gap-2">
                {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} Create Warehouse
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="medi-btn-secondary flex items-center gap-2">
                <FaTimes /> Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total",    value: warehouses.length,                      color: "#0EA5E9" },
          { label: "Active",   value: warehouses.filter(w => w.isActive).length,  color: "#10B981" },
          { label: "Inactive", value: warehouses.filter(w => !w.isActive).length, color: "#EF4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: "#8A6650" }}>{label} Warehouses</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="text-4xl animate-spin" style={{ color: "#0EA5E9" }} />
        </div>
      ) : (
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

              {/* Details */}
              <p className="text-xs" style={{ color: "#8A6650" }}>{w.address}</p>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#5C4033" }}>
                <FaUserCog style={{ color: "#7C3AED", fontSize: 12 }} />
                <span>{w.manager.name}</span>
                <span style={{ color: "#DDD0C4" }}>·</span>
                <span style={{ color: "#8A6650" }}>{w.manager.email}</span>
              </div>

              {/* Counts */}
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

              {/* Toggle */}
              <button onClick={() => toggle(w.id, w.isActive)}
                className="w-full text-xs font-bold py-2 rounded-xl mt-auto transition-all"
                style={{
                  background: w.isActive ? "#EF444415" : "#10B98115",
                  color: w.isActive ? "#EF4444" : "#10B981",
                  border: `1px solid ${w.isActive ? "#EF444430" : "#10B98130"}`,
                }}>
                {w.isActive ? "Deactivate" : "Activate"} Warehouse
              </button>
            </motion.div>
          ))}
          {!warehouses.length && (
            <p className="col-span-3 text-center py-20" style={{ color: "#8A6650" }}>
              No warehouses created yet. Add your first one above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
