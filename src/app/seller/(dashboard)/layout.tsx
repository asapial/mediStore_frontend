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
      {/* Content */}
      <div className="mt-4 flex flex-col gap-4">
        <div>{medicines}</div>
        <div>{orders}</div>
      </div>


    </div>
  );
}
