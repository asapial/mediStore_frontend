"use client";

import {
  StatsGrid, AlertBanner, Card, SectionTable, TR, TD, Badge,
  ChartLegend, KpiRow,
} from "@/components/ui/Dashboardui";
import { BarChart, GroupedBarChart } from "@/components/ui/Charts";
import {
  WAREHOUSE_STATS, WAREHOUSE_ALERTS, WAREHOUSE_LOCATIONS,
  WAREHOUSE_TRANSFERS, WAREHOUSE_CHART_DATA,
} from "@/lib/dashboard-data";
import { COLORS } from "@/lib/theme";

export function WarehouseDashboard() {
  const { stockByLocation, throughput14, expiry } = WAREHOUSE_CHART_DATA;

  return (
    <div>
      <StatsGrid stats={WAREHOUSE_STATS} />

      {WAREHOUSE_ALERTS.map((a) => <AlertBanner key={a.title} alert={a} />)}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, margin: "16px 0" }}>
        <Card title="Stock by location" subtitle="Unit distribution across all branches">
          <ChartLegend items={[
            { label: "Dhaka Central",  color: COLORS.navy  },
            { label: "Mirpur Branch",  color: COLORS.sky   },
            { label: "Chittagong Hub", color: COLORS.amber },
          ]} />
          <GroupedBarChart
            labels={stockByLocation.labels}
            series={[
              { label: "Dhaka Central",  data: stockByLocation.dhaka,      color: COLORS.navy  },
              { label: "Mirpur Branch",  data: stockByLocation.mirpur,     color: COLORS.sky   },
              { label: "Chittagong Hub", data: stockByLocation.chittagong,  color: COLORS.amber },
            ]}
            height={200}
          />
        </Card>

        <Card title="Fulfillment throughput" subtitle="Orders fulfilled per day — last 14 days">
          <ChartLegend items={[
            { label: "Fulfilled", color: COLORS.sage },
            { label: "Failed",    color: COLORS.red  },
          ]} />
          <GroupedBarChart
            labels={throughput14.labels}
            series={[
              { label: "Fulfilled", data: throughput14.fulfilled, color: COLORS.sage },
              { label: "Failed",    data: throughput14.failed,    color: COLORS.red  },
            ]}
            height={200}
            stacked
          />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
        <Card title="Transfer status board" subtitle="Inter-location transfers this month">
          {WAREHOUSE_TRANSFERS.map((t) => (
            <div key={t.stage} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: COLORS.taupe }}>{t.stage}</span>
              <Badge variant={t.variant as "amber" | "blue" | "green" | "red"}>{t.value}</Badge>
            </div>
          ))}
          <div style={{ borderTop: "0.5px solid rgba(27,58,92,0.08)", paddingTop: 10, marginTop: 4 }}>
            <KpiRow label="Total units transferred" value="12,840" bold />
            <KpiRow label="Avg transfer time"        value="1.4 days" />
          </div>
        </Card>

        <Card title="Expiry timeline" subtitle="Batches expiring by timeframe">
          <ChartLegend items={expiry.labels.map((l, i) => ({ label: l, color: expiry.colors[i] }))} />
          <BarChart
            labels={expiry.labels}
            datasets={[{ data: expiry.values, color: expiry.colors }]}
            height={180}
          />
        </Card>
      </div>

      <SectionTable
        title="Location stock summary"
        columns={["Location", "City", "Total units", "Low stock", "Near expiry", "Status"]}
      >
        {WAREHOUSE_LOCATIONS.map((loc) => (
          <TR key={loc.name}>
            <TD>{loc.name}</TD>
            <TD><span style={{ color: COLORS.taupe, fontSize: 12 }}>{loc.city}</span></TD>
            <TD>{loc.units}</TD>
            <TD><Badge variant={loc.lowStock <= 3 ? "green" : loc.lowStock <= 7 ? "amber" : "red"}>{loc.lowStock}</Badge></TD>
            <TD><Badge variant={loc.nearExpiry <= 9 ? "amber" : "red"}>{loc.nearExpiry}</Badge></TD>
            <TD><Badge variant={loc.statusVariant as "green" | "blue"}>{loc.status}</Badge></TD>
          </TR>
        ))}
      </SectionTable>
    </div>
  );
}