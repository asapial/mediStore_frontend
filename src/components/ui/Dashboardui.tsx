"use client";

import type { StatCard, AlertItem } from "@/types/dashboard";
import { COLORS } from "@/lib/theme";

// ─── CSS-variable helpers (dark-mode-safe) ────────────────────────────────────
// Wherever possible we use Tailwind / CSS variables so both light + dark work.
// Chart.js datasets still receive JS hex values (they live outside the cascade).

const ACCENT_HEX: Record<StatCard["accent"], string> = {
  amber: COLORS.amber,
  blue:  COLORS.sky,
  green: COLORS.sage,
  red:   COLORS.red,
  navy:  COLORS.navy,
};

// ─── StatCardItem ─────────────────────────────────────────────────────────────

export function StatCardItem({ stat }: { stat: StatCard }) {
  const borderColor = ACCENT_HEX[stat.accent];
  const trendClass  =
    stat.trend === "up"   ? "text-emerald-600 dark:text-emerald-400" :
    stat.trend === "down" ? "text-red-500 dark:text-red-400"         :
                            "text-muted-foreground";

  return (
    <div
      className="bg-card rounded-xl px-4 py-4 border border-border hover:shadow-md
        transition-shadow duration-200"
      style={{ borderTop: `3px solid ${borderColor}` }}
    >
      <p className="text-xs text-muted-foreground mb-1.5">{stat.label}</p>
      <p className="text-2xl font-semibold text-primary leading-none">{stat.value}</p>
      <p className={`text-xs mt-1.5 ${trendClass}`}>{stat.sub}</p>
    </div>
  );
}

// ─── StatsGrid ────────────────────────────────────────────────────────────────

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {stats.map((s) => <StatCardItem key={s.label} stat={s} />)}
    </div>
  );
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────

const ALERT_BORDER: Record<AlertItem["variant"], string> = {
  danger:  COLORS.red,
  info:    COLORS.sky,
  success: COLORS.sage,
  warning: COLORS.amber,
};

const ALERT_BG: Record<AlertItem["variant"], string> = {
  danger:  "bg-red-50 dark:bg-red-900/10",
  info:    "bg-sky-50 dark:bg-sky-900/10",
  success: "bg-emerald-50 dark:bg-emerald-900/10",
  warning: "bg-amber-50 dark:bg-amber-900/10",
};

export function AlertBanner({ alert }: { alert: AlertItem }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 mb-3 flex justify-between items-center gap-4
        border border-border ${ALERT_BG[alert.variant]}`}
      style={{ borderLeftWidth: 4, borderLeftColor: ALERT_BORDER[alert.variant] }}
    >
      <div>
        <p className="text-sm font-medium text-primary">{alert.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
      </div>
      <span className="text-xs text-sky-600 dark:text-sky-400 cursor-pointer whitespace-nowrap hover:underline">
        {alert.action}
      </span>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = "green" | "amber" | "red" | "blue" | "navy";

const BADGE_CLASS: Record<BadgeVariant, string> = {
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  amber: "bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300",
  red:   "bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-300",
  blue:  "bg-sky-100   text-sky-700   dark:bg-sky-900/30   dark:text-sky-300",
  navy:  "bg-blue-100  text-blue-800  dark:bg-blue-900/30  dark:text-blue-300",
};

export function Badge({
  children,
  variant = "navy",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium
        ${BADGE_CLASS[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  title,
  subtitle,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-xl p-5 border border-border ${className}`}>
      {title && (
        <p className="text-sm font-semibold text-primary mb-0.5">{title}</p>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      )}
      {!subtitle && title && <div className="mb-3" />}
      {children}
    </div>
  );
}

// ─── SectionTable ─────────────────────────────────────────────────────────────

export function SectionTable({
  columns,
  children,
  title,
}: {
  columns: string[];
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Card title={title}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-2.5 py-2 text-muted-foreground font-medium
                    border-b border-border whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── TR / TD ─────────────────────────────────────────────────────────────────

export function TR({ children }: { children: React.ReactNode }) {
  return (
    <tr
      className="border-b border-border/50 hover:bg-muted/40 transition-colors cursor-default"
    >
      {children}
    </tr>
  );
}

export function TD({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-2.5 py-2.5 text-foreground">{children}</td>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full bg-border overflow-hidden my-1.5 mb-3">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── KpiRow ───────────────────────────────────────────────────────────────────

export function KpiRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-1 text-[13px]">
      <span className={`flex-1 text-muted-foreground ${bold ? "font-medium" : ""}`}>
        {label}
      </span>
      <span className={`text-primary ${bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

// ─── ChartLegend ─────────────────────────────────────────────────────────────

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 mb-2.5">
      {items.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-1 text-[12px] text-muted-foreground"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── DonutCenter ─────────────────────────────────────────────────────────────

export function DonutCenter({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        text-center pointer-events-none"
    >
      <div className="text-xl font-semibold text-primary">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}