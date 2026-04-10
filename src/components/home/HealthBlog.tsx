"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Blog {
  id: string; title: string; summary: string; image?: string; slug: string;
  tags: string[]; publishedAt?: string;
  author: { id: string; name: string; image?: string };
}

export default function HealthBlog() {
  const [blogs,   setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blogs?featured=true&limit=3")
      .then(r => r.json())
      .then(d => setBlogs(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-foreground">Health Blog</h2>
            <p className="text-sm text-muted-foreground mt-1">Expert tips for a healthier life</p>
          </div>
          <a href="/blog" className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1">
            All Articles <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <a key={blog.id} href={`/blog/${blog.slug}`}
                className="group rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-background">
                <div className="h-48 bg-muted/50 overflow-hidden flex items-center justify-center relative">
                  {blog.image
                    ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    : <span className="text-6xl">🏥</span>}
                  {blog.tags[0] && (
                    <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-500 text-white text-[10px]">
                      {blog.tags[0]}
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{blog.summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {blog.author.image
                        ? <img src={blog.author.image} alt="" className="w-4 h-4 rounded-full" />
                        : <User className="w-3.5 h-3.5" />}
                      {blog.author.name}
                    </span>
                    {blog.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}