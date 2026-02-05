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
} from "react-icons/fa"

/* -------------------- Navigation Data -------------------- */
const navData = [
  // SELLER
  {
    title: "Medicine",
    url: "/seller/medicines",
    role: "SELLER",
    icon: FaPills,
    color: "text-blue-500",
  },
  {
    title: "Order",
    url: "/seller/orders",
    role: "SELLER",
    icon: FaClipboardList,
    color: "text-green-500",
  },
  {
    title: "Add Medicine",
    url: "/seller/addMedicine",
    role: "SELLER",
    icon: FaPlus,
    color: "text-purple-500",
  },

  // ADMIN
  {
    title: "Dashboard",
    url: "/admin",
    role: "ADMIN",
    icon: FaTachometerAlt,
    color: "text-blue-600",
  },
  {
    title: "Users",
    url: "/admin/users",
    role: "ADMIN",
    icon: FaUsers,
    color: "text-yellow-500",
  },
  {
    title: "Orders",
    url: "/admin/orders",
    role: "ADMIN",
    icon: FaClipboardList,
    color: "text-green-600",
  },
  {
    title: "Categories",
    url: "/admin/categories",
    role: "ADMIN",
    icon: FaLayerGroup,
    color: "text-purple-600",
  },
]

/* -------------------- Component -------------------- */
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

  const [userRole, setUserRole] = useState<"ADMIN" | "SELLER" | null>(null)
  const [loading, setLoading] = useState(true)

  /* -------------------- Fetch Session -------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { credentials: "include" }
        )

        if (!res.ok) {
          router.push("/login")
          return
        }

        const data = await res.json()
        setUserRole(data?.user?.role ?? null)
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  /* -------------------- Guard -------------------- */
  if (loading) return null

  return (
    <Sidebar {...props}>
      <SidebarHeaderWithLog />
      <SidebarHeader />

      <SidebarContent>
        {navData
          .filter((item) => item.role === userRole)
          .map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenu key={item.title}>
                <Link
                  href={item.url}
                  className="flex items-center gap-3 p-2 font-medium hover:bg-muted rounded-md"
                >
                  <Icon className={`${item.color} w-5 h-5`} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenu>
            )
          })}
      </SidebarContent>

      <SidebarRail />
      <UserSession />
    </Sidebar>
  )
}
