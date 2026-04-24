"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "../home/Themetoggle";
import Image from "next/image";

// ── Icons ─────────────────────────────────────────────────────────────────────
import {
  FaPills, FaClipboardList, FaPlus, FaTachometerAlt, FaUsers, FaLayerGroup,
  FaFileMedical, FaWallet, FaSync, FaBell, FaSearch, FaShoppingCart, FaBoxes,
  FaHeart, FaTag, FaTruck, FaUndo, FaIdCard, FaStore, FaSitemap, FaBolt,
  FaNewspaper, FaCommentDots, FaEnvelope, FaImage, FaStar, FaSignOutAlt,
  FaUser, FaCog, FaHome, FaChevronDown, FaInbox, FaShieldAlt,
  FaChartBar, FaChartLine, FaWarehouse, FaExchangeAlt, FaFileInvoice,
  FaThermometerHalf, FaCubes, FaShippingFast, FaExclamationTriangle,
  FaMoneyBillWave, FaHeadset, FaHistory, FaDatabase, FaMapMarkerAlt,
  FaFileUpload, FaBoxOpen, FaCheckDouble,
} from "react-icons/fa";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "CUSTOMER" | "SELLER" | "ADMIN" | "WAREHOUSE";

interface NavItem {
  title: string;
  url:   string;
  role:  Role | Role[];
  icon:  React.ElementType;
  group: string;
  badge?: string; // optional notification badge label
}

interface UserInfo {
  id: string; name: string; email: string;
  image: string | null; role: string; createdAt?: string;
}

