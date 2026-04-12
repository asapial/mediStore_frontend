"use client";

import { useEffect, useState } from "react";
import {
  StatsGrid, AlertBanner, Card, SectionTable, TR, TD, Badge,
  ChartLegend, KpiRow, ProgressBar,
} from "@/components/ui/Dashboardui";
import { DoughnutChart, BarChart } from "@/components/ui/Charts";
import { CUSTOMER_ALERTS, CUSTOMER_REMINDERS, CUSTOMER_CHART_DATA } from "@/lib/dashboard-data";
import type { StatCard } from "@/types/dashboard";
import { COLORS } from "@/lib/theme";

type UrgencyVariant = "red" | "green";

interface OrderStats {
  totalOrders:    number;
  deliveredCount: number;
  activeCount:    number;
  totalSpent:     number;
  wishlistCount:  number;
}

interface Order {
  id: string;
  status: string;
  totalPrice?: number;
  total?: number;
  items?: { price: number; quantity: number }[];
}

function buildStats(os: OrderStats, wallet: number | null): StatCard[] {
  const spent = os.totalSpent > 0 ? `$${os.totalSpent.toFixed(0)}` : "—";
  const bal   = wallet !== null ? `$${wallet.toFixed(0)}` : "—";
  return [
    { label: "Total orders",     value: os.totalOrders.toLocaleString(),     sub: `${os.activeCount} active · ${os.deliveredCount} delivered`, trend: "neutral", accent: "blue"  },
    { label: "Total spent",      value: spent,                                sub: "All time spending",                                         trend: "up",      accent: "amber" },
    { label: "Wallet balance",   value: bal,                                  sub: "Available store credit",                                     trend: "neutral", accent: "green" },
    { label: "Saved items",      value: os.wishlistCount.toLocaleString(),    sub: "In your wishlist",                                           trend: "neutral", accent: "navy"  },
    { label: "Active orders",    value: os.activeCount.toLocaleString(),      sub: "In progress",                                                trend: "down",    accent: "red"   },
    { label: "Delivered",        value: os.deliveredCount.toLocaleString(),   sub: "Successfully completed",                                     trend: "up",      accent: "green" },
  ];
}

function statusVariant(s: string): "green" | "blue" | "amber" | "red" {
  const sl = s?.toLowerCase();
  if (sl === "delivered" || sl === "completed") return "green";
  if (sl === "shipped"   || sl === "confirmed") return "blue";
  if (sl === "cancelled" || sl === "returned")  return "red";
  return "amber";
}

export function CustomerDashboard() {
  const [stats,   setStats]   = useState<OrderStats | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [wallet,  setWallet]  = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { spending, orderFreq, healthSpend } = CUSTOMER_CHART_DATA;

  // ── Fetch aggregated customer stats ────────────────────────────────────────
  useEffect(() => {
    fetch("/api/orders/stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d?.success && d?.data) setStats(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch recent orders ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { const list: Order[] = d?.data ?? []; setOrders(list.slice(0, 4)); })
      .catch(() => {});
  }, []);

  // ── Fetch wallet balance ───────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/wallet/my", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const b = d?.data?.balance ?? d?.data?.walletBalance;
        if (b !== undefined) setWallet(Number(b));
      })
      .catch(() => {});
  }, []);

  const statCards = stats
    ? buildStats(stats, wallet)
    : [
        { label: "Total orders",   value: "—", sub: "Loading…",  trend: "neutral" as const, accent: "blue"  as const },
        { label: "Total spent",    value: "—", sub: "Loading…",  trend: "neutral" as const, accent: "amber" as const },
        { label: "Wallet balance", value: "—", sub: "Loading…",  trend: "neutral" as const, accent: "green" as const },
        { label: "Saved items",    value: "—", sub: "Loading…",  trend: "neutral" as const, accent: "navy"  as const },
        { label: "Active orders",  value: "—", sub: "Loading…",  trend: "neutral" as const, accent: "red"   as const },
        { label: "Delivered",      value: "—", sub: "Loading…",  trend: "neutral" as const, accent: "green" as const },
      ];

  // Build order rows: real if available, else mock
  const MOCK_ORDERS = [
    { id: "ORD-10284", total: "$42",  status: "Shipped",   sv: "blue"  as const },
    { id: "ORD-10241", total: "$62",  status: "Delivered", sv: "green" as const },
    { id: "ORD-10198", total: "$19",  status: "Delivered", sv: "green" as const },
    { id: "ORD-10142", total: "$105", status: "Delivered", sv: "green" as const },
  ];
  const orderRows = orders.length > 0
    ? orders.map(o => ({
        id:  o.id.length > 14 ? "ORD-" + o.id.slice(-6).toUpperCase() : o.id,
        total: `$${((o.totalPrice ?? o.total ?? o.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0)).toFixed(0)}`,
        status: o.status,
        sv: statusVariant(o.status),
      }))
    : MOCK_ORDERS;

  return (
    <div>
      <StatsGrid stats={statCards} />

      {CUSTOMER_ALERTS.map(a => <AlertBanner key={a.title} alert={a} />)}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, margin: "16px 0" }}>
        <Card title="Spending by category" subtitle="Last 6 months breakdown">
          <div style={{ position: "relative" }}>
            <DoughnutChart labels={spending.labels} values={spending.values} colors={spending.colors} height={220} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.navy }}>
                {stats ? `$${stats.totalSpent.toFixed(0)}` : "—"}
              </div>
              <div style={{ fontSize: 11, color: COLORS.taupe }}>total spent</div>
            </div>
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
          {CUSTOMER_REMINDERS.map(r => (
            <TR key={r.medicine}>
              <TD>{r.medicine}</TD>
              <TD><span style={{ color: COLORS.taupe, fontSize: 12 }}>{r.dose}</span></TD>
              <TD><Badge variant={r.urgency as UrgencyVariant}>{r.nextDue}</Badge></TD>
            </TR>
          ))}
        </SectionTable>

        <SectionTable title="Recent orders" columns={["Order", "Total", "Status"]}>
          {orderRows.map(o => (
            <TR key={o.id}>
              <TD><span style={{ color: COLORS.sky, fontSize: 13 }}>{o.id}</span></TD>
              <TD>{o.total}</TD>
              <TD><Badge variant={o.sv}>{o.status}</Badge></TD>
            </TR>
          ))}
        </SectionTable>
      </div>

      <Card title="Health profile snapshot" subtitle="Chronic conditions & associated spending">
        {healthSpend.map(item => (
          <div key={item.condition}>
            <KpiRow label={item.condition} value={item.amount} />
            <ProgressBar pct={item.pct} color={item.color} />
          </div>
        ))}
      </Card>
    </div>
  );
}