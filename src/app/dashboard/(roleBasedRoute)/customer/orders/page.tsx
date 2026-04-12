"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaClipboardList, FaSearch, FaChevronRight, FaBoxOpen,
  FaTruck, FaCheckCircle, FaTimesCircle, FaClock,
} from "react-icons/fa";

interface OrderItem {
  id: string; quantity: number; price: number; status: string;
  medicine: { name: string; image?: string | null };
}
interface Order {
  id: string; status: string; address: string; createdAt: string;
  items: OrderItem[];
}

const STATUS_ICON: Record<string, any> = {
  PLACED:      <FaClock       style={{ color: "#C2703A" }} />,
  PROCESSING:  <FaBoxOpen     style={{ color: "#3A6EA5" }} />,
  SHIPPED:     <FaTruck       style={{ color: "#8A4EA5" }} />,
  DELIVERED:   <FaCheckCircle style={{ color: "#2E7D32" }} />,
  CANCELLED:   <FaTimesCircle style={{ color: "#C62828" }} />,
};
const STATUS_CLS: Record<string, string> = {
  PLACED:     "badge-pending",
  PROCESSING: "badge-confirmed",
  SHIPPED:    "badge-paused",
  DELIVERED:  "badge-instock",
  CANCELLED:  "badge-rejected",
};

export default function CustomerOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const statuses = ["ALL", "PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filtered = orders
    .filter(o => filter === "ALL" || o.status === filter)
    .filter(o =>
      !search || o.id.includes(search) ||
      o.items.some(i => i.medicine.name.toLowerCase().includes(search.toLowerCase()))
    );

  const count = (s: string) => s === "ALL" ? orders.length : orders.filter(o => o.status === s).length;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaClipboardList className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Orders</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filter === s ? "#1B3A5C" : "#F5EDE3",
              color:      filter === s ? "#FFF"    : "#5C4033",
              border: "1px solid #DDD0C4",
            }}>
            {s} ({count(s)})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-3" style={{ color: "#8A6650" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or medicine name…"
          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm"
          style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 medi-card">
          <FaClipboardList className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, i) => {
            const total = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="medi-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/customer/orders/${order.id}`)}>
                {/* Order header */}
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                  style={{ borderBottom: "1px solid #EEE4D9" }}>
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[order.status] ?? <FaClock />}
                    <div>
                      <p className="font-mono text-xs" style={{ color: "#8A6650" }}>#{order.id.slice(-10)}</p>
                      <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={STATUS_CLS[order.status] || "badge-pending"}>{order.status}</span>
                    <FaChevronRight style={{ color: "#8A6650" }} />
                  </div>
                </div>

                {/* Address */}
                <div className="px-5 py-2 text-xs" style={{ color: "#8A6650", borderBottom: "1px solid #EEE4D9" }}>
                  📍 {order.address}
                </div>

                {/* Items preview */}
                <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 4).map(it => (
                      <div key={it.id} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white"
                        style={{ background: "#EEE4D9" }}>
                        {it.medicine.image
                          ? <img src={it.medicine.image} alt={it.medicine.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-sm">💊</div>}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                        style={{ background: "#DDD0C4", color: "#5C4033" }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#5C4033" }}>
                      {order.items.map(i => i.medicine.name).join(", ").slice(0, 50)}
                      {order.items.map(i => i.medicine.name).join(", ").length > 50 ? "…" : ""}
                    </p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <p className="font-black" style={{ color: "#C2703A" }}>${total.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
