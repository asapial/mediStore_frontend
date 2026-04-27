"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckDouble, FaSpinner, FaMapMarkerAlt, FaUser,
  FaStore, FaBoxOpen, FaWarehouse, FaChevronDown, FaChevronUp,
} from "react-icons/fa";

interface SubOrderItem { price: number; quantity: number; }
interface SubOrder {
  id: string; total: number;
  seller: { id: string; name: string };
  items: SubOrderItem[];
}
interface TrackingEvent { status: string; note?: string; createdAt: string; }
interface Task {
  id: string; orderId: string; status: string; createdAt: string;
  order: {
    id: string; address: string;
    user: { id: string; name: string; email: string };
    items: { id: string; quantity: number; price: number; medicine: { name: string; image?: string } }[];
    subOrders: SubOrder[];
    tracking: TrackingEvent[];
  };
  warehouse?: { id: string; name: string };
}

export default function FulfillmentHistoryPage() {
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all: Task[] = d.data || [];
        setTasks(all.filter(t => t.status === "DELIVERED").reverse());
      })
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = tasks.reduce((s, t) =>
    s + t.order.items.reduce((ss, it) => ss + it.price * it.quantity, 0), 0
  );

  const stats = [
    { label: "Delivered Orders", val: tasks.length,              color: "#2E7D32", icon: <FaCheckDouble /> },
    { label: "Total Revenue",    val: `৳${totalRevenue.toFixed(0)}`, color: "#C2703A", icon: <FaBoxOpen /> },
    { label: "Sellers Paid",     val: new Set(tasks.flatMap(t => t.order.subOrders.map(s => s.seller.id))).size, color: "#1B3A5C", icon: <FaStore /> },
    { label: "Warehouses",       val: new Set(tasks.map(t => t.warehouse?.id).filter(Boolean)).size, color: "#3A6EA5", icon: <FaWarehouse /> },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#2E7D32" }}>
          <FaCheckDouble className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Delivery History</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Completed deliveries — seller wallets credited upon delivery
          </p>
        </div>
        <button onClick={load} className="ml-auto flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#F5EDE3", color: "#8A6650", border: "1px solid #DDD0C4" }}>
          <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="medi-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-1 font-semibold" style={{ color: "#8A6650" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#2E7D32" }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaCheckDouble className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#2E7D32" }} />
          <p style={{ color: "#8A6650" }}>No delivered orders yet.</p>
          <p className="text-xs mt-1" style={{ color: "#AAA" }}>Completed deliveries from the Dispatch page will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const isExpanded  = expanded === task.id;
              const total       = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);
              const deliveredAt = task.order.tracking.find(e => e.status === "DELIVERED")?.createdAt;

              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: "linear-gradient(90deg,#2E7D3210,#FFF)", borderBottom: "1px solid #DDD0C4" }}>
                    <div>
                      <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{task.order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
                        {deliveredAt
                          ? `Delivered ${new Date(deliveredAt).toLocaleDateString()}`
                          : new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      {task.warehouse && (
                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#2E7D3215", color: "#2E7D32" }}>
                          {task.warehouse.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                        style={{ background: "#2E7D3218", color: "#2E7D32" }}>
                        <FaCheckDouble /> DELIVERED
                      </span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Status hint */}
                  <div className="px-5 py-1.5 text-xs font-medium" style={{ background: "#2E7D320D", color: "#2E7D32" }}>
                    ✅ Delivered — seller wallets have been credited automatically
                  </div>

                  {/* Customer */}
                  <div className="px-5 py-3 flex flex-wrap gap-6"
                    style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                    <div className="flex items-start gap-2">
                      <FaUser style={{ color: "#8A6650", marginTop: 2, fontSize: 12 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                        <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{task.order.user.name}</p>
                        <p className="text-xs" style={{ color: "#8A6650" }}>{task.order.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt style={{ color: "#C2703A", marginTop: 2, fontSize: 12 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
                        <p className="text-sm" style={{ color: "#5C4033", maxWidth: 340 }}>{task.order.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sellers credited */}
                  {task.order.subOrders.length > 0 && (
                    <div className="px-5 py-2 flex flex-wrap gap-2"
                      style={{ borderBottom: "1px solid #EEE4D9", background: "#F9F6F2" }}>
                      <span className="text-xs font-semibold self-center" style={{ color: "#8A6650" }}>
                        <FaStore style={{ display: "inline", marginRight: 4 }} />Sellers credited:
                      </span>
                      {task.order.subOrders.map(sub => {
                        const earned = sub.items.reduce((s, i) => s + i.price * i.quantity, 0) || sub.total;
                        return (
                          <span key={sub.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "#2E7D3215", color: "#2E7D32" }}>
                            {sub.seller.name} — <strong>৳{earned.toFixed(2)}</strong> ✓
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Items + tracking toggle */}
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase" style={{ color: "#8A6650" }}>
                        {task.order.items.length} item(s)
                      </p>
                      <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                        className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#3A6EA5" }}>
                        {isExpanded ? <><FaChevronUp />Hide</> : <><FaChevronDown />View items &amp; tracking</>}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          {/* Items */}
                          <div className="space-y-2 mt-2 mb-4">
                            {task.order.items.map(it => (
                              <div key={it.id} className="flex items-center gap-3 rounded-xl p-3"
                                style={{ background: "#F5EDE3" }}>
                                <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                                  {it.medicine.image
                                    ? <img src={it.medicine.image} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center">💊</div>}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{it.medicine.name}</p>
                                  <p className="text-xs" style={{ color: "#8A6650" }}>
                                    Qty: {it.quantity} × ৳{it.price.toFixed(2)} = <strong style={{ color: "#C2703A" }}>৳{(it.quantity * it.price).toFixed(2)}</strong>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tracking timeline */}
                          {task.order.tracking.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-bold uppercase mb-2" style={{ color: "#8A6650" }}>Order Timeline</p>
                              <div className="space-y-2 pl-3" style={{ borderLeft: "2px solid #DDD0C4" }}>
                                {task.order.tracking.map((ev, idx) => (
                                  <div key={idx} className="pl-3 relative">
                                    <div className="absolute -left-4 top-1 w-2 h-2 rounded-full"
                                      style={{ background: ev.status === "DELIVERED" ? "#2E7D32" : "#3A6EA5" }} />
                                    <p className="text-xs font-bold" style={{ color: ev.status === "DELIVERED" ? "#2E7D32" : "#1B3A5C" }}>
                                      {ev.status}
                                    </p>
                                    {ev.note && <p className="text-xs" style={{ color: "#8A6650" }}>{ev.note}</p>}
                                    <p className="text-xs" style={{ color: "#AAA" }}>
                                      {new Date(ev.createdAt).toLocaleString("en-BD")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
