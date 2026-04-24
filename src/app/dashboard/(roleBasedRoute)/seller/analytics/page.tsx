"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaChartLine, FaDownload, FaChartPie, FaBoxes,
  FaTrophy, FaArrowUp, FaArrowDown, FaMinus
} from "react-icons/fa";

interface SellerStats {
  totalMedicines: number;
  outOfStockMedicines: number;
  lowStockMedicines: number;
  averagePrice: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSold: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  ordersByStatus: { status: string; _count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PLACED: "#3A6EA5",
  PROCESSING: "#C2703A",
  SHIPPED: "#5C4033",
  DELIVERED: "#2E7D32",
  CANCELLED: "#C62828",
};

const SEVERITY_BAR = [
  { key: "totalRevenue",      label: "All-Time Revenue",  prefix: "$" },
  { key: "thisMonthRevenue",  label: "This Month",        prefix: "$" },
  { key: "todayRevenue",      label: "Today",             prefix: "$" },
];

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/stat", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.success && d?.data) setStats(d.data);
        else toast.error(d?.message || "Failed to fetch analytics");
      })
      .catch(() => toast.error("Could not reach server"))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!stats) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", `$${stats.totalRevenue.toFixed(2)}`],
      ["This Month Revenue", `$${stats.thisMonthRevenue.toFixed(2)}`],
      ["Today Revenue", `$${stats.todayRevenue.toFixed(2)}`],
      ["Total Orders", stats.totalOrders],
      ["Completed Orders", stats.completedOrders],
      ["Cancelled Orders", stats.cancelledOrders],
      ["Total Units Sold", stats.totalSold],
      ["Avg Order Value", `$${stats.averageOrderValue.toFixed(2)}`],
      ["Total Medicines", stats.totalMedicines],
      ["Out of Stock", stats.outOfStockMedicines],
      ["Low Stock", stats.lowStockMedicines],
      ...stats.ordersByStatus.map(o => [`Orders — ${o.status}`, o._count]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "seller_analytics.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported as CSV");
  };

  if (loading) return (
    <div className="medi-page space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#EEE4D9" }} />
      ))}
    </div>
  );

  if (!stats) return (
    <div className="medi-page text-center py-20" style={{ color: "#C62828" }}>
      Failed to load analytics data.
    </div>
  );

  const completionRate = stats.totalOrders > 0
    ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
    : "0";

  const cancellationRate = stats.totalOrders > 0
    ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)
    : "0";

  const maxRevenue = Math.max(stats.totalRevenue, 1);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaChartLine className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Sales Analytics</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Live performance data for your store</p>
          </div>
        </div>
        <button onClick={handleExportCSV}
          className="medi-btn-accent flex items-center gap-2">
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "All-Time Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, sub: "Cumulative earnings", trend: "up", color: "#1B3A5C" },
          { label: "This Month", value: `$${stats.thisMonthRevenue.toFixed(0)}`, sub: "Current month revenue", trend: "up", color: "#3A6EA5" },
          { label: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(0)}`, sub: "Since midnight", trend: "neutral", color: "#C2703A" },
          { label: "Avg Order Value", value: `$${stats.averageOrderValue.toFixed(2)}`, sub: "Per completed order", trend: "up", color: "#2E7D32" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="medi-card p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A6650" }}>{kpi.label}</p>
              {kpi.trend === "up" ? <FaArrowUp style={{ color: "#2E7D32" }} /> :
               kpi.trend === "down" ? <FaArrowDown style={{ color: "#C62828" }} /> :
               <FaMinus style={{ color: "#8A6650" }} />}
            </div>
            <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs mt-1" style={{ color: "#8A6650" }}>{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Revenue Breakdown */}
        <div className="medi-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaChartLine style={{ color: "#1B3A5C" }} />
            <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Revenue Breakdown</h2>
          </div>
          <div className="space-y-4">
            {SEVERITY_BAR.map(item => {
              const value = stats[item.key as keyof SellerStats] as number;
              const pct = Math.min(100, (value / maxRevenue) * 100);
              return (
                <div key={item.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "#5C4033" }}>{item.label}</span>
                    <span className="font-bold" style={{ color: "#1B3A5C" }}>{item.prefix}{value.toFixed(2)}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                    <motion.div className="h-full rounded-full" style={{ background: "#1B3A5C" }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="medi-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaChartPie style={{ color: "#C2703A" }} />
            <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Orders by Status</h2>
          </div>
          {stats.ordersByStatus.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#8A6650" }}>No order data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.ordersByStatus.map(o => {
                const pct = stats.totalOrders > 0 ? (o._count / stats.totalOrders) * 100 : 0;
                const color = STATUS_COLORS[o.status] ?? "#8A6650";
                return (
                  <div key={o.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold" style={{ color }}>{o.status}</span>
                      <span style={{ color: "#5C4033" }}>{o._count} orders ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Order Performance */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="medi-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaBoxes style={{ color: "#3A6EA5" }} />
            <h2 className="font-bold" style={{ color: "#1B3A5C" }}>Inventory Health</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: "Total Listings", value: stats.totalMedicines, color: "#1B3A5C" },
              { label: "In Stock", value: stats.totalMedicines - stats.outOfStockMedicines - stats.lowStockMedicines, color: "#2E7D32" },
              { label: "Low Stock (≤10)", value: stats.lowStockMedicines, color: "#C2703A" },
              { label: "Out of Stock", value: stats.outOfStockMedicines, color: "#C62828" },
              { label: "Avg Price", value: `$${stats.averagePrice.toFixed(2)}`, color: "#5C4033" },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1 border-b" style={{ borderColor: "#EEE4D9" }}>
                <span style={{ color: "#8A6650" }}>{row.label}</span>
                <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="medi-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaTrophy style={{ color: "#C2703A" }} />
            <h2 className="font-bold" style={{ color: "#1B3A5C" }}>Order Performance</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: "Total Orders", value: stats.totalOrders, color: "#1B3A5C" },
              { label: "Delivered", value: stats.completedOrders, color: "#2E7D32" },
              { label: "Cancelled", value: stats.cancelledOrders, color: "#C62828" },
              { label: "Completion Rate", value: `${completionRate}%`, color: "#3A6EA5" },
              { label: "Cancellation Rate", value: `${cancellationRate}%`, color: "#C62828" },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1 border-b" style={{ borderColor: "#EEE4D9" }}>
                <span style={{ color: "#8A6650" }}>{row.label}</span>
                <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="medi-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine style={{ color: "#2E7D32" }} />
            <h2 className="font-bold" style={{ color: "#1B3A5C" }}>Sales Totals</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: "Units Sold", value: stats.totalSold.toLocaleString(), color: "#1B3A5C" },
              { label: "Avg Order Value", value: `$${stats.averageOrderValue.toFixed(2)}`, color: "#3A6EA5" },
              { label: "Today Revenue", value: `$${stats.todayRevenue.toFixed(2)}`, color: "#C2703A" },
              { label: "Month Revenue", value: `$${stats.thisMonthRevenue.toFixed(2)}`, color: "#3A6EA5" },
              { label: "All-Time Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, color: "#2E7D32" },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1 border-b" style={{ borderColor: "#EEE4D9" }}>
                <span style={{ color: "#8A6650" }}>{row.label}</span>
                <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Detail Table */}
      <div className="medi-card p-6">
        <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Order Status Detail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid #EEE4D9" }}>
                {["Status", "Count", "% of Total", "Progress"].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-xs uppercase tracking-wider font-semibold" style={{ color: "#8A6650" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.ordersByStatus.map(o => {
                const pct = stats.totalOrders > 0 ? (o._count / stats.totalOrders) * 100 : 0;
                const color = STATUS_COLORS[o.status] ?? "#8A6650";
                return (
                  <tr key={o.status} style={{ borderBottom: "1px solid #F5EDE3" }}>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: `${color}20`, color }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold" style={{ color: "#1B3A5C" }}>{o._count}</td>
                    <td className="py-3 pr-4" style={{ color: "#8A6650" }}>{pct.toFixed(1)}%</td>
                    <td className="py-3 pr-4">
                      <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
