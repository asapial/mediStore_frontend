"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBoxes, FaSpinner, FaStore, FaUser, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp, FaBox, FaBoxOpen, FaTruck,
  FaCheckDouble, FaClock,
} from "react-icons/fa";

type FulfillStatus = "PENDING" | "PICKED" | "PACKED" | "DISPATCHED" | "DELIVERED";
type OrderStatus   = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Medicine  { id: string; name: string; image?: string; }
interface OrderItem { id: string; quantity: number; price: number; medicine: Medicine; }
interface SubOrder  { id: string; status: OrderStatus; seller: { id: string; name: string }; }
interface Order {
  id: string; address: string; status: OrderStatus;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
  subOrders: SubOrder[];
}
interface Task {
  id: string; orderId: string; status: FulfillStatus;
  createdAt: string; startedAt?: string; packedAt?: string; dispatchedAt?: string;
  order: Order;
  warehouse?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  packingSlip?: { id: string; items: any };
}

const FS_COLOR: Record<string, string> = {
  PENDING: "#3A6EA5", PICKED: "#C2703A", PACKED: "#512DA8", DISPATCHED: "#0EA5E9",
};
const FS_ICON: Record<string, React.ReactNode> = {
  PENDING: <FaClock />, PICKED: <FaBox />, PACKED: <FaBoxOpen />, DISPATCHED: <FaTruck />,
};

// Only show active fulfillment stages — DISPATCHED lives on the Dispatch page
const ACTIVE_STAGES: FulfillStatus[] = ["PENDING", "PICKED", "PACKED"];

export default function FulfillmentQueuePage() {
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting,   setActing]   = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all: Task[] = d.data || [];
        // Only show tasks that still need action on this page
        setTasks(all.filter(t => ACTIVE_STAGES.includes(t.status as FulfillStatus)));
      })
      .catch(() => toast.error("Failed to load queue"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const doAction = async (taskId: string, endpoint: string, msg: string, newStatus?: FulfillStatus) => {
    setActing(taskId);
    try {
      const res = await fetch(`/api/fulfillment/${taskId}/${endpoint}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success(msg);
      if (newStatus === "DISPATCHED") {
        // Remove from this page — it moves to the Dispatch page
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.info("Order moved to Dispatch & Delivery page");
      } else if (newStatus) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      } else {
        load();
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(null); }
  };

  const count = (s: FulfillStatus) => tasks.filter(t => t.status === s).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#D97706" }}>
          <FaBoxes className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Fulfillment Queue</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Pending → Picked → Packed — dispatched orders appear on the Dispatch page
          </p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {ACTIVE_STAGES.map(s => (
          <div key={s} className="medi-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: FS_COLOR[s] + "18", color: FS_COLOR[s] }}>{FS_ICON[s]}</div>
            <div>
              <p className="text-xl font-black" style={{ color: FS_COLOR[s] }}>{count(s)}</p>
              <p className="text-[10px] font-semibold uppercase" style={{ color: "#8A6650" }}>{s}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#D97706" }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaCheckDouble className="mx-auto text-4xl mb-3" style={{ color: "#10B981", opacity: 0.5 }} />
          <p className="font-bold" style={{ color: "#10B981" }}>All caught up!</p>
          <p className="text-sm mt-1" style={{ color: "#8A6650" }}>
            No orders awaiting processing. Dispatched orders are on the Dispatch page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, i) => {
            const isExpanded = expanded === task.id;
            const total = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                  style={{ background: `linear-gradient(90deg,${FS_COLOR[task.status] ?? "#3A6EA5"}10,#FFF)`, borderBottom: "1px solid #DDD0C4" }}>
                  <div>
                    <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                      Order #{task.order.id.slice(-8).toUpperCase()}
                    </span>
                    {task.warehouse && (
                      <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: "#0EA5E910", color: "#0EA5E9" }}>
                        {task.warehouse.name}
                      </span>
                    )}
                    <span className="text-xs ml-2" style={{ color: "#8A6650" }}>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ background: (FS_COLOR[task.status] ?? "#3A6EA5") + "18", color: FS_COLOR[task.status] ?? "#3A6EA5" }}>
                      {FS_ICON[task.status]} {task.status}
                    </span>
                    <span className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer & Address */}
                <div className="px-5 py-3 flex flex-wrap gap-5"
                  style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                  <div className="flex gap-2 items-start">
                    <FaUser style={{ color: "#8A6650", fontSize: 11, marginTop: 2 }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                      <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{task.order.user.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <FaMapMarkerAlt style={{ color: "#C2703A", fontSize: 11, marginTop: 2 }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Address</p>
                      <p className="text-sm" style={{ color: "#5C4033", maxWidth: 340 }}>{task.order.address}</p>
                    </div>
                  </div>
                  {task.order.subOrders.length > 0 && (
                    <div className="flex gap-2 items-start">
                      <FaStore style={{ color: "#512DA8", fontSize: 11, marginTop: 2 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Sellers</p>
                        <div className="flex gap-1 flex-wrap">
                          {task.order.subOrders.map(so => (
                            <span key={so.id} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "#1B3A5C10", color: "#1B3A5C" }}>
                              {so.seller.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items collapsible */}
                <div className="px-5 py-3">
                  <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                    className="flex items-center gap-1 text-xs font-semibold mb-2"
                    style={{ color: "#3A6EA5" }}>
                    {isExpanded ? <><FaChevronUp />Hide items</> : <><FaChevronDown />View {task.order.items.length} item(s)</>}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
                        {task.order.items.map(it => (
                          <div key={it.id} className="flex items-center gap-3 rounded-xl p-2"
                            style={{ background: "#F5EDE3" }}>
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#EEE4D9" }}>
                              {it.medicine.image
                                ? <img src={it.medicine.image} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-xs">💊</div>}
                            </div>
                            <p className="text-xs font-semibold" style={{ color: "#1B3A5C" }}>
                              {it.medicine.name} <span style={{ color: "#8A6650" }}>× {it.quantity}</span>
                            </p>
                            <span className="ml-auto text-xs font-bold" style={{ color: "#C2703A" }}>
                              ৳{(it.price * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action */}
                <div className="px-5 py-3 flex flex-wrap gap-2 justify-end"
                  style={{ borderTop: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                  {task.status === "PENDING" && (
                    <button onClick={() => doAction(task.id, "pick", "Picking started ✅", "PICKED")}
                      disabled={acting === task.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                      style={{ background: FS_COLOR.PICKED, color: "#FFF" }}>
                      {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaBox />} Start Picking
                    </button>
                  )}
                  {task.status === "PICKED" && (
                    <button onClick={() => doAction(task.id, "pack", "Packed! 📦", "PACKED")}
                      disabled={acting === task.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                      style={{ background: FS_COLOR.PACKED, color: "#FFF" }}>
                      {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaBoxOpen />} Mark Packed
                    </button>
                  )}
                  {task.status === "PACKED" && (
                    <button onClick={() => doAction(task.id, "dispatch", "Dispatched! 🚚", "DISPATCHED")}
                      disabled={acting === task.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                      style={{ background: FS_COLOR.DISPATCHED, color: "#FFF" }}>
                      {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaTruck />} Dispatch Order
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
