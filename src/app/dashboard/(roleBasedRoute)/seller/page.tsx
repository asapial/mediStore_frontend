"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  StatsGrid, Card, SectionTable, TR, TD, Badge,
  ChartLegend, KpiRow, ProgressBar,
} from "@/components/ui/Dashboardui";
import { BarChart, DoughnutChart } from "@/components/ui/Charts";
import { COLORS } from "@/lib/theme";
import type { StatCard } from "@/types/dashboard";

interface SellerStats {
  totalMedicines:     number;
  outOfStockMedicines:number;
  lowStockMedicines:  number;
  averagePrice:       number;
  totalOrders:        number;
  completedOrders:    number;
  cancelledOrders:    number;
  totalSold:          number;
  totalRevenue:       number;
  averageOrderValue:  number;
  todayRevenue:       number;
  thisMonthRevenue:   number;
  ordersByStatus:     { status: string; _count: number }[];
}

function buildStats(s: SellerStats): StatCard[] {
  return [
    { label: "Total medicines",   value: s.totalMedicines.toLocaleString(),          sub: `${s.outOfStockMedicines} out of stock · ${s.lowStockMedicines} low`, trend: "neutral", accent: "green" },
    { label: "Total orders",      value: s.totalOrders.toLocaleString(),              sub: `${s.completedOrders} delivered · ${s.cancelledOrders} cancelled`,    trend: "up",      accent: "blue"  },
    { label: "Units sold",        value: s.totalSold.toLocaleString(),                sub: "All time",                                                            trend: "up",      accent: "amber" },
    { label: "Total revenue",     value: `$${s.totalRevenue.toFixed(0)}`,             sub: "All time",                                                            trend: "up",      accent: "navy"  },
    { label: "Today's revenue",   value: `$${s.todayRevenue.toFixed(0)}`,             sub: "Since midnight",                                                      trend: "neutral", accent: "amber" },
    { label: "This month",        value: `$${s.thisMonthRevenue.toFixed(0)}`,         sub: `Avg order $${s.averageOrderValue.toFixed(0)}`,                        trend: "up",      accent: "green" },
  ];
}

const STATUS_VARIANT: Record<string, "green"|"blue"|"amber"|"red"|"navy"> = {
  DELIVERED: "green", SHIPPED: "navy", PROCESSING: "amber",
  PLACED: "blue", CANCELLED: "red", CONFIRMED: "blue",
};

export default function SellerDashboardPage() {
  const [stats,   setStats]   = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/stat", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.success && d?.data) setStats(d.data);
        else toast.error(d?.message || "Failed to fetch stats");
      })
      .catch(() => toast.error("Could not reach server"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
      </div>
      {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );
  if (!stats) return <div className="p-8 text-center text-destructive font-semibold">Failed to load seller stats.</div>;

  const statusChartData = stats.ordersByStatus.length > 0
    ? {
        labels: stats.ordersByStatus.map(o => o.status),
        values: stats.ordersByStatus.map(o => o._count),
        colors: stats.ordersByStatus.map(o => {
          const m: Record<string,string> = { DELIVERED: COLORS.sage, SHIPPED: COLORS.navy, PROCESSING: COLORS.amber, PLACED: COLORS.sky, CANCELLED: COLORS.red };
          return m[o.status] ?? COLORS.taupe;
        }),
      }
    : { labels: ["No orders yet"], values: [1], colors: [COLORS.taupe] };

  const inventoryHealthPct = stats.totalMedicines > 0
    ? Math.round(((stats.totalMedicines - stats.outOfStockMedicines - stats.lowStockMedicines) / stats.totalMedicines) * 100)
    : 0;

  return (
    <div className="p-5 space-y-5 max-w-7xl mx-auto">

      <div>
        <h1 className="text-xl font-semibold text-primary">Seller Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your store performance · Live data</p>
      </div>

      <StatsGrid stats={buildStats(stats)} />

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Order status breakdown" subtitle="All orders involving your products">
          <ChartLegend items={statusChartData.labels.map((l, i) => ({ label: l, color: statusChartData.colors[i] }))} />
          <DoughnutChart
            labels={statusChartData.labels}
            values={statusChartData.values}
            colors={statusChartData.colors}
            height={200}
          />
        </Card>

        <Card title="Revenue breakdown" subtitle="Cumulative vs monthly vs daily">
          <BarChart
            labels={["All Time", "This Month", "Today"]}
            datasets={[{
              data: [
                Math.round(stats.totalRevenue),
                Math.round(stats.thisMonthRevenue),
                Math.round(stats.todayRevenue),
              ],
              color: [COLORS.navy, COLORS.sky, COLORS.amber],
            }]}
            height={200}
          />
        </Card>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <Card title="Inventory health" subtitle="Stock status overview">
          <KpiRow label="Total listings"    value={stats.totalMedicines} />
          <KpiRow label="Out of stock"      value={<span className="text-destructive">{stats.outOfStockMedicines}</span>} />
          <KpiRow label="Low stock (≤10)"   value={<span className="text-amber-500">{stats.lowStockMedicines}</span>} />
          <KpiRow label="Avg price"         value={`$${stats.averagePrice.toFixed(2)}`} bold />
          <ProgressBar pct={inventoryHealthPct} color={COLORS.sage} />
          <p className="text-[11px] text-muted-foreground">{inventoryHealthPct}% of listings are adequately stocked</p>
        </Card>

        <Card title="Sales performance" subtitle="Order completion metrics">
          <KpiRow label="Total units sold"   value={stats.totalSold.toLocaleString()} bold />
          <KpiRow label="Completed orders"   value={stats.completedOrders} />
          <KpiRow label="Cancelled orders"   value={stats.cancelledOrders} />
          <KpiRow label="Avg order value"    value={`$${stats.averageOrderValue.toFixed(2)}`} />
          <ProgressBar
            pct={stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}
            color={COLORS.sage}
          />
          <p className="text-[11px] text-muted-foreground">
            {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}% completion rate
          </p>
        </Card>

        <Card title="Revenue timeline" subtitle="Revenue progression">
          <KpiRow label="Today"       value={`$${stats.todayRevenue.toFixed(2)}`} />
          <KpiRow label="This month"  value={`$${stats.thisMonthRevenue.toFixed(2)}`} />
          <KpiRow label="All time"    value={`$${stats.totalRevenue.toFixed(2)}`} bold />
          <ProgressBar
            pct={stats.totalRevenue > 0 ? Math.min(100, (stats.thisMonthRevenue / stats.totalRevenue) * 100) : 0}
            color={COLORS.amber}
          />
          <p className="text-[11px] text-muted-foreground">This month is {stats.totalRevenue > 0 ? ((stats.thisMonthRevenue / stats.totalRevenue)*100).toFixed(1) : 0}% of all-time revenue</p>
        </Card>
      </div>

      {/* Order status table */}
      <SectionTable title="Orders by status" columns={["Status", "Count", "% of total", "Progress"]}>
        {stats.ordersByStatus.map(row => {
          const pct = stats.totalOrders > 0 ? (row._count / stats.totalOrders) * 100 : 0;
          return (
            <TR key={row.status}>
              <TD><Badge variant={STATUS_VARIANT[row.status] ?? "navy"}>{row.status}</Badge></TD>
              <TD><span className="font-semibold text-primary">{row._count}</span></TD>
              <TD><span className="text-muted-foreground">{pct.toFixed(1)}%</span></TD>
              <TD>
                <div className="w-28 h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS.navy }} />
                </div>
              </TD>
            </TR>
          );
        })}
      </SectionTable>

    </div>
  );
}
