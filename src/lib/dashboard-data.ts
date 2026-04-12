import type { StatCard, AlertItem, RoleConfig } from "@/types/dashboard";
import { COLORS, generateDays } from "@/lib/theme";

// ─── Role configs ────────────────────────────────────────────────────────────

export const ROLE_CONFIGS: RoleConfig[] = [
  { role: "admin",     label: "Admin",     userName: "Admin",      subTitle: "Platform overview · MediStore v2.0",       avatarInitials: "AD", pillVariant: "red"   },
  { role: "customer",  label: "Customer",  userName: "Rahim",      subTitle: "Welcome back, Rahim · Gold member",         avatarInitials: "RH", pillVariant: "blue"  },
  { role: "seller",    label: "Seller",    userName: "PharmaPlus", subTitle: "PharmaPlus BD · Verified seller · Gold tier",avatarInitials: "PP", pillVariant: "amber" },
  { role: "warehouse", label: "Warehouse", userName: "Warehouse",  subTitle: "Dhaka Central Hub · 3 active locations",    avatarInitials: "WH", pillVariant: "green" },
];

// ─── Admin data ───────────────────────────────────────────────────────────────

export const ADMIN_STATS: StatCard[] = [
  { label: "Total revenue",         value: "৳48.2M",  sub: "↑ 12.4% vs last month",  trend: "up",      accent: "amber" },
  { label: "Registered users",      value: "32,840",  sub: "↑ 1,204 this week",       trend: "up",      accent: "blue"  },
  { label: "Orders placed",         value: "9,182",   sub: "↑ 8.1% vs last month",    trend: "up",      accent: "green" },
  { label: "Active sellers",        value: "247",     sub: "14 pending license",       trend: "neutral", accent: "red"   },
  { label: "Pending prescriptions", value: "183",     sub: "23 unreviewed",            trend: "down",    accent: "navy"  },
  { label: "Platform GMV",          value: "৳142M",   sub: "↑ 19.7% YTD",             trend: "up",      accent: "navy"  },
];

export const ADMIN_ALERTS: AlertItem[] = [
  { title: "14 seller licenses awaiting review", desc: "Oldest submission 8 days ago",                       action: "Review queue →", variant: "danger"  },
  { title: "Fraud detection: 3 new flags today",  desc: "2 suspicious order patterns · 1 account anomaly",   action: "View flags →",   variant: "info"    },
];

export const ADMIN_FLAGGED = [
  { user: "+8801711***234",  type: "Fraud flag",      detail: "5 orders in 10 min from same device",        time: "2h ago",  status: "Investigate" },
  { user: "seller_rx_pharma", type: "License expired", detail: "License #BD-PH-2021-04412 expired",          time: "1d ago",  status: "Pending"     },
  { user: "cust_1482",       type: "Refund dispute",  detail: "Order #ORD-92841 — wrong medicine received",  time: "2d ago",  status: "In review"   },
  { user: "warehouse_ctg_02", type: "Expiry alert",   detail: "48 units Metformin 500mg expire in 7 days",   time: "3h ago",  status: "Pending"     },
];

export const ADMIN_CHART_DATA = {
  revenue: {
    labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    revenue: [30, 33, 38, 42, 44, 48],
    orders:  [5800, 6200, 7100, 8000, 8600, 9182],
  },
  roleSplit: {
    labels: ["Customer", "Seller", "Warehouse", "Admin"],
    values: [89, 8, 2, 1],
    colors: [COLORS.navy, COLORS.sky, COLORS.sage, COLORS.amber],
  },
  orderStatus: {
    labels: ["Delivered", "Processing", "Shipped", "Cancelled"],
    values: [5240, 1920, 1640, 382],
    colors: [COLORS.sage, COLORS.sky, COLORS.amber, COLORS.red],
  },
  categories: {
    labels: ["Antibiotics", "Cardiology", "Diabetes", "Vitamins", "Gastro", "Neuro"],
    values: [28, 22, 18, 15, 10, 7],
  },
};

// ─── Customer data ────────────────────────────────────────────────────────────

