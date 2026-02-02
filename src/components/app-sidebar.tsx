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
import UserProfile from "./shared/ProfileData"

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [

    {
      title: "Medicine",
      url: "/seller/medicines",
    },
    {
      title: "Order",
      url: "/seller/orders",
    },
    {
      title: "Add Medicine",
      url: "/seller/addMedicine",
    }

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>

        <img
          src="/logo/medistore-high-resolution-logo-transparent.png"
          className="max-h-8 dark:invert"
          alt="MediStore logo"
        />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarMenu key={item.title}>
            <div className=" font-bold p-1">
              <Link href={item.url}>
                {item.title}
              </Link>
            </div>

          </SidebarMenu>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
