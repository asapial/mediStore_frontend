"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaTruck, FaCheckCircle, FaBoxOpen, FaMapMarkerAlt, FaClipboardList } from "react-icons/fa";

type TrackingStatus = "PLACED" | "CONFIRMED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
interface TrackingEvent { id: string; status: TrackingStatus; note?: string; createdAt: string; }

const STEPS: TrackingStatus[] = ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const stepIcons: Record<TrackingStatus, React.ReactNode> = {
  PLACED:           <FaClipboardList />,
  CONFIRMED:        <FaCheckCircle />,
  SHIPPED:          <FaTruck />,
  OUT_FOR_DELIVERY: <FaMapMarkerAlt />,
  DELIVERED:        <FaBoxOpen />,
  CANCELLED:        <FaClipboardList />,
};
const stepColors: Record<TrackingStatus, string> = {
  PLACED: "#3A6EA5", CONFIRMED: "#1B3A5C", SHIPPED: "#C2703A",
  OUT_FOR_DELIVERY: "#C2703A", DELIVERED: "#2E7D32", CANCELLED: "#C62828",
};

export default function OrderTrackingPage() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [events,   setEvents]   = useState<TrackingEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    fetch("/api/orders/my", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOrders(d.data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const loadTracking = async (orderId: string) => {
    setSelected(orderId);
    setTrackLoading(true);
    try {
      const res  = await fetch(`/api/notifications/tracking/${orderId}`, { credentials: "include" });
      const data = await res.json();
      setEvents(data.data || []);
    } catch { toast.error("Failed to load tracking"); }
    finally { setTrackLoading(false); }
  };

  const currentStep = events.length
    ? STEPS.indexOf(events[events.length - 1].status as any)
    : -1;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaTruck className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Order Tracking</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Real-time updates on your deliveries</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-bold" style={{ color: "#1B3A5C" }}>Select Order</h2>
          {loading ? (
            <p style={{ color: "#8A6650" }}>Loading orders…</p>
          ) : orders.length === 0 ? (
            <p style={{ color: "#8A6650" }}>No orders found.</p>
          ) : orders.map(order => (
            <button key={order.id} onClick={() => loadTracking(order.id)}
              className="w-full text-left rounded-xl px-4 py-3 transition-all"
              style={{
                background: selected === order.id ? "rgba(27,58,92,0.08)" : "#FFF",
                border: selected === order.id ? "2px solid #1B3A5C" : "1px solid #DDD0C4",
              }}>
              <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length ?? 0} items
              </p>
              <span className={`badge-${order.status.toLowerCase()}`} style={{ marginTop: 6, display: "inline-block" }}>
                {order.status}
              </span>
            </button>
          ))}
        </div>

        {/* Tracking panel */}
        <div className="lg:col-span-2 medi-card p-6">
          {!selected ? (
            <div className="text-center py-16">
              <FaTruck className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
              <p style={{ color: "#8A6650" }}>Select an order to view tracking</p>
            </div>
          ) : trackLoading ? (
            <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading tracking…</p>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center mb-8 overflow-x-auto pb-2">
                {STEPS.map((step, idx) => {
                  const done    = idx <= currentStep;
                  const current = idx === currentStep;
                  return (
                    <div key={step} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all"
                          style={{
                            background: done ? stepColors[step] : "#EEE4D9",
                            color: done ? "#FFF" : "#8A6650",
                            boxShadow: current ? `0 0 0 4px ${stepColors[step]}33` : "none",
                          }}>
                          {stepIcons[step]}
                        </div>
                        <span className="text-[10px] text-center whitespace-nowrap"
                          style={{ color: done ? stepColors[step] : "#8A6650", fontWeight: done ? 700 : 400 }}>
                          {step.replace(/_/g, " ")}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 mx-1" style={{ background: idx < currentStep ? "#2E7D32" : "#DDD0C4" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Events */}
              {events.length === 0 ? (
                <p className="text-center py-8" style={{ color: "#8A6650" }}>No tracking events yet for this order.</p>
              ) : (
                <div className="space-y-4">
                  {[...events].reverse().map((ev, i) => (
                    <motion.div key={ev.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: stepColors[ev.status] + "22", color: stepColors[ev.status] }}>
                        {stepIcons[ev.status]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>
                          {ev.status.replace(/_/g, " ")}
                        </p>
                        {ev.note && <p className="text-sm" style={{ color: "#5C4033" }}>{ev.note}</p>}
                        <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                          {new Date(ev.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
