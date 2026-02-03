"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FaUser, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

interface Seller {
  id: string;
  name: string;
  image: string | null;
}

interface Medicine {
  id: string;
  name: string;
  image: string | null;
  manufacturer: string;
  seller: Seller;
}

interface OrderItem {
  id: string;
  quantity: number;
  status: string;
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

export default function AdminOrderDetailsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/order`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
      setOrders(data.data);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

const statusColor = (status: string): 
  "default" | "secondary" | "destructive" | "outline" | "link" | "ghost" => {
  switch (status) {
    case "PLACED":
      return "default";
    case "PROCESSING":
      return "secondary";
    case "SHIPPED":
      return "outline";       
    case "DELIVERED":
      return "secondary";     
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
};


  return (
    <SectionContainer className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-emerald-800 dark:text-emerald-400">
        All Orders
      </h1>

      {loading ? (
        <MedicineLoadingPage text="orders"></MedicineLoadingPage>
      ) : orders.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground text-lg">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const totalPrice = order.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            return (
              <Card
                key={order.id}
                className="overflow-x-auto border-emerald-200 dark:border-slate-700 hover:shadow-xl transition-shadow rounded-xl"
              >
                <CardHeader className=" rounded-t-xl">
                  <CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                        Order ID: <span className="font-mono text-sm">{order.id}</span>
                      </span>
                      <Badge variant={statusColor(order.status)} className="uppercase text-sm px-3 py-1">
                        {order.status}
                      </Badge>
                    </div>
                  </CardTitle>

                  <div className="flex flex-col md:flex-row md:justify-between gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-emerald-500" /> <span>User: {order.userId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-orange-500" /> <span>Address: {order.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-purple-500" /> <span>Date: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-emerald-50 dark:bg-slate-700">
                        <TableHead>Image</TableHead>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Seller</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">
                          <TableCell>
                            <img
                              src={item.medicine.image || "https://via.placeholder.com/80"}
                              alt={item.medicine.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-emerald-700 dark:text-emerald-400">{item.medicine.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>{item.medicine.manufacturer}</TableCell>
                          <TableCell>{item.medicine.seller.name}</TableCell>
                        </TableRow>
                      ))}

                      <TableRow className="bg-emerald-50 dark:bg-slate-800 font-bold">
                        <TableCell colSpan={4} className="text-right">
                          Total:
                        </TableCell>
                        <TableCell>${totalPrice.toFixed(2)}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </SectionContainer>
  );
}