export const CUSTOMER_STATS: StatCard[] = [
  { label: "Loyalty points",  value: "2,840",   sub: "↑ 120 this month · Gold tier",   trend: "up",      accent: "amber" },
  { label: "Total orders",    value: "37",       sub: "3 active · 34 delivered",        trend: "neutral", accent: "blue"  },
  { label: "Wallet balance",  value: "৳840",     sub: "Available store credit",          trend: "neutral", accent: "green" },
  { label: "Active reminders",value: "4",        sub: "1 due in 2 hours",               trend: "down",    accent: "navy"  },
  { label: "Saved items",     value: "12",       sub: "2 back in stock",                trend: "up",      accent: "navy"  },
  { label: "Total spent",     value: "৳14.2K",   sub: "↑ ৳1,840 vs last month",         trend: "up",      accent: "navy"  },
];

export const CUSTOMER_ALERTS: AlertItem[] = [
  { title: "Metformin 500mg — auto-refill in 3 days", desc: "Subscription active · Dhaka Central Warehouse has stock", action: "Manage →",    variant: "success" },
  { title: "2 wishlist items are now on sale",          desc: "Paracetamol 650mg and Vitamin D3 — up to 18% off",        action: "View deals →", variant: "warning" },
];

export const CUSTOMER_REMINDERS = [
  { medicine: "Metformin 500mg",    dose: "2x daily",   nextDue: "In 2h",    urgency: "red"   },
  { medicine: "Atorvastatin 10mg",  dose: "1x nightly", nextDue: "8 PM",     urgency: "green" },
  { medicine: "Vitamin D3 1000IU",  dose: "1x morning", nextDue: "Tomorrow", urgency: "green" },
  { medicine: "Aspirin 75mg",       dose: "1x morning", nextDue: "Tomorrow", urgency: "green" },
];

export const CUSTOMER_ORDERS = [
  { id: "ORD-10284", total: "৳840",   status: "Shipped",   statusVariant: "blue"  },
  { id: "ORD-10241", total: "৳1,240", status: "Delivered", statusVariant: "green" },
  { id: "ORD-10198", total: "৳380",   status: "Delivered", statusVariant: "green" },
  { id: "ORD-10142", total: "৳2,100", status: "Delivered", statusVariant: "green" },
];

export const CUSTOMER_CHART_DATA = {
  spending: {
    labels: ["Diabetes", "Cardiology", "Vitamins", "Other"],
    values: [40, 25, 20, 15],
    colors: [COLORS.navy, COLORS.sky, COLORS.amber, COLORS.taupe],
  },
  orderFreq: {
    labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    values: [4, 6, 5, 7, 8, 9],
  },
  healthSpend: [
    { condition: "Type 2 Diabetes", amount: "৳5,600 / yr", pct: 75, color: COLORS.navy   },
    { condition: "Hypertension",     amount: "৳3,200 / yr", pct: 45, color: COLORS.sky    },
    { condition: "Vitamins & supps", amount: "৳2,800 / yr", pct: 38, color: COLORS.amber  },
    { condition: "Other / acute",    amount: "৳2,600 / yr", pct: 30, color: COLORS.taupe  },
  ],
};

// ─── Seller data ──────────────────────────────────────────────────────────────

export const SELLER_STATS: StatCard[] = [
  { label: "Revenue this month", value: "৳2.84M",  sub: "↑ 14.2% vs last month",      trend: "up",      accent: "amber" },
  { label: "Total orders",       value: "482",      sub: "↑ 38 this week",              trend: "up",      accent: "blue"  },
  { label: "Active listings",    value: "148",      sub: "6 low stock · 2 expired",     trend: "neutral", accent: "green" },
  { label: "Pending payouts",    value: "৳840K",    sub: "Next payout in 3 days",        trend: "down",    accent: "red"   },
  { label: "Avg order value",    value: "৳5,892",   sub: "↑ ৳340 vs last month",         trend: "up",      accent: "navy"  },
  { label: "Return rate",        value: "1.8%",     sub: "↓ platform avg 3.2%",         trend: "up",      accent: "navy"  },
];

export const SELLER_ALERTS: AlertItem[] = [
  { title: "6 products critically low on stock", desc: "Metformin 500mg, Atorvastatin 10mg and 4 others below threshold", action: "Restock →", variant: "danger" },
];

export const SELLER_LOW_STOCK = [
  { medicine: "Metformin 500mg",   category: "Diabetes",   stock: 8,  threshold: 50, stockVariant: "red"   },
  { medicine: "Atorvastatin 10mg", category: "Cardiology", stock: 12, threshold: 50, stockVariant: "red"   },
  { medicine: "Amlodipine 5mg",    category: "Cardiology", stock: 24, threshold: 50, stockVariant: "amber" },
  { medicine: "Omeprazole 20mg",   category: "Gastro",     stock: 31, threshold: 50, stockVariant: "amber" },
];

