import Link from "next/link";
import React from "react";

export default function SellerDashBoardLayout({
  medicines,
  orders,
}: {
  medicines: React.ReactNode;
  orders: React.ReactNode;
}) {
  return (
    <div>
      {/* Navigation */}
      {/* <div className="border-2 border-blue-300 p-2 flex gap-4">
        <Link href="/seller/medicines">Medicines</Link>
        <Link href="/seller/orders">Orders</Link>
      </div> */}

      {/* Content */}
      <div className="mt-4 flex flex-col gap-4">
        <div>{medicines}</div>
        <div>{orders}</div>
      </div>


    </div>
  );
}
