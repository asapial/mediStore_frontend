"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GiPill, GiSyringe, GiMedicinePills, GiHealthIncrease } from "react-icons/gi";

const stats = {
  totalMedicines: 15,
  outOfStockMedicines: 2,
  lowStockMedicines: 4,
  averagePrice: 18.75,
  totalOrders: 21,
  completedOrders: 14,
  cancelledOrders: 2,
  ordersByStatus: [
    { status: "PLACED", _count: 3 },
    { status: "DELIVERED", _count: 14 },
  ],
  totalSold: 96,
  totalRevenue: 3240.5,
  averageOrderValue: 154.3,
  todayRevenue: 320,
  thisMonthRevenue: 1980,
};

export default function SellerDashBoardPage() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-5">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-600 dark:text-blue-400">
          Seller Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Overview of your pharmacy store performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={<GiPill className="text-emerald-500 w-6 h-6" />}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<GiMedicinePills className="text-blue-500 w-6 h-6" />}
        />
        <StatCard
          title="Total Sold"
          value={stats.totalSold}
          icon={<GiSyringe className="text-purple-500 w-6 h-6" />}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<GiHealthIncrease className="text-green-500 w-6 h-6" />}
        />
      </div>

      {/* Inventory & Revenue */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory */}
        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-gray-900 dark:to-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Out of stock:{" "}
              <Badge variant="destructive">{stats.outOfStockMedicines}</Badge>
            </p>
            <p>
              Low stock: <Badge variant="secondary">{stats.lowStockMedicines}</Badge>
            </p>
            <p>
              Average price:{" "}
              <span className="font-semibold">${stats.averagePrice.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Sales Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Today’s revenue:{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${stats.todayRevenue}
              </span>
            </p>
            <p>
              This month:{" "}
              <span className="font-semibold">${stats.thisMonthRevenue}</span>
            </p>
            <p>
              Avg order value:{" "}
              <span className="font-semibold">${stats.averageOrderValue.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status */}
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {stats.ordersByStatus.map((item) => (
            <Badge key={item.status} variant="outline">
              {item.status}: {item._count}
            </Badge>
          ))}

          <Badge variant="default">Completed: {stats.completedOrders}</Badge>
          <Badge variant="destructive">Cancelled: {stats.cancelledOrders}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------ Small Reusable Card ------------------ */
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-white to-emerald-50 dark:from-slate-800 dark:to-slate-900 hover:scale-105 transition-transform">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          {icon && <div className="ml-2">{icon}</div>}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
