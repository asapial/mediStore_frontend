"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTruck, FaCheckCircle, FaBox, FaStore, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp, FaSpinner, FaClipboardList,
} from "react-icons/fa";

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Medicine { id: string; name: string; image?: string; price: number; }
interface OrderItem { id: string; quantity: number; price: number; medicine: Medicine; }
interface SubOrder {
  id: string; sellerId: string; status: OrderStatus; total: number;
  seller: { name: string; email: string };
  items: Array<{ id: string; quantity: number; price: number; medicine: Medicine }>;
}
interface Order {
  id: string; status: OrderStatus; address: string; createdAt: string;
  items: OrderItem[];
  subOrders: SubOrder[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: "#3A6EA5", PROCESSING: "#C2703A", SHIPPED: "#512DA8",
  DELIVERED: "#2E7D32", CANCELLED: "#C62828",
};

const STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "PLACED",     label: "Order Placed",    icon: <FaClipboardList /> },
  { key: "PROCESSING", label: "Consolidating",   icon: <FaBox />           },
  { key: "SHIPPED",    label: "On the Way",      icon: <FaTruck />         },
  { key: "DELIVERED",  label: "Delivered",        icon: <FaCheckCircle />  },
];

function TrackingBar({ status }: { status: OrderStatus }) {
  const stepIndex = STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 my-5 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done    = i <= stepIndex;
        const current = i === stepIndex;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-[80px]">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? "text-white shadow-lg" : "text-gray-400"
              }`} style={{
                background: done ? STATUS_COLORS[step.key] : "#EEE4D9",
                transform:  current ? "scale(1.2)" : "scale(1)",
              }}>
                {step.icon}
              </div>
              <p className="text-[9px] font-bold mt-1 text-center whitespace-nowrap"
                style={{ color: done ? STATUS_COLORS[step.key] : "#AAA" }}>
                {step.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 mx-1 rounded transition-all"
                style={{ background: i < stepIndex ? STATUS_COLORS[STEPS[i + 1].key] : "#DDD0C4" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerTrackingPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders/", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(o =>
    ["PLACED", "PROCESSING", "SHIPPED"].includes(o.status)
  );
  const doneOrders = orders.filter(o =>
    ["DELIVERED", "CANCELLED"].includes(o.status)
  );

  if (loading) return (
    <div className="medi-page flex justify-center py-20">
      <FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} />
    </div>
  );

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaTruck className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Order Tracking</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Track your orders from placement to delivery
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 medi-card">
          <FaTruck className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No orders to track yet.</p>
        </div>
      ) : (
        <>
          {/* Active orders */}
          {activeOrders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#C2703A" }}>
                🟠 Active Orders ({activeOrders.length})
              </h2>
              <div className="space-y-4">
                {activeOrders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i}
                    expanded={expanded} setExpanded={setExpanded} />
                ))}
              </div>
            </div>
          )}

          {/* Completed / cancelled */}
          {doneOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#8A6650" }}>
                Past Orders ({doneOrders.length})
              </h2>
              <div className="space-y-4">
                {doneOrders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i}
                    expanded={expanded} setExpanded={setExpanded} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({
  order, index, expanded, setExpanded,
}: {
  order: Order; index: number;
  expanded: string | null; setExpanded: (id: string | null) => void;
}) {
  const isExpanded = expanded === order.id;
  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} className="medi-card overflow-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
        style={{ background: `linear-gradient(90deg,${STATUS_COLORS[order.status]}12 0%,#FFF 100%)`, borderBottom: "1px solid #DDD0C4" }}>
        <div>
          <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
            Order #{order.id.slice(-8).toUpperCase()}
          </span>
          <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: STATUS_COLORS[order.status] + "18", color: STATUS_COLORS[order.status] }}>
            {order.status}
          </span>
          <span className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Tracking bar */}
      {order.status !== "CANCELLED" && (
        <div className="px-5">
          <TrackingBar status={order.status} />
        </div>
      )}

      {/* Address */}
      <div className="px-5 py-2 flex items-center gap-2"
        style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
        <FaMapMarkerAlt style={{ color: "#C2703A", fontSize: 12, flexShrink: 0 }} />
        <p className="text-sm" style={{ color: "#5C4033" }}>{order.address}</p>
      </div>

      {/* Sub-orders from each seller */}
      {order.subOrders && order.subOrders.length > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: "1px solid #EEE4D9" }}>
          <p className="text-xs font-bold uppercase mb-2" style={{ color: "#8A6650" }}>
            <FaStore style={{ display: "inline", marginRight: 4 }} />
            Seller Breakdown
          </p>
          <div className="space-y-2">
            {order.subOrders.map(sub => (
              <div key={sub.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: "#F5EDE3" }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#1B3A5C" }}>{sub.seller.name}</p>
                  <p className="text-[11px]" style={{ color: "#8A6650" }}>
                    {sub.items.length} item{sub.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: STATUS_COLORS[sub.status] + "18", color: STATUS_COLORS[sub.status] }}>
                    {sub.status}
                  </span>
                  <p className="text-xs font-bold mt-0.5" style={{ color: "#C2703A" }}>৳{sub.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle items */}
      <div className="px-5 py-3">
        <button onClick={() => setExpanded(isExpanded ? null : order.id)}
          className="flex items-center gap-1 text-xs font-semibold mb-2"
          style={{ color: "#3A6EA5" }}>
          {isExpanded ? <><FaChevronUp />Hide items</> : <><FaChevronDown />View all items ({order.items.length})</>}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "#F5EDE3" }}>
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                    {item.medicine.image
                      ? <img src={item.medicine.image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">💊</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{item.medicine.name}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      {item.quantity} × ৳{item.price.toFixed(2)} = <strong style={{ color: "#C2703A" }}>৳{(item.quantity * item.price).toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
