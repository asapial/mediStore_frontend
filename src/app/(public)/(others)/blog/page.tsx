"use client";
import { useState, useEffect } from "react";
import { Search, Clock, User, ArrowRight, PenSquare, X, Send, CheckCircle, Tag, Image, FileText, AlignLeft } from "lucide-react";
import { toast } from "sonner";

interface Blog {
  id: string; title: string; summary: string; slug: string; image?: string;
  tags: string[]; publishedAt?: string; author: { id: string; name: string; image?: string };
}
interface SessionUser { id: string; name: string; email: string; }

const FIELD_STYLE = { borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" };
const LABEL_STYLE = "block text-xs font-semibold mb-1 text-gray-600";
const INPUT_CLS = "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";

export default function BlogPage() {
  const [blogs,     setBlogs]     = useState<Blog[]>([]);
  const [myBlogs,   setMyBlogs]   = useState<Blog[]>([]);
  const [user,      setUser]      = useState<SessionUser | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState<"all"|"mine">("all");

  const [form, setForm] = useState({
    title: "", summary: "", content: "", image: "", tags: "",
  });

  const loadBlogs = () =>
    fetch("/api/blogs?limit=50")
      .then(r => r.json()).then(d => setBlogs(d.data || []))
      .finally(() => setLoading(false));

  const loadMyBlogs = () =>
    fetch("/api/blogs/my/list", { credentials: "include" })
      .then(r => r.json()).then(d => setMyBlogs(d.data || []));

  useEffect(() => {
    loadBlogs();
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) { setUser(d.user); loadMyBlogs(); } })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error("Title, summary and content are required"); return;
    }
    setSaving(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch("/api/blogs", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, summary: form.summary, content: form.content, image: form.image || undefined, tags }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Article submitted! It will appear after admin review.");
      setSubmitted(true); setShowForm(false);
      setForm({ title: "", summary: "", content: "", image: "", tags: "" });
      loadMyBlogs();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.summary.toLowerCase().includes(search.toLowerCase()) ||
    b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 py-16 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-3">Health & Wellness</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Health Blog</h1>
          <p className="text-emerald-100 text-base mb-8">Expert health tips, medical news, and wellness guides from our community</p>
          <div className="flex items-center max-w-lg mx-auto bg-white/20 border border-white/30 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-white/60">
            <Search className="w-4 h-4 text-white/70 ml-4 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, topics, tags…"
              className="flex-1 px-3 py-3 text-sm focus:outline-none bg-transparent text-white placeholder:text-white/60" />
          </div>
          {user && (
            <button onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors">
              <PenSquare className="w-4 h-4" />
              {showForm ? "Cancel" : "Write an Article"}
            </button>
          )}
          {!user && (
            <p className="mt-6 text-emerald-200 text-sm">
              <a href="/login" className="underline font-semibold text-white">Sign in</a> to write and publish your own health articles
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Success banner */}
        {submitted && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-8 bg-emerald-50 border border-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700">Article submitted for review!</p>
              <p className="text-sm text-emerald-600">An admin will review and publish it shortly. Check your "My Articles" tab.</p>
            </div>
            <button onClick={() => setSubmitted(false)} className="ml-auto text-emerald-500 hover:text-emerald-700"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Write Article Form */}
        {showForm && user && (
          <div className="mb-10 border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Form header */}
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <PenSquare className="w-5 h-5" /> Write a Health Article
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="bg-background p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={LABEL_STYLE}><FileText className="inline w-3.5 h-3.5 mr-1" />Article Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. 10 Tips for a Healthier Immune System"
                    className={INPUT_CLS} style={FIELD_STYLE} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_STYLE}><AlignLeft className="inline w-3.5 h-3.5 mr-1" />Summary *</label>
                  <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                    placeholder="A brief summary of the article (2-3 sentences)…"
                    rows={2} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_STYLE}><Send className="inline w-3.5 h-3.5 mr-1" />Full Content *</label>
                  <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write your full article here…"
                    rows={10} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} required />
                </div>
                <div>
                  <label className={LABEL_STYLE}><Image className="inline w-3.5 h-3.5 mr-1" />Cover Image URL (optional)</label>
                  <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
                <div>
                  <label className={LABEL_STYLE}><Tag className="inline w-3.5 h-3.5 mr-1" />Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. vitamins, immunity, nutrition"
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
              </div>

              {/* Image preview */}
              {form.image && (
                <div className="rounded-xl overflow-hidden h-40 bg-muted">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-60 transition-colors">
                  <Send className="w-4 h-4" />
                  {saving ? "Submitting…" : "Submit for Review"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
                <p className="text-xs text-muted-foreground">Your article will be reviewed by an admin before publishing</p>
              </div>
            </form>
          </div>
        )}

        {/* Tabs (My Articles tab only shown if logged in and has drafts) */}
        {user && myBlogs.length > 0 && (
          <div className="flex gap-2 mb-6">
            {(["all", "mine"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="capitalize px-5 py-2 rounded-full text-sm font-bold border transition-colors"
                style={activeTab === tab
                  ? { background: "#059669", color: "#fff", borderColor: "#059669" }
                  : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}>
                {tab === "all" ? "All Articles" : `My Articles (${myBlogs.length})`}
              </button>
            ))}
          </div>
        )}

        {/* My Articles tab */}
        {activeTab === "mine" && user && (
          <div className="mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myBlogs.map(b => (
                <div key={b.id} className="rounded-2xl border border-border overflow-hidden bg-background opacity-90">
                  <div className="h-36 bg-muted/50 flex items-center justify-center overflow-hidden">
                    {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" /> : <span className="text-5xl">✍️</span>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(b as any).isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {(b as any).isPublished ? "✅ Published" : "⏳ Pending Review"}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        {activeTab === "all" && (
          loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-4xl mb-4">📄</p>
              <p className="font-semibold">No articles found{search ? ` matching "${search}"` : ""}.</p>
              {user && <button onClick={() => setShowForm(true)} className="mt-4 text-emerald-600 hover:underline text-sm font-medium">Be the first to write one →</button>}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(b => (
                <a key={b.id} href={`/blog/${b.slug}`}
                  className="group rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 bg-background">
                  <div className="h-48 bg-muted/50 overflow-hidden flex items-center justify-center">
                    {b.image
                      ? <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <span className="text-6xl">🏥</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex gap-1.5 flex-wrap mb-2">
                      {b.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">{t}</span>
                      ))}
                    </div>
                    <h2 className="font-bold text-base leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">{b.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{b.summary}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.author.name}</span>
                      {b.publishedAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(b.publishedAt).toLocaleDateString()}</span>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex items-center text-emerald-600 text-xs font-semibold">
                      Read article <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
