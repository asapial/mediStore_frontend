"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"

import SidebarHeaderWithLog from "./SidebarHeader"
import UserSession from "./SidebarUserCard"

import {
  FaPills,
  FaClipboardList,
  FaPlus,
  FaTachometerAlt,
  FaUsers,
  FaLayerGroup,
  FaFileMedical,
  FaWallet,
  FaSync,
  FaBell,
  FaSearch,
  FaShoppingCart,
  FaBoxes,
} from "react-icons/fa"

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "CUSTOMER" | "SELLER" | "ADMIN"

interface NavItem {
  title: string
  url: string
  role: Role | Role[]
  icon: React.ElementType
  iconClass: string
  group?: string
}

// ─── Navigation Data ──────────────────────────────────────────────────────────
const navData: NavItem[] = [
  // ── CUSTOMER ────────────────────────────────────────────────────────────────
  {
    title: "My Orders",
    url: "/dashboard/customer/orders",
    role: "CUSTOMER",
    icon: FaClipboardList,
    iconClass: "icon-orders",
    group: "Shopping",
  },
  {
    title: "My Cart",
    url: "/dashboard/customer/cart",
    role: "CUSTOMER",
    icon: FaShoppingCart,
    iconClass: "icon-cart",
    group: "Shopping",
  },
  {
    title: "Advanced Search",
    url: "/dashboard/customer/search",
    role: "CUSTOMER",
    icon: FaSearch,
    iconClass: "icon-search",
    group: "Shopping",
  },
  {
    title: "Prescription",
    url: "/dashboard/customer/prescription",
    role: "CUSTOMER",
    icon: FaFileMedical,
    iconClass: "icon-rx",
    group: "Health",
  },
  {
    title: "My Wallet",
    url: "/dashboard/customer/wallet",
    role: "CUSTOMER",
    icon: FaWallet,
    iconClass: "icon-wallet",
    group: "Finance",
  },
  {
    title: "Auto-Refill",
    url: "/dashboard/customer/subscription",
    role: "CUSTOMER",
    icon: FaSync,
    iconClass: "icon-sub",
    group: "Health",
  },

  // ── SELLER ──────────────────────────────────────────────────────────────────
  {
    title: "Dashboard",
    url: "/dashboard/seller/dashboard",
    role: "SELLER",
    icon: FaTachometerAlt,
    iconClass: "icon-admin",
    group: "Manage",
  },
  {
    title: "My Medicines",
    url: "/dashboard/seller",
    role: "SELLER",
    icon: FaPills,
    iconClass: "icon-seller",
    group: "Manage",
  },
  {
    title: "Add Medicine",
    url: "/dashboard/seller/addMedicine",
    role: "SELLER",
    icon: FaPlus,
    iconClass: "icon-neutral",
    group: "Manage",
  },
  {
    title: "Orders",
    url: "/dashboard/seller/orders",
    role: "SELLER",
    icon: FaClipboardList,
    iconClass: "icon-orders",
    group: "Sales",
  },
  {
    title: "Subscriptions",
    url: "/dashboard/seller/subscription",
    role: "SELLER",
    icon: FaSync,
    iconClass: "icon-sub",
    group: "Sales",
  },
  {
    title: "Stock Alerts",
    url: "/dashboard/seller/stock-alerts",
    role: "SELLER",
    icon: FaBell,
    iconClass: "icon-alert",
    group: "Inventory",
  },
  {
    title: "Batch Tracking",
    url: "/dashboard/seller/batches",
    role: "SELLER",
    icon: FaBoxes,
    iconClass: "icon-batch",
    group: "Inventory",
  },

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    role: "ADMIN",
    icon: FaTachometerAlt,
    iconClass: "icon-admin",
    group: "Overview",
  },
  {
    title: "Users",
    url: "/dashboard/admin/users",
    role: "ADMIN",
    icon: FaUsers,
    iconClass: "icon-neutral",
    group: "Overview",
  },
  {
    title: "Orders",
    url: "/dashboard/admin/orders",
    role: "ADMIN",
    icon: FaClipboardList,
    iconClass: "icon-orders",
    group: "Overview",
  },
  {
    title: "Categories",
    url: "/dashboard/admin/categories",
    role: "ADMIN",
    icon: FaLayerGroup,
    iconClass: "icon-neutral",
    group: "Content",
  },
  {
    title: "Prescriptions",
    url: "/dashboard/admin/prescription",
    role: "ADMIN",
    icon: FaFileMedical,
    iconClass: "icon-rx",
    group: "Health",
  },
  {
    title: "Wallets",
    url: "/dashboard/admin/wallet",
    role: "ADMIN",
    icon: FaWallet,
    iconClass: "icon-wallet",
    group: "Finance",
  },
]

// ─── Group Header Component ───────────────────────────────────────────────────
function GroupLabel({ label }: { label: string }) {
  return (
    <p
      className="px-3 pt-5 pb-1 text-[10px] uppercase tracking-widest font-bold select-none"
      style={{ color: "rgba(245,237,227,0.45)" }}
    >
      {label}
    </p>
  )
}

// ─── Sidebar Item Component ───────────────────────────────────────────────────
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon    = item.icon
  const active  = pathname === item.url || pathname.startsWith(item.url + "/")

  return (
    <SidebarMenu>
      <Link
        href={item.url}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
        style={{
          background: active ? "rgba(194,112,58,0.18)" : "transparent",
          color:      active ? "#C2703A" : "rgba(245,237,227,0.80)",
          border:     active ? "1px solid rgba(194,112,58,0.35)" : "1px solid transparent",
        }}
      >
        <span
          className={`${item.iconClass} w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all`}
          style={{
            background: active ? "rgba(194,112,58,0.22)" : "rgba(245,237,227,0.06)",
            color:      active ? "#C2703A" : "inherit",
          }}
        >
          <Icon className="w-4 h-4" />
        </span>
        <span className="truncate">{item.title}</span>
        {active && (
          <span
            className="ml-auto w-1.5 h-5 rounded-full flex-shrink-0"
            style={{ background: "#C2703A" }}
          />
        )}
      </Link>
    </SidebarMenu>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router   = useRouter()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [pathname, setPathname] = useState("")

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await fetch("/api/auth/me", { credentials: "include" })
        const data = await res.json()
        setUserRole(data?.user?.role ?? null)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  if (loading) return null

  // Filter items matching current role
  const roleItems = navData.filter(item =>
    Array.isArray(item.role)
      ? item.role.includes(userRole as Role)
      : item.role === userRole
  )

  // Group items
  const grouped = roleItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? "General"
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  return (
    <Sidebar
      {...props}
      style={
        {
          "--sidebar-background": "#1B3A5C",
          "--sidebar-foreground": "#F5EDE3",
        } as React.CSSProperties
      }
    >
      <SidebarHeaderWithLog />
      <SidebarHeader />

      <SidebarContent className="px-2 pb-4 overflow-y-auto">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <GroupLabel label={group} />
            {items.map(item => (
              <NavLink key={item.url + item.title} item={item} pathname={pathname} />
            ))}
          </div>
        ))}
      </SidebarContent>

      <SidebarRail />
      <UserSession />
    </Sidebar>
  )
}
