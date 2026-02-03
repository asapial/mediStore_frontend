"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { GiPill, GiSyringe } from "react-icons/gi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

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
  status: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const badgeVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "secondary"; // green
      case "CANCELLED":
        return "destructive"; // red
      default:
        return "default"; // neutral
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/orders`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      let orders: Order[] = data.data || [];

      orders = orders.map(order => {
        const itemStatuses = order.items.map(item => item.status);
        const allSame = itemStatuses.every(s => s === itemStatuses[0]);
        return { ...order, status: allSame ? itemStatuses[0] : order.status };
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
    const orderItemIds = order.items.map(item => item.id);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: order.id, orderItemIds, status }),
      });

      if (!res.ok) throw new Error("Update failed");

      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status } : o)));
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  if (loading) return (
    <MedicineLoadingPage text="orders"></MedicineLoadingPage>
  );
  if (!orders.length) return <p className="text-center py-10 text-muted-foreground">No orders yet.</p>;

  return (
    <SectionContainer className="">
      <h1 className="text-3xl font-bold text-emerald-600 dark:text-blue-400 mb-4">Seller Orders</h1>

      <div className="space-y-6">
        {orders.map(order => {
          const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-xl border bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 space-y-4 shadow-lg hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <GiPill className="text-emerald-500" /> Order ID: {order.id}
                    </h2>
                    <p className="text-sm text-muted-foreground">Address: {order.address}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge variant={badgeVariant(order.status)} className="uppercase px-4 py-1 text-sm">
                    {order.status}
                  </Badge>
                </div>

                {/* Items */}
                <table className="w-full text-sm border-t border-b divide-y divide-muted-foreground/20">
                  <thead>
                    <tr className="bg-emerald-100 dark:bg-slate-800">
                      <th className="py-2 text-left">Medicine</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="py-2 flex items-center gap-2">
                          <GiPill className="text-emerald-500" /> {item.medicine.name}
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-center">${item.price.toFixed(2)}</td>
                        <td className="text-center">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="font-bold text-lg">Total: ${totalPrice.toFixed(2)}</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => (
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
              </Card>
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
