"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// ── Icons ─────────────────────────────────────────────────────────────────────
import {
  FaPills, FaClipboardList, FaPlus, FaTachometerAlt, FaUsers, FaLayerGroup,
  FaFileMedical, FaWallet, FaSync, FaBell, FaSearch, FaShoppingCart, FaBoxes,
  FaHeart, FaTag, FaTruck, FaUndo, FaIdCard, FaStore, FaSitemap, FaBolt,
  FaNewspaper, FaCommentDots, FaEnvelope, FaImage, FaStar, FaSignOutAlt,
  FaUser, FaCog, FaHome, FaChevronDown, FaInbox, FaCheckCircle, FaShieldAlt,
  FaChartBar, FaCreditCard,
} from "react-icons/fa";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "CUSTOMER" | "SELLER" | "ADMIN";

interface NavItem {
  title: string;
  url: string;
  role: Role | Role[];
  icon: React.ElementType;
  group: string;
}

interface UserInfo {
  id: string; name: string; email: string;
  image: string | null; role: string; createdAt?: string;
}

// ── Navigation Data ───────────────────────────────────────────────────────────
const navData: NavItem[] = [
  // ── CUSTOMER ──────────────────────────────────────────────────────────────
  { title: "My Orders",       url: "/dashboard/customer/orders",       role: "CUSTOMER", icon: FaClipboardList, group: "Shopping" },
  { title: "My Cart",         url: "/dashboard/customer/cart",         role: "CUSTOMER", icon: FaShoppingCart,  group: "Shopping" },
  { title: "Wishlist",        url: "/dashboard/customer/wishlist",     role: "CUSTOMER", icon: FaHeart,         group: "Shopping" },
  { title: "Coupons",         url: "/dashboard/customer/coupons",      role: "CUSTOMER", icon: FaTag,           group: "Shopping" },
  { title: "Advanced Search", url: "/dashboard/customer/search",       role: "CUSTOMER", icon: FaSearch,        group: "Shopping" },
  { title: "Prescription",    url: "/dashboard/customer/prescription", role: "CUSTOMER", icon: FaFileMedical,   group: "Health" },
  { title: "Auto-Refill",     url: "/dashboard/customer/subscription", role: "CUSTOMER", icon: FaSync,          group: "Health" },
  { title: "Order Tracking",  url: "/dashboard/customer/tracking",     role: "CUSTOMER", icon: FaTruck,         group: "Orders" },
  { title: "Returns & Refunds",url:"/dashboard/customer/returns",      role: "CUSTOMER", icon: FaUndo,          group: "Orders" },
  { title: "My Wallet",       url: "/dashboard/customer/wallet",       role: "CUSTOMER", icon: FaWallet,        group: "Finance" },
  { title: "Notifications",   url: "/dashboard/customer/notifications",role: "CUSTOMER", icon: FaBell,          group: "Account" },

  // ── SELLER ────────────────────────────────────────────────────────────────
  { title: "Overview",          url: "/dashboard/seller",             role: "SELLER", icon: FaTachometerAlt, group: "Manage" },
  { title: "Add Medicine",      url: "/dashboard/seller/addMedicine", role: "SELLER", icon: FaPlus,          group: "Manage" },
  { title: "My Medicines",      url: "/dashboard/seller/medicines",   role: "SELLER", icon: FaPills,         group: "Manage" },
  { title: "License",           url: "/dashboard/seller/license",    role: "SELLER", icon: FaIdCard,        group: "Manage" },
  { title: "Orders",            url: "/dashboard/seller/orders",     role: "SELLER", icon: FaClipboardList, group: "Sales" },
  { title: "Split Orders",      url: "/dashboard/seller/sub-orders", role: "SELLER", icon: FaSitemap,       group: "Sales" },
  { title: "Flash Sale",        url: "/dashboard/seller/flash-sale", role: "SELLER", icon: FaBolt,          group: "Sales" },
  { title: "My Coupons",        url: "/dashboard/seller/coupons",    role: "SELLER", icon: FaTag,           group: "Sales" },
  { title: "Subscriptions",     url: "/dashboard/seller/subscription",role: "SELLER",icon: FaSync,          group: "Sales" },
  { title: "Returns",           url: "/dashboard/seller/returns",    role: "SELLER", icon: FaUndo,          group: "Sales" },
  { title: "Stock Alerts",      url: "/dashboard/seller/stock-alerts",role:"SELLER",  icon: FaBell,          group: "Inventory" },
  { title: "Batch Tracking",    url: "/dashboard/seller/batches",    role: "SELLER", icon: FaBoxes,         group: "Inventory" },
  { title: "Notifications",     url: "/dashboard/seller/notifications",role:"SELLER", icon: FaBell,          group: "Account" },

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  { title: "Dashboard",         url: "/dashboard/admin",               role: "ADMIN", icon: FaTachometerAlt, group: "Overview" },
  { title: "Users",             url: "/dashboard/admin/users",         role: "ADMIN", icon: FaUsers,         group: "Overview" },
  { title: "Orders",            url: "/dashboard/admin/orders",        role: "ADMIN", icon: FaClipboardList, group: "Overview" },
  { title: "Categories",        url: "/dashboard/admin/categories",    role: "ADMIN", icon: FaLayerGroup,    group: "Content" },
  { title: "Prescriptions",     url: "/dashboard/admin/prescription",  role: "ADMIN", icon: FaFileMedical,   group: "Health" },
  { title: "Coupon Management", url: "/dashboard/admin/coupons",       role: "ADMIN", icon: FaTag,           group: "Commerce" },
  { title: "License Verification",url:"/dashboard/admin/license",      role: "ADMIN", icon: FaShieldAlt,     group: "Commerce" },
  { title: "Returns & Refunds", url: "/dashboard/admin/returns",       role: "ADMIN", icon: FaUndo,          group: "Commerce" },
  { title: "Wallets",           url: "/dashboard/admin/wallet",        role: "ADMIN", icon: FaWallet,        group: "Finance" },
  { title: "Promo Banners",     url: "/dashboard/admin/banners",       role: "ADMIN", icon: FaImage,         group: "Homepage CMS" },
  { title: "Features Strip",    url: "/dashboard/admin/platform-features",role:"ADMIN",icon: FaStar,         group: "Homepage CMS" },
  { title: "Featured Products", url: "/dashboard/admin/featured-products",role:"ADMIN",icon: FaStore,        group: "Homepage CMS" },
  { title: "Flash Sales",       url: "/dashboard/admin/flash-sale",    role: "ADMIN", icon: FaBolt,          group: "Homepage CMS" },
  { title: "Health Blogs",      url: "/dashboard/admin/blogs",         role: "ADMIN", icon: FaNewspaper,     group: "Homepage CMS" },
  { title: "Testimonials",      url: "/dashboard/admin/testimonials",  role: "ADMIN", icon: FaCommentDots,   group: "Homepage CMS" },
  { title: "Newsletter",        url: "/dashboard/admin/newsletter",    role: "ADMIN", icon: FaEnvelope,      group: "Homepage CMS" },
  { title: "Contact Messages",  url: "/dashboard/admin/messages",      role: "ADMIN", icon: FaInbox,         group: "Homepage CMS" },
];

