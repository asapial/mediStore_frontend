// ─── Shared dashboard type definitions ───────────────────────────────────────

export interface StatCard {
  label:  string;
  value:  string;
  sub:    string;
  trend:  "up" | "down" | "neutral";
  accent: "amber" | "blue" | "green" | "red" | "navy";
}

export interface AlertItem {
  title:   string;
  desc:    string;
  action:  string;
  variant: "danger" | "info" | "success" | "warning";
}

export interface RoleConfig {
  role:           string;
  label:          string;
  userName:       string;
  subTitle:       string;
  avatarInitials: string;
  pillVariant:    "red" | "blue" | "amber" | "green";
}
