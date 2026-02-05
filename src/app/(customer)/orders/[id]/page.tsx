"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BiArrowBack, BiCube } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";
import { Spinner } from "@/components/ui/spinner";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

// ShadCN Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/${id}`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch order");
      setOrder(data.data);
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Error fetching order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  if (loading)
    return <MedicineLoadingPage text="order"></MedicineLoadingPage>;

  if (!order)
    return (
      <p className="text-center py-10 text-muted-foreground">Order not found.</p>
    );

  const totalPrice = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ---------------- DELETE ORDER ----------------
  const handleDeleteOrder = async (orderId: string) => {
    if (!order) return;
    try {
      setLoading(true);
      console.log(orderId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/${orderId}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete order");
      toast.success("Order deleted successfully");
      router.push("/orders");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <SectionContainer
      className="min-h-screen p-5 md:p-8 space-y-6
        bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-extrabold text-foreground dark:text-white flex items-center gap-2">
          <BiCube className="text-emerald-500 dark:text-blue-400 text-2xl" />
          Order Details
        </h1>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-1"
        >
          <BiArrowBack /> Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-xl bg-white dark:bg-slate-900 border border-transparent hover:border-emerald-300 dark:hover:border-blue-600 transition-all">
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
                ${
                  order.status === "DELIVERED"
                    ? "bg-green-500 text-white"
                    : order.status === "CANCELLED"
                    ? "bg-red-500 text-white"
                    : "bg-yellow-400 text-black"
                }`}
            >
              {order.status}
            </Badge>
          </CardHeader>

          <CardContent className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-muted-foreground/20 bg-emerald-100 dark:bg-slate-800">
                  <th className="py-2 px-4">Image</th>
                  <th className="py-2 px-4">Medicine</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Price</th>
                  <th className="py-2 px-4">Subtotal</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-muted-foreground/10 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="py-2 px-4 w-20">
                      <img
                        src={
                          item.medicine.image ||
                          "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"
                        }
                        alt={item.medicine.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="py-2 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {item.medicine.name}
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {item.medicine.description}
                    </td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                    <td className="py-2 px-4 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-2 px-4">
                      <Badge
                        variant={
                          item.status === "DELIVERED"
                            ? "default"
                            : item.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              Total: ${totalPrice.toFixed(2)}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/checkout")}
                className="bg-emerald-500 dark:bg-blue-600 hover:bg-emerald-600 dark:hover:bg-blue-700 px-6"
              >
                Proceed to Checkout
              </Button>

              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="px-6">
                      Delete Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this order? This action cannot be undone.</p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={()=>handleDeleteOrder(order.id)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </SectionContainer>
  );
}