// ── Group config: label → icon + accent color ─────────────────────────────────
const GROUP_META: Record<string, { icon: React.ElementType; color: string }> = {
  Shopping:     { icon: FaShoppingCart, color: "#4CAF50" },
  Health:       { icon: FaFileMedical,  color: "#E91E63" },
  Orders:       { icon: FaTruck,        color: "#FF9800" },
  Finance:      { icon: FaWallet,       color: "#9C27B0" },
  Account:      { icon: FaUser,         color: "#03A9F4" },
  Manage:       { icon: FaCog,          color: "#607D8B" },
  Sales:        { icon: FaChartBar,     color: "#FF5722" },
  Inventory:    { icon: FaBoxes,        color: "#795548" },
  Overview:     { icon: FaTachometerAlt,color: "#3F51B5" },
  Content:      { icon: FaLayerGroup,   color: "#009688" },
  Commerce:     { icon: FaStore,        color: "#F44336" },
  "Homepage CMS":{ icon: FaImage,       color: "#673AB7" },
  General:      { icon: FaHome,         color: "#8A6650" },
};

// ── Role badge colors ─────────────────────────────────────────────────────────
const ROLE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN:    { bg: "rgba(63,81,181,0.3)",  text: "#90CAF9", label: "Admin" },
  SELLER:   { bg: "rgba(76,175,80,0.3)",  text: "#A5D6A7", label: "Seller" },
  CUSTOMER: { bg: "rgba(194,112,58,0.3)", text: "#FFCC80", label: "Customer" },
};

// ── Collapsible Group ────────────────────────────────────────────────────────
function NavGroup({
  group, items, pathname, defaultOpen = true,
}: {
  group: string; items: NavItem[]; pathname: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = GROUP_META[group] ?? GROUP_META["General"];
  const GroupIcon = meta.icon;
  const hasActive = items.some(i => pathname === i.url || pathname.startsWith(i.url + "/"));

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all select-none group"
        style={{
          background: open ? "rgba(255,255,255,0.06)" : "transparent",
          color: hasActive ? meta.color : "rgba(245,237,227,0.55)",
        }}
      >
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <GroupIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest flex-1 text-left">{group}</span>
        {hasActive && (
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
        )}
        <FaChevronDown
          className="w-2.5 h-2.5 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", color: "rgba(245,237,227,0.35)" }}
        />
      </button>

      {/* Collapsible items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
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

// ── Single Nav Link ──────────────────────────────────────────────────────────
function NavLink({ item, pathname, accentColor }: { item: NavItem; pathname: string; accentColor: string }) {
  const Icon   = item.icon;
  const active = pathname === item.url || pathname.startsWith(item.url + "/");

  return (
    <Link
      href={item.url}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative"
      style={{
        background: active ? `rgba(${hexToRgb(accentColor)},0.15)` : "transparent",
        color:      active ? accentColor : "rgba(245,237,227,0.75)",
        border:     active ? `1px solid rgba(${hexToRgb(accentColor)},0.3)` : "1px solid transparent",
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: accentColor }} />
      )}

      {/* Icon */}
      <span
        className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
        style={{
          background: active ? `rgba(${hexToRgb(accentColor)},0.2)` : "rgba(245,237,227,0.06)",
          color:      active ? accentColor : "rgba(245,237,227,0.6)",
        }}
      >
        <Icon className="w-3.5 h-3.5" />
      </span>

      <span className="truncate text-xs">{item.title}</span>
    </Link>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "194,112,58";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

