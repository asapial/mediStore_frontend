"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaTruck, FaCheckDouble, FaSpinner, FaMapMarkerAlt,
  FaUser, FaStore, FaBox,
} from "react-icons/fa";

type FulfillStatus = "PENDING" | "PICKED" | "PACKED" | "DISPATCHED" | "DELIVERED";
type OrderStatus   = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Medicine  { id: string; name: string; image?: string; }
interface OrderItem { id: string; quantity: number; price: number; medicine: Medicine; }
interface SubOrder  { id: string; status: OrderStatus; total: number; seller: { id: string; name: string }; }
interface Task {
  id: string; orderId: string; status: FulfillStatus;
  createdAt: string; dispatchedAt?: string;
  order: {
    id: string; address: string; status: OrderStatus;
    user: { id: string; name: string; email: string };
    items: OrderItem[];
    subOrders: SubOrder[];
  };
  warehouse?: { id: string; name: string };
}

export default function WarehouseDispatchPage() {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all: Task[] = d.data || [];
        // Show only DISPATCHED tasks on this page
        setTasks(all.filter(t => t.status === "DISPATCHED"));
      })
      .catch(() => toast.error("Failed to load dispatched orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markDelivered = async (taskId: string) => {
    setActing(taskId);
    try {
      const res = await fetch(`/api/fulfillment/${taskId}/deliver`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("✅ Delivered! Seller wallets credited automatically.");
      await load(); // re-fetch so DELIVERED tasks are filtered out
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(null); }
  };

  const totalItems = tasks.reduce((s, t) => s + t.order.items.length, 0);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
          <FaTruck className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Dispatch & Delivery</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Orders en route to customers — confirm when delivered
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-7">
        {[
          { label: "Out for Delivery", val: tasks.length,  color: "#0EA5E9", icon: <FaTruck /> },
          { label: "Total Items",      val: totalItems,    color: "#7C3AED", icon: <FaBox />  },
          { label: "Total Value",      val: `৳${tasks.reduce((s, t) => s + t.order.items.reduce((ss, it) => ss + it.price * it.quantity, 0), 0).toFixed(2)}`, color: "#C2703A", icon: <FaCheckDouble /> },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-1 font-semibold" style={{ color: "#8A6650" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
        style={{ background: "#0EA5E910", color: "#0EA5E9", border: "1px solid #0EA5E930" }}>
        <FaTruck />
        <span>
          Clicking <strong>"Mark Delivered"</strong> confirms customer receipt and automatically credits each seller's wallet.
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#0EA5E9" }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaTruck className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#0EA5E9" }} />
          <p style={{ color: "#8A6650" }}>No orders currently out for delivery.</p>
          <p className="text-xs mt-1" style={{ color: "#AAA" }}>
            Dispatch orders from the Pick &amp; Pack page to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, i) => {
            const total = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="medi-card overflow-hidden">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                  style={{ background: "linear-gradient(90deg,#0EA5E910,#FFF)", borderBottom: "1px solid #DDD0C4" }}>
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
                      Dispatched {task.dispatchedAt ? new Date(task.dispatchedAt).toLocaleDateString() : new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ background: "#0EA5E918", color: "#0EA5E9" }}>
                      <FaTruck /> DISPATCHED
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

                {/* Items */}
                <div className="px-5 py-3" style={{ borderBottom: "1px solid #EEE4D9" }}>
                  <p className="text-xs font-bold uppercase mb-2" style={{ color: "#8A6650" }}>
                    Items in parcel
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.order.items.map(it => (
                      <span key={it.id} className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5"
                        style={{ background: "#F5EDE3", color: "#5C4033" }}>
                        {it.medicine.image && (
                          <img src={it.medicine.image} alt="" className="w-4 h-4 rounded object-cover" />
                        )}
                        {it.medicine.name} × {it.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sellers */}
                {task.order.subOrders.length > 0 && (
                  <div className="px-5 py-3" style={{ borderBottom: "1px solid #EEE4D9", background: "#F9F6F2" }}>
                    <p className="text-xs font-bold uppercase mb-2" style={{ color: "#8A6650" }}>
                      <FaStore style={{ display: "inline", marginRight: 4 }} />Sellers in this order
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {task.order.subOrders.map(sub => (
                        <span key={sub.id} className="text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                          style={{ background: "#1B3A5C10", color: "#1B3A5C" }}>
                          <FaStore style={{ fontSize: 10 }} />
                          {sub.seller.name}
                          <span style={{ color: "#C2703A", fontWeight: "bold" }}>৳{sub.total.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mark delivered */}
                <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
                  style={{ background: "#F0FFF4" }}>
                  <p className="text-xs" style={{ color: "#2E7D32" }}>
                    💡 Confirm customer received the package to credit seller wallets
                  </p>
                  <button onClick={() => markDelivered(task.id)} disabled={acting === task.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 shadow transition-all"
                    style={{ background: "#2E7D32", color: "#FFF" }}>
                    {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaCheckDouble />}
                    Mark Customer Received
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
