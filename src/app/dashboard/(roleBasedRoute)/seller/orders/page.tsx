"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClipboardList, FaBox, FaTruck, FaCheckCircle,
  FaUser, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
  FaSpinner, FaWarehouse, FaSitemap, FaPhone, FaEnvelope,
} from "react-icons/fa";

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type LegStatus = "SELLER_PREPARING" | "AWAITING_ORIGIN_WH" | "AT_ORIGIN_WH" | "IN_TRANSIT" | "AT_DEST_WH";

interface Medicine { id: string; name: string; image?: string; }
interface OrderItem { id: string; quantity: number; price: number; status: string; medicine: Medicine; subOrderId?: string; }
interface WarehouseInfo {
  id: string; name: string; address: string; city: string; country: string; phone?: string;
  manager: { name: string; email: string };
}
interface ShipmentLegInfo {
  id: string; status: LegStatus;
  arrivedAtOriginAt?: string; dispatchedAt?: string; arrivedAtDestAt?: string;
  destWarehouse?: { id: string; name: string; city: string };
}
interface SubOrder {
  id: string; status: OrderStatus; total: number;
  items: Array<{ id: string; quantity: number; price: number; medicine: Medicine }>;
  originWarehouse?: WarehouseInfo | null;  // where SELLER ships their items to
  shipmentLeg?: ShipmentLegInfo | null;    // live tracking leg
}
interface FulfillmentTaskInfo { id: string; status: string; warehouse: WarehouseInfo; }
interface SellerOrder {
  id: string; status: OrderStatus; address: string; createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
  subOrders: SubOrder[];
  fulfillmentTask?: FulfillmentTaskInfo | null;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: "#3A6EA5", PROCESSING: "#C2703A", SHIPPED: "#512DA8",
  DELIVERED: "#2E7D32", CANCELLED: "#C62828",
};
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PLACED: "PROCESSING", PROCESSING: "SHIPPED",
};
const STATUS_HINT: Partial<Record<OrderStatus, string>> = {
  PLACED:     "Review the order and confirm you can fulfill it",
  PROCESSING: "Pack items — your nearest warehouse is shown below",
  SHIPPED:    "✅ Items sent to warehouse — tracking your shipment leg",
  DELIVERED:  "✅ Delivered! Earnings credited to your wallet.",
  CANCELLED:  "This order has been cancelled.",
};

const LEG_STATUS_LABELS: Record<LegStatus, string> = {
  SELLER_PREPARING:   "📦 Preparing",
  AWAITING_ORIGIN_WH: "🚚 En route to origin WH",
  AT_ORIGIN_WH:       "🏭 At origin warehouse",
  IN_TRANSIT:         "✈️ In transit to dest WH",
  AT_DEST_WH:         "✅ Arrived — consolidating",
};

