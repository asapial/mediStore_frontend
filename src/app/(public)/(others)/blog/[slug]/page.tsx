"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Clock, User, ArrowLeft, Tag } from "lucide-react";

interface Blog {
  id: string; title: string; summary: string; content: string; slug: string;
  image?: string; tags: string[]; publishedAt?: string;
  author: { id: string; name: string; image?: string };
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog,    setBlog]    = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound,setNotFound]= useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs/${slug}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setBlog(d.data || null); })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </a>

        {loading && (
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-64 bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-2">{Array.from({ length: 8 }).map((_,i)=><div key={i} className="h-3 bg-muted rounded animate-pulse"/>)}</div>
          </div>
        )}

        {!loading && notFound && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📄</p>
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground">This article may have been removed or doesn't exist.</p>
            <a href="/blog" className="text-emerald-600 hover:underline mt-4 inline-block">← View all articles</a>
          </div>
        )}

        {!loading && blog && (
          <article>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map(t => (
                <span key={t} className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  <Tag className="w-3 h-3" />{t}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-black leading-tight mb-4">{blog.title}</h1>
            <p className="text-muted-foreground text-base mb-6 leading-relaxed">{blog.summary}</p>

            {/* Author & date */}
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-border">
              <div className="flex items-center gap-2.5">
                {blog.author.image
                  ? <img src={blog.author.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                  : <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center"><User className="w-4 h-4 text-emerald-600" /></div>}
                <div>
                  <p className="text-sm font-semibold">{blog.author.name}</p>
                  {blog.publishedAt && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(blog.publishedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</p>}
                </div>
              </div>
            </div>

            {/* Cover image */}
            {blog.image && (
              <div className="rounded-2xl overflow-hidden mb-8 h-72 md:h-96">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-emerald max-w-none dark:prose-invert text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, "<br/>") }} />
          </article>
        )}
      </div>
    </div>
  );
}
