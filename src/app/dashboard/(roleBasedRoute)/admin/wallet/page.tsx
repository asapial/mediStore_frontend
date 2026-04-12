"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaWallet, FaUser, FaPlusCircle } from "react-icons/fa";

interface Wallet {
  id: string;
  balance: number;
  userId: string;
  user: { name: string; email: string };
}

export default function AdminWalletPage() {
  const [wallets,    setWallets]    = useState<Wallet[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [userId,     setUserId]     = useState("");
  const [amount,     setAmount]     = useState("");
  const [desc,       setDesc]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search,     setSearch]     = useState("");

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/wallet", { credentials: "include" });
      const data = await res.json();
      setWallets(data.data || []);
    } catch { toast.error("Failed to load wallets"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWallets(); }, []);

  const handleCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) { toast.error("userId and amount are required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/credit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: Number(amount), description: desc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Wallet credited successfully!");
      setUserId(""); setAmount(""); setDesc("");
      fetchWallets();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const filtered     = wallets.filter(w =>
    w.user.name.toLowerCase().includes(search.toLowerCase()) ||
    w.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaWallet className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Wallet Management</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>View and credit customer wallets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="medi-card p-5">
          <p className="text-xs uppercase font-semibold mb-1" style={{ color: "#8A6650" }}>Total Wallets</p>
          <p className="text-3xl font-black" style={{ color: "#1B3A5C" }}>{wallets.length}</p>
        </div>
        <div className="medi-card p-5">
          <p className="text-xs uppercase font-semibold mb-1" style={{ color: "#8A6650" }}>Total Balance</p>
          <p className="text-3xl font-black" style={{ color: "#C2703A" }}>${totalBalance.toFixed(2)}</p>
        </div>
        <div className="medi-card p-5 lg:col-span-1 col-span-2">
          <p className="text-xs uppercase font-semibold mb-1" style={{ color: "#8A6650" }}>Avg Balance</p>
          <p className="text-3xl font-black" style={{ color: "#3A6EA5" }}>
            ${wallets.length ? (totalBalance / wallets.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Credit Form */}
        <form onSubmit={handleCredit} className="medi-card p-6 space-y-4 h-fit">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaPlusCircle style={{ color: "#C2703A" }} /> Credit a Wallet
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>User ID</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            >
              <option value="">Select user…</option>
              {wallets.map(w => (
                <option key={w.userId} value={w.userId}>{w.user.name} ({w.user.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Amount ($)</label>
            <input
              type="number" min="0.01" step="0.01"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Description</label>
            <input
              type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="e.g., Loyalty bonus"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            />
          </div>
          <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Processing…" : "Credit Wallet"}
          </button>
        </form>

        {/* Wallets Table */}
        <div className="medi-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>All Wallets</h2>
            <input
              placeholder="Search user…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033", width: 200 }}
            />
          </div>
          {loading ? (
            <p className="text-center py-12" style={{ color: "#8A6650" }}>Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #DDD0C4" }}>
                    {["User", "Email", "Balance"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-bold uppercase tracking-wide" style={{ color: "#8A6650" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => (
                    <motion.tr
                      key={w.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b"
                      style={{ borderColor: "#EEE4D9" }}
                    >
                      <td className="py-3 pr-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: "#1B3A5C" }}>
                          {w.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold" style={{ color: "#5C4033" }}>{w.user.name}</span>
                      </td>
                      <td className="py-3 pr-4" style={{ color: "#8A6650" }}>{w.user.email}</td>
                      <td className="py-3 font-bold" style={{ color: "#C2703A" }}>${w.balance.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
