"use client";
import { useState, useEffect, useRef } from "react";
import {
  Search, Clock, User, ArrowRight, PenSquare, X, Send, CheckCircle,
  Tag, Image as ImageIcon, FileText, AlignLeft, Upload, Loader2, Edit3, Lock,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────── Types ──────────────────────────────── */
interface Blog {
  id: string; title: string; summary: string; slug: string; image?: string;
  tags: string[]; isPublished?: boolean; isFeatured?: boolean;
  publishedAt?: string; content?: string;
  author: { id: string; name: string; image?: string };
}
interface SessionUser { id: string; name: string; email: string; role: string; }

/* ─────────────────────────────── Style helpers ──────────────────────────────── */
const FIELD_STYLE = { borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" };
const LABEL_CLS   = "block text-xs font-semibold mb-1 text-gray-600";
const INPUT_CLS   = "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
const IMGBB_KEY   = "e91ee091af74018e8539c64488ba645e";

/* ─────────────────────────────── imgbb upload ───────────────────────────────── */
async function uploadToImgbb(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.data.url as string;
}

/* ─────────────────── Reusable image upload field ───────────────────────────── */
function ImageUploadField({
  value, onChange, label = "Cover Image (optional)",
}: {
  value: string; onChange: (url: string) => void; label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToImgbb(file);
      onChange(url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed. Try a URL instead.");
    } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div>
      <label className={LABEL_CLS}><ImageIcon className="inline w-3.5 h-3.5 mr-1" />{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg  or upload ↑"
          className={INPUT_CLS} style={FIELD_STYLE}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition disabled:opacity-60"
          title="Upload image to imgbb"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <div className="mt-2 rounded-xl overflow-hidden h-36 bg-muted relative">
          <img src={value} alt="preview" className="w-full h-full object-cover"
            onError={e => (e.currentTarget.style.display = "none")} />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════ MAIN PAGE ════════════════════════════════════ */
export default function BlogPage() {
  const [blogs,     setBlogs]     = useState<Blog[]>([]);
  const [myBlogs,   setMyBlogs]   = useState<Blog[]>([]);
  const [user,      setUser]      = useState<SessionUser | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  /* ─── edit state ─── */
  const [editBlog, setEditBlog]   = useState<Blog | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  /* ─── write form ─── */
  const [form, setForm] = useState({ title: "", summary: "", content: "", image: "", tags: "" });
  /* ─── edit form ─── */
  const [editForm, setEditForm] = useState({ title: "", summary: "", content: "", image: "", tags: "" });

  /* ─── loaders ─── */
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

  /* ─── open edit modal ─── */
  const openEdit = (b: Blog) => {
    setEditBlog(b);
    setEditForm({
      title:   b.title,
      summary: b.summary,
      content: b.content || "",
      image:   b.image   || "",
      tags:    b.tags.join(", "),
    });
  };

  /* ─── submit new article ─── */
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

  /* ─── save edit ─── */
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBlog) return;
    if (!editForm.title.trim() || !editForm.summary.trim() || !editForm.content.trim()) {
      toast.error("Title, summary and content are required"); return;
    }
    setEditSaving(true);
    try {
      const tags = editForm.tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch(`/api/blogs/${editBlog.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:   editForm.title.trim(),
          summary: editForm.summary.trim(),
          content: editForm.content.trim(),
          image:   editForm.image || null,
          tags,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success(d.message || "Article updated — pending admin review");
      setEditBlog(null);
      loadMyBlogs();
    } catch (e: any) { toast.error(e.message); }
    finally { setEditSaving(false); }
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.summary.toLowerCase().includes(search.toLowerCase()) ||
    b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 py-16 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-3">Health &amp; Wellness</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">Health Blog</h1>
          <p className="text-emerald-100 text-base mb-8">Expert health tips, medical news, and wellness guides from our community</p>
          <div className="flex items-center max-w-lg mx-auto bg-white/20 border border-white/30 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-white/60">
            <Search className="w-4 h-4 text-white/70 ml-4 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, topics, tags…"
              className="flex-1 px-3 py-3 text-sm focus:outline-none bg-transparent text-white placeholder:text-white/60" />
          </div>
          {user ? (
            <button onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors">
              <PenSquare className="w-4 h-4" />
              {showForm ? "Cancel" : "Write an Article"}
            </button>
          ) : (
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

        {/* ── Write Article Form ─────────────────────────────────────────────── */}
        {showForm && user && (
          <div className="mb-10 border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <PenSquare className="w-5 h-5" /> Write a Health Article
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="bg-background p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}><FileText className="inline w-3.5 h-3.5 mr-1" />Article Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. 10 Tips for a Healthier Immune System"
                    className={INPUT_CLS} style={FIELD_STYLE} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}><AlignLeft className="inline w-3.5 h-3.5 mr-1" />Summary *</label>
                  <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                    placeholder="A brief summary of the article (2-3 sentences)…"
                    rows={2} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}><Send className="inline w-3.5 h-3.5 mr-1" />Full Content *</label>
                  <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write your full article here…"
                    rows={10} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} required />
                </div>
                {/* imgbb image upload */}
                <div className="sm:col-span-2">
                  <ImageUploadField value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
                </div>
                <div>
                  <label className={LABEL_CLS}><Tag className="inline w-3.5 h-3.5 mr-1" />Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. vitamins, immunity, nutrition"
                    className={INPUT_CLS} style={FIELD_STYLE} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
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

        {/* ── Edit Article Modal ─────────────────────────────────────────────── */}
        {editBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Modal header */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Edit3 className="w-5 h-5" /> Edit Article
                </div>
                <button onClick={() => setEditBlog(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Admin notice */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-start gap-2 text-xs text-amber-800 flex-shrink-0">
                <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>After saving, this article will be set back to <strong>Pending Review</strong>. An admin must re-publish and re-feature it.</span>
              </div>

              <form onSubmit={handleEditSave} className="overflow-y-auto p-6 space-y-5 flex-1">
                <div className="space-y-4">
                  <div>
                    <label className={LABEL_CLS}><FileText className="inline w-3.5 h-3.5 mr-1" />Article Title *</label>
                    <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                      className={INPUT_CLS} style={FIELD_STYLE} required />
                  </div>
                  <div>
                    <label className={LABEL_CLS}><AlignLeft className="inline w-3.5 h-3.5 mr-1" />Summary *</label>
                    <textarea value={editForm.summary} onChange={e => setEditForm(p => ({ ...p, summary: e.target.value }))}
                      rows={3} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} required />
                  </div>
                  <div>
                    <label className={LABEL_CLS}><Send className="inline w-3.5 h-3.5 mr-1" />Full Content *</label>
                    <textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                      rows={12} className={`${INPUT_CLS} resize-none`} style={FIELD_STYLE} required />
                  </div>
                  {/* imgbb upload in edit form */}
                  <ImageUploadField
                    value={editForm.image}
                    onChange={url => setEditForm(p => ({ ...p, image: url }))}
                    label="Cover Image (optional — upload or paste URL)"
                  />
                  <div>
                    <label className={LABEL_CLS}><Tag className="inline w-3.5 h-3.5 mr-1" />Tags (comma-separated)</label>
                    <input value={editForm.tags} onChange={e => setEditForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="e.g. vitamins, immunity"
                      className={INPUT_CLS} style={FIELD_STYLE} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={editSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-60 transition-colors">
                    {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                    {editSaving ? "Saving…" : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditBlog(null)}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
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

        {/* ── My Articles tab ───────────────────────────────────────────────── */}
        {activeTab === "mine" && user && (
          <div className="mb-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {myBlogs.map(b => (
                <div key={b.id} className="rounded-2xl border border-border overflow-hidden bg-background group hover:shadow-md transition-all">
                  <div className="h-36 bg-muted/50 flex items-center justify-center overflow-hidden relative">
                    {b.image
                      ? <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      : <span className="text-5xl">✍️</span>}
                    {/* Edit button overlay */}
                    <button
                      onClick={() => openEdit(b)}
                      className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold"
                      title="Edit article"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {b.isPublished ? "✅ Published" : "⏳ Pending Review"}
                      </span>
                      {b.isFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">⭐ Featured</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.summary}</p>
                    <button
                      onClick={() => openEdit(b)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Edit this article
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── All articles ──────────────────────────────────────────────────── */}
        {activeTab === "all" && (
          loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
