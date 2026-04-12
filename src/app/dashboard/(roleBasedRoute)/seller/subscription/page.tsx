"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaSync, FaClock, FaUser } from "react-icons/fa";

type SubStatus    = "ACTIVE" | "PAUSED" | "CANCELLED";
type SubFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

interface Subscription {
  id: string;
  quantity: number;
  frequency: SubFrequency;
  status: SubStatus;
  nextRefillAt: string;
  medicine: { name: string; price: number; image?: string };
  user: { name: string; email: string };
}

const freqLabel: Record<SubFrequency, string> = {
  WEEKLY: "Weekly", BIWEEKLY: "Bi-weekly", MONTHLY: "Monthly",
};
const statusStyle: Record<SubStatus, string> = {
  ACTIVE:    "badge-active",
  PAUSED:    "badge-paused",
  CANCELLED: "badge-cancelled",
};

export default function SellerSubscriptionsPage() {
  const [subs,    setSubs]    = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<SubStatus | "ALL">("ALL");

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/subscriptions/seller", { credentials: "include" });
      const data = await res.json();
      setSubs(data.data || []);
    } catch { toast.error("Failed to load subscriptions"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubs(); }, []);

  const filtered = filter === "ALL" ? subs : subs.filter(s => s.status === filter);
  const count    = (s: SubStatus | "ALL") => s === "ALL" ? subs.length : subs.filter(x => x.status === s).length;

  const revenue = subs
    .filter(s => s.status === "ACTIVE")
    .reduce((acc, s) => acc + s.medicine.price * s.quantity, 0);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#3A6EA5" }}>
          <FaSync className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Customer Subscriptions</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Active auto-refill orders for your medicines</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",     val: count("ALL"),       color: "#1B3A5C" },
          { label: "Active",    val: count("ACTIVE"),    color: "#2E7D32" },
          { label: "Paused",    val: count("PAUSED"),    color: "#8A6650" },
          { label: "Est. Revenue / Cycle", val: `$${revenue.toFixed(2)}`, color: "#C2703A" },
        ].map(s => (
          <div key={s.label} className="medi-card p-5">
            <p className="text-xs uppercase font-semibold mb-1" style={{ color: "#8A6650" }}>{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", "ACTIVE", "PAUSED", "CANCELLED"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? "#1B3A5C" : "#F5EDE3",
              color:      filter === f ? "#FFFFFF"  : "#5C4033",
              border:     "1px solid #DDD0C4",
            }}
          >
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading subscriptions…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaSync className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#3A6EA5" }} />
          <p style={{ color: "#8A6650" }}>No subscriptions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="medi-card p-5 flex flex-wrap items-center gap-4"
              >
                {/* Medicine image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: "#EEE4D9" }}>
                  {sub.medicine.image
                    ? <img src={sub.medicine.image} alt={sub.medicine.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-0.5" style={{ color: "#1B3A5C" }}>{sub.medicine.name}</h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: "#8A6650" }}>
                    <FaUser style={{ fontSize: 10 }} />
                    {sub.user.name} · {sub.user.email}
                  </p>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#8A6650" }}>
                  <div>
                    <p className="font-semibold" style={{ color: "#5C4033" }}>Qty</p>
                    <p>{sub.quantity}</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "#5C4033" }}>Frequency</p>
                    <p>{freqLabel[sub.frequency]}</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "#5C4033" }}>Next Refill</p>
                    <p className="flex items-center gap-1">
                      <FaClock style={{ fontSize: 10 }} />
                      {new Date(sub.nextRefillAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "#5C4033" }}>Value</p>
                    <p className="font-bold" style={{ color: "#C2703A" }}>
                      ${(sub.medicine.price * sub.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <span className={statusStyle[sub.status]}>{sub.status}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
