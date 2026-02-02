"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// React Icons
import { FaUsers, FaPills, FaClipboardList, FaShoppingCart, FaStar } from "react-icons/fa";

// Recharts for mini charts
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AdminStats {
  users: { total: number; customers: number; sellers: number; admins: number };
  medicines: { total: number };
  orders: {
    total: number;
    placed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  cart: { totalItems: number; totalQuantity: number };
  reviews: { total: number; averageRating: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/stats`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch stats");
      setStats(data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error fetching admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className="p-6 text-red-500">Failed to load stats.</p>;
  }

  const orderData = [
    { name: "Placed", value: stats.orders.placed },
    { name: "Processing", value: stats.orders.processing },
    { name: "Shipped", value: stats.orders.shipped },
    { name: "Delivered", value: stats.orders.delivered },
    { name: "Cancelled", value: stats.orders.cancelled },
  ];

  const reviewData = [
    { name: "Rating", value: stats.reviews.averageRating },
  ];

  const cardStyle =
    "bg-gradient-to-br from-white/80 dark:from-gray-900/80 to-white/60 dark:to-gray-800/60 p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-transform";

  return (
    <div className="p-6 md:p-10 space-y-6">
      <h1 className="text-4xl font-extrabold text-foreground dark:text-white mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users */}
        <Card className={cardStyle}>
          <CardHeader className="flex items-center gap-3 mb-4">
            <FaUsers className="w-7 h-7 text-blue-600" />
            <CardTitle className="text-xl font-bold">Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total: <Badge variant="secondary">{stats.users.total}</Badge></p>
            <p>Customers: <Badge variant="default">{stats.users.customers}</Badge></p>
            <p>Sellers: <Badge variant="outline">{stats.users.sellers}</Badge></p>
            <p>Admins: <Badge variant="destructive">{stats.users.admins}</Badge></p>
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card className={cardStyle}>
          <CardHeader className="flex items-center gap-3 mb-4">
            <FaPills className="w-7 h-7 text-green-600" />
            <CardTitle className="text-xl font-bold">Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Medicines: <Badge variant="secondary">{stats.medicines.total}</Badge></p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className={cardStyle}>
          <CardHeader className="flex items-center gap-3 mb-4">
            <FaClipboardList className="w-7 h-7 text-purple-600" />
            <CardTitle className="text-xl font-bold">Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total Orders: <Badge variant="secondary">{stats.orders.total}</Badge></p>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        <Card className={cardStyle}>
          <CardHeader className="flex items-center gap-3 mb-4">
            <FaShoppingCart className="w-7 h-7 text-orange-600" />
            <CardTitle className="text-xl font-bold">Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total Items: <Badge variant="secondary">{stats.cart.totalItems}</Badge></p>
            <p>Total Quantity: <Badge variant="default">{stats.cart.totalQuantity}</Badge></p>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className={cardStyle}>
          <CardHeader className="flex items-center gap-3 mb-4">
            <FaStar className="w-7 h-7 text-yellow-500" />
            <CardTitle className="text-xl font-bold">Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total Reviews: <Badge variant="secondary">{stats.reviews.total}</Badge></p>
            <p>Average Rating: <Badge variant="default">{stats.reviews.averageRating.toFixed(1)}</Badge></p>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reviewData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#facc15" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