export const SELLER_FUNNEL = [
  { stage: "Product views",    value: 24820, pct: 100, color: COLORS.navy  },
  { stage: "Added to cart",    value: 6240,  pct: 25,  color: COLORS.sky   },
  { stage: "Checkout started", value: 3180,  pct: 13,  color: COLORS.amber },
  { stage: "Orders placed",    value: 482,   pct: 2,   color: COLORS.sage  },
];

export const SELLER_CHART_DATA = {
  revenue30: {
    labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
    values: generateDays(30, 60, 60, 42),
    target: 90,
  },
  topProducts: {
    labels: ["Metformin 500mg", "Atorvastatin 10mg", "Omeprazole 20mg", "Amlodipine 5mg", "Vit D3"],
    values: [680, 520, 410, 340, 290],
  },
  fulfillment: {
    labels: ["Fulfilled", "Processing", "Pending", "Cancelled"],
    values: [72, 18, 7, 3],
    colors: [COLORS.sage, COLORS.sky, COLORS.amber, COLORS.red],
  },
};

// ─── Warehouse data ───────────────────────────────────────────────────────────

export const WAREHOUSE_STATS: StatCard[] = [
  { label: "Total stock units",      value: "84,240", sub: "Across 3 locations",          trend: "up",      accent: "amber" },
  { label: "Pending transfers",      value: "14",     sub: "4 in transit",                trend: "down",    accent: "blue"  },
  { label: "Orders fulfilled today", value: "218",    sub: "↑ 34 vs yesterday",           trend: "up",      accent: "green" },
  { label: "Expiry alerts",          value: "37",     sub: "12 expire within 7 days",     trend: "down",    accent: "red"   },
  { label: "Pick & pack tasks",      value: "92",     sub: "28 overdue",                  trend: "down",    accent: "navy"  },
  { label: "GRNs this week",         value: "18",     sub: "↑ 3 vs last week",            trend: "up",      accent: "navy"  },
];

export const WAREHOUSE_ALERTS: AlertItem[] = [
  { title: "12 batches expire within 7 days — action required", desc: "Metformin (48 units) · Amoxicillin (96 units) at Mirpur branch", action: "View alerts →", variant: "danger"  },
  { title: "Transfer #TRF-0482 arrived at Chittagong Hub",       desc: "240 units Atorvastatin 10mg — confirm receipt",                   action: "Confirm →",     variant: "info"    },
];

export const WAREHOUSE_LOCATIONS = [
  { name: "Dhaka Central Hub", city: "Dhaka",      units: "42,180", lowStock: 2,  nearExpiry: 8,  statusVariant: "green", status: "Active"          },
  { name: "Mirpur Branch",     city: "Dhaka",      units: "28,400", lowStock: 6,  nearExpiry: 18, statusVariant: "green", status: "Active"          },
  { name: "Chittagong Hub",    city: "Chittagong", units: "13,660", lowStock: 11, nearExpiry: 11, statusVariant: "blue",  status: "Transfer pending" },
];

export const WAREHOUSE_TRANSFERS = [
  { stage: "Pending initiation",     value: 8,  variant: "amber" },
  { stage: "In transit",             value: 4,  variant: "blue"  },
  { stage: "Received & confirmed",   value: 62, variant: "green" },
  { stage: "Cancelled",              value: 2,  variant: "red"   },
];

export const WAREHOUSE_CHART_DATA = {
  stockByLocation: {
    labels: ["Diabetes", "Cardiology", "Antibiotics", "Vitamins"],
    dhaka:     [18000, 12000, 8000, 4200],
    mirpur:    [12000, 8500,  5200, 2700],
    chittagong:[4200,  3100,  3800, 2560],
  },
  throughput14: {
    labels:    Array.from({ length: 14 }, (_, i) => String(i + 1)),
    fulfilled: generateDays(14, 160, 80, 99),
    failed:    generateDays(14, 2,   12, 77),
  },
  expiry: {
    labels: ["Within 7d", "Within 30d", "Within 60d", "60d+"],
    values: [12, 18, 7, 4],
    colors: [COLORS.red, COLORS.amber, COLORS.sky, COLORS.navy],
  },
};