// ── Navigation Data ───────────────────────────────────────────────────────────
const navData: NavItem[] = [

  // ──────────────────────────────────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────────────────────────────────
  { title: "Dashboard",           url: "/dashboard",                        role: "ADMIN", icon: FaTachometerAlt, group: "Overview"     },
  { title: "Users",               url: "/dashboard/admin/users",            role: "ADMIN", icon: FaUsers,         group: "Overview"     },
  { title: "Orders",              url: "/dashboard/admin/orders",           role: "ADMIN", icon: FaClipboardList, group: "Overview"     },
  { title: "Platform Wallets",    url: "/dashboard/admin/wallet",           role: "ADMIN", icon: FaWallet,        group: "Overview"     },

  { title: "Categories",          url: "/dashboard/admin/categories",       role: "ADMIN", icon: FaLayerGroup,    group: "Content"      },
  { title: "Prescriptions",       url: "/dashboard/admin/prescription",     role: "ADMIN", icon: FaFileMedical,   group: "Content"      },
  { title: "Returns & Refunds",   url: "/dashboard/admin/returns",          role: "ADMIN", icon: FaUndo,          group: "Content"      },

  { title: "Coupon Management",   url: "/dashboard/admin/coupons",           role: "ADMIN", icon: FaTag,            group: "Commerce"     },
  { title: "License Verification",url: "/dashboard/admin/license",           role: "ADMIN", icon: FaShieldAlt,      group: "Commerce"     },
  { title: "Flash Sales",         url: "/dashboard/admin/flash-sale",        role: "ADMIN", icon: FaBolt,           group: "Commerce"     },
  { title: "Payout Requests",     url: "/dashboard/admin/payouts",           role: "ADMIN", icon: FaMoneyBillWave,  group: "Commerce"     },

  { title: "Promo Banners",       url: "/dashboard/admin/banners",           role: "ADMIN", icon: FaImage,          group: "CMS"          },
  { title: "Platform Features",   url: "/dashboard/admin/platform-features", role: "ADMIN", icon: FaStar,           group: "CMS"          },
  { title: "Featured Products",   url: "/dashboard/admin/featured-products", role: "ADMIN", icon: FaStore,          group: "CMS"          },
  { title: "Health Blogs",        url: "/dashboard/admin/blogs",             role: "ADMIN", icon: FaNewspaper,      group: "CMS"          },
  { title: "Testimonials",        url: "/dashboard/admin/testimonials",      role: "ADMIN", icon: FaCommentDots,    group: "CMS"          },
  { title: "Newsletter",          url: "/dashboard/admin/newsletter",        role: "ADMIN", icon: FaEnvelope,       group: "CMS"          },
  { title: "Contact Messages",    url: "/dashboard/admin/messages",          role: "ADMIN", icon: FaInbox,          group: "CMS"          },

  { title: "Help Desk",           url: "/dashboard/admin/support",           role: "ADMIN", icon: FaHeadset,        group: "Operations"   },
  { title: "Fraud Flags",         url: "/dashboard/admin/fraud-flags",       role: "ADMIN", icon: FaShieldAlt,      group: "Operations"   },
  { title: "Platform Settings",   url: "/dashboard/admin/platform-settings", role: "ADMIN", icon: FaCog,            group: "Operations"   },
  { title: "Audit Logs",          url: "/dashboard/admin/audit-logs",        role: "ADMIN", icon: FaHistory,        group: "Operations"   },

  // ──────────────────────────────────────────────────────────────────────────
  // SELLER
  // ──────────────────────────────────────────────────────────────────────────
  { title: "Dashboard",           url: "/dashboard",                            role: "SELLER", icon: FaChartLine,    group: "Overview"    },
  { title: "Analytics",           url: "/dashboard/seller/analytics",           role: "SELLER", icon: FaChartBar,     group: "Overview"    },

  { title: "Add Medicine",        url: "/dashboard/seller/addMedicine",         role: "SELLER", icon: FaPlus,         group: "Inventory"   },
  { title: "My Medicines",        url: "/dashboard/seller/medicines",           role: "SELLER", icon: FaPills,        group: "Inventory"   },
  { title: "Inventory Manager",   url: "/dashboard/seller/inventory",           role: "SELLER", icon: FaDatabase,     group: "Inventory"   },
  { title: "Stock Alerts",        url: "/dashboard/seller/stock-alerts",        role: "SELLER", icon: FaBell,         group: "Inventory"   },
  { title: "Batch Tracking",      url: "/dashboard/seller/batches",             role: "SELLER", icon: FaBoxes,        group: "Inventory"   },
  { title: "Bulk CSV Import",     url: "/dashboard/seller/catalog/import",      role: "SELLER", icon: FaFileUpload,   group: "Inventory"   },

  { title: "Orders",              url: "/dashboard/seller/orders",              role: "SELLER", icon: FaClipboardList,group: "Sales"       },
  { title: "Sub-Orders",          url: "/dashboard/seller/sub-orders",          role: "SELLER", icon: FaSitemap,      group: "Sales"       },
  { title: "Returns",             url: "/dashboard/seller/returns",             role: "SELLER", icon: FaUndo,         group: "Sales"       },
  { title: "Flash Sale",          url: "/dashboard/seller/flash-sale",          role: "SELLER", icon: FaBolt,         group: "Sales"       },
  { title: "Coupons",             url: "/dashboard/seller/coupons",             role: "SELLER", icon: FaTag,          group: "Sales"       },
  { title: "Subscriptions",       url: "/dashboard/seller/subscription",        role: "SELLER", icon: FaSync,         group: "Sales"       },

  { title: "My Wallet",           url: "/dashboard/seller/wallet",              role: "SELLER", icon: FaWallet,       group: "Finance"     },
  { title: "Withdraw Funds",      url: "/dashboard/seller/wallet/withdraw",     role: "SELLER", icon: FaMoneyBillWave,group: "Finance"     },

  { title: "My Profile",          url: "/dashboard/seller/profile",             role: "SELLER", icon: FaUser,         group: "Account"     },
  { title: "License",             url: "/dashboard/seller/license",             role: "SELLER", icon: FaIdCard,       group: "Account"     },
  { title: "Notifications",       url: "/dashboard/seller/notifications",       role: "SELLER", icon: FaBell,         group: "Account"     },

  // ──────────────────────────────────────────────────────────────────────────
  // CUSTOMER
  // ──────────────────────────────────────────────────────────────────────────
  { title: "Dashboard",           url: "/dashboard",                        role: "CUSTOMER", icon: FaChartLine,     group: "Overview"  },
  { title: "My Orders",           url: "/dashboard/customer/orders",        role: "CUSTOMER", icon: FaClipboardList, group: "Shopping"  },
  { title: "My Cart",             url: "/dashboard/customer/cart",          role: "CUSTOMER", icon: FaShoppingCart,  group: "Shopping"  },
  { title: "Wishlist",            url: "/dashboard/customer/wishlist",      role: "CUSTOMER", icon: FaHeart,         group: "Shopping"  },
  { title: "Coupons",             url: "/dashboard/customer/coupons",       role: "CUSTOMER", icon: FaTag,           group: "Shopping"  },
  { title: "Advanced Search",     url: "/dashboard/customer/search",        role: "CUSTOMER", icon: FaSearch,        group: "Shopping"  },

  { title: "Prescription",        url: "/dashboard/customer/prescription",  role: "CUSTOMER", icon: FaFileMedical,   group: "Health"    },
  { title: "Auto-Refill",         url: "/dashboard/customer/subscription",  role: "CUSTOMER", icon: FaSync,          group: "Health"    },

  { title: "Order Tracking",      url: "/dashboard/customer/tracking",      role: "CUSTOMER", icon: FaTruck,         group: "Orders"    },
  { title: "Returns & Refunds",   url: "/dashboard/customer/returns",       role: "CUSTOMER", icon: FaUndo,          group: "Orders"    },

  { title: "My Wallet",           url: "/dashboard/customer/wallet",        role: "CUSTOMER", icon: FaWallet,        group: "Finance"   },
  { title: "Notifications",       url: "/dashboard/customer/notifications", role: "CUSTOMER", icon: FaBell,          group: "Finance"   },

  { title: "Help & Support",      url: "/dashboard/customer/support",       role: "CUSTOMER", icon: FaHeadset,       group: "Support"   },

  // ──────────────────────────────────────────────────────────────────────────
  // WAREHOUSE
  // ──────────────────────────────────────────────────────────────────────────
  { title: "Overview",            url: "/dashboard/warehouse/overview",     role: "WAREHOUSE", icon: FaWarehouse,       group: "Warehouse"  },
  { title: "Analytics",           url: "/dashboard/warehouse/analytics",    role: "WAREHOUSE", icon: FaChartLine,       group: "Warehouse"  },

  { title: "Stock Transfers",     url: "/dashboard/warehouse/transfers",    role: "WAREHOUSE", icon: FaExchangeAlt,     group: "Inventory"  },
  { title: "Storage Bins",        url: "/dashboard/warehouse/bins",         role: "WAREHOUSE", icon: FaCubes,           group: "Inventory"  },
  { title: "Expiry Monitor",      url: "/dashboard/warehouse/expiry",       role: "WAREHOUSE", icon: FaExclamationTriangle, group: "Inventory" },

  { title: "GRN Management",      url: "/dashboard/warehouse/grn",          role: "WAREHOUSE", icon: FaFileInvoice,     group: "Receiving"  },
  { title: "Suppliers",           url: "/dashboard/warehouse/suppliers",    role: "WAREHOUSE", icon: FaShippingFast,    group: "Receiving"  },

  { title: "Order Management",  url: "/dashboard/warehouse/orders",      role: "WAREHOUSE", icon: FaCheckDouble,     group: "Fulfillment" },
  { title: "Fulfillment Queue",   url: "/dashboard/warehouse/fulfillment",  role: "WAREHOUSE", icon: FaBoxes,           group: "Fulfillment" },
  { title: "Inbound Parcels",     url: "/dashboard/warehouse/inbound",      role: "WAREHOUSE", icon: FaInbox,           group: "Fulfillment" },
  { title: "Pick & Pack",         url: "/dashboard/warehouse/packing",      role: "WAREHOUSE", icon: FaBoxOpen,         group: "Fulfillment" },
  { title: "Dispatch / Delivery", url: "/dashboard/warehouse/dispatch",     role: "WAREHOUSE", icon: FaShippingFast,    group: "Fulfillment" },

  { title: "All Stock",           url: "/dashboard/warehouse/stock",        role: "WAREHOUSE", icon: FaDatabase,        group: "Inventory"  },
  { title: "Locations",           url: "/dashboard/warehouse/locations",    role: "WAREHOUSE", icon: FaMapMarkerAlt,    group: "Inventory"  },

  { title: "Stock & Expiry Alerts",url: "/dashboard/warehouse/alerts",     role: "WAREHOUSE", icon: FaBell,            group: "Monitoring" },
  { title: "Temperature Logs",    url: "/dashboard/warehouse/temperature",  role: "WAREHOUSE", icon: FaThermometerHalf, group: "Monitoring" },
  { title: "Notifications",       url: "/dashboard/warehouse/notifications",role: "WAREHOUSE", icon: FaBell,            group: "Monitoring" },

  // ADMIN — Warehouse pages
  { title: "Warehouses",          url: "/dashboard/admin/warehouses",       role: "ADMIN", icon: FaWarehouse,       group: "Warehouse"  },
  { title: "Stock Transfers",     url: "/dashboard/admin/transfers",        role: "ADMIN", icon: FaExchangeAlt,     group: "Warehouse"  },
  { title: "Expiry Alerts",       url: "/dashboard/admin/expiry-alerts",    role: "ADMIN", icon: FaExclamationTriangle, group: "Warehouse" },
];

