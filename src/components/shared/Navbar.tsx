"use client";

import { useState } from "react";
import { ShoppingCart, Search, Heart, User, Phone, MapPin, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "../home/Themetoggle";


const categories = [
  "Personal Care",
  "Grocery",
  "Baby",
  "Beauty",
  "Herbs",
  "Sports Nutrition",
  "Pets",
  "Medicines",
  "Supplements",
];

const navLinks = [
  { label: "Home", href: "/", hasDropdown: false },
  { label: "Shop", href: "/shop", hasDropdown: true },
  { label: "Health Topics", href: "/health", hasDropdown: true },
  { label: "About Us", href: "/about", hasDropdown: false },
  { label: "Blog", href: "/blog", hasDropdown: false },
  { label: "Contact", href: "/contact", hasDropdown: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white text-sm py-2 px-4">
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
            <a href="#" className="hover:underline opacity-90">Sign In</a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none">P</span>
            </div>
            <span className="font-black text-xl tracking-tight text-foreground">
              Pro<span className="text-emerald-500">Pharm</span>
            </span>
          </a>

          {/* Category dropdown */}
          <div className="hidden md:flex items-center gap-1 border border-border rounded-lg px-3 py-2 cursor-pointer hover:border-emerald-500 transition-colors bg-muted/50 text-sm font-medium text-foreground min-w-[160px]">
            <Menu className="w-4 h-4 text-emerald-500" />
            <span className="ml-1">All Categories</span>
            <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-60" />
          </div>

          {/* Search bar */}
          <div className="flex-1 hidden md:flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400 bg-background">
            <Input
              placeholder="Search for medicines, vitamins, health products..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm"
            />
            <Button size="sm" className="rounded-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 h-10">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <Heart className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-rose-500 hover:bg-rose-500">3</Badge>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <ShoppingCart className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-emerald-500 hover:bg-emerald-500">5</Badge>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>
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
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <Input placeholder="Search products..." className="border-0 shadow-none focus-visible:ring-0 text-sm" />
            <Button size="sm" className="rounded-none bg-emerald-500 hover:bg-emerald-600 text-white px-3">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-foreground py-2 border-b border-border/50">
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1"><Heart className="w-4 h-4 mr-1" /> Wishlist</Button>
            <Button variant="outline" size="sm" className="flex-1"><ShoppingCart className="w-4 h-4 mr-1" /> Cart (5)</Button>
          </div>
        </div>
      )}
    </header>
  );
}