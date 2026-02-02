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
  status:string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUSES = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const badgeVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "secondary"; // green-ish by custom css if needed
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

const fetchOrders = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/orders`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await res.json();
    let orders: Order[] = data.data || [];
    console.log(orders)

    // Adjust order status based on item statuses
    orders = orders.map((order) => {
      const itemStatuses = order.items.map((item) => item.status);
      const allSame = itemStatuses.every((s) => s === itemStatuses[0]);

      return {
        ...order,
        status: allSame ? itemStatuses[0] : order.status, // use item's status if all same
      };
    });

    setOrders(orders);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load orders");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (order: Order, status: string) => {
    const orderItemIds = order.items.map((item) => item.id);

    console.log(order.id,
            orderItemIds,
            status,)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/orders`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            orderId: order.id,
            orderItemIds,
            status,
          }),
        }
      );

      console.log(res)

      if (!res.ok) throw new Error("Update failed");

      // optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status } : o
        )
      );

      toast.success(`Order updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  if (loading) {
    return <p className="text-center py-10">Loading orders...</p>;
  }

  if (!orders.length) {
    return (
      <p className="text-center text-muted-foreground py-10">
        No orders yet.
      </p>
    );
  }

  return (
    <div className="p-5 space-y-5">
      <h1 className="text-3xl font-bold">Seller Orders</h1>

      <Card className="flex flex-col gap-6 p-5">
        {orders.map((order) => {
          const totalPrice = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div
              key={order.id}
              className="rounded-xl border bg-background p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Order ID: {order.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    Address: {order.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <Badge variant={badgeVariant(order.status)} className="uppercase">
                  {order.status}
                </Badge>
              </div>

              {/* Items */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Medicine</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.medicine.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="font-bold">
                  Total: ${totalPrice.toFixed(2)}
                </p>

                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === order.status ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(order, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
