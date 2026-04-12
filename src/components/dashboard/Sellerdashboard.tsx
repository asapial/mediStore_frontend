"use client";

import { useEffect, useState } from "react";
import {
  StatsGrid, AlertBanner, Card, SectionTable, TR, TD, Badge,
  ChartLegend, KpiRow,
} from "@/components/ui/DashboardUI";
import { LineChart, BarChart, DoughnutChart } from "@/components/ui/Charts";
import {
  SELLER_STATS, SELLER_ALERTS, SELLER_FUNNEL, SELLER_CHART_DATA,
} from "@/lib/dashboard-data";
import type { StatCard } from "@/types/dashboard";
import { COLORS } from "@/lib/theme";

interface Medicine {
  id: string; name: string; stock: number; price: number;
  category?: { name: string };
}
interface StockAlert { id: string; medicine?: { name: string; category?: { name: string } }; threshold: number; currentStock: number; }

function mergeStats(base: StatCard[], listings?: number, lowStock?: number): StatCard[] {
  return base.map((s, i) => {
    if (i === 2 && listings !== undefined) return { ...s, value: String(listings) };
    return s;
  });
}

function stockVariant(stock: number, threshold: number): "red" | "amber" {
  return stock <= threshold * 0.3 ? "red" : "amber";
}

export function SellerDashboard() {
  const [stats,      setStats]      = useState<StatCard[]>(SELLER_STATS);
  const [lowStocks,  setLowStocks]  = useState<StockAlert[]>([]);
  const { revenue30, topProducts, fulfillment } = SELLER_CHART_DATA;

  // ── Fetch seller medicines ────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/medicines/own", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list: Medicine[] = d?.data?.medicines ?? d?.data ?? [];
        setStats(prev => mergeStats(prev, list.length));
      })
      .catch(() => { /* keep mock */ });
  }, []);

  // ── Fetch stock alerts ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/stock-alerts", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list: StockAlert[] = d?.data ?? [];
        setLowStocks(list.slice(0, 5));
      })
      .catch(() => { /* keep mock */ });
  }, []);

  // Build low-stock rows: real if available, else fall back to mock
  const SELLER_LOW_STOCK_MOCK = [
    { medicine: "Metformin 500mg",   category: "Diabetes",   stock: 8,  threshold: 50, stockVariant: "red"   },
    { medicine: "Atorvastatin 10mg", category: "Cardiology", stock: 12, threshold: 50, stockVariant: "red"   },
    { medicine: "Amlodipine 5mg",    category: "Cardiology", stock: 24, threshold: 50, stockVariant: "amber" },
    { medicine: "Omeprazole 20mg",   category: "Gastro",     stock: 31, threshold: 50, stockVariant: "amber" },
  ];

  const lowStockRows = lowStocks.length > 0
    ? lowStocks.map(a => ({
        medicine:     a.medicine?.name ?? "Unknown",
        category:     a.medicine?.category?.name ?? "—",
        stock:        a.currentStock,
        threshold:    a.threshold,
        stockVariant: stockVariant(a.currentStock, a.threshold),
      }))
    : SELLER_LOW_STOCK_MOCK;

  return (
    <div>
      <StatsGrid stats={stats} />

      {SELLER_ALERTS.map((a) => <AlertBanner key={a.title} alert={a} />)}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, margin: "16px 0" }}>
        <Card title="Revenue trend" subtitle="Daily revenue — last 30 days">
          <ChartLegend items={[
            { label: "Revenue (৳K)", color: COLORS.navy  },
            { label: "Target",       color: COLORS.amber },
          ]} />
          <LineChart
            labels={revenue30.labels}
            datasets={[
              { data: revenue30.values,              color: COLORS.navy,  fill: true,   label: "Revenue" },
              { data: Array(30).fill(revenue30.target), color: COLORS.amber, dashed: true, label: "Target"  },
            ]}
            height={200}
            maxTicksX={8}
          />
        </Card>

        <Card title="Top products by revenue" subtitle="This month's leaders">
          <BarChart
            labels={topProducts.labels}
            datasets={[{ data: topProducts.values, color: [COLORS.navy, COLORS.sky, COLORS.sky, COLORS.amber, COLORS.amber] }]}
            height={200}
            horizontal
          />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
        <Card title="Conversion funnel" subtitle="Views → cart → purchase">
          {SELLER_FUNNEL.map((item) => (
            <div key={item.stage}>
              <KpiRow label={item.stage} value={item.value.toLocaleString()} />
              <div style={{ height: 6, borderRadius: 3, background: "rgba(27,58,92,0.08)", overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${item.pct}%`, borderRadius: 3, background: item.color, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </Card>

        <Card title="Order fulfillment" subtitle="Status breakdown this month">
          <div style={{ position: "relative" }}>
            <DoughnutChart labels={fulfillment.labels} values={fulfillment.values} colors={fulfillment.colors} height={200} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.navy }}>
                {stats[1]?.value ?? "—"}
              </div>
              <div style={{ fontSize: 11, color: COLORS.taupe }}>orders</div>
            </div>
          </div>
          <ChartLegend items={fulfillment.labels.map((l, i) => ({ label: l, color: fulfillment.colors[i] }))} />
        </Card>
      </div>

      <SectionTable title="Low stock alerts" columns={["Medicine", "Category", "Stock", "Threshold", "Action"]}>
        {lowStockRows.map((row) => (
          <TR key={row.medicine}>
            <TD>{row.medicine}</TD>
            <TD><span style={{ color: COLORS.taupe, fontSize: 12 }}>{row.category}</span></TD>
            <TD><Badge variant={row.stockVariant as "red" | "amber"}>{row.stock} units</Badge></TD>
            <TD><span style={{ color: COLORS.taupe }}>{row.threshold}</span></TD>
            <TD><Badge variant="blue">Restock</Badge></TD>
          </TR>
        ))}
      </SectionTable>
    </div>
  );
}