"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClipboardList, FaBox, FaTruck, FaCheckCircle,
  FaUser, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
} from "react-icons/fa";

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string; quantity: number; price: number; status: OrderStatus;
  medicine: { id: string; name: string; image?: string };
}
interface Order {
  id: string; status: OrderStatus; address: string; createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: "#3A6EA5", PROCESSING: "#C2703A", SHIPPED: "#512DA8",
  DELIVERED: "#2E7D32", CANCELLED: "#C62828",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PLACED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED",
};

export default function SellerOrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<OrderStatus | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/seller/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const statuses: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);
  const count    = (s: OrderStatus | "ALL") => s === "ALL" ? orders.length : orders.filter(o => o.status === s).length;

  // Advance order status (and reduce stock on SHIPPED)
  const advanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order.id);
    try {
      // 1. Update all item statuses
      const itemIds = order.items.map(i => i.id);
      const res = await fetch(`/api/seller/orders/${order.id}/items`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemIds: itemIds, status: next }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Status update failed");
      toast.success(`Order moved to ${next}`);

      // 2. When shipped → deduct stock from each medicine
      if (next === "SHIPPED") {
        const stockUpdates = order.items.map(item =>
          fetch(`/api/seller/medicines/${item.medicine.id}`, {
            method: "PUT", credentials: "include",
            headers: { "Content-Type": "application/json" },
            // We send a negative adjustment signal; frontend computes new in place
            body: JSON.stringify({ stockDecrement: item.quantity }),
          })
        );
        await Promise.allSettled(stockUpdates);
        toast.success("Stock adjusted for shipped items");
      }

      // 3. Update local state
      setOrders(prev => prev.map(o =>
        o.id === order.id ? {
          ...o, status: next,
          items: o.items.map(i => ({ ...i, status: next })),
        } : o
      ));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const stats = [
    { label: "Total",    val: orders.length,          color: "#1B3A5C", icon: <FaClipboardList /> },
    { label: "Pending",  val: count("PLACED") + count("PROCESSING"), color: "#C2703A", icon: <FaBox /> },
    { label: "In Transit", val: count("SHIPPED"),     color: "#512DA8", icon: <FaTruck /> },
    { label: "Delivered",  val: count("DELIVERED"),   color: "#2E7D32", icon: <FaCheckCircle /> },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaClipboardList className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Orders</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>All orders containing your medicines</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="medi-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.color + "18", color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-1 font-semibold" style={{ color: "#8A6650" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", ...statuses] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : STATUS_COLORS[f as OrderStatus]) : "#F5EDE3",
              color: filter === f ? "#FFF" : "#5C4033",
              border: "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaClipboardList className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No orders here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((order, i) => {
              const nextStatus = NEXT_STATUS[order.status];
              const isExpanded = expanded === order.id;
              const total = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: "linear-gradient(90deg,#F5EDE3 0%,#FFF 100%)", borderBottom: "1px solid #DDD0C4" }}>
                    <div>
                      <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>${total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Customer + Address */}
                  <div className="px-5 py-3 flex flex-wrap gap-6"
                    style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                    <div className="flex items-start gap-2">
                      <FaUser style={{ color: "#8A6650", marginTop: 2, fontSize: 12 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                        <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{order.user?.name || "—"}</p>
                        <p className="text-xs" style={{ color: "#8A6650" }}>{order.user?.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt style={{ color: "#C2703A", marginTop: 2, fontSize: 12 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
                        <p className="text-sm" style={{ color: "#5C4033", maxWidth: 320 }}>{order.address || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items preview + expand */}
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase" style={{ color: "#8A6650" }}>
                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                      </p>
                      <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                        className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: "#3A6EA5" }}>
                        {isExpanded ? <><FaChevronUp />Hide items</> : <><FaChevronDown />View items</>}
                      </button>
                    </div>

                    {/* Collapsed: icon strip */}
                    {!isExpanded && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 5).map(it => (
                            <div key={it.id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                              style={{ background: "#EEE4D9" }}>
                              {it.medicine.image
                                ? <img src={it.medicine.image} alt={it.medicine.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-sm">💊</div>}
                            </div>
                          ))}
                          {order.items.length > 5 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                              style={{ background: "#DDD0C4", color: "#5C4033" }}>
                              +{order.items.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: "#8A6650" }}>
                          {order.items.map(i => i.medicine.name).join(", ").slice(0, 60)}
                          {order.items.map(i => i.medicine.name).join(", ").length > 60 ? "…" : ""}
                        </span>
                      </div>
                    )}

                    {/* Expanded: full list */}
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 rounded-xl p-3"
                            style={{ background: "#F5EDE3" }}>
                            <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                              {item.medicine.image
                                ? <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center">💊</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: "#1B3A5C" }}>{item.medicine.name}</p>
                              <p className="text-xs" style={{ color: "#8A6650" }}>
                                {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                            <span className={`badge-${item.status.toLowerCase()}`} style={{ fontSize: "0.65rem" }}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Action footer */}
                  {nextStatus && (
                    <div className="px-5 py-3 flex items-center justify-between gap-3"
                      style={{ borderTop: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                      <p className="text-xs" style={{ color: "#8A6650" }}>
                        {nextStatus === "SHIPPED"
                          ? "⚠ Marking as Shipped will reduce stock for all items in this order"
                          : `Next step: mark as ${nextStatus}`}
                      </p>
                      <button onClick={() => advanceStatus(order)}
                        disabled={updating === order.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
                        style={{
                          background: STATUS_COLORS[nextStatus],
                          color: "#FFF",
                        }}>
                        {updating === order.id ? "Updating…" : (
                          <>
                            {nextStatus === "PROCESSING" && <FaBox />}
                            {nextStatus === "SHIPPED"    && <FaTruck />}
                            {nextStatus === "DELIVERED"  && <FaCheckCircle />}
                            Mark as {nextStatus}
                          </>
                        )}
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
