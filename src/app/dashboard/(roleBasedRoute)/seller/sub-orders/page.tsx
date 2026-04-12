"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStore, FaBoxOpen, FaTruck, FaCheckCircle, FaClipboardList,
  FaStoreAlt,
} from "react-icons/fa";

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface SubOrder {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  order: {
    id: string;
    address: string;
    createdAt: string;
    user: { name: string; email: string };
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    medicine: { id: string; name: string; price: number; image?: string };
  }>;
}

const statusIcon: Record<OrderStatus, React.ReactNode> = {
  PLACED:     <FaClipboardList />,
  PROCESSING: <FaBoxOpen />,
  SHIPPED:    <FaTruck />,
  DELIVERED:  <FaCheckCircle />,
  CANCELLED:  <FaClipboardList />,
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PLACED:     "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED:    "DELIVERED",
};

export default function SellerSubOrdersPage() {
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<OrderStatus | "ALL">("ALL");
  const [updating,  setUpdating]  = useState<string | null>(null);

  const fetchSubOrders = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/sub-orders/my", { credentials: "include" });
      const data = await res.json();
      setSubOrders(data.data || []);
    } catch { toast.error("Failed to load sub-orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubOrders(); }, []);

  const advance = async (id: string, nextStatus: OrderStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/sub-orders/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Status updated to ${nextStatus}`);
      fetchSubOrders();
    } catch { toast.error("Failed to update status"); }
    finally { setUpdating(null); }
  };

  const allStatuses: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filtered = filter === "ALL" ? subOrders : subOrders.filter(o => o.status === filter);
  const count = (s: OrderStatus | "ALL") =>
    s === "ALL" ? subOrders.length : subOrders.filter(o => o.status === s).length;

  const totalRevenue = subOrders
    .filter(o => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaStoreAlt className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Split Order Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Your portion of multi-seller customer orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Total Sub-Orders", val: subOrders.length,        color: "#1B3A5C" },
          { label: "Pending",          val: count("PLACED"),          color: "#C2703A" },
          { label: "In Transit",       val: count("SHIPPED"),         color: "#3A6EA5" },
          { label: "Revenue (Delivered)", val: `$${totalRevenue.toFixed(2)}`, color: "#2E7D32" },
        ].map(s => (
          <div key={s.label} className="medi-card p-5">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", ...allStatuses] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? "#1B3A5C" : "#F5EDE3",
              color:      filter === f ? "#FFFFFF" : "#5C4033",
              border:     "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {/* Sub-order cards */}
      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading sub-orders…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaStoreAlt className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No sub-orders found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {filtered.map((so, i) => (
              <motion.div key={so.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="medi-card overflow-hidden">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                  style={{ background: "linear-gradient(90deg, #F5EDE3 0%, #FFF 100%)", borderBottom: "1px solid #DDD0C4" }}>
                  <div>
                    <p className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                      Sub-Order #{so.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                      Parent Order: #{so.order.id.slice(-8).toUpperCase()} ·{" "}
                      {new Date(so.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge-${so.status.toLowerCase()}`}>{so.status}</span>
                    <span className="text-lg font-black" style={{ color: "#C2703A" }}>
                      ${so.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer info */}
                <div className="px-6 py-3 flex flex-wrap gap-6"
                  style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                    <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{so.order.user.name}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>{so.order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
                    <p className="text-sm" style={{ color: "#5C4033" }}>{so.order.address}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8A6650" }}>
                    Items ({so.items.length})
                  </p>
                  <div className="space-y-2">
                    {so.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.medicine.image
                          ? <img src={item.medicine.image} alt={item.medicine.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                              style={{ background: "#EEE4D9" }}>💊</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "#1B3A5C" }}>
                            {item.medicine.name}
                          </p>
                          <p className="text-xs" style={{ color: "#8A6650" }}>
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0" style={{ color: "#C2703A" }}>
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                {NEXT_STATUS[so.status] && (
                  <div className="px-6 pb-5">
                    <button
                      disabled={updating === so.id}
                      onClick={() => advance(so.id, NEXT_STATUS[so.status]!)}
                      className="medi-btn-accent flex items-center gap-2 disabled:opacity-60"
                    >
                      {statusIcon[NEXT_STATUS[so.status]!]}
                      {updating === so.id ? "Updating…" : `Mark as ${NEXT_STATUS[so.status]}`}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
