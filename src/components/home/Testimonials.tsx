"use client";

import { useEffect, useState } from "react";
import { Star, User, Send, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Testimonial {
  id: string; content: string; rating: number;
  user: { id: string; name: string; image?: string };
  createdAt: string;
}

interface SessionUser { id: string; name: string; }

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange?.(s)}>
          <Star className={`w-5 h-5 transition-colors ${s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} ${onChange ? "cursor-pointer hover:text-amber-400" : "cursor-default"}`} />
        </button>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [user,         setUser]         = useState<SessionUser | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [content,      setContent]      = useState("");
  const [rating,       setRating]       = useState(5);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  useEffect(() => {
    fetch("/api/testimonials?approved=true&limit=6")
      .then(r => r.json())
      .then(d => setTestimonials(d.data || []))
      .finally(() => setLoading(false));
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d?.user ?? null))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { toast.error("Please write something"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, rating }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed");
      setSubmitted(true);
      setShowForm(false);
      toast.success("Thank you! Your review is pending approval.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="py-10 sm:py-12 bg-muted/20 dark:bg-muted/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">What Customers Say</h2>
            <p className="text-sm text-muted-foreground mt-1">Real reviews from our community</p>
          </div>
          {user && !submitted && (
            <Button onClick={() => setShowForm(!showForm)} size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {showForm ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Star className="w-4 h-4 mr-1" /> Write a Review</>}
            </Button>
          )}
          {submitted && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
              <CheckCircle className="w-4 h-4" /> Review submitted — pending approval
            </span>
          )}
          {!user && (
            <a href="/login" className="text-sm text-emerald-600 hover:underline font-medium">Sign in to leave a review →</a>
          )}
        </div>

        {/* Submission form */}
        {showForm && (
          <form onSubmit={handleSubmit}
            className="mb-8 p-6 rounded-2xl border border-border bg-background shadow-sm">
            <h3 className="font-bold mb-4">Your Review</h3>
            <div className="mb-3">
              <label className="text-sm font-medium mb-1 block">Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
              placeholder="Share your experience with our pharmacy…"
              className="w-full border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-background" />
            <div className="flex justify-end mt-3">
              <Button type="submit" disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Send className="w-4 h-4 mr-1" />
                {submitting ? "Submitting…" : "Submit Review"}
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-5 space-y-3 bg-background">
                <div className="flex gap-2"><div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div><div className="flex-1 space-y-1"><div className="h-3 bg-muted rounded animate-pulse w-1/2"></div><div className="h-2.5 bg-muted rounded animate-pulse w-1/3"></div></div></div>
                <div className="h-3 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-4/5"></div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No reviews yet. Be the first!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map(t => (
              <div key={t.id} className="bg-background border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                    {t.user.image
                      ? <img src={t.user.image} alt={t.user.name} className="w-full h-full object-cover" />
                      : <span className="font-bold text-muted-foreground">{t.user.name.charAt(0)}</span>}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.user.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <StarRating value={t.rating} />
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-4">"{t.content}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}