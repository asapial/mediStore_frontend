"use client";

import { useState, useEffect } from "react";
import { AdminDashboard }    from "@/components/dashboard/Admindashboard";
import { CustomerDashboard } from "@/components/dashboard/Customerdashboard";
import { SellerDashboard }   from "@/components/dashboard/Sellerdashboard";

type Role = "ADMIN" | "CUSTOMER" | "SELLER";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
}

const ROLE_TITLE: Record<Role, { heading: string; sub: string }> = {
  ADMIN:    { heading: "Platform overview",   sub: "MediStore Admin · Real-time stats" },
  CUSTOMER: { heading: "My health dashboard", sub: "Welcome back · Your orders & health" },
  SELLER:   { heading: "Seller dashboard",    sub: "Your store performance & inventory" },
};

const ROLE_HOME: Record<Role, string> = {
  ADMIN:    "/dashboard/admin",
  SELLER:   "/dashboard/seller",
  CUSTOMER: "/dashboard/customer/orders",
};

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-5 h-5 text-muted-foreground cursor-pointer">
      <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" />
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

export default function DashboardPage() {
  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the real logged-in user
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent
          animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    </div>
  );

  // ── Not logged in (middleware should have redirected, but just in case) ─────
  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-primary mb-2">Session Expired</h2>
        <p className="text-muted-foreground text-sm mb-4">Please log in to access your dashboard.</p>
        <a href="/login" className="px-6 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground">
          Go to Login
        </a>
      </div>
    </div>
  );

  const role  = user.role as Role;
  const title = ROLE_TITLE[role] ?? ROLE_TITLE.CUSTOMER;

  const DashboardComponent =
    role === "ADMIN"    ? AdminDashboard    :
    role === "SELLER"   ? SellerDashboard   :
    /* CUSTOMER */        CustomerDashboard;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ── Top navigation bar ────────────────────────────────────────────── */}
      <header className="bg-primary h-14 flex items-center justify-between px-6
        sticky top-0 z-[100] border-b border-primary/20">
        <span className="text-primary-foreground text-lg font-semibold tracking-wide">
          Medi<span className="text-accent font-normal">Store</span>
        </span>

        <div className="flex items-center gap-4">
          {/* Bell */}
          <div className="relative">
            <BellIcon />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-accent
              border-2 border-primary" />
          </div>

          {/* Avatar + Name */}
          <a href={ROLE_HOME[role]}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {user.image
              ? <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
              : (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center
                  text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )
            }
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-primary-foreground leading-tight">{user.name}</p>
              <p className="text-[10px] text-primary-foreground/50">{role}</p>
            </div>
          </a>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className="p-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-primary">{title.heading}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{title.sub}</p>
        </div>

        {/* Role-based dashboard component */}
        <DashboardComponent />
      </main>
    </div>
  );
}