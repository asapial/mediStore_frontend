"use client";

import { useEffect, useState } from "react";
import { DoughnutChart, BarChart, LineChart } from "@/components/ui/Charts";
import { COLORS } from "@/lib/theme";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "ADMIN" | "SELLER" | "CUSTOMER";

interface Me {
  id: string; name: string; email: string;
  image: string | null; role: Role;
}

// Admin data shape
interface AdminData {
  users:       { total: number; customers: number; sellers: number; admins: number };
  medicines:   { total: number };
  orders:      { total: number; placed: number; processing: number; shipped: number; delivered: number; cancelled: number };
  cart:        { totalItems: number; totalQuantity: number };
  reviews:     { total: number; averageRating: number };
  revenue:     { total: number };
  pendingLicenses: number;
  recentOrders: { id: string; status: string; createdAt: string; customer: string; total: number }[];
}

// Seller data shape
interface SellerData {
  medicines: { total: number; outOfStock: number; lowStock: number; averagePrice: number; totalStock: number };
  orders:    { total: number; completed: number; cancelled: number; byStatus: { status: string; count: number }[] };
  revenue:   { total: number; thisMonth: number; today: number; averageOrderValue: number };
  sales:     { totalSold: number };
  lowStockAlerts: { id: string; name: string; stock: number; price: number; category: { name: string } | null }[];
  recentOrders:   { id: string; status: string; createdAt: string; customer: string; total: number }[];
}

