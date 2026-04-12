// ─── Brand colour palette ─────────────────────────────────────────────────────
// Single source of truth for all dashboard components.
// In dark mode, components using these values should conditionally override via
// globals.css `.dark` selectors. The JS values are used for Chart.js datasets
// which live outside the Tailwind cascade.

export const COLORS = {
  // Primary
  navy:      "#1B3A5C",
  navyLight: "rgba(27,58,92,0.12)",
  navyDark:  "#0e2038",

  // Accent
  amber:      "#C2703A",
  amberLight: "rgba(194,112,58,0.12)",
  amberDark:  "#8a4c20",

  // Sky / info
  sky:      "#3A6EA5",
  skyLight: "rgba(58,110,165,0.12)",
  skyDark:  "#244e7a",

  // Sage / success
  sage:      "#4A7C59",
  sageLight: "rgba(74,124,89,0.12)",
  sageDark:  "#2d5239",

  // Red / danger
  red:      "#C23A3A",
  redLight: "rgba(194,58,58,0.12)",
  redDark:  "#8a1f1f",

  // Neutrals
  taupe:   "#8A6650",
  espresso:"#5C4033",
  cream:   "#F5EDE3",
  white:   "#FFFFFF",
} as const;

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Generates `count` random-ish numbers seeded from `seed`,
 *  hovering around `base` with ±`spread` variance. */
export function generateDays(count: number, base: number, spread: number, seed: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const pct = (s >>> 0) / 0xffffffff;   // 0‥1
    out.push(Math.round(base + (pct - 0.5) * 2 * spread));
  }
  return out;
}