const GROUP_META: Record<string, { icon: React.ElementType; color: string }> = {
  Overview:    { icon: FaTachometerAlt,      color: "#3A6EA5" },
  Inventory:   { icon: FaBoxes,              color: "#4A7C59" },
  Sales:       { icon: FaChartBar,           color: "#C2703A" },
  Account:     { icon: FaUser,               color: "#8A6650" },
  Content:     { icon: FaLayerGroup,         color: "#5C7AEA" },
  Commerce:    { icon: FaStore,              color: "#E05C5C" },
  CMS:         { icon: FaImage,              color: "#9B59B6" },
  Operations:  { icon: FaCog,                color: "#64748B" },
  Shopping:    { icon: FaShoppingCart,       color: "#4A7C59" },
  Health:      { icon: FaFileMedical,        color: "#E91E8C" },
  Orders:      { icon: FaTruck,              color: "#C2703A" },
  Finance:     { icon: FaWallet,             color: "#3A6EA5" },
  Support:     { icon: FaHeadset,            color: "#C2703A" },
  General:     { icon: FaHome,               color: "#8A6650" },
  Warehouse:   { icon: FaWarehouse,          color: "#0EA5E9" },
  Receiving:   { icon: FaShippingFast,       color: "#7C3AED" },
  Fulfillment: { icon: FaBoxOpen,            color: "#D97706" },
  Monitoring:  { icon: FaThermometerHalf,    color: "#10B981" },
};

