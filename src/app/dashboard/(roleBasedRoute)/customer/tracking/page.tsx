"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTruck, FaCheckCircle, FaSpinner, FaWarehouse,
  FaStore, FaBox, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
  FaShippingFast, FaBoxOpen, FaClock, FaSync, FaClipboardList,
} from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus   = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type LegStatus     = "SELLER_PREPARING" | "AWAITING_ORIGIN_WH" | "AT_ORIGIN_WH" | "IN_TRANSIT" | "AT_DEST_WH";
type FulfillStatus = "PENDING" | "READY" | "PICKED" | "PACKED" | "DISPATCHED" | "DELIVERED";

interface SellerInfo { id: string; name: string; email: string; }
interface MedicineInfo { id: string; name: string; image?: string; }
interface OrderItem { id: string; quantity: number; price: number; medicine: MedicineInfo; }
interface WHInfo { id: string; name: string; city: string; }
interface ShipmentLeg {
  id: string;
  status: LegStatus;
  arrivedAtOriginAt?: string;
  dispatchedAt?: string;
  arrivedAtDestAt?: string;
  originWarehouse: WHInfo;
  destWarehouse: WHInfo;
}
interface SubOrder {
  id: string;
  status: OrderStatus;
  total: number;
  seller: SellerInfo;
  items: Array<{ id: string; quantity: number; price: number; medicine: MedicineInfo }>;
  shipmentLeg?: ShipmentLeg | null;
}
interface FulfillmentTask {
  id: string;
  status: FulfillStatus;
  startedAt?: string;
  packedAt?: string;
  dispatchedAt?: string;
  warehouse: WHInfo;
}
interface Order {
  id: string;
  status: OrderStatus;
  address: string;
  createdAt: string;
  items: OrderItem[];
  subOrders: SubOrder[];
  fulfillmentTask?: FulfillmentTask | null;
}

// ─── Journey step derivation ───────────────────────────────────────────────────
// Maps the live data into a linear list of journey milestones per SubOrder
interface JourneyStep {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  color: string;
  done: boolean;
  active: boolean;
  timestamp?: string;
}

function deriveJourney(order: Order, sub: SubOrder): JourneyStep[] {
  const leg = sub.shipmentLeg;
  const ft  = order.fulfillmentTask;
  const legStep = (s: LegStatus) => leg?.status === s;

  const done  = (cond: boolean) => cond;
  const isStatus = (...ss: OrderStatus[]) => (ss as string[]).includes(sub.status);

  const steps: JourneyStep[] = [
    {
      label: "Order Placed",
      sublabel: "Waiting for seller confirmation",
      icon: <FaClipboardList />,
      color: "#3A6EA5",
      done: true,
      active: sub.status === "PLACED",
      timestamp: order.createdAt,
    },
    {
      label: "Seller Processing",
      sublabel: `${sub.seller.name} reviewing order`,
      icon: <FaStore />,
      color: "#C2703A",
      done: done(["PROCESSING","SHIPPED","DELIVERED","CANCELLED"].some(s => (sub.status as string) === s || (sub.status as string) > "PLACED")),
      active: sub.status === "PROCESSING",
    },
    {
      label: "Seller Shipped",
      sublabel: leg ? `Headed to ${leg.originWarehouse.name}, ${leg.originWarehouse.city}` : "Headed to origin warehouse",
      icon: <FaShippingFast />,
      color: "#8B5CF6",
      done: done(leg ? leg.status !== "SELLER_PREPARING" : sub.status === "SHIPPED" || sub.status === "DELIVERED"),
      active: leg?.status === "AWAITING_ORIGIN_WH",
      timestamp: undefined,
    },
    {
      label: "At Origin Warehouse",
      sublabel: leg ? `Received at ${leg.originWarehouse.name}` : "At origin warehouse",
      icon: <FaWarehouse />,
      color: "#3B82F6",
      done: done(leg ? ["AT_ORIGIN_WH","IN_TRANSIT","AT_DEST_WH"].includes(leg.status) : false),
      active: leg?.status === "AT_ORIGIN_WH",
      timestamp: leg?.arrivedAtOriginAt,
    },
    {
      label: "In Transit",
      sublabel: leg ? `${leg.originWarehouse.city} → ${leg.destWarehouse.city}` : "Inter-warehouse transfer",
      icon: <FaTruck />,
      color: "#F59E0B",
      done: done(leg ? ["IN_TRANSIT","AT_DEST_WH"].includes(leg.status) : false),
      active: leg?.status === "IN_TRANSIT",
      timestamp: leg?.dispatchedAt,
    },
    {
      label: "At Destination Warehouse",
      sublabel: leg ? `Arrived at ${leg.destWarehouse.name}` : "Consolidating with other sellers",
      icon: <FaBoxOpen />,
      color: "#10B981",
      done: done(leg ? leg.status === "AT_DEST_WH" : false),
      active: leg?.status === "AT_DEST_WH" && ft?.status === "PENDING",
      timestamp: leg?.arrivedAtDestAt,
    },
    {
      label: "Packing",
      sublabel: ft ? `Packed at ${ft.warehouse.name}` : "Consolidating all seller items",
      icon: <FaBox />,
      color: "#512DA8",
      done: done(ft ? ["PICKED","PACKED","DISPATCHED","DELIVERED"].includes(ft.status) : false),
      active: ft ? ["PICKED","PACKED"].includes(ft.status) : false,
      timestamp: ft?.startedAt,
    },
    {
      label: "Out for Delivery",
      sublabel: "Package dispatched to your address",
      icon: <FaShippingFast />,
      color: "#0EA5E9",
      done: done(ft ? ["DISPATCHED","DELIVERED"].includes(ft.status) : order.status === "DELIVERED"),
      active: ft?.status === "DISPATCHED",
      timestamp: ft?.dispatchedAt,
    },
    {
      label: "Delivered",
      sublabel: "Package received successfully!",
      icon: <FaCheckCircle />,
      color: "#2E7D32",
      done: done(order.status === "DELIVERED"),
      active: false,
    },
  ];

  return steps;
}

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PLACED:     "#3A6EA5",
  PROCESSING: "#C2703A",
  SHIPPED:    "#8B5CF6",
  DELIVERED:  "#2E7D32",
  CANCELLED:  "#EF4444",
};

