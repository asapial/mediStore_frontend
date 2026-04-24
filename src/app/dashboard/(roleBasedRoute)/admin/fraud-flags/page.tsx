"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaShieldAlt, FaExclamationTriangle, FaCheck, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";

interface FlaggedOrder {
  id: string; total: number; status: string; createdAt: string;
  user: { id: string; name: string; email: string };
  items: { quantity: number; price: number }[];
  flagReason?: string;
}

interface FlaggedUser {
  id: string; name: string; email: string; createdAt: string;
  orderCount: number; totalSpend: number; flagReason: string;
}

export default function AdminFraudFlagsPage() {
  const [flaggedOrders, setFlaggedOrders] = useState<FlaggedOrder[]>([]);
  const [flaggedUsers, setFlaggedUsers]   = useState<FlaggedUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"orders" | "users">("orders");
  const [search, setSearch]     = useState("");
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    const detectFraud = async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetch("/api/orders?limit=200", { credentials: "include" }).then(r => r.json()),
          fetch("/api/admin/users?limit=500", { credentials: "include" }).then(r => r.json()),
        ]);

        const orders: any[] = ordersRes.data || ordersRes.orders || [];
        const users: any[]  = usersRes.data || usersRes.users  || [];

        // Flag suspicious orders: high value (>$500), bulk qty (any item >50 units), very fast repeat
        const suspicious = orders.filter((o: any) => {
          const highValue   = o.total > 500;
          const bulkItems   = o.items?.some((it: any) => it.quantity > 50);
          const cancelledThenReplaced = o.status === "CANCELLED" && orders.filter((x: any) => x.user?.id === o.user?.id).length > 3;
          return highValue || bulkItems || cancelledThenReplaced;
        }).map((o: any) => ({
          ...o,
          flagReason: o.total > 500 ? "High value order (>$500)" : o.items?.some((it: any) => it.quantity > 50) ? "Bulk quantity purchase (>50 units)" : "Repeated cancellations",
        }));

        // Flag suspicious users: >10 orders in system, or account very new with high spend
        const now = Date.now();
        const suspUsers: FlaggedUser[] = users
          .map((u: any) => {
            const userOrders = orders.filter((o: any) => o.user?.id === u.id);
            const totalSpend = userOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);
            const orderCount = userOrders.length;
            const acctAgeDays = (now - new Date(u.createdAt).getTime()) / 86_400_000;
            let flagReason = "";
            if (orderCount > 10) flagReason = `Unusual order volume (${orderCount} orders)`;
            else if (acctAgeDays < 3 && totalSpend > 200) flagReason = `New account with high spend ($${totalSpend.toFixed(0)} in <3 days)`;
            return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, orderCount, totalSpend, flagReason };
          })
          .filter((u: FlaggedUser) => u.flagReason);

        setFlaggedOrders(suspicious);
        setFlaggedUsers(suspUsers);
      } catch { toast.error("Failed to analyze fraud signals"); }
      finally { setLoading(false); }
    };

    detectFraud();
  }, []);

  const markLegit = async (id: string, type: "order" | "user") => {
    setReviewing(id);
    await new Promise(r => setTimeout(r, 500));
    if (type === "order") setFlaggedOrders(prev => prev.filter(o => o.id !== id));
    else setFlaggedUsers(prev => prev.filter(u => u.id !== id));
    toast.success("Marked as legitimate — flag cleared");
    setReviewing(null);
  };

  const banUser = async (userId: string) => {
    setReviewing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: true, reason: "Flagged for fraudulent activity" }),
      });
      if (!res.ok) throw new Error("Ban failed");
      toast.success("User banned for fraud");
      setFlaggedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) { toast.error(err.message); }
    finally { setReviewing(null); }
  };

  const filtOrders = flaggedOrders.filter(o => !search || o.user.name.toLowerCase().includes(search.toLowerCase()) || o.user.email.toLowerCase().includes(search.toLowerCase()));
  const filtUsers  = flaggedUsers.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C62828" }}>
          <FaShieldAlt className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Fraud Detection</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Auto-detected suspicious orders and accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <div className="medi-card p-4 text-center">
          <p className="text-2xl font-black" style={{ color: "#C62828" }}>{flaggedOrders.length}</p>
          <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>Flagged Orders</p>
        </div>
        <div className="medi-card p-4 text-center">
          <p className="text-2xl font-black" style={{ color: "#C62828" }}>{flaggedUsers.length}</p>
          <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>Flagged Users</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl mb-6" style={{ background: "#FFF8E1", border: "1px solid #C2703A" }}>
        <FaExclamationTriangle style={{ color: "#C2703A", flexShrink: 0, marginTop: 2 }} />
        <div className="text-sm" style={{ color: "#5C4033" }}>
          <p className="font-semibold mb-1">Auto-Detection Rules</p>
          <ul className="list-disc pl-4 text-xs space-y-0.5" style={{ color: "#8A6650" }}>
            <li>Orders over <strong>$500</strong> total value</li>
            <li>Any order line with <strong>50+ units</strong> of a single medicine</li>
            <li>New accounts (registered &lt;3 days) with <strong>$200+ spend</strong></li>
            <li>Users with <strong>10+ total orders</strong> in the system</li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "orders", label: `Suspicious Orders (${flaggedOrders.length})` },
          { key: "users",  label: `Suspicious Users (${flaggedUsers.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "orders" | "users")}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition"
            style={{ background: tab === t.key ? "#C62828" : "#EEE4D9", color: tab === t.key ? "#FFF" : "#5C4033" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FaSearch className="absolute left-3 top-3 text-xs" style={{ color: "#8A6650" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#C62828" }} /></div>
      ) : tab === "orders" ? (
        filtOrders.length === 0 ? (
          <div className="medi-card text-center py-16">
            <FaCheck className="mx-auto text-3xl mb-2" style={{ color: "#2E7D32" }} />
            <p style={{ color: "#8A6650" }}>No suspicious orders detected 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtOrders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm" style={{ color: "#1B3A5C" }}>
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "#FFEBEE", color: "#C62828" }}>
                        ⚠ {order.flagReason}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      Customer: <strong style={{ color: "#5C4033" }}>{order.user.name}</strong> · {order.user.email}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                      Total: <strong style={{ color: "#C62828" }}>${order.total?.toFixed(2)}</strong>
                      &nbsp;·&nbsp;{new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => markLegit(order.id, "order")} disabled={reviewing === order.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                    style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    {reviewing === order.id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Mark Legitimate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        filtUsers.length === 0 ? (
          <div className="medi-card text-center py-16">
            <FaCheck className="mx-auto text-3xl mb-2" style={{ color: "#2E7D32" }} />
            <p style={{ color: "#8A6650" }}>No suspicious users detected 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtUsers.map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{user.name}</span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "#FFEBEE", color: "#C62828" }}>
                        ⚠ {user.flagReason}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "#8A6650" }}>
                      {user.email} · Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>
                      Orders: <strong style={{ color: "#1B3A5C" }}>{user.orderCount}</strong>
                      &nbsp;·&nbsp;Total Spend: <strong style={{ color: "#C62828" }}>${user.totalSpend.toFixed(2)}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markLegit(user.id, "user")} disabled={reviewing === user.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                      style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                      {reviewing === user.id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Legit
                    </button>
                    <button onClick={() => banUser(user.id)} disabled={reviewing === user.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                      style={{ background: "#FFEBEE", color: "#C62828" }}>
                      <FaTimes /> Ban User
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