// ── User Popup Modal ─────────────────────────────────────────────────────────
function UserPopup({ user, onClose }: { user: UserInfo; onClose: () => void }) {
  const router = useRouter();
  const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.CUSTOMER;

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-start p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-72 rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          background: "linear-gradient(145deg,#1B3A5C,#0F2740)",
          borderColor: "rgba(255,255,255,0.12)",
          marginLeft: "4px",
        }}
      >
        {/* Header */}
        <div className="relative p-5 pb-4" style={{ background: "linear-gradient(135deg,rgba(194,112,58,0.2),rgba(27,58,92,0.4))" }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg">
            ×
          </button>
          <div className="flex items-center gap-3">
            {user.image
              ? <img src={user.image} alt="" className="w-14 h-14 rounded-2xl object-cover border-2" style={{ borderColor: "rgba(194,112,58,0.5)" }} />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: "rgba(194,112,58,0.3)", color: "#C2703A" }}>{user.name.charAt(0)}</div>
            }
            <div className="min-w-0">
              <p className="font-bold text-white text-base truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: rs.bg, color: rs.text }}>
                {rs.label}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Active · Online now</span>
          </div>
        </div>

        {/* Info grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {[
            { label: "User ID", value: user.id.slice(0, 10) + "…" },
            { label: "Account", value: user.role },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xs font-bold text-white/80 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-3 space-y-1">
          {[
            { icon: FaTachometerAlt, label: "Dashboard",     href: user.role === "ADMIN" ? "/dashboard/admin" : user.role === "SELLER" ? "/dashboard/seller" : "/dashboard/customer/orders" },
            { icon: FaUser,          label: "My Profile",    href: "/profile" },
            { icon: FaCog,           label: "Settings",      href: "/settings" },
            { icon: FaHome,          label: "Go to Website", href: "/" },
          ].map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: "rgba(245,237,227,0.75)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "rgba(194,112,58,0.8)" }} />
              {label}
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="px-3 pb-3 pt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
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

// ── Sidebar Footer User Card ─────────────────────────────────────────────────
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
      {/* Footer card */}
      <button
        onClick={() => setShowPopup(true)}
        className="mx-3 mb-3 w-[calc(100%-24px)] flex items-center gap-3 p-3 rounded-2xl transition-all text-left group"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.image
            ? <img src={user.image} alt="" className="w-9 h-9 rounded-xl object-cover" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "rgba(194,112,58,0.3)", color: "#C2703A" }}>{user.name.charAt(0)}</div>
          }
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: "#1B3A5C" }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white/90 truncate leading-tight">{user.name}</p>
          <p className="text-[10px] text-white/40 truncate">{user.email}</p>
        </div>

        {/* Role badge */}
        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: rs.bg, color: rs.text }}>
          {rs.label}
        </span>
      </button>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && <UserPopup user={user} onClose={() => setShowPopup(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── Sidebar Logo Header ──────────────────────────────────────────────────────
function SidebarLogoHeader() {
  return (
    <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <Link href="/" className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0" style={{ background: "linear-gradient(135deg,#C2703A,#8A4F28)" }}>
          <FaPills className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-black text-sm text-white leading-tight tracking-tight">
            Pro<span style={{ color: "#C2703A" }}>Pharm</span>
          </p>
          <p className="text-[9px] text-white/40 uppercase tracking-widest">Healthcare Platform</p>
        </div>
      </Link>
      <Link href="/" className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
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

// ── Main AppSidebar ───────────────────────────────────────────────────────────
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [pathname, setPathname] = useState("");

  useEffect(() => { setPathname(window.location.pathname); }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => setUserRole(d?.user?.role ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return null;

  const roleItems = navData.filter(item =>
    Array.isArray(item.role) ? item.role.includes(userRole as Role) : item.role === userRole
  );

  const grouped = roleItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? "General";
    if (!acc[g]) acc[g] = [];
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
      {/* Logo header */}
      <SidebarLogoHeader />
      <SidebarHeader />

      {/* Scrollable nav content */}
      <SidebarContent className="px-2 pt-3 pb-2 overflow-y-auto flex-1">
        <div className="space-y-0.5">
          {Object.entries(grouped).map(([group, items], idx) => (
            <NavGroup
              key={group}
              group={group}
              items={items}
              pathname={pathname}
              defaultOpen={idx < 2}  /* first 2 groups open by default */
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
