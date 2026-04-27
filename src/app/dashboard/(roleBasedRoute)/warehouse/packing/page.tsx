"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBoxOpen, FaBox, FaStore, FaUser, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp, FaSpinner, FaWarehouse,
  FaShippingFast, FaCheckCircle, FaTruck, FaClock,
} from "react-icons/fa";

type LegStatus     = "SELLER_PREPARING" | "AWAITING_ORIGIN_WH" | "AT_ORIGIN_WH" | "IN_TRANSIT" | "AT_DEST_WH";
type FulfillStatus = "PENDING" | "CONSOLIDATING" | "PICKED" | "PACKED" | "DISPATCHED" | "DELIVERED";

interface ShipmentLeg {
  id: string; status: LegStatus;
  stagedAt?: string | null; arrivedAtDestAt?: string | null;
  originWarehouse: { name: string; city: string };
}
interface SubOrder {
  id: string; total: number;
  seller: { id: string; name: string };
  items: { price: number; quantity: number }[];
  shipmentLeg?: ShipmentLeg;
}
interface Task {
  id: string; orderId: string; status: FulfillStatus; createdAt: string;
  order: {
    id: string; address: string;
    user: { id: string; name: string; email: string };
    items: { id: string; quantity: number; price: number; medicine: { name: string; image?: string } }[];
    subOrders: SubOrder[];
  };
  warehouse?: { id: string; name: string };
  packingSlip?: { id: string; items: any };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:       "#3A6EA5",
  CONSOLIDATING: "#C2703A",
  PICKED:        "#512DA8",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING:       "Waiting for packages to arrive",
  CONSOLIDATING: "Receiving seller packages — not all arrived yet",
  PICKED:        "All packages received — ready to pack",
};

