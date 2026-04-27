"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTruck, FaSpinner, FaWarehouse, FaUser, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp, FaCheckCircle, FaClock,
  FaShippingFast, FaArrowRight,
} from "react-icons/fa";

type LegStatus =
  | "SELLER_PREPARING" | "AWAITING_ORIGIN_WH"
  | "AT_ORIGIN_WH" | "IN_TRANSIT" | "AT_DEST_WH";

interface Warehouse { id: string; name: string; city: string; }
interface ShipmentLeg {
  id: string; orderId: string; status: LegStatus;
  arrivedAtOriginAt?: string; dispatchedAt?: string; arrivedAtDestAt?: string; createdAt: string;
  originWarehouseId: string; destWarehouseId: string;
  subOrder: {
    id: string; total: number;
    seller: { name: string; email: string };
    items: Array<{ quantity: number; medicine: { name: string; image?: string } }>;
  };
  order: { id: string; address: string; user: { name: string; email: string } };
  originWarehouse: Warehouse;
  destWarehouse: Warehouse;
}

const STATUS_COLOR: Record<LegStatus, string> = {
  SELLER_PREPARING:   "#8A6650",
  AWAITING_ORIGIN_WH: "#C2703A",
  AT_ORIGIN_WH:       "#3A6EA5",
  IN_TRANSIT:         "#7C3AED",
  AT_DEST_WH:         "#2E7D32",
};
const STATUS_LABEL: Record<LegStatus, string> = {
  SELLER_PREPARING:   "Seller is preparing the shipment",
  AWAITING_ORIGIN_WH: "Awaiting receipt at origin warehouse",
  AT_ORIGIN_WH:       "Received at origin — ready to dispatch onward",
  IN_TRANSIT:         "In transit to destination warehouse",
  AT_DEST_WH:         "Arrived at destination — ready for fulfillment",
};

const TABS = [
  { key: "all",      label: "All",               statuses: [] as LegStatus[] },
  { key: "incoming", label: "Incoming",           statuses: ["AWAITING_ORIGIN_WH"] as LegStatus[] },
  { key: "ready",    label: "Ready to Dispatch",  statuses: ["AT_ORIGIN_WH"] as LegStatus[] },
  { key: "transit",  label: "In Transit",         statuses: ["IN_TRANSIT"] as LegStatus[] },
  { key: "arrived",  label: "Arrived",            statuses: ["AT_DEST_WH"] as LegStatus[] },
] as const;