export default function SellerOrdersPage() {
  const [orders,   setOrders]   = useState<SellerOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<OrderStatus | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/seller/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Determine effective status per order ────────────────────────────────────
  // If the order has a SubOrder for this seller, use SubOrder.status
  // Otherwise use the order-level status
  const getEffectiveStatus = (order: SellerOrder): OrderStatus => {
    const subs = order.subOrders ?? [];
    if (subs.length > 0) return subs[0].status;
    return order.status;
  };

  // ── Advance status ──────────────────────────────────────────────────────────
  const advanceStatus = async (order: SellerOrder) => {
    const currentStatus = getEffectiveStatus(order);
    const nextStatus    = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    const key = order.id;
    setUpdating(key);

    try {
      let res: Response;

      if ((order.subOrders ?? []).length > 0) {
        // ── NEW FLOW: Update via SubOrder endpoint ──────────────────────────
        const subOrderId = order.subOrders[0].id;
        res = await fetch(`/api/sub-orders/${subOrderId}/status`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
      } else {
        // ── OLD FLOW: Update via legacy OrderItem endpoint ──────────────────
        const myItemIds = order.items.map(i => i.id);
        res = await fetch("/api/seller/orders", {
          method: "PUT", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, orderItemIds: myItemIds, status: nextStatus }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const msg = nextStatus === "SHIPPED"
        ? "📦 Items marked as Shipped to warehouse — warehouse will consolidate & deliver!"
        : `Order moved to ${nextStatus}`;
      toast.success(msg);

      // Optimistically update local state
      setOrders(prev => prev.map(o => {
        if (o.id !== order.id) return o;
        if ((o.subOrders ?? []).length > 0) {
          return { ...o, subOrders: [{ ...o.subOrders[0], status: nextStatus }] };
        }
        return { ...o, status: nextStatus };
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const statuses: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const count = (s: OrderStatus | "ALL") =>
    s === "ALL" ? orders.length
      : orders.filter(o => getEffectiveStatus(o) === s).length;
  const filtered = filter === "ALL"
    ? orders
    : orders.filter(o => getEffectiveStatus(o) === filter);

  const stats = [
    { label: "Total",       val: orders.length,            color: "#1B3A5C", icon: <FaClipboardList /> },
    { label: "Processing",  val: count("PLACED") + count("PROCESSING"), color: "#C2703A", icon: <FaBox /> },
    { label: "At Warehouse",val: count("SHIPPED"),          color: "#512DA8", icon: <FaWarehouse />    },
    { label: "Delivered",   val: count("DELIVERED"),        color: "#2E7D32", icon: <FaCheckCircle />  },
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
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Process orders → ship to warehouse → earnings credited on delivery
          </p>
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

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", ...statuses] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : STATUS_COLORS[f as OrderStatus]) : "#F5EDE3",
              color:      filter === f ? "#FFF" : "#5C4033",
              border:     "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#C2703A" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaClipboardList className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No orders in this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((order, i) => {
              const effectiveStatus = getEffectiveStatus(order);
              const nextStatus      = NEXT_STATUS[effectiveStatus];
              const isExpanded      = expanded === order.id;
              const hasSubOrder     = (order.subOrders ?? []).length > 0;
              const sub             = hasSubOrder ? order.subOrders[0] : null;
              const total           = sub
                ? sub.total
                : order.items.reduce((s, it) => s + it.price * it.quantity, 0);

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: `linear-gradient(90deg,${STATUS_COLORS[effectiveStatus]}10,#FFF)`, borderBottom: "1px solid #DDD0C4" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      {hasSubOrder && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "#1B3A5C10", color: "#1B3A5C" }}>
                          <FaSitemap style={{ fontSize: 9 }} /> Sub-Order
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "#8A6650" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: STATUS_COLORS[effectiveStatus] + "18", color: STATUS_COLORS[effectiveStatus] }}>
                        {effectiveStatus}
                      </span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="px-5 py-3 flex flex-wrap gap-6"
                    style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
                    <div className="flex items-start gap-2">
                      <FaUser style={{ color: "#8A6650", fontSize: 11, marginTop: 2 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
                        <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{order.user.name}</p>
                        <p className="text-xs" style={{ color: "#8A6650" }}>{order.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt style={{ color: "#C2703A", fontSize: 11, marginTop: 2 }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
                        <p className="text-sm" style={{ color: "#5C4033", maxWidth: 340 }}>{order.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status hint */}
                  {STATUS_HINT[effectiveStatus] && (
                    <div className="px-5 py-2 text-xs"
                      style={{ background: STATUS_COLORS[effectiveStatus] + "0D", color: STATUS_COLORS[effectiveStatus] }}>
                      {STATUS_HINT[effectiveStatus]}
                    </div>
                  )}

                  {/* Items */}
                  <div className="px-5 py-3">
                    <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="flex items-center gap-1 text-xs font-semibold mb-2"
                      style={{ color: "#3A6EA5" }}>
                      {isExpanded ? <><FaChevronUp />Hide items</> : <><FaChevronDown />View {order.items.length} item(s)</>}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
                          {order.items.map(it => (
                            <div key={it.id} className="flex items-center gap-3 rounded-xl p-3"
                              style={{ background: "#F5EDE3" }}>
                              <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                                {it.medicine.image
                                  ? <img src={it.medicine.image} alt="" className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center">💊</div>}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{it.medicine.name}</p>
                                <p className="text-xs" style={{ color: "#8A6650" }}>
                                  {it.quantity} × ৳{it.price.toFixed(2)} = <strong style={{ color: "#C2703A" }}>৳{(it.quantity * it.price).toFixed(2)}</strong>
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action footer */}
                  {nextStatus ? (
                    <div className="px-5 py-3 flex flex-col gap-3"
                      style={{ borderTop: "1px solid #EEE4D9", background: "#FAFAFA" }}>

                      {/* Origin warehouse — where seller must ship items to */}
                      {effectiveStatus === "PROCESSING" && sub?.originWarehouse && (
                        <div className="rounded-xl p-4 space-y-2"
                          style={{ background: "#EDE7F6", border: "1px solid #D1C4E9" }}>
                          <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: "#512DA8" }}>
                            📦 Ship Your Items To (Origin Warehouse)
                          </p>
                          <div className="flex items-start gap-2">
                            <FaWarehouse style={{ color: "#512DA8", fontSize: 12, marginTop: 2 }} />
                            <div>
                              <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{sub.originWarehouse.name}</p>
                              <p className="text-xs" style={{ color: "#5C4033" }}>
                                {sub.originWarehouse.address}, {sub.originWarehouse.city}, {sub.originWarehouse.country}
                              </p>
                              {sub.originWarehouse.phone && (
                                <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#512DA8" }}>
                                  <FaPhone style={{ fontSize: 10 }} /> {sub.originWarehouse.phone}
                                </p>
                              )}
                              <p className="text-xs mt-1" style={{ color: "#8A6650" }}>
                                Manager: <strong>{sub.originWarehouse.manager.name}</strong>
                                &nbsp;({sub.originWarehouse.manager.email})
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs" style={{ color: "#8A6650" }}>
                          {nextStatus === "SHIPPED"
                            ? "⚠ Confirm you've physically sent items to the origin warehouse above"
                            : `Ready to advance to: ${nextStatus}`}
                        </p>
                        <button onClick={() => advanceStatus(order)}
                          disabled={updating === order.id}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60 shadow-sm transition-all"
                          style={{ background: STATUS_COLORS[nextStatus], color: "#FFF" }}>
                          {updating === order.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            nextStatus === "PROCESSING" ? <FaBox /> : <FaTruck />
                          )}
                          Mark as {nextStatus}
                        </button>
                      </div>
                    </div>
                  ) : effectiveStatus === "SHIPPED" ? (
                    <div className="px-5 py-4 space-y-3"
                      style={{ borderTop: "1px solid #EEE4D9", background: "#EDE7F6" }}>
                      <div className="flex items-center gap-2">
                        <FaWarehouse style={{ color: "#512DA8" }} />
                        <p className="text-xs font-semibold" style={{ color: "#512DA8" }}>
                          Items in transit — tracking shipment leg
                        </p>
                      </div>

                      {/* Shipment leg status */}
                      {sub?.shipmentLeg && (
                        <div className="rounded-xl p-3 text-xs font-semibold flex items-center justify-between"
                          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #D1C4E9", color: "#512DA8" }}>
                          <span>{LEG_STATUS_LABELS[sub.shipmentLeg.status]}</span>
                          {sub.shipmentLeg.destWarehouse && (
                            <span style={{ color: "#8A6650", fontWeight: 400 }}>
                              → {sub.shipmentLeg.destWarehouse.name}, {sub.shipmentLeg.destWarehouse.city}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Origin WH summary */}
                      {sub?.originWarehouse && (
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #D1C4E9" }}>
                          <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: "#512DA8" }}>
                            📦 Shipped to Origin WH
                          </p>
                          <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{sub.originWarehouse.name}</p>
                          <p className="text-xs" style={{ color: "#5C4033" }}>
                            {sub.originWarehouse.address}, {sub.originWarehouse.city}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : effectiveStatus === "DELIVERED" ? (
                    <div className="px-5 py-3 flex items-center gap-2"
                      style={{ borderTop: "1px solid #EEE4D9", background: "#E8F5E9" }}>
                      <FaCheckCircle style={{ color: "#2E7D32" }} />
                      <p className="text-xs font-semibold" style={{ color: "#2E7D32" }}>
                        Delivered! ৳{total.toFixed(2)} credited to your wallet.
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