export default function WarehousePackingPage() {
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting,   setActing]   = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/fulfillment/my-queue", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all: Task[] = d.data || [];
        setTasks(all.filter(t => ["PENDING", "CONSOLIDATING", "PICKED"].includes(t.status)));
      })
      .catch(() => toast.error("Failed to load queue"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStagingProgress = (task: Task) => {
    const received = (task.packingSlip?.items as any)?.receivedSubOrderIds as string[] ?? [];
    const total = task.order.subOrders.length;
    const done  = task.order.subOrders.filter(s => received.includes(s.id)).length;
    return { received, done, total, pct: total > 0 ? (done / total) * 100 : 0 };
  };

  const doReceive = async (task: Task, subOrderId: string) => {
    const key = `${task.id}:${subOrderId}`;
    setActing(key);
    try {
      const res = await fetch(`/api/fulfillment/${task.id}/receive-seller/${subOrderId}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
      toast.success(d.message);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(null); }
  };

  const doPack = async (taskId: string) => {
    setActing(`${taskId}:pack`);
    try {
      const res = await fetch(`/api/fulfillment/${taskId}/pack`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [] }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
      toast.success("📦 Order packed! Moving to Dispatch.");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(null); }
  };

  const count = (s: string) => s === "ALL" ? tasks.length : tasks.filter(t => t.status === s).length;
  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

  const stats = [
    { label: "Total",         val: tasks.length,       color: "#1B3A5C", icon: <FaWarehouse /> },
    { label: "Waiting",       val: count("PENDING"),       color: "#3A6EA5", icon: <FaClock /> },
    { label: "Consolidating", val: count("CONSOLIDATING"), color: "#C2703A", icon: <FaTruck /> },
    { label: "All Staged",    val: count("PICKED"),        color: "#512DA8", icon: <FaBoxOpen /> },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#7C3AED" }}>
          <FaBoxOpen className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Pick &amp; Pack</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Receive seller packages → consolidate → pack → send to dispatch
          </p>
        </div>
        <button onClick={load} className="ml-auto flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#F5EDE3", color: "#8A6650", border: "1px solid #DDD0C4" }}>
          <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
        </button>
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
        {["ALL", "PENDING", "CONSOLIDATING", "PICKED"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === f ? (f === "ALL" ? "#1B3A5C" : STATUS_COLOR[f] ?? "#1B3A5C") : "#F5EDE3",
              color: filter === f ? "#FFF" : "#5C4033",
              border: "1px solid #DDD0C4",
            }}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#7C3AED" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaBoxOpen className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#7C3AED" }} />
          <p style={{ color: "#8A6650" }}>No orders in this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((task, i) => {
              const isExpanded = expanded === task.id;
              const prog = getStagingProgress(task);
              const total = task.order.items.reduce((s, it) => s + it.price * it.quantity, 0);
              const color = STATUS_COLOR[task.status] ?? "#3A6EA5";
              const canPack = task.status === "PICKED";

              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="medi-card overflow-hidden">

                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    style={{ background: `linear-gradient(90deg,${color}10,#FFF)`, borderBottom: "1px solid #DDD0C4" }}>
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
                        style={{ background: color + "18", color }}>
                        {task.status === "PICKED" ? <FaCheckCircle /> : task.status === "CONSOLIDATING" ? <FaTruck /> : <FaClock />}
                        {task.status}
                      </span>
                      <p className="font-black text-sm" style={{ color: "#C2703A" }}>৳{total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Status hint */}
                  <div className="px-5 py-1.5 text-xs font-medium" style={{ background: color + "0D", color }}>
                    {STATUS_LABEL[task.status]}
                  </div>

                  {/* Customer */}
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

                  {/* Progress bar */}
                  <div className="px-5 py-3" style={{ borderBottom: "1px solid #EEE4D9" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold" style={{ color: prog.done === prog.total && prog.total > 0 ? "#2E7D32" : "#C2703A" }}>
                        📦 {prog.done}/{prog.total} seller packages received
                      </span>
                      <span className="text-xs" style={{ color: "#8A6650" }}>{prog.pct.toFixed(0)}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden mb-3" style={{ height: 6, background: "#EEE4D9" }}>
                      <div style={{
                        height: "100%", borderRadius: 9999,
                        width: `${prog.pct}%`,
                        background: prog.done === prog.total ? "#2E7D32" : "#C2703A",
                        transition: "width 0.4s",
                      }} />
                    </div>

                    {/* Per-seller rows */}
                    <div className="space-y-2">
                      {task.order.subOrders.map(so => {
                        const staged    = prog.received.includes(so.id);
                        const legStatus = so.shipmentLeg?.status;
                        const canStage  = !staged && legStatus === "AT_DEST_WH";
                        const inTransit = !staged && ["IN_TRANSIT", "AT_ORIGIN_WH"].includes(legStatus ?? "");
                        const busy      = acting === `${task.id}:${so.id}`;

                        return (
                          <div key={so.id} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                            style={{
                              background: staged ? "#E8F5E9" : canStage ? "#FFF8F0" : "#F5EDE3",
                              border: `1px solid ${staged ? "#A5D6A7" : canStage ? "#F5CBA7" : "#DDD0C4"}`,
                            }}>
                            <div className="flex items-center gap-2">
                              <FaStore style={{ color: staged ? "#2E7D32" : "#8A6650", fontSize: 13 }} />
                              <div>
                                <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{so.seller.name}</p>
                                {so.shipmentLeg && (
                                  <p className="text-xs" style={{ color: "#8A6650" }}>
                                    From: {so.shipmentLeg.originWarehouse.name} · {legStatus?.replace(/_/g, " ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            {staged ? (
                              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#2E7D32" }}>
                                <FaCheckCircle /> Received
                              </span>
                            ) : canStage ? (
                              <button onClick={() => doReceive(task, so.id)} disabled={busy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60"
                                style={{ background: "#C2703A", color: "#FFF" }}>
                                {busy ? <FaSpinner className="animate-spin" /> : <FaShippingFast />}
                                Mark Received
                              </button>
                            ) : inTransit ? (
                              <span className="text-xs font-medium" style={{ color: "#8A6650" }}>
                                🚚 In transit → confirm on Routing tab
                              </span>
                            ) : (
                              <span className="text-xs font-medium" style={{ color: "#8A6650" }}>
                                ⏳ {legStatus === "SELLER_PREPARING" ? "Seller preparing" : "Awaiting shipment"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items toggle */}
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase" style={{ color: "#8A6650" }}>
                        {task.order.items.length} item(s)
                      </p>
                      <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                        className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#3A6EA5" }}>
                        {isExpanded ? <><FaChevronUp />Hide</> : <><FaChevronDown />View items</>}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2 mt-2">
                          {task.order.items.map(it => (
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
                                  Qty: {it.quantity} × ৳{it.price.toFixed(2)} = <strong style={{ color: "#C2703A" }}>৳{(it.quantity * it.price).toFixed(2)}</strong>
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action footer */}
                  <div className="px-5 py-3 flex flex-wrap gap-2 justify-end"
                    style={{ borderTop: "1px solid #EEE4D9", background: canPack ? "#E8F5E9" : "#FAFAFA" }}>
                    {!canPack && (
                      <span className="text-xs font-medium self-center" style={{ color: "#8A6650" }}>
                        {task.status === "PENDING" ? "⏳ Waiting for packages to arrive at this warehouse" :
                          `⏳ Waiting for ${prog.total - prog.done} more package(s)`}
                      </span>
                    )}
                    {canPack && (
                      <button onClick={() => doPack(task.id)} disabled={acting === `${task.id}:pack`}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60 shadow"
                        style={{ background: "#7C3AED", color: "#FFF" }}>
                        {acting === `${task.id}:pack` ? <FaSpinner className="animate-spin" /> : <FaBoxOpen />}
                        🎁 Pack &amp; Create Packing Slip
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
