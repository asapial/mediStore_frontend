"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaClipboardList, FaBox, FaTruck, FaCheckCircle } from "react-icons/fa";

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  medicine: { id: string; name: string; image?: string };
}
interface Order {
  id: string;
  status: OrderStatus;
  address: string;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

const statusColors: Record<OrderStatus, string> = {
  PLACED: "#3A6EA5", PROCESSING: "#C2703A", SHIPPED: "#512DA8",
  DELIVERED: "#2E7D32", CANCELLED: "#C62828",
};

export default function SellerOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    fetch("/api/seller/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const statuses: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);
  console.log("Order from seller :",filtered);
  const count = (s: OrderStatus | "ALL") =>
    s === "ALL" ? orders.length : orders.filter(o => o.status === s).length;

  const stats = [
    { label: "Total Orders",  val: orders.length,                         color: "#1B3A5C", icon: <FaClipboardList /> },
    { label: "Pending",       val: count("PLACED") + count("PROCESSING"), color: "#C2703A", icon: <FaBox /> },
    { label: "In Transit",    val: count("SHIPPED"),                       color: "#512DA8", icon: <FaTruck /> },
    { label: "Delivered",     val: count("DELIVERED"),                     color: "#2E7D32", icon: <FaCheckCircle /> },
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
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : statusColors[f as OrderStatus]) : "#F5EDE3",
              color:      filter === f ? "#FFFFFF" : "#5C4033",
              border:     "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {/* Orders */}
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
            {filtered.map((order, i) => (

              <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                  style={{ background: "linear-gradient(90deg, #F5EDE3 0%, #FFF 100%)", borderBottom: "1px solid #DDD0C4" }}>
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
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "#8A6650" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>
                        ${order.items.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer + Address */}
                {/* <div className="px-5 py-3 flex flex-wrap gap-6"
                  style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                    <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{order.user.name}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>{order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
                    <p className="text-sm" style={{ color: "#5C4033" }}>{order.address}</p>
                  </div>
                </div> */}

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.medicine.image
                          ? <img src={item.medicine.image} alt={item.medicine.name}
                              className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                              style={{ background: "#EEE4D9" }}>💊</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "#1B3A5C" }}>
                            {item.medicine.name}
                          </p>
                          <p className="text-xs" style={{ color: "#8A6650" }}>
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0" style={{ color: "#C2703A" }}>
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
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
