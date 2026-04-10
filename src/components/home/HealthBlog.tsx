import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const posts = [
  {
    category: "Nutrition",
    categoryColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    title: "10 Essential Vitamins Your Body Needs Every Day",
    excerpt: "Discover the most important vitamins for optimal health, from Vitamin D for bone strength to Vitamin C for immune support...",
    author: "Dr. Sarah Mitchell",
    date: "April 5, 2026",
    readTime: "5 min read",
    emoji: "🥦",
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
  },
  {
    category: "Wellness",
    categoryColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    title: "How to Build a Daily Supplement Routine That Works",
    excerpt: "Creating an effective supplement routine can feel overwhelming. Here's a practical guide to getting started and staying consistent...",
    author: "PharmD James Lee",
    date: "April 2, 2026",
    readTime: "7 min read",
    emoji: "⏰",
    bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
  },
  {
    category: "Health Tips",
    categoryColor: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    title: "The Truth About Probiotics: What Science Actually Says",
    excerpt: "With so many probiotic products on the market, it's hard to know what works. We break down the research for you...",
    author: "Dr. Emily Patel",
    date: "March 28, 2026",
    readTime: "6 min read",
    emoji: "🔬",
    bg: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
  },
];

export default function HealthBlog() {
  return (
    <section className="py-12 bg-muted/30 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">Health Blog</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground mt-1">Latest Health Articles</h2>
          </div>
          <Button variant="ghost" className="self-start sm:self-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold text-sm">
            View All Articles <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post) => (
            <article
              key={post.title}
              className={`bg-gradient-to-br ${post.bg} rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group`}
            >
              {/* Emoji banner */}
              <div className="h-32 flex items-center justify-center bg-muted/20 dark:bg-muted/10 text-6xl">
                {post.emoji}
              </div>
              <div className="p-5 flex flex-col gap-3">
                <Badge variant="secondary" className={`self-start text-xs px-3 py-0.5 ${post.categoryColor}`}>
                  {post.category}
                </Badge>
                <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                </div>
                <a href="#" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}