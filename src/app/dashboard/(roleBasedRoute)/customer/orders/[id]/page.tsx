"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaClipboardList, FaArrowLeft, FaMapMarkerAlt, FaCalendar,
  FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaClock,
  FaReceipt, FaTrash,
} from "react-icons/fa";

interface OrderItem {
  id: string; medicineId: string; quantity: number; price: number; status: string;
  medicine: { name: string; description: string; price: number; image: string | null; manufacturer?: string };
}
interface Order {
  id: string; status: string; address: string; createdAt: string;
  items: OrderItem[];
}

const STATUS_STEPS = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STATUS_ICON: Record<string, any> = {
  PLACED:     <FaClock       style={{ color: "#C2703A" }} />,
  PROCESSING: <FaBoxOpen     style={{ color: "#3A6EA5" }} />,
  SHIPPED:    <FaTruck       style={{ color: "#8A4EA5" }} />,
  DELIVERED:  <FaCheckCircle style={{ color: "#2E7D32" }} />,
  CANCELLED:  <FaTimesCircle style={{ color: "#C62828" }} />,
};

export default function OrderDetailsPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [order,  setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.data) setOrder(d.data); else toast.error(d.message); })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!order || !confirm("Cancel this order? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/orders/${order.id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Order cancelled");
      router.push("/dashboard/customer/orders");
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="medi-page flex items-center justify-center"><p style={{ color: "#8A6650" }}>Loading…</p></div>;
  if (!order)  return <div className="medi-page text-center py-20"><p style={{ color: "#8A6650" }}>Order not found.</p></div>;

  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="medi-page">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/dashboard/customer/orders")}
          className="p-2 rounded-xl" style={{ background: "#F5EDE3", color: "#5C4033" }}>
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaReceipt className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Order Details</h1>
            <p className="text-xs font-mono" style={{ color: "#8A6650" }}>#{order.id}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {STATUS_ICON[order.status]}
          <span className={`badge-${order.status === "DELIVERED" ? "instock" : order.status === "CANCELLED" ? "rejected" : order.status === "PLACED" ? "pending" : "confirmed"}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== "CANCELLED" && (
        <div className="medi-card p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#8A6650" }}>Order Progress</p>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: i <= stepIdx ? "#2E7D32" : "#EEE4D9",
                      color: i <= stepIdx ? "#FFF" : "#8A6650",
                    }}>
                    {i < stepIdx ? "✓" : i + 1}
                  </div>
                  <p className="text-xs mt-1 text-center w-16 leading-tight" style={{ color: i <= stepIdx ? "#2E7D32" : "#8A6650" }}>
                    {step}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1" style={{ background: i < stepIdx ? "#2E7D32" : "#EEE4D9" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="medi-card overflow-hidden">
            <div className="px-5 py-4 font-bold" style={{ borderBottom: "1px solid #EEE4D9", color: "#1B3A5C" }}>
              Items ({order.items.length})
            </div>
            {order.items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < order.items.length - 1 ? "1px solid #EEE4D9" : "none" }}>
                {/* Image */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                  {item.medicine.image
                    ? <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{item.medicine.name}</p>
                  {item.medicine.manufacturer && (
                    <p className="text-xs" style={{ color: "#8A6650" }}>{item.medicine.manufacturer}</p>
                  )}
                  {item.medicine.description && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#8A6650" }}>{item.medicine.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: "#8A6650" }}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </span>
                    <span className={`badge-${item.status === "DELIVERED" ? "instock" : item.status === "CANCELLED" ? "rejected" : "pending"}`}
                      style={{ fontSize: "0.65rem" }}>
                      {item.status}
                    </span>
                  </div>
                </div>
                {/* Subtotal */}
                <p className="font-black flex-shrink-0" style={{ color: "#C2703A" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Order info */}
          <div className="medi-card p-5 space-y-3">
            <p className="font-bold" style={{ color: "#1B3A5C" }}>Order Information</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FaCalendar className="flex-shrink-0 mt-0.5" style={{ color: "#8A6650" }} />
                <div>
                  <p style={{ color: "#8A6650" }}>Order Date</p>
                  <p className="font-semibold" style={{ color: "#5C4033" }}>
                    {new Date(order.createdAt).toLocaleString("en-BD")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="flex-shrink-0 mt-0.5" style={{ color: "#C2703A" }} />
                <div>
                  <p style={{ color: "#8A6650" }}>Delivery Address</p>
                  <p className="font-semibold" style={{ color: "#5C4033" }}>{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="medi-card p-5 space-y-3">
            <p className="font-bold" style={{ color: "#1B3A5C" }}>Payment Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#8A6650" }}>Subtotal</span>
                <span style={{ color: "#5C4033" }}>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#8A6650" }}>Delivery</span>
                <span style={{ color: "#2E7D32" }}>Free</span>
              </div>
              <div className="flex justify-between font-black text-base pt-1 border-t" style={{ borderColor: "#DDD0C4" }}>
                <span style={{ color: "#1B3A5C" }}>Total</span>
                <span style={{ color: "#C2703A" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cancel button */}
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <button onClick={handleDelete} disabled={deleting}
              className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #C62828" }}>
              <FaTrash /> {deleting ? "Cancelling…" : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
