"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaCheck, FaCheckDouble, FaShoppingCart, FaBoxOpen, FaSync, FaExclamationCircle } from "react-icons/fa";

type NotifType = "ORDER_UPDATE" | "LOW_STOCK" | "SUBSCRIPTION_REFILL" | "SYSTEM" | "RETURN_UPDATE";
interface Notification {
  id: string; type: NotifType; title: string; body: string; isRead: boolean; createdAt: string;
}

const notifIcon: Record<NotifType, React.ReactNode> = {
  ORDER_UPDATE:        <FaShoppingCart />,
  LOW_STOCK:           <FaExclamationCircle />,
  SUBSCRIPTION_REFILL: <FaSync />,
  SYSTEM:              <FaBell />,
  RETURN_UPDATE:       <FaBoxOpen />,
};
const notifColor: Record<NotifType, string> = {
  ORDER_UPDATE:        "#3A6EA5",
  LOW_STOCK:           "#C62828",
  SUBSCRIPTION_REFILL: "#2E7D32",
  SYSTEM:              "#1B3A5C",
  RETURN_UPDATE:       "#C2703A",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [unreadOnly,    setUnreadOnly]    = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`/api/notifications?unread=${unreadOnly}`, { credentials: "include" }),
        fetch("/api/notifications/unread-count", { credentials: "include" }),
      ]);
      const notifData = await notifRes.json();
      const countData = await countRes.json();
      setNotifications(notifData.data || []);
      setUnreadCount(countData.data || 0);
    } catch { toast.error("Failed to load notifications"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, [unreadOnly]);

  const markRead = async (id?: string) => {
    try {
      const url = id ? `/api/notifications/${id}/read` : "/api/notifications/read-all";
      await fetch(url, { method: "PATCH", credentials: "include" });
      toast.success(id ? "Marked as read" : "All marked as read");
      fetchNotifs();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center relative" style={{ background: "#1B3A5C" }}>
            <FaBell className="text-white text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                style={{ background: "#C62828" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Notifications</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>{unreadCount} unread</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5C4033" }}>
            <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} className="accent-[#1B3A5C]" />
            Unread only
          </label>
          {unreadCount > 0 && (
            <button onClick={() => markRead()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "#E3F0FB", color: "#3A6EA5", border: "1px solid #3A6EA5" }}>
              <FaCheckDouble /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 medi-card">
          <FaBell className="mx-auto text-5xl mb-4 opacity-20" style={{ color: "#1B3A5C" }} />
          <p className="font-semibold" style={{ color: "#8A6650" }}>
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="medi-card p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => !n.isRead && markRead(n.id)}
                style={{ borderLeft: `3px solid ${n.isRead ? "#DDD0C4" : notifColor[n.type]}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: notifColor[n.type] + "18", color: notifColor[n.type] }}>
                  {notifIcon[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: n.isRead ? "#8A6650" : "#1B3A5C" }}>{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: notifColor[n.type] }} />
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "#5C4033" }}>{n.body}</p>
                  <p className="text-xs mt-1" style={{ color: "#8A6650" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button onClick={e => { e.stopPropagation(); markRead(n.id); }}
                    className="p-1.5 rounded-lg flex-shrink-0 hover:bg-gray-100 transition"
                    title="Mark as read">
                    <FaCheck style={{ color: "#2E7D32", fontSize: 12 }} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
