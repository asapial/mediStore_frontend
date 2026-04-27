"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTruck, FaCheckDouble, FaSpinner, FaMapMarkerAlt,
  FaUser, FaStore, FaBoxOpen, FaWarehouse, FaShippingFast,
  FaChevronDown, FaChevronUp,
} from "react-icons/fa";

type FulfillStatus = "PACKED" | "DISPATCHED";

interface SubOrderItem { price: number; quantity: number; }
interface SubOrder {
  id: string; total: number;
  seller: { id: string; name: string };
  items: SubOrderItem[];
}
interface Task {
  id: string; orderId: string; status: FulfillStatus;
  createdAt: string; dispatchedAt?: string; packedAt?: string;
  order: {
    id: string; address: string;
    user: { id: string; name: string; email: string };
    items: { id: string; quantity: number; price: number; medicine: { name: string; image?: string } }[];
    subOrders: SubOrder[];
  };
  warehouse?: { id: string; name: string };
}

const STATUS_COLOR = { PACKED: "#0EA5E9", DISPATCHED: "#2E7D32" };
const STATUS_LABEL = {
  PACKED:     "Packed & sealed — ready to dispatch to customer",
  DISPATCHED: "Out for delivery — confirm when customer receives",
};

export default function WarehouseDispatchPage() {
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting,   setActing]   = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all: Task[] = d.data || [];
        setTasks(all.filter(t => ["PACKED", "DISPATCHED"].includes(t.status)) as Task[]);
      })
      .catch(() => toast.error("Failed to load dispatch queue"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const doAction = async (taskId: string, endpoint: string, msg: string) => {
    setActing(taskId);
    try {
      const res = await fetch(`/api/fulfillment/${taskId}/${endpoint}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
      toast.success(msg);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(null); }
  };

  const count = (s: string) => s === "ALL" ? tasks.length : tasks.filter(t => t.status === s).length;
  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);
  const totalValue = tasks.reduce((s, t) => s + t.order.items.reduce((ss, it) => ss + it.price * it.quantity, 0), 0);

  const stats = [
    { label: "Total",       val: tasks.length,      color: "#1B3A5C", icon: <FaWarehouse /> },
    { label: "Ready",       val: count("PACKED"),    color: "#0EA5E9", icon: <FaBoxOpen /> },
    { label: "Dispatched",  val: count("DISPATCHED"),color: "#2E7D32", icon: <FaTruck /> },
    { label: "Total Value", val: `৳${totalValue.toFixed(0)}`, color: "#C2703A", icon: <FaCheckDouble /> },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
          <FaTruck className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Dispatch &amp; Delivery</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Dispatch packed orders → confirm customer delivery → credit seller wallets
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

      {/* Info banner */}
      <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
        style={{ background: "#0EA5E910", color: "#0EA5E9", border: "1px solid #0EA5E930" }}>
        <FaCheckDouble />
        <span>Clicking <strong>"Mark Delivered"</strong> confirms customer receipt and automatically credits each seller's wallet.</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL", "PACKED", "DISPATCHED"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : STATUS_COLOR[f as keyof typeof STATUS_COLOR]) : "#F5EDE3",
              color: filter === f ? "#FFF" : "#5C4033",
              border: "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#0EA5E9" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaTruck className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#0EA5E9" }} />
          <p style={{ color: "#8A6650" }}>No orders in this status.</p>
          <p className="text-xs mt-1" style={{ color: "#AAA" }}>Pack orders on the Pick &amp; Pack page first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((task, i) => {
              const isExpanded = expanded === task.id;
              const total = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);
              const color = STATUS_COLOR[task.status];

              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: `linear-gradient(90deg,${color}10,#FFF)`, borderBottom: "1px solid #DDD0C4" }}>
                    <div>
                      <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{task.order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
                        {task.status === "DISPATCHED" && task.dispatchedAt
                          ? `Dispatched ${new Date(task.dispatchedAt).toLocaleDateString()}`
                          : new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      {task.warehouse && (
                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#0EA5E915", color: "#0EA5E9" }}>
                          {task.warehouse.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                        style={{ background: color + "18", color }}>
                        {task.status === "PACKED" ? <FaBoxOpen /> : <FaTruck />} {task.status}
                      </span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Status hint */}
                  <div className="px-5 py-1.5 text-xs font-medium" style={{ background: color + "0D", color }}>
                    {STATUS_LABEL[task.status]}
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

                  {/* Sellers earnings */}
                  {task.order.subOrders.length > 0 && (
                    <div className="px-5 py-2 flex flex-wrap gap-2"
                      style={{ borderBottom: "1px solid #EEE4D9", background: "#F9F6F2" }}>
                      <span className="text-xs font-semibold self-center" style={{ color: "#8A6650" }}>
                        <FaStore style={{ display: "inline", marginRight: 4 }} />Sellers:
                      </span>
                      {task.order.subOrders.map(sub => {
                        const earned = sub.items.reduce((s, i) => s + i.price * i.quantity, 0) || sub.total;
                        return (
                          <span key={sub.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "#1B3A5C15", color: "#1B3A5C" }}>
                            {sub.seller.name} — <strong style={{ color: "#2E7D32" }}>৳{earned.toFixed(2)}</strong>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Items toggle */}
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase" style={{ color: "#8A6650" }}>
                        {task.order.items.length} item(s) in parcel
                      </p>
                      <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                        className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#3A6EA5" }}>
                        {isExpanded ? <><FaChevronUp />Hide</> : <><FaChevronDown />View items</>}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2 mt-2">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action footer */}
                  <div className="px-5 py-3 flex flex-wrap gap-2 justify-between items-center"
                    style={{ borderTop: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      {task.status === "PACKED"
                        ? "💡 Ready to go — dispatch this order to the customer"
                        : "💡 Confirm customer received the package to credit seller wallets"}
                    </p>
                    {task.status === "PACKED" && (
                      <button onClick={() => doAction(task.id, "dispatch", "🚚 Dispatched! Out for delivery.")}
                        disabled={acting === task.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: "#0EA5E9", color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaShippingFast />}
                        Dispatch to Customer
                      </button>
                    )}
                    {task.status === "DISPATCHED" && (
                      <button onClick={() => doAction(task.id, "deliver", "✅ Delivered! Seller wallets credited.")}
                        disabled={acting === task.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60 shadow"
                        style={{ background: "#2E7D32", color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaCheckDouble />}
                        Mark Customer Received
                      </button>
                    )}
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
