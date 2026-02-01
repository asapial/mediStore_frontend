// import Link from "next/link";
// import React from "react";

// export default function SellerDashBoardLayout({
//   children,

// }: {
//   children: React.ReactNode;

// }) {
//   return (
//     <div>
//       {/* Navigation */}
//       <div className="border-2 border-blue-300 p-2 flex gap-4">
//         <Link href="/seller/medicines">Medicines</Link>
//         <Link href="/seller/orders">Orders</Link>
//       </div>



//       {/* Optional: render nested children */}
//       <div>{children}</div>
//     </div>
//   );
// }

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link";

export default function Page({
  children,

}: {
  children: React.ReactNode;

}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="">
            {children}
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
