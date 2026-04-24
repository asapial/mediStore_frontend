"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBoxOpen, FaCheckDouble, FaTruck, FaShippingFast, FaBox,
  FaUser, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
  FaSpinner, FaWarehouse, FaClock,
} from "react-icons/fa";

type FulfillStatus = "PENDING" | "PICKED" | "PACKED" | "DISPATCHED";
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
  startedAt?: string; packedAt?: string; dispatchedAt?: string; createdAt: string;
  order: Order;
  warehouse?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  packingSlip?: { id: string };
}

const FS_COLOR: Record<FulfillStatus, string> = {
  PENDING:    "#3A6EA5",
  PICKED:     "#C2703A",
  PACKED:     "#512DA8",
  DISPATCHED: "#0EA5E9",
};
const FS_LABEL: Record<FulfillStatus, string> = {
  PENDING:    "Pending — waiting to pick",
  PICKED:     "Picking items",
  PACKED:     "Packed — ready to dispatch",
  DISPATCHED: "Dispatched to customer",
};
const FS_ICON: Record<FulfillStatus, React.ReactNode> = {
  PENDING:    <FaClock />,
  PICKED:     <FaBox />,
  PACKED:     <FaBoxOpen />,
  DISPATCHED: <FaTruck />,
};

const STEPS: { key: FulfillStatus; label: string }[] = [
  { key: "PENDING",    label: "Pending"   },
  { key: "PICKED",     label: "Picking"   },
  { key: "PACKED",     label: "Packed"    },
  { key: "DISPATCHED", label: "Dispatched"},
];

