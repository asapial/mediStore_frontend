"use client";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { COLORS } from "@/lib/theme";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
);

const TICK = { font: { size: 11 }, color: COLORS.taupe };
const GRID = { color: "rgba(92,64,51,0.06)" };
const NO_GRID = { display: false };

// ─── Line Chart ───────────────────────────────────────────────────────────────

interface LineChartProps {
  labels: string[];
  datasets: {
    data: number[];
    color: string;
    dashed?: boolean;
    fill?: boolean;
    yAxisID?: string;
    label?: string;
  }[];
  height?: number;
  secondaryAxis?: boolean;
  maxTicksX?: number;
}

export function LineChart({ labels, datasets, height = 220, secondaryAxis, maxTicksX }: LineChartProps) {
  const alpha = (hex: string, a: number) =>
    hex + Math.round(a * 255).toString(16).padStart(2, "0");

  return (
    <div style={{ position: "relative", height }}>
      <Line
        data={{
          labels,
          datasets: datasets.map((ds) => ({
            label: ds.label ?? "",
            data: ds.data,
            borderColor: ds.color,
            backgroundColor: ds.fill ? alpha(ds.color, 0.06) : "transparent",
            borderDash: ds.dashed ? [5, 4] : undefined,
            tension: 0.4,
            fill: ds.fill,
            pointRadius: 2,
            pointBackgroundColor: ds.color,
            borderWidth: 2,
            yAxisID: ds.yAxisID,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: NO_GRID, ticks: { ...TICK, maxTicksLimit: maxTicksX } },
            y: { grid: GRID, ticks: TICK },
            ...(secondaryAxis
              ? { y1: { position: "right", grid: NO_GRID, ticks: { ...TICK, color: COLORS.amber } } }
              : {}),
          },
        }}
      />
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface BarChartProps {
  labels: string[];
  datasets: { data: number[]; color: string | string[]; label?: string }[];
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
  borderRadius?: number;
}

export function BarChart({
  labels, datasets, height = 200, horizontal, stacked, borderRadius = 4,
}: BarChartProps) {
  return (
    <div style={{ position: "relative", height }}>
      <Bar
        data={{
          labels,
          datasets: datasets.map((ds) => ({
            label: ds.label ?? "",
            data: ds.data,
            backgroundColor: Array.isArray(ds.color) ? ds.color : ds.color,
            borderRadius,
          })),
        }}
        options={{
          indexAxis: horizontal ? "y" : "x",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { stacked, grid: horizontal ? GRID : NO_GRID, ticks: TICK },
            y: { stacked, grid: horizontal ? NO_GRID : GRID, ticks: TICK },
          },
        }}
      />
    </div>
  );
}

// ─── Grouped Bar Chart ────────────────────────────────────────────────────────

interface GroupedBarChartProps {
  labels: string[];
  series: { label: string; data: number[]; color: string }[];
  height?: number;
  stacked?: boolean;
}

export function GroupedBarChart({ labels, series, height = 200, stacked }: GroupedBarChartProps) {
  return (
    <div style={{ position: "relative", height }}>
      <Bar
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data,
            backgroundColor: s.color,
            borderRadius: 3,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { stacked, grid: NO_GRID, ticks: TICK },
            y: { stacked, grid: GRID,    ticks: TICK },
          },
        }}
      />
    </div>
  );
}

// ─── Doughnut Chart ───────────────────────────────────────────────────────────

interface DoughnutChartProps {
  labels: string[];
  values: number[];
  colors: string[];
  height?: number;
}

export function DoughnutChart({ labels, values, colors, height = 220 }: DoughnutChartProps) {
  return (
    <div style={{ position: "relative", height }}>
      <Doughnut
        data={{
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: COLORS.white,
            hoverBorderWidth: 2,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  );
}