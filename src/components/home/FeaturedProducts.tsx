"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  badgeColor?: string;
  category: string;
  emoji: string;
  inStock: boolean;
}

const products: Product[] = [
  { id: 1, name: "Vitamin C 1000mg Effervescent Tablets", brand: "HealthPro", price: 12.99, originalPrice: 18.99, rating: 4.8, reviews: 324, badge: "Sale", badgeColor: "bg-rose-500", category: "Vitamins", emoji: "🍊", inStock: true },
  { id: 2, name: "Omega-3 Fish Oil 1200mg Softgels", brand: "NaturePlus", price: 24.49, rating: 4.9, reviews: 512, badge: "Best Seller", badgeColor: "bg-emerald-500", category: "Supplements", emoji: "🐟", inStock: true },
  { id: 3, name: "Probiotic 50 Billion CFU Daily Capsules", brand: "GutHealth", price: 31.99, originalPrice: 39.99, rating: 4.7, reviews: 198, badge: "New", badgeColor: "bg-blue-500", category: "Digestive", emoji: "🦠", inStock: true },
  { id: 4, name: "Multivitamin Complete Men's Formula", brand: "VitaMax", price: 19.99, rating: 4.6, reviews: 267, category: "Vitamins", emoji: "💪", inStock: true },
  { id: 5, name: "Melatonin 10mg Sleep Support Gummies", brand: "SleepWell", price: 14.99, originalPrice: 19.99, rating: 4.8, reviews: 445, badge: "Sale", badgeColor: "bg-rose-500", category: "Sleep", emoji: "🌙", inStock: true },
  { id: 6, name: "Collagen Peptides Powder Unflavored", brand: "BeautyPro", price: 36.99, rating: 4.9, reviews: 731, badge: "Top Rated", badgeColor: "bg-violet-500", category: "Beauty", emoji: "💆", inStock: true },
  { id: 7, name: "Magnesium Glycinate 400mg Capsules", brand: "PureMag", price: 22.49, rating: 4.7, reviews: 189, badge: "New", badgeColor: "bg-blue-500", category: "Minerals", emoji: "⚡", inStock: false },
  { id: 8, name: "Zinc + Vitamin D3 Immune Complex", brand: "ImmuneShield", price: 17.99, originalPrice: 24.99, rating: 4.6, reviews: 302, badge: "Sale", badgeColor: "bg-rose-500", category: "Immune", emoji: "🛡️", inStock: true },
];

const tabs = ["All", "Vitamins", "Supplements", "Beauty", "New Arrivals"];

function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl dark:hover:shadow-emerald-950/30 transition-all duration-300 flex flex-col">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.badge && (
          <Badge className={`${product.badgeColor} hover:${product.badgeColor} text-white text-[10px] px-2 py-0.5`}>
            {product.badge}
          </Badge>
        )}
        {discount && (
          <Badge className="bg-rose-500 hover:bg-rose-500 text-white text-[10px] px-2 py-0.5">
            -{discount}%
          </Badge>
        )}
        {!product.inStock && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Out of Stock</Badge>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => setWishlisted((v) => !v)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
      >
        <Heart
          className={cn("w-4 h-4 transition-colors", wishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground")}
        />
      </button>

      {/* Product image area */}
      <div className="relative bg-gradient-to-br from-muted/30 to-muted/60 dark:from-muted/20 dark:to-muted/40 h-44 flex items-center justify-center">
        <span className="text-7xl select-none">{product.emoji}</span>
        {/* Quick view */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <Button size="sm" variant="secondary" className="text-xs shadow-md h-7 px-3">
            <Eye className="w-3 h-3 mr-1" /> Quick View
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">{product.brand} · {product.category}</p>
          <h3 className="text-sm font-semibold text-foreground leading-tight mt-1 line-clamp-2">{product.name}</h3>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                className={cn("w-3 h-3", s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({product.reviews})</span>
        </div>
        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-black text-foreground">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs line-through text-muted-foreground">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        {/* Add to cart */}
        <Button
          onClick={handleAdd}
          disabled={!product.inStock}
          className={cn(
            "w-full h-9 text-xs font-semibold rounded-xl transition-all",
            added
              ? "bg-green-500 hover:bg-green-500 text-white"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:scale-105"
          )}
        >
          {!product.inStock ? (
            "Out of Stock"
          ) : added ? (
            "✓ Added!"
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All"
    ? products
    : activeTab === "New Arrivals"
    ? products.filter((p) => p.badge === "New")
    : products.filter((p) => p.category === activeTab);

  const displayed = filtered.length ? filtered : products;

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">Featured Products</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Top Selling Products</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200",
                  activeTab === tab
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all */}
        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-8 py-5 font-semibold rounded-xl transition-all hover:scale-105">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}