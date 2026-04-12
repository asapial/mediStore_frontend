"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  StatsGrid, AlertBanner, Card, SectionTable, TR, TD, Badge,
  ChartLegend, KpiRow, ProgressBar,
} from "@/components/ui/Dashboardui";
import { BarChart, DoughnutChart } from "@/components/ui/Charts";
import { COLORS } from "@/lib/theme";
import type { StatCard, AlertItem } from "@/types/dashboard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminStats {
  users:    { total: number; customers: number; sellers: number; admins: number };
  medicines:{ total: number };
  orders:   { total: number; placed: number; processing: number; shipped: number; delivered: number; cancelled: number };
  cart:     { totalItems: number; totalQuantity: number };
  reviews:  { total: number; averageRating: number };
}

// ─── Build stat card grid from live data ─────────────────────────────────────
function buildStats(s: AdminStats): StatCard[] {
  return [
    { label: "Total users",      value: s.users.total.toLocaleString(),      sub: `${s.users.customers} customers · ${s.users.sellers} sellers`, trend: "up",      accent: "blue"  },
    { label: "Total medicines",  value: s.medicines.total.toLocaleString(),   sub: "Across all sellers",                                            trend: "neutral", accent: "green" },
    { label: "Orders placed",    value: s.orders.total.toLocaleString(),      sub: `${s.orders.delivered} delivered · ${s.orders.cancelled} cancelled`, trend: "up", accent: "amber" },
    { label: "Active cart items",value: s.cart.totalItems.toLocaleString(),   sub: `${s.cart.totalQuantity} total qty in carts`,                    trend: "neutral", accent: "navy"  },
    { label: "Total reviews",    value: s.reviews.total.toLocaleString(),     sub: `Avg rating ${s.reviews.averageRating.toFixed(1)} ★`,            trend: "up",      accent: "amber" },
    { label: "Admin accounts",   value: s.users.admins.toLocaleString(),      sub: "Platform administrators",                                        trend: "neutral", accent: "red"   },
  ];
}

const ALERTS: AlertItem[] = [
  { title: "Review seller licenses", desc: "Pending applications may be waiting for approval", action: "Go to Licenses →", variant: "danger"  },
  { title: "Monitor review quality", desc: "Flag spam or abusive reviews from the reviews panel", action: "View Reviews →",  variant: "info"   },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.success && d?.data) setStats(d.data);
        else toast.error(d?.message || "Failed to fetch stats");
      })
      .catch(() => toast.error("Could not reach server"))
      .finally(() => setLoading(false));
  }, []);

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );

  if (!stats) return (
    <div className="p-8 text-center">
      <p className="text-destructive font-semibold">Failed to load admin stats.</p>
    </div>
  );

  // ── Derived chart data ─────────────────────────────────────────────────────
  const orderStatusData = {
    labels: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    values: [stats.orders.placed, stats.orders.processing, stats.orders.shipped, stats.orders.delivered, stats.orders.cancelled],
    colors: [COLORS.sky, COLORS.amber, COLORS.navy, COLORS.sage, COLORS.red],
  };

  const userRoleData = {
    labels: ["Customers", "Sellers", "Admins"],
    values: [stats.users.customers, stats.users.sellers, stats.users.admins],
    colors: [COLORS.navy, COLORS.sky, COLORS.red],
  };

  return (
    <div className="p-5 space-y-5 max-w-7xl mx-auto">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-primary">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">MediStore Admin · Live statistics</p>
      </div>

      {/* Stat cards */}
      <StatsGrid stats={buildStats(stats)} />

      {/* Alerts */}
      {ALERTS.map(a => <AlertBanner key={a.title} alert={a} />)}

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-5">

        <Card title="Order status breakdown" subtitle="Current snapshot across all orders">
          <ChartLegend items={orderStatusData.labels.map((l, i) => ({ label: l, color: orderStatusData.colors[i] }))} />
          <BarChart
            labels={orderStatusData.labels}
            datasets={[{ data: orderStatusData.values, color: orderStatusData.colors }]}
            height={200}
          />
        </Card>

        <Card title="User roles" subtitle="Distribution of registered accounts">
          <div className="relative">
            <DoughnutChart
              labels={userRoleData.labels}
              values={userRoleData.values}
              colors={userRoleData.colors}
              height={200}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-xl font-bold text-primary">{stats.users.total.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">total users</p>
            </div>
          </div>
          <ChartLegend items={userRoleData.labels.map((l, i) => ({ label: l, color: userRoleData.colors[i] }))} />
        </Card>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <Card title="Cart insights" subtitle="Across all active customer carts">
          <KpiRow label="Cart line items" value={stats.cart.totalItems.toLocaleString()} />
          <KpiRow label="Total quantity in carts" value={stats.cart.totalQuantity.toLocaleString()} bold />
          <ProgressBar
            pct={Math.min(100, (stats.cart.totalItems / Math.max(stats.users.customers, 1)) * 10)}
            color={COLORS.amber}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            ~{(stats.cart.totalItems / Math.max(stats.users.customers, 1)).toFixed(1)} items / customer
          </p>
        </Card>

        <Card title="Review summary" subtitle="Across all medicines">
          <KpiRow label="Total reviews" value={stats.reviews.total.toLocaleString()} />
          <KpiRow label="Average rating" value={`${stats.reviews.averageRating.toFixed(2)} / 5`} bold />
          <ProgressBar pct={(stats.reviews.averageRating / 5) * 100} color={COLORS.amber} />
          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-base ${s <= Math.round(stats.reviews.averageRating) ? "text-amber-400" : "text-muted-foreground/30"}`}>★</span>
            ))}
          </div>
        </Card>

        <Card title="Seller activity" subtitle="Registered seller accounts">
          <KpiRow label="Total sellers"    value={stats.users.sellers.toLocaleString()} />
          <KpiRow label="Total medicines"  value={stats.medicines.total.toLocaleString()} bold />
          <KpiRow label="Avg per seller"   value={(stats.medicines.total / Math.max(stats.users.sellers, 1)).toFixed(1)} />
          <ProgressBar
            pct={Math.min(100, (stats.users.sellers / Math.max(stats.users.total, 1)) * 100 * 6)}
            color={COLORS.navy}
          />
        </Card>
      </div>

      {/* Order status detail table */}
      <SectionTable title="Order status detail" columns={["Status", "Count", "% of total", "Bar"]}>
        {orderStatusData.labels.map((label, i) => {
          const count = orderStatusData.values[i];
          const pct   = stats.orders.total > 0 ? (count / stats.orders.total) * 100 : 0;
          const variantMap: Record<string, "green" | "blue" | "amber" | "navy" | "red"> = {
            Delivered: "green", Shipped: "navy", Processing: "amber", Placed: "blue", Cancelled: "red",
          };
          return (
            <TR key={label}>
              <TD><Badge variant={variantMap[label] ?? "navy"}>{label}</Badge></TD>
              <TD><span className="font-semibold text-primary">{count.toLocaleString()}</span></TD>
              <TD><span className="text-muted-foreground">{pct.toFixed(1)}%</span></TD>
              <TD>
                <div className="w-32 h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: orderStatusData.colors[i] }} />
                </div>
              </TD>
            </TR>
          );
        })}
      </SectionTable>

    </div>
  );
}
