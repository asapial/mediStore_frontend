"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaWallet, FaArrowUp, FaArrowDown, FaPlusCircle } from "react-icons/fa";

type TxType = "DEPOSIT" | "WITHDRAWAL" | "PURCHASE" | "REFUND";
interface Tx { id: string; amount: number; type: TxType; description?: string; createdAt: string; }
interface WalletData { balance: number; transactions: Tx[]; }

const txColor: Record<TxType, string> = {
  DEPOSIT:    "#2E7D32",
  REFUND:     "#2E7D32",
  WITHDRAWAL: "#C62828",
  PURCHASE:   "#C62828",
};
const txSign: Record<TxType, string> = {
  DEPOSIT: "+", REFUND: "+", WITHDRAWAL: "-", PURCHASE: "-",
};

export default function CustomerWalletPage() {
  const [wallet,     setWallet]     = useState<WalletData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [amount,     setAmount]     = useState("");
  const [desc,       setDesc]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/wallet/my", { credentials: "include" });
      const data = await res.json();
      setWallet(data.data);
    } catch { toast.error("Failed to load wallet"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description: desc || "Manual top-up" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`$${Number(amount).toFixed(2)} added to wallet!`);
      setAmount(""); setDesc("");
      fetchWallet();
    } catch (err: any) { toast.error(err.message || "Top-up failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaWallet className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Wallet</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Manage your store credit balance</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-7 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #243F63 60%, #3A6EA5 100%)" }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10" style={{ background: "#C2703A" }} />
            <p className="text-sm uppercase tracking-widest opacity-80 mb-1">Available Balance</p>
            <p className="text-4xl font-bold mb-6">
              {loading ? "—" : `$${(wallet?.balance ?? 0).toFixed(2)}`}
            </p>
            <FaWallet className="opacity-20 text-5xl absolute bottom-5 right-6" />
          </motion.div>

          {/* Top-up form */}
          <form onSubmit={handleTopUp} className="medi-card p-5 mt-5 space-y-4">
            <h3 className="font-bold" style={{ color: "#1B3A5C" }}>
              <FaPlusCircle className="inline mr-1" style={{ color: "#C2703A" }} /> Add Credit
            </h3>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount ($)"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
              required
            />
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            />
            <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
              {submitting ? "Processing…" : "Top Up Wallet"}
            </button>
          </form>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 medi-card p-6">
          <h2 className="font-bold text-lg mb-5" style={{ color: "#1B3A5C" }}>Transaction History</h2>
          {loading ? (
            <p className="text-center py-10" style={{ color: "#8A6650" }}>Loading…</p>
          ) : !wallet?.transactions?.length ? (
            <p className="text-center py-10" style={{ color: "#8A6650" }}>No transactions yet.</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              <AnimatePresence>
                {wallet.transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "#F5EDE3" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: txColor[tx.type] + "22" }}
                      >
                        {["DEPOSIT","REFUND"].includes(tx.type)
                          ? <FaArrowDown style={{ color: txColor[tx.type] }} />
                          : <FaArrowUp   style={{ color: txColor[tx.type] }} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#5C4033" }}>{tx.type}</p>
                        <p className="text-xs" style={{ color: "#8A6650" }}>{tx.description ?? "—"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: txColor[tx.type] }}>
                        {txSign[tx.type]}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs" style={{ color: "#8A6650" }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
