"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaCubes, FaPlus, FaSpinner } from "react-icons/fa";

type Bin = {
  id: string; binCode: string; capacity: number; currentLoad: number; isActive: boolean;
  location: { zone: string; aisle: string; shelf: string };
  allocations: { medicine: { name: string }; quantity: number }[];
};

export default function StorageBinsPage() {
  const [bins,       setBins]       = useState<Bin[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [whId,       setWhId]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ warehouseId: "", locationId: "", binCode: "", capacity: 100 });
  const [locations,  setLocations]  = useState<{ id: string; zone: string; aisle: string; shelf: string }[]>([]);
  const [allocForm,  setAllocForm]  = useState({ binId: "", medicineId: "", quantity: 1 });

  const load = (id: string) => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/storage-bins/${id}`, { credentials: "include" })
      .then(r => r.json()).then(d => setBins(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/warehouses", { credentials: "include" }).then(r => r.json()).then(d => {
      setWarehouses(d.data || []);
      if (d.data?.[0]) { setWhId(d.data[0].id); load(d.data[0].id); }
    });
  }, []);

  useEffect(() => {
    if (!whId) return;
    load(whId);
    fetch(`/api/warehouses/${whId}/locations`, { credentials: "include" })
      .then(r => r.json()).then(d => setLocations(d.data || []));
  }, [whId]);

  const createBin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/storage-bins", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, warehouseId: whId }),
    });
    const d = await res.json();
    if (res.ok) { toast.success("Bin created!"); setShowForm(false); load(whId); } else toast.error(d.message);
  };

  const allocate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/storage-bins/allocate", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allocForm),
    });
    const d = await res.json();
    if (res.ok) { toast.success("Allocated!"); load(whId); } else toast.error(d.message);
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
            <FaCubes className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Storage Bins</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Manage bin capacity & allocations</p>
          </div>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <select value={whId} onChange={e => setWhId(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm font-semibold" style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button onClick={() => setShowForm(v => !v)} className="medi-btn-primary flex items-center gap-2">
            <FaPlus /> New Bin
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form onSubmit={createBin} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="medi-card p-5 mb-6 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Location</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }}
              value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}>
              <option value="">Select...</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.zone}-{l.aisle}-{l.shelf}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Bin Code</label>
            <input required placeholder="e.g. A-01-001" value={form.binCode}
              onChange={e => setForm(f => ({ ...f, binCode: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Capacity (units)</label>
            <input type="number" min={1} value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div className="md:col-span-3 flex gap-3">
            <button type="submit" className="medi-btn-accent">Create Bin</button>
            <button type="button" onClick={() => setShowForm(false)} className="medi-btn-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#0EA5E9" }} /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bins.map(bin => {
            const pct = Math.round((bin.currentLoad / bin.capacity) * 100);
            const color = pct > 85 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#10B981";
            return (
              <motion.div key={bin.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="medi-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-black text-lg" style={{ color: "#1B3A5C" }}>{bin.binCode}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      {bin.location.zone} · {bin.location.aisle} · {bin.location.shelf}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: `${color}22`, color }}>{pct}% full</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "#F5EDE3" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="text-xs mb-2" style={{ color: "#8A6650" }}>{bin.currentLoad} / {bin.capacity} units</p>
                {bin.allocations.map((a, i) => (
                  <span key={i} className="text-xs mr-1 px-2 py-0.5 rounded-lg inline-block"
                    style={{ background: "#F5EDE3", color: "#5C4033" }}>{a.medicine.name} ({a.quantity})</span>
                ))}
                {/* Quick allocate */}
                <form onSubmit={allocate} className="mt-3 flex gap-2">
                  <input placeholder="Medicine ID" value={allocForm.binId === bin.id ? allocForm.medicineId : ""}
                    onFocus={() => setAllocForm(f => ({ ...f, binId: bin.id }))}
                    onChange={e => setAllocForm(f => ({ ...f, medicineId: e.target.value, binId: bin.id }))}
                    className="flex-1 border rounded-lg px-2 py-1 text-xs" style={{ borderColor: "#DDD0C4" }} />
                  <input type="number" min={1} value={allocForm.binId === bin.id ? allocForm.quantity : 1}
                    onChange={e => setAllocForm(f => ({ ...f, quantity: +e.target.value, binId: bin.id }))}
                    className="w-16 border rounded-lg px-2 py-1 text-xs" style={{ borderColor: "#DDD0C4" }} />
                  <button type="submit" className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "#0EA5E922", color: "#0EA5E9" }}>+</button>
                </form>
              </motion.div>
            );
          })}
          {!bins.length && <p className="col-span-3 text-center py-16" style={{ color: "#8A6650" }}>No bins configured</p>}
        </div>
      )}
    </div>
  );
}