export default function WarehouseOrdersPage() {
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<FulfillStatus | "ALL" | "DELIVERED">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting,   setActing]   = useState<string | null>(null);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => setTasks(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const doAction = async (
    taskId: string,
    endpoint: string,
    successMsg: string,
    newLocalStatus?: FulfillStatus | "DELIVERED"
  ) => {
    setActing(taskId);
    try {
      const res  = await fetch(`/api/fulfillment/${taskId}/${endpoint}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");
      toast.success(successMsg);

      if (newLocalStatus === "DELIVERED") {
        // Remove from queue — order is done
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success("✅ Seller wallets credited automatically!");
      } else if (newLocalStatus) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: newLocalStatus as FulfillStatus } : t
        ));
      } else {
        fetchTasks();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setActing(null);
    }
  };

  const allStatuses: (FulfillStatus | "ALL")[] = ["ALL", "PENDING", "PICKED", "PACKED", "DISPATCHED"];
  const count = (s: FulfillStatus | "ALL") =>
    s === "ALL" ? tasks.length : tasks.filter(t => t.status === s).length;
  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

  const stats = [
    { label: "Total",      val: tasks.length,           color: "#1B3A5C", icon: <FaWarehouse  /> },
    { label: "Pending",    val: count("PENDING"),        color: "#3A6EA5", icon: <FaClock      /> },
    { label: "Packing",    val: count("PICKED") + count("PACKED"), color: "#C2703A", icon: <FaBox /> },
    { label: "Dispatched", val: count("DISPATCHED"),     color: "#0EA5E9", icon: <FaTruck      /> },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#0EA5E9" }}>
          <FaWarehouse className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Order Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Consolidate seller shipments → pack → dispatch → mark delivered
          </p>
        </div>
      </div>

      {/* Pipeline visual */}
      <div className="medi-card p-4 mb-7 flex items-center gap-0 overflow-x-auto">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-[80px]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1"
                style={{ background: FS_COLOR[step.key] }}>
                {FS_ICON[step.key]}
              </div>
              <p className="text-[10px] font-bold text-center" style={{ color: "#5C4033" }}>{step.label}</p>
              <p className="text-lg font-black" style={{ color: FS_COLOR[step.key] }}>{count(step.key)}</p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="w-8 h-0.5 flex-shrink-0" style={{ background: "#DDD0C4" }} />
            )}
          </div>
        ))}
        <div className="flex items-center flex-1 min-w-0 ml-0">
          <div className="w-8 h-0.5 flex-shrink-0" style={{ background: "#DDD0C4" }} />
          <div className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1"
              style={{ background: "#2E7D32" }}>
              <FaCheckDouble />
            </div>
            <p className="text-[10px] font-bold text-center" style={{ color: "#5C4033" }}>Delivered</p>
            <p className="text-[10px]" style={{ color: "#2E7D32" }}>Wallets credited</p>
          </div>
        </div>
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

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {allStatuses.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : FS_COLOR[f as FulfillStatus]) : "#F5EDE3",
              color: filter === f ? "#FFF" : "#5C4033",
              border: "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaWarehouse className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No orders in this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((task, i) => {
              const isExpanded = expanded === task.id;
              const total = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);
              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: `linear-gradient(90deg,${FS_COLOR[task.status]}10 0%,#FFF 100%)`, borderBottom: "1px solid #DDD0C4" }}>
                    <div>
                      <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{task.order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
                        {new Date(task.createdAt).toLocaleDateString()}
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
                        style={{ background: FS_COLOR[task.status] + "18", color: FS_COLOR[task.status] }}>
                        {FS_ICON[task.status]} {task.status}
                      </span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Status hint bar */}
                  <div className="px-5 py-1.5 text-xs font-medium"
                    style={{ background: FS_COLOR[task.status] + "0D", color: FS_COLOR[task.status] }}>
                    {FS_LABEL[task.status]}
                  </div>

                  {/* Customer + Address */}
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

                  {/* Sellers breakdown */}
                  {task.order.subOrders.length > 0 && (
                    <div className="px-5 py-2 flex flex-wrap gap-2"
                      style={{ borderBottom: "1px solid #EEE4D9", background: "#F9F6F2" }}>
                      <span className="text-xs font-semibold" style={{ color: "#8A6650" }}>Sellers:</span>
                      {task.order.subOrders.map(so => (
                        <span key={so.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "#1B3A5C15", color: "#1B3A5C" }}>
                          {so.seller.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Items toggle */}
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase" style={{ color: "#8A6650" }}>
                        {task.order.items.length} item{task.order.items.length > 1 ? "s" : ""}
                      </p>
                      <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                        className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: "#3A6EA5" }}>
                        {isExpanded ? <><FaChevronUp />Hide</> : <><FaChevronDown />View items</>}
                      </button>
                    </div>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-2">
                        {task.order.items.map(item => (
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
                                Qty: {item.quantity} × ৳{item.price.toFixed(2)} = <strong style={{ color: "#C2703A" }}>৳{(item.quantity * item.price).toFixed(2)}</strong>
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="px-5 py-3 flex flex-wrap gap-2 justify-end"
                    style={{ borderTop: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                    {task.status === "PENDING" && (
                      <button onClick={() => doAction(task.id, "pick", "Task assigned — picking started", "PICKED")}
                        disabled={acting === task.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: FS_COLOR.PICKED, color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaBox />}
                        Start Picking
                      </button>
                    )}
                    {task.status === "PICKED" && (
                      <button onClick={() => doAction(task.id, "pack", "Items packed successfully", "PACKED")}
                        disabled={acting === task.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: FS_COLOR.PACKED, color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaBoxOpen />}
                        Mark as Packed
                      </button>
                    )}
                    {task.status === "PACKED" && (
                      <button onClick={() => doAction(task.id, "dispatch", "Dispatched to customer 🚚", "DISPATCHED")}
                        disabled={acting === task.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: FS_COLOR.DISPATCHED, color: "#FFF" }}>
                        {acting === task.id ? <FaSpinner className="animate-spin" /> : <FaShippingFast />}
                        Dispatch to Customer
                      </button>
                    )}
                    {task.status === "DISPATCHED" && (
                      <button onClick={() => doAction(task.id, "deliver", "Order delivered! Wallets credited 💰", "DELIVERED")}
                        disabled={acting === task.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60 shadow"
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