// ── Role badge style ──────────────────────────────────────────────────────────
const ROLE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN:     { bg: "rgba(90,120,200,0.3)",  text: "#90CAF9", label: "Admin"     },
  SELLER:    { bg: "rgba(74,124,89,0.35)",  text: "#A5D6A7", label: "Seller"    },
  CUSTOMER:  { bg: "rgba(194,112,58,0.3)",  text: "#FFCC80", label: "Customer"  },
  WAREHOUSE: { bg: "rgba(14,165,233,0.25)", text: "#7DD3FC", label: "Warehouse" },
};

// ── Utility ───────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "194,112,58";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

// ── NavLink ───────────────────────────────────────────────────────────────────
function NavLink({ item, pathname, accentColor }: {
  item: NavItem; pathname: string; accentColor: string;
}) {
  const Icon   = item.icon;
  const active = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"));
  const rgb    = hexToRgb(accentColor);

  return (
    <Link
      href={item.url}
      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium
        transition-all duration-150 relative group"
      style={{
        background: active ? `rgba(${rgb},0.15)` : "transparent",
        color:      active ? accentColor          : "rgba(245,237,227,0.7)",
        border:     active ? `1px solid rgba(${rgb},0.25)` : "1px solid transparent",
      }}
    >
      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
          style={{ background: accentColor }} />
      )}

      {/* Icon container */}
      <span
        className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
        style={{
          background: active ? `rgba(${rgb},0.22)` : "rgba(245,237,227,0.06)",
          color:      active ? accentColor          : "rgba(245,237,227,0.5)",
        }}
      >
        <Icon className="w-3 h-3" />
      </span>

      <span className="flex-1 truncate">{item.title}</span>

      {/* Optional badge */}
      {item.badge && (
        <span className="text-[9px] font-bold px-1.5 py-px rounded-full flex-shrink-0"
          style={{ background: `rgba(${rgb},0.25)`, color: accentColor }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ── NavGroup ──────────────────────────────────────────────────────────────────
function NavGroup({ group, items, pathname, defaultOpen = true }: {
  group: string; items: NavItem[]; pathname: string; defaultOpen?: boolean;
}) {
  const meta      = GROUP_META[group] ?? GROUP_META["General"];
  const GroupIcon = meta.icon;
  const hasActive = items.some(i =>
    pathname === i.url || (i.url !== "/dashboard" && pathname.startsWith(i.url + "/"))
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div className="mb-0.5">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all select-none"
        style={{
          background: open ? "rgba(255,255,255,0.05)" : "transparent",
          color:      hasActive ? meta.color : "rgba(245,237,227,0.4)",
        }}
      >
        <GroupIcon className="w-3 h-3 flex-shrink-0" style={{ color: meta.color }} />
        <span className="text-[9px] font-black uppercase tracking-widest flex-1 text-left">{group}</span>
        {hasActive && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />}
        <FaChevronDown
          className="w-2 h-2 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", color: "rgba(245,237,227,0.25)" }}
        />
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 space-y-0.5 pl-1">
              {items.map(item => (
                <NavLink key={item.url + item.title} item={item} pathname={pathname} accentColor={meta.color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User Popup ───────────────────────────────────────────────────────────────
function UserPopup({ user, onClose }: { user: UserInfo; onClose: () => void }) {
  const router = useRouter();
  const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.CUSTOMER;

  const handleLogout = async () => {
    try { await authClient.signOut(); router.push("/login"); }
    catch (err) { console.error("Logout failed:", err); }
  };

  const quickLinks = [
    { icon: FaTachometerAlt, label: "Dashboard", href: "/dashboard" },
    { icon: FaUser,          label: "My Profile", href: "/profile" },
    { icon: FaCog,           label: "Settings",   href: "/settings" },
    { icon: FaHome,          label: "Go to Website", href: "/" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-start p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0,  scale: 1     }}
        exit={{ opacity: 0,   y: 20,  scale: 0.95  }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="w-72 rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          background:  "linear-gradient(145deg,#1B3A5C,#0F2740)",
          borderColor: "rgba(255,255,255,0.12)",
          marginLeft:  "4px",
        }}
      >
        {/* Header */}
        <div className="relative p-5 pb-4"
          style={{ background: "linear-gradient(135deg,rgba(194,112,58,0.2),rgba(27,58,92,0.4))" }}>
          <button onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center
              text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg">
            ×
          </button>
          <div className="flex items-center gap-3">
            {user.image
              ? <img src={user.image} alt="" className="w-14 h-14 rounded-2xl object-cover border-2"
                  style={{ borderColor: "rgba(194,112,58,0.5)" }} />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
                  style={{ background: "rgba(194,112,58,0.3)", color: "#C2703A" }}>
                  {user.name.charAt(0)}
                </div>
            }
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: rs.bg, color: rs.text }}>
                {rs.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Active · Online now</span>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {[
            { label: "User ID",  value: user.id.slice(0, 10) + "…" },
            { label: "Account",  value: user.role              },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xs font-bold text-white/80 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="p-3 space-y-0.5">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
              style={{ color: "rgba(245,237,227,0.75)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "rgba(194,112,58,0.8)" }} />
              {label}
            </Link>
          ))}
        </div>

        {/* Theme toggle */}
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "rgba(194,112,58,0.8)" }}>🌙</span>
              <span className="text-xs font-semibold" style={{ color: "rgba(245,237,227,0.75)" }}>Theme</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.25)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          >
            <FaSignOutAlt className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Sidebar Footer ────────────────────────────────────────────────────────────
function SidebarUserFooter() {
  const [user,      setUser]      = useState<UserInfo | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => setUser(d?.user ?? null))
      .catch(() => {});
  }, []);

  if (!user) return (
    <div className="mx-3 mb-3 h-14 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
  );

  const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.CUSTOMER;

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="mx-3 mb-3 w-[calc(100%-24px)] flex items-center gap-2.5 p-2.5 rounded-2xl transition-all text-left"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.image
            ? <img src={user.image} alt="" className="w-8 h-8 rounded-xl object-cover" />
            : <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: "rgba(194,112,58,0.3)", color: "#C2703A" }}>
                {user.name.charAt(0)}
              </div>
          }
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
            style={{ borderColor: "#1B3A5C" }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white/90 truncate leading-tight">{user.name}</p>
          <p className="text-[10px] text-white/40 truncate">{user.email}</p>
        </div>

        {/* Role badge */}
        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: rs.bg, color: rs.text }}>
          {rs.label}
        </span>
      </button>

      <AnimatePresence>
        {showPopup && <UserPopup user={user} onClose={() => setShowPopup(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── Logo Header ───────────────────────────────────────────────────────────────
function SidebarLogoHeader({ role }: { role: Role | null }) {
  const ROLE_SUB: Record<string, string> = {
    ADMIN:     "Admin Console",
    SELLER:    "Seller Portal",
    CUSTOMER:  "Customer Portal",
    WAREHOUSE: "Warehouse Portal",
  };

  return (
    <div className="px-4 py-3.5 flex items-center gap-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <Link href="/" className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
          <Image src="/logo/lifeline_logo.png" alt="logo" width={28} height={28} priority />
        </div>
        <div className="min-w-0">
          <p className="font-black text-sm text-white leading-tight tracking-tight">
            Life<span style={{ color: "#C2703A" }}>Line</span>
          </p>
          <p className="text-[9px] text-white/40 uppercase tracking-widest truncate">
            {role ? ROLE_SUB[role] : "Healthcare Platform"}
          </p>
        </div>
      </Link>

      <Link href="/"
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(245,237,227,0.5)" }}
        title="Visit website"
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      >
        <FaHome className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ── Role Banner ───────────────────────────────────────────────────────────────
function RoleBanner({ role }: { role: Role }) {
  const config: Record<Role, { label: string; desc: string; color: string; bg: string }> = {
    ADMIN:     { label: "Admin",     desc: "Full platform control",    color: "#90CAF9", bg: "rgba(90,120,200,0.15)"  },
    SELLER:    { label: "Seller",    desc: "Manage your store",        color: "#A5D6A7", bg: "rgba(74,124,89,0.15)"  },
    CUSTOMER:  { label: "Customer",  desc: "Your health & orders",     color: "#FFCC80", bg: "rgba(194,112,58,0.15)" },
    WAREHOUSE: { label: "Warehouse", desc: "Warehouse operations",     color: "#7DD3FC", bg: "rgba(14,165,233,0.12)" },
  };
  const c = config[role];
  return (
    <div className="mx-2 mb-3 px-3 py-2 rounded-xl flex items-center gap-2.5"
      style={{ background: c.bg, border: `1px solid ${c.color}22` }}>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.color }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: c.color }}>{c.label}</p>
        </div>
        <p className="text-[9px] text-white/40 mt-0.5">{c.desc}</p>
      </div>
    </div>
  );
}

// ── Main AppSidebar ───────────────────────────────────────────────────────────
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => setUserRole(d?.user?.role ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  // Filter nav items for current role
  const roleItems = navData.filter(item =>
    Array.isArray(item.role)
      ? item.role.includes(userRole as Role)
      : item.role === userRole
  );

  // Group them (preserving insertion order)
  const groupOrder: string[] = [];
  const grouped = roleItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? "General";
    if (!acc[g]) { acc[g] = []; groupOrder.push(g); }
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <Sidebar
      {...props}
      style={{
        "--sidebar-background": "#1B3A5C",
        "--sidebar-foreground": "#F5EDE3",
      } as React.CSSProperties}
    >
      {/* Logo + role subtitle */}
      <SidebarLogoHeader role={userRole} />
      <SidebarHeader />

      {/* Role banner */}
      {userRole && (
        <div className="pt-3 px-0">
          <RoleBanner role={userRole} />
        </div>
      )}

      {/* Scrollable nav */}
      <SidebarContent className="px-2 pb-2 overflow-y-auto flex-1">
        <div className="space-y-0">
          {groupOrder.map((group, idx) => (
            <NavGroup
              key={group}
              group={group}
              items={grouped[group]}
              pathname={pathname}
              defaultOpen={idx < 2}
            />
          ))}
        </div>
      </SidebarContent>

      {/* Footer user card */}
      <SidebarUserFooter />
      <SidebarRail />
    </Sidebar>
  );
}
