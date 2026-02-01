"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface Medicine {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  medicine: Medicine;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/orders`,{
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`,{
          method: "GET",
          credentials: "include", // must include cookie
        });
      const data = await res.json();
      console.log(data);
      setOrders(data.data); // ✅ use data.data
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status");
    }
  };

  if (loading) return <p className="text-center py-10">Loading orders...</p>;

  if (!orders.length)
    return (
      <p className="text-center text-muted-foreground py-10">
        No orders yet.
      </p>
    );

  return (
    <div className="p-5 space-y-5">
      <h1 className="text-3xl font-bold text-foreground dark:text-white">
        Seller Orders
      </h1>

      <Card className="flex flex-col gap-6 p-5">
        {orders.map((order) => {
          const totalPrice = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div
              key={order.id}
              className="bg-background dark:bg-slate-900 shadow-xl rounded-xl p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground dark:text-white">
                    Order ID: {order.id}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Address: {order.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created At: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* <Badge
                  variant={
                    order.status === "DELIVERED"
                      ? "success"
                      : order.status === "CANCELLED"
                      ? "destructive"
                      : "default"
                  }
                  className="uppercase"
                >
                  {order.status}
                </Badge> */}
              </div>

              {/* Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-muted-foreground/20">
                      <th className="py-2 px-4">Medicine</th>
                      <th className="py-2 px-4">Quantity</th>
                      <th className="py-2 px-4">Price</th>
                      <th className="py-2 px-4">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-muted-foreground/10"
                      >
                        <td className="py-2 px-4">{item.medicine.name}</td>
                        <td className="py-2 px-4">{item.quantity}</td>
                        <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                        <td className="py-2 px-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
                <p className="text-lg font-bold text-foreground dark:text-white">
                  Total: ${totalPrice.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                    (s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={s === order.status ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(order.id, s)}
                      >
                        {s}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
