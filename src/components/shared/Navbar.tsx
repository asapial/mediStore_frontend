"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Search, Heart, User, Phone, MapPin, ChevronDown,
  Menu, X, LogOut, LayoutDashboard, Package, Settings, LogIn,
  UserPlus, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "../home/Themetoggle";
import { toast } from "sonner";
import Logo from "./NamePlate";

interface Category { id: string; name: string; }
interface UserInfo { id: string; name: string; email: string; role: string; image?: string; }

const navLinks = [
  { label: "Home",         href: "/",        hasDropdown: false },
  { label: "Shop",         href: "/shop",    hasDropdown: false },
  // { label: "Health Topics",href: "/health",  hasDropdown: false },
  // { label: "About Us",     href: "/about",   hasDropdown: false },
  { label: "Blog",         href: "/blog",    hasDropdown: false },
  { label: "Contact",      href: "/contact", hasDropdown: false },
];

function getDashboardUrl(role: string) {
  if (role === "ADMIN")     return "/dashboard/admin";
  if (role === "SELLER")    return "/dashboard/seller";
  if (role === "WAREHOUSE") return "/dashboard/warehouse/overview";
  return "/dashboard/customer/orders";
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [catOpen,      setCatOpen]      = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  // Dynamic data
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [cartCount,    setCartCount]    = useState(0);
  const [wishCount,    setWishCount]    = useState(0);
  const [user,         setUser]         = useState<UserInfo | null>(null);

  const catRef     = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node))     setCatOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json()).then(d => setCategories(d.data || [])).catch(() => {});
  }, []);

  // Fetch user session
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d?.user ?? null))
      .catch(() => {});
  }, []);

  // Fetch cart + wishlist counts
  useEffect(() => {
    if (!user) { setCartCount(0); setWishCount(0); return; }
    fetch("/api/cart", { credentials: "include" })
      .then(r => r.json()).then(d => setCartCount(d.data?.items?.length || 0)).catch(() => {});
    fetch("/api/wishlist", { credentials: "include" })
      .then(r => r.json()).then(d => setWishCount(d.data?.length || 0)).catch(() => {});
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/shop?name=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
      setUser(null); setCartCount(0); setWishCount(0);
      toast.success("Logged out");
      router.push("/");
    } catch { toast.error("Logout failed"); }
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      {/* <div className="bg-emerald-600 dark:bg-emerald-800 text-white text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              +1 800 123 4567
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              123 Health Street, New York
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="opacity-90">Free shipping on orders over $50</span>
            <span className="w-px h-3 bg-white/40" />
            <a href="#" className="hover:underline opacity-90">Track Order</a>
            <span className="w-px h-3 bg-white/40" />
            {user
              ? <span className="opacity-90">👋 {user.name.split(" ")[0]}</span>
              : <a href="/login" className="hover:underline opacity-90">Sign In</a>}
          </div>
        </div>
      </div> */}

      {/* Main navbar */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          {/* <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none">P</span>
            </div>
            <span className="font-black text-xl tracking-tight text-foreground">
              Pro<span className="text-emerald-500">Pharm</span>
            </span>
          </a> */}
          <Logo size="lg"></Logo>

          {/* ── Category dropdown ─────────────────────────────────────────── */}
          <div ref={catRef} className="hidden md:block relative">
            <div
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-1 border border-border rounded-lg px-3 py-2 cursor-pointer hover:border-emerald-500 transition-colors bg-muted/50 text-sm font-medium text-foreground min-w-[160px] select-none">
              <Menu className="w-4 h-4 text-emerald-500" />
              <span className="ml-1">All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 ml-auto opacity-60 transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </div>
            {catOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-xl shadow-xl py-2 z-50">
                <a href="/shop"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  onClick={() => setCatOpen(false)}>
                  🛒 All Products
                </a>
                <div className="border-t border-border/60 my-1" />
                {categories.length === 0
                  ? <p className="px-4 py-2 text-xs text-muted-foreground">Loading…</p>
                  : categories.map(cat => (
                    <a key={cat.id}
                      href={`/shop?categoryId=${cat.id}`}
                      onClick={() => setCatOpen(false)}
                      className="block px-4 py-2.5 text-sm text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                      {cat.name}
                    </a>
                  ))}
              </div>
            )}
          </div>

          {/* ── Search bar ────────────────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400 bg-background">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for medicines, vitamins, health products..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm"
            />
            <Button type="submit" size="sm" className="rounded-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 h-10">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <ThemeToggle />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden md:flex relative" onClick={() => router.push("/dashboard/customer/wishlist")}>
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-rose-500 hover:bg-rose-500">
                  {wishCount > 99 ? "99+" : wishCount}
                </Badge>
              )}
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="hidden md:flex relative" onClick={() => router.push("/dashboard/customer/cart")}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-emerald-500 hover:bg-emerald-500">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Button>

            {/* Profile dropdown */}
            <div ref={profileRef} className="hidden md:block relative">
              <Button variant="ghost" size="icon" onClick={() => setProfileOpen(!profileOpen)} className="relative">
                {user?.image
                  ? <img src={user.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                  : <User className="w-5 h-5" />}
                {user && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />}
              </Button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-2xl shadow-2xl py-2 z-50">
                  {user ? (
                    <>
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          {user.image
                            ? <img src={user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                            : <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-emerald-600">{user.name.charAt(0)}</div>}
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                              style={{
                                background:
                                  user.role === "ADMIN"     ? "#E3F0FB" :
                                  user.role === "SELLER"    ? "#E8F5E9" :
                                  user.role === "WAREHOUSE" ? "#E0F2FE" :
                                  "#FFF3E0",
                                color:
                                  user.role === "ADMIN"     ? "#3A6EA5" :
                                  user.role === "SELLER"    ? "#2E7D32" :
                                  user.role === "WAREHOUSE" ? "#0369A1" :
                                  "#C2703A",
                              }}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      {[
                        { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard",   href: getDashboardUrl(user.role) },
                        { icon: <Package className="w-4 h-4" />,         label: "My Orders",   href: "/dashboard/customer/orders" },
                        { icon: <Heart className="w-4 h-4" />,           label: "Wishlist",    href: "/dashboard/customer/wishlist" },
                        { icon: <ShoppingCart className="w-4 h-4" />,   label: "My Cart",     href: "/dashboard/customer/cart" },
                        { icon: <BookOpen className="w-4 h-4" />,        label: "My Articles", href: "/blog" },
                        { icon: <Settings className="w-4 h-4" />,        label: "Profile",     href: "/profile" },
                      ].map(({ icon, label, href }) => (
                        <a key={label} href={href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                          <span className="text-muted-foreground">{icon}</span>{label}
                        </a>
                      ))}

                      <div className="border-t border-border mt-1 pt-1">
                        <button onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-bold text-sm">Welcome to LifeLine</p>
                        <p className="text-xs text-muted-foreground">Sign in to access your account</p>
                      </div>
                      <a href="/login" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors font-semibold">
                        <LogIn className="w-4 h-4 text-emerald-500" /> Sign In
                      </a>
                      <a href="/register" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                        <UserPlus className="w-4 h-4 text-blue-500" /> Create Account
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="hidden md:block bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-0">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors border-b-2 border-transparent hover:border-emerald-500"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </a>
            ))}
            <div className="ml-auto flex items-center gap-2 py-2">
              <span className="text-xs text-muted-foreground">🚚 Free delivery over $50</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex items-center border border-border rounded-lg overflow-hidden">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="border-0 shadow-none focus-visible:ring-0 text-sm" />
            <Button type="submit" size="sm" className="rounded-none bg-emerald-500 hover:bg-emerald-600 text-white px-3">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* Mobile categories */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button onClick={() => setCatOpen(!catOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium">
              All Categories <ChevronDown className={`w-4 h-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </button>
            {catOpen && (
              <div className="border-t border-border bg-muted/30 py-1">
                {categories.map(cat => (
                  <a key={cat.id} href={`/shop?categoryId=${cat.id}`}
                    className="block px-6 py-2 text-sm hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-foreground py-2 border-b border-border/50">
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push("/dashboard/customer/wishlist")}>
              <Heart className="w-4 h-4 mr-1" /> Wishlist {wishCount > 0 && `(${wishCount})`}
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push("/dashboard/customer/cart")}>
              <ShoppingCart className="w-4 h-4 mr-1" /> Cart {cartCount > 0 && `(${cartCount})`}
            </Button>
          </div>
          {user ? (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push(getDashboardUrl(user.role))}>
                <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push("/login")}>
                <LogIn className="w-4 h-4 mr-1" /> Sign In
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push("/register")}>
                <UserPlus className="w-4 h-4 mr-1" /> Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}