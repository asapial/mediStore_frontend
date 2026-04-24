"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaWarehouse, FaPlus, FaEdit, FaMapMarkerAlt, FaSpinner, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface Location {
  id: string; name: string; address: string; city: string;
  latitude?: number; longitude?: number; isActive: boolean;
  _count?: { locationStocks: number; fulfillmentTasks: number };
}

export default function WarehouseLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", latitude: "", longitude: "" });
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/warehouses", { credentials: "include" });
      const data = await res.json();
      setLocations(data.data || []);
    } catch { toast.error("Failed to load locations"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, address: form.address, city: form.city,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Location created");
      setShowForm(false);
      setForm({ name: "", address: "", city: "", latitude: "", longitude: "" });
      fetchLocations();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/warehouses/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      toast.success(`Location ${current ? "deactivated" : "activated"}`);
      fetchLocations();
    } catch { toast.error("Toggle failed"); }
    finally { setToggling(null); }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaWarehouse className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Location Management</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Manage all warehouse facility locations</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="medi-btn-accent flex items-center gap-2">
          <FaPlus /> {showForm ? "Cancel" : "Add Location"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.form onSubmit={handleCreate} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="medi-card p-6 mb-6 space-y-4">
          <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>New Warehouse Location</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Facility Name", name: "name", placeholder: "e.g. Dhaka Central Warehouse", required: true },
              { label: "City", name: "city", placeholder: "e.g. Dhaka", required: true },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>{f.label}</label>
                <input value={(form as any)[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.placeholder} required={f.required}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: "#DDD0C4" }} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Full Address</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Street address" required
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Latitude (GPS)", name: "latitude", placeholder: "23.8103" },
              { label: "Longitude (GPS)", name: "longitude", placeholder: "90.4125" },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>{f.label}</label>
                <input type="number" step="any" value={(form as any)[f.name]}
                  onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: "#DDD0C4" }} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
            style={{ background: "#1B3A5C", color: "#FFF" }}>
            {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />} Create Location
          </button>
        </motion.form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Locations", value: locations.length, color: "#1B3A5C" },
          { label: "Active", value: locations.filter(l => l.isActive).length, color: "#2E7D32" },
          { label: "Inactive", value: locations.filter(l => !l.isActive).length, color: "#C62828" },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {locations.map((loc, i) => (
            <motion.div key={loc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="medi-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold" style={{ color: "#1B3A5C" }}>{loc.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                      style={{ background: loc.isActive ? "#E8F5E9" : "#FFEBEE", color: loc.isActive ? "#2E7D32" : "#C62828" }}>
                      {loc.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1">
                    <FaMapMarkerAlt className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#C2703A" }} />
                    <p className="text-xs" style={{ color: "#8A6650" }}>{loc.address}, {loc.city}</p>
                  </div>
                  {loc.latitude && (
                    <p className="text-xs mt-1 font-mono" style={{ color: "#8A6650" }}>
                      GPS: {loc.latitude}, {loc.longitude}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/dashboard/warehouse/locations/${loc.id}`)}
                    className="p-2 rounded-lg text-sm transition"
                    style={{ background: "#E3F0FB", color: "#3A6EA5" }} title="View Detail">
                    <FaEdit />
                  </button>
                  <button onClick={() => toggleActive(loc.id, loc.isActive)} disabled={toggling === loc.id}
                    className="p-2 rounded-lg text-sm transition"
                    style={{ background: loc.isActive ? "#FFEBEE" : "#E8F5E9", color: loc.isActive ? "#C62828" : "#2E7D32" }}>
                    {toggling === loc.id ? <FaSpinner className="animate-spin" /> : loc.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              </div>
              {loc._count && (
                <div className="flex gap-4 text-xs pt-2 border-t" style={{ borderColor: "#EEE4D9" }}>
                  <span style={{ color: "#8A6650" }}>Stock items: <strong style={{ color: "#1B3A5C" }}>{loc._count.locationStocks}</strong></span>
                  <span style={{ color: "#8A6650" }}>Active tasks: <strong style={{ color: "#C2703A" }}>{loc._count.fulfillmentTasks}</strong></span>
                </div>
              )}
            </motion.div>
          ))}
          {!locations.length && (
            <div className="medi-card text-center py-12 col-span-2">
              <FaWarehouse className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
              <p style={{ color: "#8A6650" }}>No locations yet. Add your first warehouse location.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
