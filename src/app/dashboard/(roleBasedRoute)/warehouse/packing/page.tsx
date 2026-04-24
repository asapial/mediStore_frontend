"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBoxOpen, FaBox, FaStore, FaUser, FaMapMarkerAlt,
  FaCheckCircle, FaSpinner, FaChevronDown, FaChevronUp,
  FaShippingFast,
} from "react-icons/fa";

type FulfillStatus = "PENDING" | "PICKED" | "PACKED" | "DISPATCHED";
type OrderStatus   = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Medicine  { id: string; name: string; image?: string; }
interface OrderItem { id: string; quantity: number; price: number; medicine: Medicine; }
interface SubOrder  { id: string; status: OrderStatus; total: number; seller: { id: string; name: string }; }
interface PackingSlip { id: string; items: { receivedSubOrderIds?: string[]; [k: string]: any } | null; }
interface Task {
  id: string; orderId: string; status: FulfillStatus;
  createdAt: string;
  order: {
    id: string; address: string;
    user: { id: string; name: string; email: string };
    items: OrderItem[];
    subOrders: SubOrder[];
  };
  warehouse?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  packingSlip?: PackingSlip | null;
}

type Tab = "pick" | "pack";

export default function WarehousePackingPage() {
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<Tab>("pick");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting,   setActing]   = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => setTasks(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pick tab = PENDING or PICKED tasks
  const pickTasks = tasks.filter(t => t.status === "PENDING" || t.status === "PICKED");
  // Pack tab = PICKED tasks where ALL sub-orders received (or order has no SubOrders at all)
  const packTasks = tasks.filter(t => {
    if (t.status !== "PICKED") return false;
    const subOrders = t.order.subOrders ?? [];
    // No SubOrders = old order flow → can pack immediately, skip receive step
    if (subOrders.length === 0) return true;
    const received: string[] = t.packingSlip?.items?.receivedSubOrderIds ?? [];
    return subOrders.every(s => received.includes(s.id));
  });

  const getReceived = (task: Task): string[] =>
    task.packingSlip?.items?.receivedSubOrderIds ?? [];

  const markReceived = async (task: Task, subOrderId: string) => {
    const key = `${task.id}-${subOrderId}`;
    setActing(key);
    try {
      const res = await fetch(`/api/fulfillment/${task.id}/receive-seller/${subOrderId}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
      toast.success(d.message);
      // Re-fetch to get true backend state (avoids optimistic update bugs)
      await load();
      // If all received → switch to Pack tab automatically
      if (d.data?.allReceived) {
        toast.success("📦 All seller items received — switch to Pack tab!", { duration: 4000 });
        setTab("pack");
      }
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setActing(null);
    }
  };

  const doPack = async (taskId: string) => {
    setActing(taskId);
    try {
      const res = await fetch(`/api/fulfillment/${taskId}/pack`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
      toast.success("📦 Order packed successfully!");
      await load(); // re-fetch to get correct state
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setActing(null);
    }
  };

  const displayTasks = tab === "pick" ? pickTasks : packTasks;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#7C3AED" }}>
          <FaBoxOpen className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Pick & Pack</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Receive seller shipments → confirm all arrived → pack the parcel
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: "#F5EDE3" }}>
        {(["pick", "pack"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === t ? (t === "pick" ? "#C2703A" : "#7C3AED") : "transparent",
              color:      tab === t ? "#FFF" : "#8A6650",
            }}>
            {t === "pick" ? <FaBox /> : <FaBoxOpen />}
            {t === "pick" ? "Pick" : "Pack"}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
              style={{
                background: tab === t ? "rgba(255,255,255,0.25)" : "#DDD0C4",
                color:      tab === t ? "#FFF" : "#5C4033",
              }}>
              {t === "pick" ? pickTasks.length : packTasks.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#7C3AED" }} />
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaBoxOpen className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#7C3AED" }} />
          <p style={{ color: "#8A6650" }}>
            {tab === "pick"
              ? "No orders pending pick-up."
              : "No orders ready to pack yet. Mark all seller items as received first."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {displayTasks.map((task, i) => {
              const received   = getReceived(task);
              const subOrders  = task.order.subOrders ?? [];
              const allReceived = subOrders.length === 0 ||
                (subOrders.length > 0 && subOrders.every(s => received.includes(s.id)));
              const isExpanded = expanded === task.id;
              const total      = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);

              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="medi-card overflow-hidden">

                  {/* Card header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: "linear-gradient(90deg,#7C3AED10,#FFF)", borderBottom: "1px solid #DDD0C4" }}>
                    <div>
                      <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{task.order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ background: "#7C3AED15", color: "#7C3AED" }}>
                        {received.length}/{subOrders.length} sellers received
                      </span>
                      <span className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Customer & address */}
                  <div className="px-5 py-3 flex flex-wrap gap-5"
                    style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                    <div className="flex gap-2 items-start">
                      <FaUser style={{ color: "#8A6650", fontSize: 11, marginTop: 2 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                        <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{task.order.user.name}</p>
                        <p className="text-xs" style={{ color: "#8A6650" }}>{task.order.user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <FaMapMarkerAlt style={{ color: "#C2703A", fontSize: 11, marginTop: 2 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
                        <p className="text-sm" style={{ color: "#5C4033", maxWidth: 340 }}>{task.order.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Per-seller receive status — the core of the packing page */}
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid #EEE4D9" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <FaStore style={{ color: "#1B3A5C", fontSize: 12 }} />
                      <p className="text-xs font-bold uppercase" style={{ color: "#1B3A5C" }}>
                        Seller Shipments — Mark each as Received
                      </p>
                    </div>
                    {subOrders.length === 0 ? (
                      <p className="text-xs" style={{ color: "#8A6650" }}>No sub-orders found for this order.</p>
                    ) : (
                      <div className="space-y-2">
                        {subOrders.map(sub => {
                          const isReceived = received.includes(sub.id);
                          const actKey     = `${task.id}-${sub.id}`;
                          return (
                            <div key={sub.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                              style={{
                                background: isReceived ? "#E8F5E9" : "#F5EDE3",
                                border: `1px solid ${isReceived ? "#A5D6A7" : "#DDD0C4"}`,
                              }}>
                              <div className="flex items-center gap-2">
                                <FaStore style={{ color: isReceived ? "#2E7D32" : "#8A6650", fontSize: 13 }} />
                                <div>
                                  <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{sub.seller.name}</p>
                                  <p className="text-xs" style={{ color: "#8A6650" }}>
                                    ৳{sub.total.toFixed(2)} · Status: {sub.status}
                                  </p>
                                </div>
                              </div>
                              {isReceived ? (
                                <span className="flex items-center gap-1 text-xs font-bold"
                                  style={{ color: "#2E7D32" }}>
                                  <FaCheckCircle /> Received
                                </span>
                              ) : (
                                <button onClick={() => markReceived(task, sub.id)}
                                  disabled={acting === actKey}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60 transition-all"
                                  style={{ background: "#C2703A", color: "#FFF" }}>
                                  {acting === actKey ? <FaSpinner className="animate-spin" /> : <FaShippingFast />}
                                  Mark Received
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Items toggle */}
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
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pack action footer — only shown when all received */}
                  {tab === "pick" && allReceived && task.status === "PICKED" && (
                    <div className="px-5 py-3 flex items-center justify-between gap-3"
                      style={{ borderTop: "1px solid #EEE4D9", background: "#E8F5E9" }}>
                      <p className="text-xs font-semibold" style={{ color: "#2E7D32" }}>
                        ✅ All seller items received! Ready to pack.
      </p>
                      <button onClick={() => doPack(task.id)} disabled={acting === task.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60 shadow"
                        style={{ background: "#7C3AED", color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaBoxOpen />}
                        Pack This Order
                      </button>
                    </div>
                  )}
                  {tab === "pack" && (
                    <div className="px-5 py-3 flex justify-end"
                      style={{ borderTop: "1px solid #EEE4D9", background: "#EDE7F6" }}>
                      <button onClick={() => doPack(task.id)} disabled={acting === task.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: "#7C3AED", color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaBoxOpen />}
                        Pack & Create Packing Slip
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
