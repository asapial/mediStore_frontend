"use client";

import { useEffect, useState } from "react";
import {
  StatsGrid, AlertBanner, Card, SectionTable, TR, TD, Badge, ChartLegend,
} from "@/components/ui/Dashboardui";
import { LineChart, BarChart, DoughnutChart } from "@/components/ui/Charts";
import {
  ADMIN_STATS, ADMIN_ALERTS, ADMIN_FLAGGED, ADMIN_CHART_DATA,
} from "@/lib/dashboard-data";
import type { StatCard } from "@/types/dashboard";
import { COLORS } from "@/lib/theme";

const STATUS_VARIANT: Record<string, "red" | "amber" | "blue" | "green"> = {
  Investigate: "red",
  Pending:     "amber",
  "In review": "blue",
};

// Merge real API stats into the seeded label/accent/trend structure
function mergeStats(base: StatCard[], live: Record<string, any>): StatCard[] {
  return base.map((s, i) => {
    if (i === 0 && live.totalRevenue)   return { ...s, value: `৳${(live.totalRevenue / 1_000_000).toFixed(1)}M` };
    if (i === 1 && live.totalUsers)     return { ...s, value: live.totalUsers.toLocaleString() };
    if (i === 2 && live.totalOrders)    return { ...s, value: live.totalOrders.toLocaleString() };
    if (i === 3 && live.activeSellers)  return { ...s, value: String(live.activeSellers) };
    return s;
  });
}

export function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>(ADMIN_STATS);
  const { revenue, roleSplit, orderStatus, categories } = ADMIN_CHART_DATA;

  // ── Fetch real admin stats ────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.success && d?.data) setStats(mergeStats(ADMIN_STATS, d.data));
      })
      .catch(() => { /* keep mock on error */ });
  }, []);

  return (
    <div>
      <StatsGrid stats={stats} />

      {ADMIN_ALERTS.map((a) => <AlertBanner key={a.title} alert={a} />)}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, margin: "16px 0" }}>
        <Card title="Revenue & orders — last 6 months" subtitle="Monthly trend with dual axis">
          <ChartLegend items={[
            { label: "Revenue (৳M)", color: COLORS.navy  },
            { label: "Orders",       color: COLORS.amber },
          ]} />
          <LineChart
            labels={revenue.labels}
            datasets={[
              { data: revenue.revenue, color: COLORS.navy,  fill: true,   yAxisID: "y",  label: "Revenue" },
              { data: revenue.orders,  color: COLORS.amber, dashed: true, yAxisID: "y1", label: "Orders"  },
            ]}
            height={220}
            secondaryAxis
          />
        </Card>

        <Card title="User role breakdown" subtitle="All registered accounts by role">
          <div style={{ position: "relative" }}>
            <DoughnutChart labels={roleSplit.labels} values={roleSplit.values} colors={roleSplit.colors} height={220} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: COLORS.navy }}>
                {stats[1]?.value ?? "—"}
              </div>
              <div style={{ fontSize: 11, color: COLORS.taupe }}>total users</div>
            </div>
          </div>
          <ChartLegend items={roleSplit.labels.map((l, i) => ({ label: l, color: roleSplit.colors[i] }))} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 16 }}>
        <Card title="Order status distribution" subtitle="Current snapshot across all orders">
          <ChartLegend items={orderStatus.labels.map((l, i) => ({ label: l, color: orderStatus.colors[i] }))} />
          <BarChart
            labels={orderStatus.labels}
            datasets={[{ data: orderStatus.values, color: orderStatus.colors }]}
            height={200}
          />
        </Card>

        <Card title="Top medicine categories" subtitle="By revenue share this month">
          <BarChart
            labels={categories.labels}
            datasets={[{ data: categories.values, color: [COLORS.navy, COLORS.navy, COLORS.sky, COLORS.sky, COLORS.amber, COLORS.amber] }]}
            height={200}
            horizontal
          />
        </Card>
      </div>

      <SectionTable title="Recent flagged activity" columns={["User", "Type", "Detail", "Time", "Status"]}>
        {ADMIN_FLAGGED.map((row) => (
          <TR key={row.user + row.time}>
            <TD>{row.user}</TD>
            <TD>{row.type}</TD>
            <TD>{row.detail}</TD>
            <TD><span style={{ color: COLORS.taupe, fontSize: 12 }}>{row.time}</span></TD>
            <TD><Badge variant={STATUS_VARIANT[row.status] ?? "navy"}>{row.status}</Badge></TD>
          </TR>
        ))}
      </SectionTable>
    </div>
  );
}