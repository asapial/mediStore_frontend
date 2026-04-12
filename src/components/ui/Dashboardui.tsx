"use client";

import type { StatCard, AlertItem } from "@/types/dashboard";
import { COLORS } from "@/lib/theme";

// ─── StatCard ─────────────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<StatCard["accent"], string> = {
  amber: COLORS.amber,
  blue:  COLORS.sky,
  green: COLORS.sage,
  red:   COLORS.red,
  navy:  COLORS.navy,
};

export function StatCardItem({ stat }: { stat: StatCard }) {
  const accentColor = ACCENT_COLORS[stat.accent];
  const trendColor =
    stat.trend === "up"   ? COLORS.sage :
    stat.trend === "down" ? COLORS.red  : COLORS.taupe;

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 12,
        padding: "16px 18px",
        border: "0.5px solid rgba(27,58,92,0.1)",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <p style={{ fontSize: 12, color: COLORS.taupe, marginBottom: 6 }}>{stat.label}</p>
      <p style={{ fontSize: 26, fontWeight: 500, color: COLORS.navy, lineHeight: 1 }}>{stat.value}</p>
      <p style={{ fontSize: 12, marginTop: 5, color: trendColor }}>{stat.sub}</p>
    </div>
  );
}

// ─── StatsGrid ────────────────────────────────────────────────────────────────

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {stats.map((s) => <StatCardItem key={s.label} stat={s} />)}
    </div>
  );
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────

const ALERT_COLORS: Record<AlertItem["variant"], string> = {
  danger:  COLORS.red,
  info:    COLORS.sky,
  success: COLORS.sage,
  warning: COLORS.amber,
};

export function AlertBanner({ alert }: { alert: AlertItem }) {
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 10,
        borderLeft: `4px solid ${ALERT_COLORS[alert.variant]}`,
        padding: "14px 18px",
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        border: "0.5px solid rgba(27,58,92,0.08)",
        borderLeftWidth: 4,
        borderLeftColor: ALERT_COLORS[alert.variant],
      }}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.navy }}>{alert.title}</p>
        <p style={{ fontSize: 12, color: COLORS.taupe, marginTop: 2 }}>{alert.desc}</p>
      </div>
      <span style={{ fontSize: 12, color: COLORS.sky, cursor: "pointer", whiteSpace: "nowrap" }}>
        {alert.action}
      </span>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = "green" | "amber" | "red" | "blue" | "navy";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  green: { bg: COLORS.sageLight,  color: COLORS.sageDark  },
  amber: { bg: COLORS.amberLight, color: COLORS.amberDark },
  red:   { bg: COLORS.redLight,   color: COLORS.redDark   },
  blue:  { bg: COLORS.skyLight,   color: COLORS.skyDark   },
  navy:  { bg: COLORS.navyLight,  color: COLORS.navyDark  },
};

export function Badge({ children, variant = "navy" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const { bg, color } = BADGE_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 20,
        fontWeight: 500,
      }}
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
  style,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 12,
        padding: 20,
        border: "0.5px solid rgba(27,58,92,0.1)",
        ...style,
      }}
    >
      {title && (
        <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.navy, marginBottom: subtitle ? 3 : 14 }}>
          {title}
        </p>
      )}
      {subtitle && (
        <p style={{ fontSize: 12, color: COLORS.taupe, marginBottom: 14 }}>{subtitle}</p>
      )}
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
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    color: COLORS.taupe,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(27,58,92,0.08)",
                    whiteSpace: "nowrap",
                  }}
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

// ─── TableRow ─────────────────────────────────────────────────────────────────

export function TR({ children }: { children: React.ReactNode }) {
  return (
    <tr
      style={{ borderBottom: "0.5px solid rgba(27,58,92,0.05)", cursor: "default" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(245,237,227,0.5)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
    >
      {children}
    </tr>
  );
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "9px 10px", color: COLORS.espresso }}>{children}</td>;
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        height: 8,
        borderRadius: 4,
        background: "rgba(27,58,92,0.08)",
        overflow: "hidden",
        margin: "6px 0 12px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 4,
          background: color,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

// ─── KpiRow ──────────────────────────────────────────────────────────────────

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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
        fontSize: 13,
      }}
    >
      <span style={{ flex: 1, color: COLORS.taupe, fontWeight: bold ? 500 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 500 : 400, color: COLORS.navy }}>{value}</span>
    </div>
  );
}

// ─── ChartLegend ─────────────────────────────────────────────────────────────

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 10 }}>
      {items.map((item) => (
        <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.taupe }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, display: "inline-block" }} />
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
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 500, color: COLORS.navy }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.taupe }}>{label}</div>
    </div>
  );
}