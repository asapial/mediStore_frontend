"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaUser, FaCamera, FaEdit, FaStar, FaSave, FaUniversity } from "react-icons/fa";

interface SellerProfile {
  id: string; name: string; email: string; image?: string;
  medicines: { id: string }[];
  reviews?: { rating: number }[];
}

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", image: "" });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const u = d?.data || d?.user || d;
        if (u?.id) {
          setProfile(u);
          setForm({ name: u.name || "", image: u.image || "" });
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: form.name, image: form.image || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Profile updated successfully");
      setProfile(p => p ? { ...p, name: form.name, image: form.image } : p);
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="medi-page space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#EEE4D9" }} />)}
    </div>
  );

  if (!profile) return (
    <div className="medi-page text-center py-20" style={{ color: "#C62828" }}>Failed to load profile.</div>
  );

  const avgRating = profile.reviews?.length
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : "No reviews";

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaUser className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Seller Profile</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Manage your storefront and account settings</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="medi-card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4"
                style={{ borderColor: "#1B3A5C" }}>
                {profile.image
                  ? <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl"
                      style={{ background: "#EEE4D9" }}>
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                }
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#1B3A5C" }}>{profile.name}</h2>
            <p className="text-sm mb-3" style={{ color: "#8A6650" }}>{profile.email}</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              <FaStar style={{ color: "#C2703A" }} />
              <span className="font-semibold text-sm" style={{ color: "#C2703A" }}>{avgRating}</span>
              {profile.reviews?.length ? (
                <span className="text-xs" style={{ color: "#8A6650" }}>({profile.reviews.length} reviews)</span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl" style={{ background: "#F5EDE3" }}>
                <p className="text-2xl font-black" style={{ color: "#1B3A5C" }}>{profile.medicines?.length || 0}</p>
                <p className="text-xs" style={{ color: "#8A6650" }}>Listings</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#F5EDE3" }}>
                <p className="text-2xl font-black" style={{ color: "#C2703A" }}>{profile.reviews?.length || 0}</p>
                <p className="text-xs" style={{ color: "#8A6650" }}>Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-5">
          <motion.div className="medi-card p-6" layout>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Storefront Settings</h3>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
                  style={{ background: "#EEE4D9", color: "#1B3A5C" }}>
                  <FaEdit /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1B3A5C" }}>
                    Display Name
                  </label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1B3A5C" }}>
                    Profile Image URL
                  </label>
                  <div className="relative">
                    <FaCamera className="absolute left-3 top-3" style={{ color: "#8A6650" }} />
                    <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      placeholder="https://..."
                      className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
                      style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#8A6650" }}>
                    Paste a Cloudinary or external image URL
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition"
                    style={{ background: "#1B3A5C", color: "#FFF" }}>
                    {saving
                      ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      : <FaSave />
                    }
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition"
                    style={{ background: "#EEE4D9", color: "#5C4033" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-sm">
                {[
                  { label: "Display Name", value: profile.name },
                  { label: "Email Address", value: profile.email },
                  { label: "Profile Image", value: profile.image || "Not set" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-3 border-b" style={{ borderColor: "#F5EDE3" }}>
                    <span style={{ color: "#8A6650" }}>{r.label}</span>
                    <span className="font-semibold max-w-xs truncate text-right" style={{ color: "#1B3A5C" }}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Bank Account Info */}
          <div className="medi-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaUniversity style={{ color: "#C2703A" }} />
              <h3 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Payout Information</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "#8A6650" }}>
              Bank account details are submitted with each withdrawal request. To update them, use the
              withdrawal request form.
            </p>
            <button onClick={() => window.location.href = "/dashboard/seller/wallet/withdraw"}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition"
              style={{ background: "#C2703A20", color: "#C2703A" }}>
              <FaUniversity /> Request Withdrawal / Update Bank Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