export default function CustomerTrackingPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subOpen,  setSubOpen]  = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/orders/my", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Compute overall progress for an order
  const overallProgress = (order: Order): number => {
    if (order.status === "DELIVERED") return 100;
    if (order.status === "CANCELLED") return 0;
    const ft = order.fulfillmentTask;
    if (ft?.status === "DISPATCHED") return 87;
    if (ft?.status === "PACKED")     return 75;
    if (ft?.status === "PICKED")     return 62;
    const legs = order.subOrders.map(s => s.shipmentLeg).filter(Boolean);
    if (legs.every(l => l?.status === "AT_DEST_WH")) return 55;
    if (legs.some(l => l?.status === "IN_TRANSIT"))   return 42;
    if (legs.some(l => l?.status === "AT_ORIGIN_WH")) return 30;
    if (legs.some(l => l?.status === "AWAITING_ORIGIN_WH")) return 20;
    if (order.status === "SHIPPED")    return 15;
    if (order.status === "PROCESSING") return 8;
    return 3;
  };

  const activeOrders   = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const completedOrders = orders.filter(o => o.status === "DELIVERED");

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C2703A, #8B5CF6)" }}>
            <FaTruck className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Order Tracking</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>
              Real-time journey: Seller → Warehouses → Your Door
            </p>
          </div>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "#C2703A15", color: "#C2703A", border: "1px solid #C2703A30" }}>
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Total Orders",  val: orders.length,           color: "#1B3A5C" },
          { label: "In Progress",   val: activeOrders.length,     color: "#C2703A" },
          { label: "Delivered",     val: completedOrders.length,  color: "#2E7D32" },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="text-4xl animate-spin" style={{ color: "#C2703A" }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="medi-card text-center py-20">
          <FaTruck className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No orders yet. Start shopping!</p>
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {orders.map((order, oi) => {
              const isOpen    = expanded === order.id;
              const progress  = overallProgress(order);
              const ft        = order.fulfillmentTask;
              const colour    = ORDER_STATUS_COLOR[order.status];
              const totalSpent = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

              return (
                <motion.div key={order.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: oi * 0.04 }}
                  className="medi-card overflow-hidden">

                  {/* Header */}
                  <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3"
                    style={{
                      background: `linear-gradient(90deg,${colour}08,#FFF)`,
                      borderBottom: "1px solid #DDD0C4",
                    }}>
                    <div>
                      <p className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-BD", {
                          day: "numeric", month: "long", year: "numeric"
                        })} · {order.subOrders.length} seller{order.subOrders.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: colour + "18", color: colour }}>
                        {order.status}
                      </span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>
                        ৳{totalSpent.toFixed(2)}
                      </p>
                      <button onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: "#F5EDE3", color: "#5C4033" }}>
                        {isOpen ? <><FaChevronUp />Hide</> : <><FaChevronDown />Track</>}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {order.status !== "CANCELLED" && (
                    <div className="px-5 py-3" style={{ borderBottom: "1px solid #EEE4D9" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Journey Progress</p>
                        <p className="text-xs font-black" style={{ color: colour }}>{progress}%</p>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${colour},${colour}bb)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: oi * 0.05 }}
                        />
                      </div>
                      {/* Milestone labels */}
                      <div className="flex justify-between mt-1">
                        {["Placed","Processing","Shipped","At WH","Packed","Delivered"].map((m, mi) => (
                          <span key={m} className="text-[8px] font-semibold"
                            style={{ color: progress >= mi * 20 ? colour : "#DDD0C4" }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery address */}
                  <div className="px-5 py-2.5 flex items-start gap-2"
                    style={{ background: "#FAFAFA", borderBottom: "1px solid #EEE4D9" }}>
                    <FaMapMarkerAlt style={{ color: "#C2703A", fontSize: 12, marginTop: 2 }} />
                    <p className="text-xs" style={{ color: "#5C4033" }}>{order.address}</p>
                  </div>

                  {/* Destination warehouse pill */}
                  {ft && (
                    <div className="px-5 py-2 flex items-center gap-2"
                      style={{ borderBottom: "1px solid #EEE4D9", background: "#10B98108" }}>
                      <FaWarehouse style={{ color: "#10B981", fontSize: 11 }} />
                      <p className="text-xs font-semibold" style={{ color: "#10B981" }}>
                        Your nearest warehouse:{" "}
                        <strong>{ft.warehouse.name}</strong>, {ft.warehouse.city}
                        {" "}· Fulfillment:{" "}
                        <span className="font-black">{ft.status}</span>
                      </p>
                    </div>
                  )}

                  {/* Expanded: per-seller journey */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden">

                        {order.subOrders.map((sub, si) => {
                          const journey = deriveJourney(order, sub);
                          const isSubOpen = subOpen === sub.id;
                          const currentStep = journey.findLastIndex(s => s.done) + 1;

                          return (
                            <div key={sub.id}
                              style={{ borderBottom: si < order.subOrders.length - 1 ? "1px solid #EEE4D9" : undefined }}>

                              {/* Sub-order header */}
                              <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2"
                                style={{ background: "#F9F6F2" }}>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: "#C2703A18", color: "#C2703A" }}>
                                    <FaStore style={{ fontSize: 11 }} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black" style={{ color: "#C2703A" }}>
                                      {sub.seller.name}
                                    </p>
                                    <p className="text-[10px]" style={{ color: "#8A6650" }}>
                                      {sub.items.length} item(s) · ৳{sub.total.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: ORDER_STATUS_COLOR[sub.status] + "18",
                                      color:      ORDER_STATUS_COLOR[sub.status],
                                    }}>
                                    {sub.status}
                                  </span>
                                  <button onClick={() => setSubOpen(isSubOpen ? null : sub.id)}
                                    className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                    style={{ background: "#EEE4D9", color: "#5C4033" }}>
                                    {isSubOpen ? "▲" : "▼"} Journey
                                  </button>
                                </div>
                              </div>

                              {/* Journey timeline */}
                              <AnimatePresence>
                                {isSubOpen && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="px-6 py-4">
                                      <div className="relative">
                                        {/* Vertical line */}
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5"
                                          style={{ background: "#EEE4D9" }} />

                                        <div className="space-y-4">
                                          {journey.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-4 relative">
                                              {/* Icon dot */}
                                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${step.active ? "ring-4" : ""}`}
                                                style={{
                                                  background: step.done ? step.color : step.active ? step.color + "30" : "#F5EDE3",
                                                  color:      step.done ? "#FFF"       : step.active ? step.color          : "#C5B0A0",
                                                  ringColor:  step.color + "40",
                                                  boxShadow:  step.active ? `0 0 0 4px ${step.color}30` : undefined,
                                                }}>
                                                <span style={{ fontSize: 12 }}>{step.icon}</span>
                                              </div>

                                              {/* Content */}
                                              <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                  <p className={`text-sm font-bold`}
                                                    style={{
                                                      color: step.done   ? step.color :
                                                             step.active ? step.color : "#C5B0A0",
                                                    }}>
                                                    {step.label}
                                                  </p>
                                                  {step.active && (
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse"
                                                      style={{ background: step.color + "20", color: step.color }}>
                                                      CURRENT
                                                    </span>
                                                  )}
                                                </div>
                                                {step.sublabel && (
                                                  <p className="text-xs mt-0.5"
                                                    style={{ color: step.done || step.active ? "#8A6650" : "#C5B0A0" }}>
                                                    {step.sublabel}
                                                  </p>
                                                )}
                                                {step.timestamp && (
                                                  <p className="text-[10px] mt-0.5 font-semibold"
                                                    style={{ color: step.color }}>
                                                    {new Date(step.timestamp).toLocaleString()}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Warehouse route summary */}
                                      {sub.shipmentLeg && (
                                        <div className="mt-5 rounded-xl p-3 flex items-center gap-2 flex-wrap text-xs"
                                          style={{ background: "#EDE7F6", border: "1px solid #D1C4E9" }}>
                                          <FaStore style={{ color: "#8B5CF6", fontSize: 11 }} />
                                          <span style={{ color: "#5C4033" }}>
                                            <strong>{sub.seller.name}</strong>
                                          </span>
                                          <span style={{ color: "#8A6650" }}>→</span>
                                          <FaWarehouse style={{ color: "#3B82F6", fontSize: 11 }} />
                                          <span style={{ color: "#5C4033" }}>
                                            {sub.shipmentLeg.originWarehouse.name},{" "}
                                            {sub.shipmentLeg.originWarehouse.city}
                                          </span>
                                          <span style={{ color: "#8A6650" }}>→</span>
                                          <FaWarehouse style={{ color: "#10B981", fontSize: 11 }} />
                                          <span style={{ color: "#5C4033" }}>
                                            {sub.shipmentLeg.destWarehouse.name},{" "}
                                            {sub.shipmentLeg.destWarehouse.city}
                                          </span>
                                          <span style={{ color: "#8A6650" }}>→</span>
                                          <FaMapMarkerAlt style={{ color: "#C2703A", fontSize: 11 }} />
                                          <span style={{ color: "#5C4033" }}>Your address</span>
                                        </div>
                                      )}

                                      {/* Items in this sub-order */}
                                      <div className="mt-4 space-y-2">
                                        <p className="text-xs font-black uppercase tracking-widest mb-2"
                                          style={{ color: "#8A6650" }}>Items from {sub.seller.name}</p>
                                        {sub.items.map(item => (
                                          <div key={item.id}
                                            className="flex items-center gap-3 rounded-xl p-2.5"
                                            style={{ background: "#F5EDE3" }}>
                                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                                              style={{ background: "#EEE4D9" }}>
                                              {item.medicine.image
                                                ? <img src={item.medicine.image} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-sm">💊</div>}
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-xs font-semibold" style={{ color: "#1B3A5C" }}>
                                                {item.medicine.name}
                                              </p>
                                              <p className="text-[10px]" style={{ color: "#8A6650" }}>
                                                {item.quantity} × ৳{item.price.toFixed(2)} ={" "}
                                                <strong style={{ color: "#C2703A" }}>
                                                  ৳{(item.quantity * item.price).toFixed(2)}
                                                </strong>
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}

                        {/* Delivered banner */}
                        {order.status === "DELIVERED" && (
                          <div className="px-5 py-4 flex items-center gap-3"
                            style={{ background: "#E8F5E9", borderTop: "1px solid #C8E6C9" }}>
                            <FaCheckCircle style={{ color: "#2E7D32", fontSize: 20 }} />
                            <div>
                              <p className="font-bold text-sm" style={{ color: "#2E7D32" }}>
                                🎉 Order Delivered!
                              </p>
                              <p className="text-xs" style={{ color: "#4CAF50" }}>
                                All sellers have been paid. Thank you for shopping!
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Cancelled banner */}
                        {order.status === "CANCELLED" && (
                          <div className="px-5 py-4 flex items-center gap-3"
                            style={{ background: "#FFEBEE", borderTop: "1px solid #FFCDD2" }}>
                            <FaClock style={{ color: "#EF4444", fontSize: 18 }} />
                            <p className="text-xs font-semibold" style={{ color: "#EF4444" }}>
                              This order was cancelled.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
