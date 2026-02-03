"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BiCube } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

interface Medicine {
  name: string;
  description: string;
  price: number;
  image: string | null;
}

interface OrderItem {
  id: string;
  medicineId: string;
  quantity: number;
  price: number;
  status: string;
  medicine: Medicine;
}

interface Order {
  id: string;
  status: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setOrders(data.data || []);
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

    if (loading) return (
        <MedicineLoadingPage text="orders"></MedicineLoadingPage>
    );

  if (!orders.length) {
    return <p className="text-center py-10 text-muted-foreground">No orders found.</p>;
  }

  return (
    <SectionContainer
      className="min-h-screen p-5 md:p-8 space-y-6
        bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      <h1 className="text-3xl font-extrabold text-foreground dark:text-white mb-4">
        <BiCube className="inline mr-2 text-emerald-500 dark:text-blue-400" />
        Your Orders
      </h1>

      {orders.map((order) => {
        const totalPrice = order.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return (
          <motion.div
            key={order.id}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl bg-white dark:bg-slate-900 border border-transparent hover:border-emerald-300 dark:hover:border-blue-600 transition-all my-5">
              <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                    Order ID: {order.id}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Address: {order.address}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className={`uppercase px-3 py-1 font-semibold rounded-full
                    ${order.status === "DELIVERED"
                      ? "bg-green-500 text-white"
                      : order.status === "CANCELLED"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-400 text-black"
                    }`}
                >
                  {order.status}
                </Badge>
              </CardHeader>

              <CardContent className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-muted-foreground/20 bg-emerald-100 dark:bg-slate-800">
                      <th className="py-2 px-4">Image</th>
                      <th className="py-2 px-4">Medicine</th>
                      <th className="py-2 px-4">Quantity</th>
                      <th className="py-2 px-4">Price</th>
                      <th className="py-2 px-4">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-muted-foreground/10 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="py-2 px-4">
                          <img
                            src={item.medicine.image || "https://via.placeholder.com/50"}
                            alt={item.medicine.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </td>
                        <td className="py-2 px-4 font-medium text-slate-900 dark:text-slate-100">{item.medicine.name}</td>
                        <td className="py-2 px-4">{item.quantity}</td>
                        <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                        <td className="py-2 px-4 font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>

              <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  Total: ${totalPrice.toFixed(2)}
                </p>
                <Button
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="bg-emerald-500 dark:bg-blue-600 hover:bg-emerald-600 dark:hover:bg-blue-700 px-6"
                >
                  Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </SectionContainer>
  );
}
