"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaSync, FaPause, FaTimes, FaPlay, FaPlusCircle, FaClock } from "react-icons/fa";

type SubStatus    = "ACTIVE" | "PAUSED" | "CANCELLED";
type SubFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

interface Subscription {
  id: string;
  quantity: number;
  frequency: SubFrequency;
  status: SubStatus;
  nextRefillAt: string;
  medicine: { id: string; name: string; price: number; image?: string };
}

const freqLabel: Record<SubFrequency, string> = {
  WEEKLY: "Every Week", BIWEEKLY: "Every 2 Weeks", MONTHLY: "Every Month",
};

export default function CustomerSubscriptionPage() {
  const [subs,       setSubs]       = useState<Subscription[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [medicines,  setMedicines]  = useState<any[]>([]);
  const [medLoading, setMedLoading] = useState(true);

  const [medicineId, setMedicineId] = useState("");
  const [quantity,   setQuantity]   = useState(1);
  const [frequency,  setFrequency]  = useState<SubFrequency>("MONTHLY");
  const [submitting, setSubmitting] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/subscriptions/my", { credentials: "include" });
      const data = await res.json();
      setSubs(data.data || []);
    } catch { toast.error("Failed to load subscriptions"); }
    finally { setLoading(false); }
  };

  const fetchMeds = async () => {
    try {
      const res  = await fetch("/api/medicines", { credentials: "include" });
      const data = await res.json();
      setMedicines(data.data || []);
    } catch {} finally { setMedLoading(false); }
  };

  useEffect(() => { fetchSubs(); fetchMeds(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineId) { toast.error("Select a medicine"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, quantity, frequency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Auto-refill subscription created!");
      setMedicineId(""); setQuantity(1); setFrequency("MONTHLY");
      fetchSubs();
    } catch (err: any) { toast.error(err.message || "Failed to create"); }
    finally { setSubmitting(false); }
  };

  const updateStatus = async (id: string, status: SubStatus) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Subscription ${status.toLowerCase()}`);
      fetchSubs();
    } catch { toast.error("Action failed"); }
  };

  const statusStyle: Record<SubStatus, string> = {
    ACTIVE:    "badge-active",
    PAUSED:    "badge-paused",
    CANCELLED: "badge-cancelled",
  };

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#3A6EA5" }}>
          <FaSync className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Auto-Refill Subscriptions</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Never run out of your essential medicines</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="medi-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#1B3A5C" }}>
          <FaPlusCircle style={{ color: "#C2703A" }} /> New Subscription
        </h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Medicine</label>
            <select
              value={medicineId}
              onChange={e => setMedicineId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
              required
            >
              <option value="">Select medicine…</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name} — ${m.price}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Qty / Refill</label>
            <input
              type="number" min={1} value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as SubFrequency)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Bi-Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={submitting} className="medi-btn-accent flex items-center gap-2 disabled:opacity-60">
              <FaSync /> {submitting ? "Creating…" : "Subscribe"}
            </button>
          </div>
        </form>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <p className="text-center py-12" style={{ color: "#8A6650" }}>Loading subscriptions…</p>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaSync className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#3A6EA5" }} />
          <p style={{ color: "#8A6650" }}>No subscriptions yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {subs.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="medi-card overflow-hidden"
              >
                <div className="h-28 bg-cover bg-center relative"
                  style={{ backgroundImage: sub.medicine.image ? `url(${sub.medicine.image})` : "none", background: sub.medicine.image ? undefined : "#EEE4D9" }}>
                  {!sub.medicine.image && (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ color: "#DDD0C4" }}>💊</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={statusStyle[sub.status]}>{sub.status}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#1B3A5C" }}>{sub.medicine.name}</h3>
                  <p className="text-xs mb-0.5" style={{ color: "#8A6650" }}>
                    {sub.quantity} unit{sub.quantity > 1 ? "s" : ""} · {freqLabel[sub.frequency]}
                  </p>
                  <p className="text-xs mb-4 flex items-center gap-1" style={{ color: "#8A6650" }}>
                    <FaClock className="inline" />
                    Next refill: {new Date(sub.nextRefillAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {sub.status === "ACTIVE" && (
                      <>
                        <button onClick={() => updateStatus(sub.id, "PAUSED")}
                          className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1"
                          style={{ background: "#FFF3E0", color: "#C2703A", border: "1px solid #C2703A" }}>
                          <FaPause /> Pause
                        </button>
                        <button onClick={() => updateStatus(sub.id, "CANCELLED")}
                          className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1"
                          style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #C62828" }}>
                          <FaTimes /> Cancel
                        </button>
                      </>
                    )}
                    {sub.status === "PAUSED" && (
                      <button onClick={() => updateStatus(sub.id, "ACTIVE")}
                        className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1"
                        style={{ background: "#E3F0FB", color: "#3A6EA5", border: "1px solid #3A6EA5" }}>
                        <FaPlay /> Resume
                      </button>
                    )}
                    {sub.status === "CANCELLED" && (
                      <p className="text-xs" style={{ color: "#8A6650" }}>Subscription ended</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