// Customer data shape
interface CustomerData {
  orders:        { total: number; delivered: number; active: number };
  spending:      { total: number };
  wallet:        { balance: number };
  wishlist:      { count: number };
  prescriptions: { total: number };
  recentOrders:  { id: string; status: string; createdAt: string; total: number; itemCount: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  PLACED:     "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  SHIPPED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CONFIRMED:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DELIVERED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELLED:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  RETURNED:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  SELLER:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CUSTOMER: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
};

const ACCENT: Record<number, string> = {
  0: COLORS.amber, 1: COLORS.sky, 2: COLORS.sage,
  3: COLORS.navy,  4: COLORS.red, 5: COLORS.amber,
};

function fmt(n: number, prefix = "") {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${prefix}${(n / 1_000).toFixed(1)}K`;
  return `${prefix}${n}`;
}

function shortId(id: string) {
  return id.length > 12 ? "…" + id.slice(-8).toUpperCase() : id.toUpperCase();
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent, trend }: {
  label: string; value: string; sub?: string;
  accent: string; trend?: "up" | "down" | "neutral";
}) {
  const trendCls =
    trend === "up"   ? "text-emerald-600 dark:text-emerald-400" :
    trend === "down" ? "text-red-500 dark:text-red-400"         :
                       "text-muted-foreground";
  return (
    <div
      className="bg-card rounded-2xl p-4 border border-border hover:shadow-lg
        transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <p className="text-xs text-muted-foreground font-medium mb-1.5 tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-bold text-primary leading-none">{value}</p>
      {sub && <p className={`text-[11px] mt-1.5 ${trendCls}`}>{sub}</p>}
    </div>
  );
}

function SCard({ children, title, subtitle }: {
  children: React.ReactNode; title?: string; subtitle?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      {title && <p className="text-sm font-semibold text-primary mb-0.5">{title}</p>}
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      {!subtitle && title && <div className="mb-4" />}
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function KpiRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-border overflow-hidden mt-1 mb-3">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

function OrderRow({ id, status, total, extra }: { id: string; status: string; total: number; extra?: string }) {
  return (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
      <td className="py-2.5 px-3 text-xs font-mono text-sky-600 dark:text-sky-400">{shortId(id)}</td>
      <td className="py-2.5 px-3"><StatusBadge status={status} /></td>
      <td className="py-2.5 px-3 text-sm font-semibold text-primary">${total.toFixed(0)}</td>
      {extra && <td className="py-2.5 px-3 text-xs text-muted-foreground">{extra}</td>}
    </tr>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 mb-3">
      {items.map(i => (
        <span key={i.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-56 rounded-2xl bg-muted" />
        <div className="h-56 rounded-2xl bg-muted" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-2xl bg-muted" />)}
      </div>
      <div className="h-48 rounded-2xl bg-muted" />
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ data }: { data: AdminData }) {
  const orderStatusLabels = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
  const orderStatusValues = [data.orders.placed, data.orders.processing, data.orders.shipped, data.orders.delivered, data.orders.cancelled];
  const orderStatusColors = [COLORS.sky, COLORS.amber, COLORS.navy, COLORS.sage, COLORS.red];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total users",      value: data.users.total.toLocaleString(),    sub: `↑ ${data.users.customers} customers`, trend: "up",      accent: COLORS.amber },
          { label: "Sellers",          value: data.users.sellers.toLocaleString(),  sub: `${data.pendingLicenses} pending license`, trend: "neutral", accent: COLORS.sky   },
          { label: "Medicines",        value: data.medicines.total.toLocaleString(),sub: "Across all sellers",                  trend: "neutral", accent: COLORS.sage  },
          { label: "Total orders",     value: data.orders.total.toLocaleString(),   sub: `${data.orders.delivered} delivered`,  trend: "up",      accent: COLORS.navy  },
          { label: "Platform revenue", value: fmt(data.revenue.total, "$"),         sub: "All-time GMV",                        trend: "up",      accent: COLORS.amber },
          { label: "Avg rating",       value: `${data.reviews.averageRating} ★`,   sub: `${data.reviews.total} reviews`,       trend: "up",      accent: COLORS.amber },
        ].map((s, i) => (
          <StatCard key={s.label} {...s} trend={s.trend as "up" | "neutral"} />
        ))}
      </div>

      {/* Pending license alert */}
      {data.pendingLicenses > 0 && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800
          rounded-2xl px-5 py-3" style={{ borderLeft: `4px solid ${COLORS.red}` }}>
          <span className="text-red-500 text-lg">⚠</span>
          <div>
            <p className="text-sm font-semibold text-primary">{data.pendingLicenses} seller license{data.pendingLicenses > 1 ? "s" : ""} awaiting review</p>
            <p className="text-xs text-muted-foreground">Action required in the Licenses section</p>
          </div>
          <a href="/dashboard/admin/license" className="ml-auto text-xs text-red-600 dark:text-red-400 hover:underline whitespace-nowrap">
            Review →
          </a>
        </div>
      )}

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-5">
        <SCard title="Order status breakdown" subtitle="Current snapshot across all orders">
          <Legend items={orderStatusLabels.map((l, i) => ({ label: l, color: orderStatusColors[i] }))} />
          <BarChart labels={orderStatusLabels} datasets={[{ data: orderStatusValues, color: orderStatusColors }]} height={200} />
        </SCard>

        <SCard title="User role distribution" subtitle="All registered accounts">
          <Legend items={["Customers", "Sellers", "Admins"].map((l, i) => ({ label: l, color: [COLORS.navy, COLORS.sky, COLORS.red][i] }))} />
          <div className="relative">
            <DoughnutChart
              labels={["Customers", "Sellers", "Admins"]}
              values={[data.users.customers, data.users.sellers, data.users.admins]}
              colors={[COLORS.navy, COLORS.sky, COLORS.red]}
              height={200}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{data.users.total.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">total users</p>
              </div>
            </div>
          </div>
        </SCard>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SCard title="Platform health" subtitle="Key performance indicators">
          <KpiRow label="Cart items (active)" value={data.cart.totalItems.toLocaleString()} />
          <KpiRow label="Cart quantity"        value={data.cart.totalQuantity.toLocaleString()} />
          <KpiRow label="Total reviews"        value={data.reviews.total.toLocaleString()} />
          <KpiRow label="Avg rating"           value={`${data.reviews.averageRating} / 5`} />
          <KpiRow label="Pending licenses"     value={<span className={data.pendingLicenses > 0 ? "text-red-500" : "text-emerald-500"}>{data.pendingLicenses}</span>} />
        </SCard>

        <SCard title="Order funnel" subtitle="Status progression">
          {[
            { label: "Placed",     value: data.orders.placed,     color: COLORS.sky   },
            { label: "Processing", value: data.orders.processing,  color: COLORS.amber },
            { label: "Shipped",    value: data.orders.shipped,     color: COLORS.navy  },
            { label: "Delivered",  value: data.orders.delivered,   color: COLORS.sage  },
            { label: "Cancelled",  value: data.orders.cancelled,   color: COLORS.red   },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-primary">{item.value.toLocaleString()}</span>
              </div>
              <Bar pct={data.orders.total > 0 ? (item.value / data.orders.total) * 100 : 0} color={item.color} />
            </div>
          ))}
        </SCard>

        <SCard title="Revenue insights" subtitle="Platform-wide earnings">
          <KpiRow label="Total platform GMV"  value={`$${data.revenue.total.toLocaleString()}`} />
          <KpiRow label="Avg order size"      value={data.orders.total > 0 ? `$${(data.revenue.total / data.orders.total).toFixed(0)}` : "—"} />
          <KpiRow label="Medicines listed"    value={data.medicines.total.toLocaleString()} />
          <KpiRow label="Avg per seller"      value={data.users.sellers > 0 ? (data.medicines.total / data.users.sellers).toFixed(0) : "—"} />
        </SCard>
      </div>

      {/* Recent orders table */}
      <SCard title="Recent orders" subtitle="Last 5 orders across the platform">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Order ID", "Status", "Total", "Customer"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map(o => (
                <OrderRow key={o.id} id={o.id} status={o.status} total={o.total} extra={o.customer} />
              ))}
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  );
}

// ─── SELLER VIEW ──────────────────────────────────────────────────────────────
function SellerView({ data }: { data: SellerData }) {
  const statusColors: Record<string, string> = {
    DELIVERED: COLORS.sage, SHIPPED: COLORS.navy, PROCESSING: COLORS.amber,
    PLACED: COLORS.sky, CANCELLED: COLORS.red, CONFIRMED: COLORS.sky,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Medicines",       value: data.medicines.total.toLocaleString(),       sub: `${data.medicines.outOfStock} out of stock`,       trend: "neutral", accent: COLORS.sage },
          { label: "Total orders",    value: data.orders.total.toLocaleString(),           sub: `${data.orders.completed} delivered`,               trend: "up",      accent: COLORS.sky   },
          { label: "Units sold",      value: data.sales.totalSold.toLocaleString(),        sub: "Across all orders",                                 trend: "up",      accent: COLORS.amber },
          { label: "Total revenue",   value: fmt(data.revenue.total, "$"),                 sub: "All time",                                          trend: "up",      accent: COLORS.navy  },
          { label: "This month",      value: fmt(data.revenue.thisMonth, "$"),             sub: `Today: $${data.revenue.today.toFixed(0)}`,          trend: "up",      accent: COLORS.amber },
          { label: "Avg order value", value: `$${data.revenue.averageOrderValue.toFixed(0)}`,sub: "Per order",                                      trend: "neutral", accent: COLORS.sage  },
        ].map(s => (
          <StatCard key={s.label} {...s} trend={s.trend as "up" | "neutral"} />
        ))}
      </div>

      {/* Low stock alert */}
      {data.medicines.lowStock > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800
          rounded-2xl px-5 py-3" style={{ borderLeft: `4px solid ${COLORS.amber}` }}>
          <span className="text-amber-500 text-lg">📦</span>
          <div>
            <p className="text-sm font-semibold text-primary">{data.medicines.lowStock} medicines are running low on stock</p>
            <p className="text-xs text-muted-foreground">Restock soon to avoid losing orders</p>
          </div>
          <a href="/dashboard/seller/stock-alerts" className="ml-auto text-xs text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap">
            Manage →
          </a>
        </div>
      )}

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-5">
        <SCard title="Order status breakdown" subtitle="Your orders this period">
          <Legend items={data.orders.byStatus.map(o => ({ label: o.status, color: statusColors[o.status] ?? COLORS.taupe }))} />
          {data.orders.byStatus.length > 0 ? (
            <DoughnutChart
              labels={data.orders.byStatus.map(o => o.status)}
              values={data.orders.byStatus.map(o => o.count)}
              colors={data.orders.byStatus.map(o => statusColors[o.status] ?? COLORS.taupe)}
              height={200}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No orders yet</div>
          )}
        </SCard>

        <SCard title="Revenue breakdown" subtitle="Today vs this month vs all time">
          <BarChart
            labels={["Today", "This Month", "All Time"]}
            datasets={[{ data: [data.revenue.today, data.revenue.thisMonth, data.revenue.total], color: [COLORS.amber, COLORS.sky, COLORS.navy] }]}
            height={220}
          />
        </SCard>
      </div>

      {/* KPI cards + low stock */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SCard title="Inventory health" subtitle="Stock status overview">
          <KpiRow label="Total listings"   value={data.medicines.total} />
          <KpiRow label="In stock"         value={<span className="text-emerald-600">{data.medicines.total - data.medicines.outOfStock - data.medicines.lowStock}</span>} />
          <KpiRow label="Low stock (≤10)"  value={<span className="text-amber-500">{data.medicines.lowStock}</span>} />
          <KpiRow label="Out of stock"     value={<span className="text-red-500">{data.medicines.outOfStock}</span>} />
          <KpiRow label="Total stock units" value={data.medicines.totalStock.toLocaleString()} />
          <KpiRow label="Avg price"        value={`$${data.medicines.averagePrice.toFixed(2)}`} />
          <Bar
            pct={data.medicines.total > 0 ? ((data.medicines.total - data.medicines.outOfStock) / data.medicines.total) * 100 : 0}
            color={COLORS.sage}
          />
        </SCard>

        <SCard title="Sales performance" subtitle="Order completion metrics">
          <KpiRow label="Total orders"     value={data.orders.total} />
          <KpiRow label="Completed"        value={<span className="text-emerald-600">{data.orders.completed}</span>} />
          <KpiRow label="Cancelled"        value={<span className="text-red-500">{data.orders.cancelled}</span>} />
          <KpiRow label="Units sold"       value={data.sales.totalSold.toLocaleString()} />
          <KpiRow label="Avg order value"  value={`$${data.revenue.averageOrderValue.toFixed(2)}`} />
          <Bar
            pct={data.orders.total > 0 ? (data.orders.completed / data.orders.total) * 100 : 0}
            color={COLORS.sage}
          />
          <p className="text-[11px] text-muted-foreground">
            {data.orders.total > 0 ? ((data.orders.completed / data.orders.total) * 100).toFixed(1) : 0}% completion rate
          </p>
        </SCard>

        <SCard title="Low stock alerts" subtitle="Need restocking soon">
          {data.lowStockAlerts.length > 0 ? (
            <div className="space-y-2">
              {data.lowStockAlerts.map(m => (
                <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-primary leading-tight truncate max-w-[150px]">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.category?.name ?? "—"}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.stock === 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                    {m.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">All stocked ✓</p>
          )}
        </SCard>
      </div>

      {/* Recent orders */}
      <SCard title="Recent orders" subtitle="Latest orders from your listings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Order ID", "Status", "Total ($)", "Customer"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length > 0
                ? data.recentOrders.map(o => <OrderRow key={o.id} id={o.id} status={o.status} total={o.total} extra={o.customer} />)
                : <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
              }
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  );
}

// ─── CUSTOMER VIEW ────────────────────────────────────────────────────────────
function CustomerView({ data }: { data: CustomerData }) {
  const deliveryPct = data.orders.total > 0 ? (data.orders.delivered / data.orders.total) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total orders",    value: data.orders.total.toLocaleString(),    sub: `${data.orders.active} active`,            trend: "neutral", accent: COLORS.sky   },
          { label: "Delivered",       value: data.orders.delivered.toLocaleString(),sub: "Completed orders",                         trend: "up",      accent: COLORS.sage  },
          { label: "Active orders",   value: data.orders.active.toLocaleString(),   sub: "In progress",                              trend: "neutral", accent: COLORS.amber },
          { label: "Total spent",     value: fmt(data.spending.total, "$"),          sub: "Lifetime spending",                        trend: "neutral", accent: COLORS.navy  },
          { label: "Wallet balance",  value: `$${data.wallet.balance.toFixed(0)}`,  sub: "Available credit",                         trend: "neutral", accent: COLORS.sage  },
          { label: "Wishlist",        value: data.wishlist.count.toLocaleString(),   sub: `${data.prescriptions.total} prescriptions`,trend: "neutral", accent: COLORS.sky   },
        ].map(s => (
          <StatCard key={s.label} {...s} trend={s.trend as "up" | "neutral"} />
        ))}
      </div>

      {/* Charts + KPIs */}
      <div className="grid md:grid-cols-2 gap-5">
        <SCard title="Order summary" subtitle="Breakdown of your order history">
          <Legend items={[
            { label: "Delivered",  color: COLORS.sage  },
            { label: "Active",     color: COLORS.sky   },
            { label: "Cancelled",  color: COLORS.red   },
          ]} />
          <div className="relative">
            <DoughnutChart
              labels={["Delivered", "Active", "Other"]}
              values={[
                data.orders.delivered,
                data.orders.active,
                Math.max(0, data.orders.total - data.orders.delivered - data.orders.active),
              ]}
              colors={[COLORS.sage, COLORS.sky, COLORS.taupe]}
              height={220}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{data.orders.total}</p>
                <p className="text-[10px] text-muted-foreground">total orders</p>
              </div>
            </div>
          </div>
        </SCard>

        <SCard title="Account overview" subtitle="Your health & spending insights">
          <KpiRow label="Total orders"     value={data.orders.total} />
          <KpiRow label="Orders delivered" value={data.orders.delivered} />
          <KpiRow label="Active orders"    value={data.orders.active} />
          <KpiRow label="Total spending"   value={`$${data.spending.total.toFixed(2)}`} />
          <KpiRow label="Wallet balance"   value={`$${data.wallet.balance.toFixed(2)}`} />
          <KpiRow label="Wishlist items"   value={data.wishlist.count} />
          <KpiRow label="Prescriptions"    value={data.prescriptions.total} />
          <Bar pct={deliveryPct} color={COLORS.sage} />
          <p className="text-[11px] text-muted-foreground">{deliveryPct.toFixed(0)}% of your orders have been delivered</p>
        </SCard>
      </div>

      {/* Wallet card + links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SCard title="My wallet" subtitle="Store credit balance">
          <div className="rounded-xl p-4 mt-1 text-white"
            style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.sky} 100%)` }}>
            <p className="text-xs opacity-70 mb-1 uppercase tracking-wider">Available Balance</p>
            <p className="text-3xl font-bold">${data.wallet.balance.toFixed(2)}</p>
            <p className="text-[11px] opacity-60 mt-2">MediStore Wallet</p>
          </div>
          <div className="mt-4 space-y-1">
            <KpiRow label="Total orders placed" value={data.orders.total} />
            <KpiRow label="Lifetime spend" value={`$${data.spending.total.toFixed(0)}`} />
          </div>
        </SCard>

        <SCard title="Quick links" subtitle="Navigate your account">
          {[
            { label: "My Orders",          href: "/dashboard/customer/orders",       icon: "📦" },
            { label: "My Cart",            href: "/dashboard/customer/cart",         icon: "🛒" },
            { label: "Wishlist",           href: "/dashboard/customer/wishlist",     icon: "❤️" },
            { label: "Prescriptions",      href: "/dashboard/customer/prescription", icon: "💊" },
            { label: "Wallet & Payments",  href: "/dashboard/customer/wallet",       icon: "💳" },
            { label: "Track Orders",       href: "/dashboard/customer/tracking",     icon: "📍" },
          ].map(link => (
            <a key={link.href} href={link.href}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors text-sm text-primary group">
              <span>{link.icon}</span>
              <span className="group-hover:underline underline-offset-2">{link.label}</span>
              <span className="ml-auto text-muted-foreground text-xs">→</span>
            </a>
          ))}
        </SCard>

        <SCard title="Order progress" subtitle="Overall completion rate">
          <div className="space-y-3 py-2">
            {[
              { label: "Delivered",  value: data.orders.delivered, color: COLORS.sage   },
              { label: "Active",     value: data.orders.active,    color: COLORS.sky    },
              { label: "Other",      value: Math.max(0, data.orders.total - data.orders.delivered - data.orders.active), color: COLORS.taupe },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-primary">{item.value}</span>
                </div>
                <Bar pct={data.orders.total > 0 ? (item.value / data.orders.total) * 100 : 0} color={item.color} />
              </div>
            ))}
          </div>
        </SCard>
      </div>

      {/* Recent orders */}
      <SCard title="Recent orders" subtitle="Your latest purchases">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Order ID", "Status", "Total ($)", "Items"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length > 0
                ? data.recentOrders.map(o => (
                    <OrderRow key={o.id} id={o.id} status={o.status} total={o.total}
                      extra={`${o.itemCount} item${o.itemCount !== 1 ? "s" : ""}`} />
                  ))
                : <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">No orders placed yet</td></tr>
              }
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [me,      setMe]      = useState<Me | null>(null);
  const [data,    setData]    = useState<AdminData | SellerData | CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // Fetch session + dashboard data in parallel
    Promise.all([
      fetch("/api/auth/me",    { credentials: "include" }).then(r => r.json()),
      fetch("/api/dashboard",  { credentials: "include" }).then(r => r.json()),
    ])
      .then(([meRes, dashRes]) => {
        setMe(meRes?.user ?? null);
        if (dashRes?.success) setData(dashRes.data);
        else setError(dashRes?.message ?? "Failed to load dashboard data");
      })
      .catch(() => setError("Could not connect to server"))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-background">
      {/* Header placeholder */}
      <div className="h-16 bg-card border-b border-border animate-pulse" />
      <Skeleton />
    </div>
  );

  // ── Error / no session ───────────────────────────────────────────────────────
  if (!me || error) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-primary mb-2">{error ? "Error" : "Session Expired"}</h2>
        <p className="text-muted-foreground text-sm mb-6">{error ?? "Please log in to access your dashboard."}</p>
        <a href="/login"
          className="inline-block px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: COLORS.navy }}>
          Go to Login
        </a>
      </div>
    </div>
  );

  const role = me.role as Role;
  const initials = me.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const ROLE_META: Record<Role, { heading: string; sub: string; navLinks: { label: string; href: string }[] }> = {
    ADMIN: {
      heading: "Platform Overview",
      sub: "MediStore Admin · Real-time statistics",
      navLinks: [
        { label: "Users",     href: "/dashboard/admin/users"    },
        { label: "Orders",    href: "/dashboard/admin/orders"   },
        { label: "Licenses",  href: "/dashboard/admin/license"  },
        { label: "Medicines", href: "/dashboard/admin/categories" },
      ],
    },
    SELLER: {
      heading: "Seller Dashboard",
      sub: "Your store performance · Live data",
      navLinks: [
        { label: "Medicines", href: "/dashboard/seller/medicines"    },
        { label: "Orders",    href: "/dashboard/seller/orders"       },
        { label: "Stock",     href: "/dashboard/seller/stock-alerts" },
        { label: "Batches",   href: "/dashboard/seller/batches"      },
      ],
    },
    CUSTOMER: {
      heading: "My Health Dashboard",
      sub: `Welcome back, ${me.name.split(" ")[0]} · Your orders & account`,
      navLinks: [
        { label: "Orders",   href: "/dashboard/customer/orders"  },
        { label: "Cart",     href: "/dashboard/customer/cart"    },
        { label: "Wishlist", href: "/dashboard/customer/wishlist"},
        { label: "Wallet",   href: "/dashboard/customer/wallet"  },
      ],
    },
  };

  const meta = ROLE_META[role];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 max-w-[1400px] mx-auto">

          {/* Brand */}
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-primary hover:opacity-80 transition-opacity">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: COLORS.navy }}>M</span>
            Medi<span style={{ color: COLORS.amber }}>Store</span>
          </a>

          {/* Quick nav */}
          <nav className="hidden md:flex items-center gap-1">
            {meta.navLinks.map(link => (
              <a key={link.href} href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification dot */}
            <div className="relative cursor-pointer">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" />
                <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: COLORS.amber }} />
            </div>

            {/* Role badge */}
            <span className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[role]}`}>
              {role}
            </span>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              {me.image
                ? <img src={me.image} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-border"
                      style={{ background: COLORS.navy }}>
                      {initials}
                    </div>
                  )
              }
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-primary leading-tight">{me.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{me.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Page heading */}
        <div className="flex items-start justify-between mb-5 sm:mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">{meta.heading}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{meta.sub}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary
              px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Role-based content */}
        {role === "ADMIN"    && data && <AdminView    data={data as AdminData}    />}
        {role === "SELLER"   && data && <SellerView   data={data as SellerData}   />}
        {role === "CUSTOMER" && data && <CustomerView data={data as CustomerData} />}

        {!data && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-muted-foreground">No data available — please try refreshing.</p>
          </div>
        )}
      </main>
    </div>
  );
}