"use client";

import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Sarah Johnson",
    role: "Regular Customer",
    avatar: "👩",
    rating: 5,
    text: "Pharmora has completely changed how I manage my family's health. The quality of their supplements is outstanding, and delivery is always super fast. Highly recommend!",
    product: "Vitamin C Effervescent",
  },
  {
    name: "Michael Chen",
    role: "Verified Buyer",
    avatar: "👨",
    rating: 5,
    text: "I've been using Pharmora for over a year. Their prices are competitive, the products are genuine, and the customer service team is incredibly knowledgeable. My go-to pharmacy!",
    product: "Omega-3 Fish Oil",
  },
  {
    name: "Amelia Rodriguez",
    role: "Health Enthusiast",
    avatar: "👩‍🦱",
    rating: 4,
    text: "Great selection of organic and natural products. I appreciate that they clearly label ingredients and have detailed product descriptions. The loyalty rewards program is a nice bonus.",
    product: "Collagen Peptides",
  },
  {
    name: "David Park",
    role: "Fitness Trainer",
    avatar: "🧑‍🏋️",
    rating: 5,
    text: "As a personal trainer, I recommend Pharmora to all my clients. The sports nutrition range is excellent and the products are exactly as described. Great value for money.",
    product: "Pre-Workout Powder",
  },
  {
    name: "Emma Watson",
    role: "New Customer",
    avatar: "👩‍💼",
    rating: 5,
    text: "Placed my first order last week and was blown away by how quickly it arrived. The packaging was professional and the product quality exceeded my expectations.",
    product: "Probiotic Capsules",
  },
];

const VISIBLE = 3;

export default function Testimonials() {
  const [start, setStart] = useState(0);

  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(reviews.length - VISIBLE, s + 1));
  const visible = reviews.slice(start, start + VISIBLE);

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">Testimonials</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground mt-1">What Our Customers Say</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={start === 0}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              disabled={start >= reviews.length - VISIBLE}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map((review) => (
            <div
              key={review.name}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">{review.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>
                <Quote className="w-8 h-8 text-emerald-200 dark:text-emerald-800" />
              </div>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-4">{review.text}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold border-t border-border pt-3">
                Purchased: {review.product}
              </p>
            </div>
          ))}
        </div>

        {/* Trust stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: "2M+", label: "Happy Customers" },
            { val: "50K+", label: "Products Listed" },
            { val: "4.8/5", label: "Average Rating" },
            { val: "99%", label: "Satisfaction Rate" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-5 text-center border border-emerald-100 dark:border-emerald-900">
              <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stat.val}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}