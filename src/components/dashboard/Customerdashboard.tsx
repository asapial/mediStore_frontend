"use client";

import { useEffect, useState } from "react";
import {
  StatsGrid, AlertBanner, Card, SectionTable, TR, TD, Badge,
  ChartLegend, KpiRow, ProgressBar,
} from "@/components/ui/DashboardUI";
import { DoughnutChart, BarChart } from "@/components/ui/Charts";
import {
  CUSTOMER_STATS, CUSTOMER_ALERTS, CUSTOMER_REMINDERS,
  CUSTOMER_CHART_DATA,
} from "@/lib/dashboard-data";
import type { StatCard } from "@/types/dashboard";
import { COLORS } from "@/lib/theme";

type UrgencyVariant = "red" | "green";

interface Order {
  id: string;
  totalPrice?: number;
  total?: number;
  status: string;
}

function statusVariant(status: string): "green" | "blue" | "amber" | "red" {
  const s = status?.toLowerCase();
  if (s === "delivered" || s === "completed") return "green";
  if (s === "shipped"   || s === "confirmed") return "blue";
  if (s === "cancelled" || s === "returned")  return "red";
  return "amber";
}

function mergeStat(base: StatCard[], wallet?: number, orderCount?: number): StatCard[] {
  return base.map((s, i) => {
    if (i === 1 && orderCount !== undefined) return { ...s, value: String(orderCount) };
    if (i === 2 && wallet    !== undefined)  return { ...s, value: `৳${wallet.toLocaleString()}` };
    return s;
  });
}

export function CustomerDashboard() {
  const [stats,   setStats]   = useState<StatCard[]>(CUSTOMER_STATS);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const { spending, orderFreq, healthSpend } = CUSTOMER_CHART_DATA;

  // ── Fetch real orders ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list: Order[] = d?.data?.orders ?? d?.data ?? [];
        setOrders(list.slice(0, 4));
        setStats(prev => mergeStat(prev, undefined, list.length));
      })
      .catch(() => { /* keep mock */ });
  }, []);

  // ── Fetch wallet ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/wallet", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const balance = d?.data?.balance ?? d?.data?.walletBalance;
        if (balance !== undefined) setStats(prev => mergeStat(prev, balance, undefined));
      })
      .catch(() => { /* keep mock */ });
  }, []);

  const displayOrders = orders.length > 0
    ? orders.map(o => ({
        id:            o.id.startsWith("ORD") ? o.id : `ORD-${o.id.slice(-5).toUpperCase()}`,
        total:         `৳${(o.totalPrice ?? o.total ?? 0).toLocaleString()}`,
        status:        o.status,
        statusVariant: statusVariant(o.status),
      }))
    : [
        { id: "ORD-10284", total: "৳840",   status: "Shipped",   statusVariant: "blue"  as const },
        { id: "ORD-10241", total: "৳1,240", status: "Delivered", statusVariant: "green" as const },
        { id: "ORD-10198", total: "৳380",   status: "Delivered", statusVariant: "green" as const },
        { id: "ORD-10142", total: "৳2,100", status: "Delivered", statusVariant: "green" as const },
      ];

  return (
    <div>
      <StatsGrid stats={stats} />

      {CUSTOMER_ALERTS.map((a) => <AlertBanner key={a.title} alert={a} />)}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, margin: "16px 0" }}>
        <Card title="Spending by category" subtitle="Last 6 months breakdown">
          <div style={{ position: "relative" }}>
            <DoughnutChart labels={spending.labels} values={spending.values} colors={spending.colors} height={220} />
          </div>
          <ChartLegend items={spending.labels.map((l, i) => ({ label: l, color: spending.colors[i] }))} />
        </Card>

        <Card title="Order frequency" subtitle="Orders placed per month">
          <ChartLegend items={[{ label: "Orders", color: COLORS.navy }]} />
          <BarChart
            labels={orderFreq.labels}
            datasets={[{ data: orderFreq.values, color: COLORS.navy }]}
            height={220}
          />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
        <SectionTable title="Active medicine reminders" columns={["Medicine", "Dose", "Next due"]}>
          {CUSTOMER_REMINDERS.map((r) => (
            <TR key={r.medicine}>
              <TD>{r.medicine}</TD>
              <TD><span style={{ color: COLORS.taupe, fontSize: 12 }}>{r.dose}</span></TD>
              <TD><Badge variant={r.urgency as UrgencyVariant}>{r.nextDue}</Badge></TD>
            </TR>
          ))}
        </SectionTable>

        <SectionTable title="Recent orders" columns={["Order", "Total", "Status"]}>
          {displayOrders.map((o) => (
            <TR key={o.id}>
              <TD><span style={{ color: COLORS.sky, fontSize: 13 }}>{o.id}</span></TD>
              <TD>{o.total}</TD>
              <TD><Badge variant={o.statusVariant as "green" | "blue" | "amber" | "red"}>{o.status}</Badge></TD>
            </TR>
          ))}
        </SectionTable>
      </div>

      <Card title="Health profile snapshot" subtitle="Chronic conditions & associated spending">
        {healthSpend.map((item) => (
          <div key={item.condition}>
            <KpiRow label={item.condition} value={item.amount} />
            <ProgressBar pct={item.pct} color={item.color} />
          </div>
        ))}
      </Card>
    </div>
  );
}