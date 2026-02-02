import * as React from "react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import UserProfile from "./SidebarUserCard"
import UserSession from "./SidebarUserCard"
import SidebarHeaderWithLog from "./SidebarHeader"
import { userService } from "@/services/user.service"
import { FaPills, FaClipboardList, FaPlus, FaTachometerAlt, FaUsers, FaShoppingCart, FaLayerGroup } from "react-icons/fa";


const { data: userData } = await userService.getSession();
// console.log(userData)
const userRole = userData?.user?.role;

// This is sample data.
const data = {
  navMain: [
    // Seller Routes
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

    // Admin Routes
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
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeaderWithLog></SidebarHeaderWithLog>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}

{data.navMain
  .filter((item) => !item.role || item.role === userRole)
  .map((item) => {
    const Icon = item.icon; // React component for the icon
    return (
      <SidebarMenu key={item.title}>
        <div className="flex items-center gap-2 font-bold p-1">
          {Icon && <Icon className={`${item.color} w-5 h-5`} />}
          <Link href={item.url}>{item.title}</Link>
        </div>
      </SidebarMenu>
    );
  })}

      </SidebarContent>
      <SidebarRail />
      <UserSession></UserSession>
    </Sidebar>
  )
}
