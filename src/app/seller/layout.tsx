import Link from "next/link";
import React from "react";

export default function SellerDashBoardLayout({
  children,

}: {
  children: React.ReactNode;

}) {
  return (
    <div>
      {/* Navigation */}
      <div className="border-2 border-blue-300 p-2 flex gap-4">
        <Link href="/seller/medicines">Medicines</Link>
        <Link href="/seller/orders">Orders</Link>
      </div>



      {/* Optional: render nested children */}
      <div>{children}</div>
    </div>
  );
}
