"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaThermometerHalf, FaPlus, FaSpinner } from "react-icons/fa";

type Log = {
  id: string; zone: string; temperature: number;
  minAllowed: number; maxAllowed: number; isAlert: boolean; recordedAt: string;
  recordedBy?: { name: string };
};

export default function TemperaturePage() {
  const [logs,       setLogs]       = useState<Log[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [whId,       setWhId]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ warehouseId: "", zone: "COLD", temperature: 5, minAllowed: 2, maxAllowed: 8 });
  const [alertsOnly, setAlertsOnly] = useState(false);

  useEffect(() => {
    fetch("/api/warehouses", { credentials: "include" }).then(r => r.json()).then(d => {
      setWarehouses(d.data || []);
      if (d.data?.[0]) setWhId(d.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!whId) return;
    setLoading(true);
    const params = new URLSearchParams({ ...(alertsOnly ? { alertsOnly: "true" } : {}) });
    fetch(`/api/temperature-logs/${whId}?${params}`, { credentials: "include" })
      .then(r => r.json()).then(d => setLogs(d.data || []))
      .finally(() => setLoading(false));
  }, [whId, alertsOnly]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/temperature-logs", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, warehouseId: whId }),
    });
    const d = await res.json();
    if (res.ok) {
      if (d.message.includes("ALERT")) toast.error(d.message);
      else toast.success(d.message);
      setShowForm(false);
      setWhId(v => v);
    } else toast.error(d.message);
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#10B981" }}>
            <FaThermometerHalf className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Temperature Logs</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Cold chain monitoring & alerts</p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={whId} onChange={e => setWhId(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm font-semibold" style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }}>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button onClick={() => setAlertsOnly(v => !v)}
            className="text-xs font-bold px-3 py-2 rounded-xl transition-all"
            style={{ background: alertsOnly ? "#EF4444" : "#F5EDE3", color: alertsOnly ? "#FFF" : "#5C4033" }}>
            {alertsOnly ? "⚠ Alerts Only" : "All Logs"}
          </button>
          <button onClick={() => setShowForm(v => !v)} className="medi-btn-primary flex items-center gap-2">
            <FaPlus /> Log Reading
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="medi-card p-5 mb-6 grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Zone</label>
            <input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
              placeholder="e.g. COLD" required className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Temperature (°C)</label>
            <input type="number" step="0.1" value={form.temperature}
              onChange={e => setForm(f => ({ ...f, temperature: +e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Min (°C)</label>
            <input type="number" step="0.1" value={form.minAllowed}
              onChange={e => setForm(f => ({ ...f, minAllowed: +e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Max (°C)</label>
            <input type="number" step="0.1" value={form.maxAllowed}
              onChange={e => setForm(f => ({ ...f, maxAllowed: +e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "#DDD0C4" }} />
          </div>
          <div className="md:col-span-4 flex gap-3">
            <button type="submit" className="medi-btn-accent">Save Reading</button>
            <button type="button" onClick={() => setShowForm(false)} className="medi-btn-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#10B981" }} /></div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const ok = !log.isAlert;
            return (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="medi-card p-4 flex items-center justify-between flex-wrap gap-3"
                style={{ borderLeft: `3px solid ${ok ? "#10B981" : "#EF4444"}` }}>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black" style={{ color: ok ? "#10B981" : "#EF4444" }}>
                    {log.temperature}°C
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{log.zone}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      Range: {log.minAllowed}–{log.maxAllowed}°C ·{" "}
                      {log.recordedBy?.name} · {new Date(log.recordedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {log.isAlert && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: "#EF444422", color: "#EF4444" }}>⚠ OUT OF RANGE</span>
                )}
              </motion.div>
            );
          })}
          {!logs.length && <p className="text-center py-16" style={{ color: "#8A6650" }}>No temperature logs found</p>}
        </div>
      )}
    </div>
  );
}
