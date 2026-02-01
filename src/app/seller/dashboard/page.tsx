import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Medicines" value={stats.totalMedicines} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Sold" value={stats.totalSold} />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
        />
      </div>

      {/* Inventory & Sales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Out of stock:{" "}
              <Badge variant="destructive">
                {stats.outOfStockMedicines}
              </Badge>
            </p>
            <p>
              Low stock:{" "}
              <Badge variant="secondary">{stats.lowStockMedicines}</Badge>
            </p>
            <p>
              Average price:{" "}
              <span className="font-semibold">
                ${stats.averagePrice.toFixed(2)}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Today’s revenue:{" "}
              <span className="font-semibold text-green-600">
                ${stats.todayRevenue}
              </span>
            </p>
            <p>
              This month:{" "}
              <span className="font-semibold">
                ${stats.thisMonthRevenue}
              </span>
            </p>
            <p>
              Avg order value:{" "}
              <span className="font-semibold">
                ${stats.averageOrderValue.toFixed(2)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {stats.ordersByStatus.map((item) => (
            <Badge key={item.status} variant="outline">
              {item.status}: {item._count}
            </Badge>
          ))}

          <Badge variant="default">
            Completed: {stats.completedOrders}
          </Badge>

          <Badge variant="destructive">
            Cancelled: {stats.cancelledOrders}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------ Small Reusable Card ------------------ */
function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}



// "use client";

// import { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// interface OrderStatusCount {
//   status: string;
//   _count: number;
// }

// interface SellerStats {
//   totalMedicines: number;
//   outOfStockMedicines: number;
//   lowStockMedicines: number;
//   averagePrice: number;
//   totalOrders: number;
//   completedOrders: number;
//   cancelledOrders: number;
//   ordersByStatus: OrderStatusCount[];
//   totalSold: number;
//   totalRevenue: number;
//   averageOrderValue: number;
//   todayRevenue: number;
//   thisMonthRevenue: number;
// }

// export default function SellerDashBoardPage() {
//   const [stats, setStats] = useState<SellerStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/stat`, {
//           credentials: "include", // IMPORTANT if auth cookie based
//         });

//         if (!res.ok) {
//           throw new Error("Failed to load seller stats");
//         }

//         const data = await res.json();
//         setStats(data);
//       } catch (err: any) {
//         setError(err.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   /* ------------------ States ------------------ */
//   if (loading) {
//     return (
//       <div className="text-center py-16 text-muted-foreground">
//         Loading dashboard...
//       </div>
//     );
//   }

//   if (error || !stats) {
//     return (
//       <div className="text-center py-16 text-red-500">
//         {error || "Failed to load data"}
//       </div>
//     );
//   }

//   /* ------------------ UI ------------------ */
//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold">Seller Dashboard</h1>
//         <p className="text-muted-foreground">
//           Store performance overview
//         </p>
//       </div>

//       {/* Main Stats */}
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard title="Total Medicines" value={stats.totalMedicines} />
//         <StatCard title="Total Orders" value={stats.totalOrders} />
//         <StatCard title="Total Sold" value={stats.totalSold} />
//         <StatCard
//           title="Total Revenue"
//           value={`$${stats.totalRevenue.toFixed(2)}`}
//         />
//       </div>

//       {/* Inventory & Revenue */}
//       <div className="grid gap-6 md:grid-cols-2">
//         {/* Inventory */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Inventory</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <p>
//               Out of stock:{" "}
//               <Badge variant="destructive">
//                 {stats.outOfStockMedicines}
//               </Badge>
//             </p>
//             <p>
//               Low stock:{" "}
//               <Badge variant="secondary">{stats.lowStockMedicines}</Badge>
//             </p>
//             <p>
//               Avg price:{" "}
//               <span className="font-semibold">
//                 ${stats.averagePrice.toFixed(2)}
//               </span>
//             </p>
//           </CardContent>
//         </Card>

//         {/* Revenue */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Revenue</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <p>
//               Today:{" "}
//               <span className="font-semibold text-green-600">
//                 ${stats.todayRevenue}
//               </span>
//             </p>
//             <p>
//               This month:{" "}
//               <span className="font-semibold">
//                 ${stats.thisMonthRevenue}
//               </span>
//             </p>
//             <p>
//               Avg order value:{" "}
//               <span className="font-semibold">
//                 ${stats.averageOrderValue.toFixed(2)}
//               </span>
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Order Status */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Orders by Status</CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-wrap gap-3">
//           {stats.ordersByStatus.map((item) => (
//             <Badge key={item.status} variant="outline">
//               {item.status}: {item._count}
//             </Badge>
//           ))}

//           <Badge variant="default">
//             Completed: {stats.completedOrders}
//           </Badge>

//           <Badge variant="destructive">
//             Cancelled: {stats.cancelledOrders}
//           </Badge>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// /* ------------------ Reusable Card ------------------ */
// function StatCard({
//   title,
//   value,
// }: {
//   title: string;
//   value: string | number;
// }) {
//   return (
//     <Card>
//       <CardHeader className="pb-2">
//         <CardTitle className="text-sm text-muted-foreground">
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">{value}</p>
//       </CardContent>
//     </Card>
//   );
// }
