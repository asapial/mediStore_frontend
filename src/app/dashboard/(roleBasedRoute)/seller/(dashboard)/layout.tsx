import Link from "next/link";
import React from "react";

export default function SellerDashBoardLayout({
  children,
  medicines,
  orders,
}: {
  children: React.ReactNode;
  medicines: React.ReactNode;
  orders: React.ReactNode;
}) {
  return (
    <div>
      {/* <div className="">
        {children}
      </div> */}
      {/* Content */}
      <div className="mt-4 flex flex-col gap-4">
        <div>{medicines}</div>
        <div>{orders}</div>
      </div>


    </div>
  );
}