export default function WarehouseRoutingPage() {
  const [legs,          setLegs]          = useState<ShipmentLeg[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState("all");
  const [acting,        setActing]        = useState<string | null>(null);
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [myWarehouseIds,setMyWarehouseIds]= useState<string[]>([]);

  const fetchLegs = useCallback(() => {
    setLoading(true);
    fetch("/api/shipment-legs/mine", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const data: ShipmentLeg[] = d.data || [];
        setLegs(data);
        const ids = new Set<string>();
        data.forEach(l => { ids.add(l.originWarehouse.id); ids.add(l.destWarehouse.id); });
        fetch("/api/profile/me", { credentials: "include" })
          .then(r => r.json())
          .then(p => {
            const managedId = p.data?.managedWarehouses?.[0]?.id;
            if (managedId) setMyWarehouseIds([managedId]);
            else setMyWarehouseIds(Array.from(ids));
          })
          .catch(() => setMyWarehouseIds(Array.from(ids)));
      })
      .catch(() => toast.error("Failed to load routing data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLegs(); }, [fetchLegs]);

  const act = async (legId: string, endpoint: string, msg: string) => {
    setActing(legId);
    try {
      const res = await fetch(`/api/shipment-legs/${legId}/${endpoint}`, {
        method: "PATCH", credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Action failed");
      toast.success(msg);
      fetchLegs();
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(null); }
  };

  const tabStatuses = TABS.find(t => t.key === activeTab)?.statuses ?? [];
  const filtered    = tabStatuses.length ? legs.filter(l => (tabStatuses as string[]).includes(l.status)) : legs;
  const isMyWH      = (id: string) => myWarehouseIds.length === 0 || myWarehouseIds.includes(id);
  const asOrigin    = filtered.filter(l => isMyWH(l.originWarehouse.id));
  const asDest      = filtered.filter(l => isMyWH(l.destWarehouse.id) && !isMyWH(l.originWarehouse.id));
  const tabCount    = (statuses: readonly LegStatus[]) =>
    statuses.length ? legs.filter(l => (statuses as string[]).includes(l.status)).length : legs.length;

  const stats = [
    { label: "Awaiting Receipt", val: legs.filter(l => l.status === "AWAITING_ORIGIN_WH").length, color: "#C2703A" },
    { label: "At Origin WH",     val: legs.filter(l => l.status === "AT_ORIGIN_WH").length,       color: "#3A6EA5" },
    { label: "In Transit",       val: legs.filter(l => l.status === "IN_TRANSIT").length,          color: "#7C3AED" },
    { label: "Arrived",          val: legs.filter(l => l.status === "AT_DEST_WH").length,          color: "#2E7D32" },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#3A6EA5" }}>
          <FaTruck className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Shipment Routing</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Receive from sellers · dispatch between warehouses · confirm arrivals
          </p>
        </div>
        <button onClick={fetchLegs} className="ml-auto flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#F5EDE3", color: "#8A6650", border: "1px solid #DDD0C4" }}>
          <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="medi-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.color + "18", color: s.color }}><FaTruck /></div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-1 font-semibold" style={{ color: "#8A6650" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => {
          const n      = tabCount(tab.statuses);
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
              style={{
                background: active ? "#1B3A5C" : "#F5EDE3",
                color: active ? "#FFF" : "#5C4033",
                border: "1px solid #DDD0C4",
              }}>
              {tab.label}
              {n > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
                  style={{ background: active ? "rgba(255,255,255,0.25)" : "#DDD0C4", color: active ? "#FFF" : "#5C4033" }}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="text-3xl animate-spin" style={{ color: "#3A6EA5" }} />
        </div>
      ) : asOrigin.length === 0 && asDest.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaWarehouse className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No shipment legs match this filter.</p>
        </div>
      ) : (
        <>
          {asOrigin.length > 0 && (
            <Section title="🏭 This Warehouse as ORIGIN" subtitle="Items arriving from sellers — confirm receipt then dispatch onward">
              {asOrigin.map((leg, i) => (
                <LegCard key={leg.id} leg={leg} index={i} isOrigin={true}
                  acting={acting} expanded={expanded} onExpand={setExpanded} onAct={act} />
              ))}
            </Section>
          )}
          {asDest.length > 0 && (
            <Section title="📥 This Warehouse as DESTINATION" subtitle="Items in transit from other warehouses — confirm arrival to start fulfillment">
              {asDest.map((leg, i) => (
                <LegCard key={leg.id} leg={leg} index={i} isOrigin={false}
                  acting={acting} expanded={expanded} onExpand={setExpanded} onAct={act} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{title}</h2>
        <p className="text-xs" style={{ color: "#8A6650" }}>{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function LegCard({ leg, index, isOrigin, acting, expanded, onExpand, onAct }: {
  leg: ShipmentLeg; index: number; isOrigin: boolean;
  acting: string | null; expanded: string | null;
  onExpand: (id: string | null) => void;
  onAct: (id: string, endpoint: string, msg: string) => void;
}) {
  const sameWH     = leg.originWarehouseId === leg.destWarehouseId;
  const color      = STATUS_COLOR[leg.status];
  const busy       = acting === leg.id;
  const isExpanded = expanded === leg.id;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }} className="medi-card overflow-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
        style={{ background: `linear-gradient(90deg,${color}10,#FFF)`, borderBottom: "1px solid #DDD0C4" }}>
        <div>
          <span className="font-black text-sm" style={{ color: "#1B3A5C" }}>
            Order #{leg.orderId.slice(-8).toUpperCase()}
          </span>
          <span className="text-xs ml-3" style={{ color: "#8A6650" }}>
            {new Date(leg.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {sameWH && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "#C2703A18", color: "#C2703A", border: "1px solid #C2703A33" }}>
              🏬 Same Warehouse
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{ background: color + "18", color }}>
            {leg.status === "AT_DEST_WH" ? <FaCheckCircle /> : leg.status === "IN_TRANSIT" ? <FaTruck /> : <FaClock />}
            {leg.status.replace(/_/g, " ")}
          </span>
          <p className="font-black text-sm" style={{ color: "#C2703A" }}>৳{leg.subOrder.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Status hint */}
      <div className="px-5 py-1.5 text-xs font-medium" style={{ background: color + "0D", color }}>
        {sameWH && leg.status === "AWAITING_ORIGIN_WH"
          ? "Same warehouse — receive from seller to send directly to Pick & Pack"
          : sameWH && leg.status === "AT_DEST_WH"
          ? "Received from seller — forwarded to Pick & Pack queue"
          : STATUS_LABEL[leg.status]}
      </div>

      {/* Route */}
      <div className="px-5 py-3 flex items-center gap-3 flex-wrap"
        style={{ borderBottom: "1px solid #EEE4D9", background: "#FAFAFA" }}>
        {sameWH ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#C2703A18" }}>
              <FaWarehouse style={{ color: "#C2703A", fontSize: 14 }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "#C2703A" }}>Same Warehouse — No Transit</p>
              <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{leg.originWarehouse.name}</p>
              <p className="text-xs" style={{ color: "#8A6650" }}>{leg.originWarehouse.city} · Seller ships → Receive → Pack &amp; Pack</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-[120px]">
              <p className="text-xs font-bold uppercase" style={{ color: "#3A6EA5" }}>Origin</p>
              <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{leg.originWarehouse.name}</p>
              <p className="text-xs" style={{ color: "#8A6650" }}>{leg.originWarehouse.city}</p>
            </div>
            <FaArrowRight style={{ color: "#DDD0C4", fontSize: 20, flexShrink: 0 }} />
            <div className="flex-1 min-w-[120px]">
              <p className="text-xs font-bold uppercase" style={{ color: "#2E7D32" }}>Destination</p>
              <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{leg.destWarehouse.name}</p>
              <p className="text-xs" style={{ color: "#8A6650" }}>{leg.destWarehouse.city}</p>
            </div>
          </>
        )}

        {/* Timeline chips */}
        <div className="flex flex-wrap gap-2 ml-auto">
          {leg.arrivedAtOriginAt && (
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#3A6EA518", color: "#3A6EA5", border: "1px solid #3A6EA530" }}>
              📥 Received {new Date(leg.arrivedAtOriginAt).toLocaleDateString()}
            </span>
          )}
          {!sameWH && leg.dispatchedAt && (
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#7C3AED18", color: "#7C3AED", border: "1px solid #7C3AED30" }}>
              🚚 Sent {new Date(leg.dispatchedAt).toLocaleDateString()}
            </span>
          )}
          {leg.arrivedAtDestAt && (
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#2E7D3218", color: "#2E7D32", border: "1px solid #2E7D3230" }}>
              ✅ {sameWH ? "Sent to Pick & Pack" : "Arrived"} {new Date(leg.arrivedAtDestAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Customer + Seller */}
      <div className="px-5 py-3 flex flex-wrap gap-6"
        style={{ borderBottom: "1px solid #EEE4D9", background: "#F9F6F2" }}>
        <div className="flex items-start gap-2">
          <FaUser style={{ color: "#8A6650", marginTop: 2, fontSize: 12 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Customer</p>
            <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{leg.order.user.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <FaShippingFast style={{ color: "#C2703A", marginTop: 2, fontSize: 12 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Seller</p>
            <p className="text-sm font-bold" style={{ color: "#1B3A5C" }}>{leg.subOrder.seller.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <FaMapMarkerAlt style={{ color: "#C2703A", marginTop: 2, fontSize: 12 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#8A6650" }}>Delivery Address</p>
            <p className="text-sm" style={{ color: "#5C4033", maxWidth: 300 }}>{leg.order.address}</p>
          </div>
        </div>
      </div>

      {/* Items toggle */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase" style={{ color: "#8A6650" }}>
            {leg.subOrder.items.length} item(s)
          </p>
          <button onClick={() => onExpand(isExpanded ? null : leg.id)}
            className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#3A6EA5" }}>
            {isExpanded ? <><FaChevronUp />Hide</> : <><FaChevronDown />View items</>}
          </button>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2 mt-2">
              {leg.subOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#F5EDE3" }}>
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                    {item.medicine.image
                      ? <img src={item.medicine.image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">💊</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{item.medicine.name}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 flex flex-wrap gap-2 justify-end"
        style={{ borderTop: "1px solid #EEE4D9", background: "#FAFAFA" }}>

        {/* ── SAME-WAREHOUSE FLOW ── */}
        {sameWH && leg.status === "AWAITING_ORIGIN_WH" && (
          <ActionBtn busy={busy} color="#C2703A"
            onClick={() => onAct(leg.id, "receive-at-origin", "✅ Received from seller — forwarded to Pick & Pack!")}>
            <FaCheckCircle /> Receive from Seller → Pick &amp; Pack
          </ActionBtn>
        )}
        {sameWH && leg.status === "AT_DEST_WH" && (
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
            style={{ background: "#C2703A15", color: "#C2703A", border: "1px solid #C2703A33" }}>
            <FaCheckCircle /> Forwarded to Pick &amp; Pack
          </span>
        )}

        {/* ── MULTI-WAREHOUSE FLOW ── */}
        {!sameWH && leg.status === "AWAITING_ORIGIN_WH" && isOrigin && (
          <ActionBtn busy={busy} color="#3A6EA5"
            onClick={() => onAct(leg.id, "receive-at-origin", "✅ Items received at origin warehouse")}>
            <FaCheckCircle /> Confirm Receipt from Seller
          </ActionBtn>
        )}
        {!sameWH && leg.status === "AT_ORIGIN_WH" && isOrigin && (
          <ActionBtn busy={busy} color="#7C3AED"
            onClick={() => onAct(leg.id, "dispatch", `🚚 Dispatched to ${leg.destWarehouse.name}`)}>
            <FaTruck /> Dispatch to {leg.destWarehouse.name}
          </ActionBtn>
        )}
        {!sameWH && (leg.status === "IN_TRANSIT" || leg.status === "AT_ORIGIN_WH") && !isOrigin && (
          <ActionBtn busy={busy} color="#2E7D32"
            onClick={() => onAct(leg.id, "receive-at-dest", "📥 Arrival confirmed — added to fulfillment queue")}>
            <FaCheckCircle /> Confirm Arrival
          </ActionBtn>
        )}
        {!sameWH && leg.status === "AT_DEST_WH" && (
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
            style={{ background: "#2E7D3215", color: "#2E7D32", border: "1px solid #2E7D3230" }}>
            <FaCheckCircle /> Arrived — In Pick &amp; Pack Queue
          </span>
        )}
        {leg.status === "SELLER_PREPARING" && (
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
            style={{ background: "#8A665015", color: "#8A6650", border: "1px solid #DDD0C4" }}>
            <FaClock /> Waiting for seller to ship…
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ActionBtn({ children, onClick, color, busy }: { children: React.ReactNode; onClick: () => void; color: string; busy: boolean }) {
  return (
    <button onClick={onClick} disabled={busy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
      style={{ background: color, color: "#FFF" }}>
      {busy ? <FaSpinner className="animate-spin" /> : children}
    </button>
  );
}
