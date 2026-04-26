"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaWallet, FaArrowUp, FaArrowDown, FaClock, FaPlus, FaHistory,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSync,
} from "react-icons/fa";

interface Transaction {
  id: string; amount: number; type: string;
  description?: string; createdAt: string;
}
interface WithdrawalRequest {
  id: string; amount: number; status: "PENDING" | "APPROVED" | "REJECTED";
  bankName: string; accountNumber: string; adminNote?: string; createdAt: string;
}
interface SellerWallet {
  id: string; balance: number; totalEarned: number;
  totalWithdrawn: number; pendingAmount: number;
  transactions: Transaction[];
}

const TXN_ICONS: Record<string, React.ReactNode> = {
  DEPOSIT:    <FaArrowDown  style={{ color: "#2E7D32" }} />,
  WITHDRAWAL: <FaArrowUp    style={{ color: "#C62828" }} />,
  PURCHASE:   <FaArrowUp    style={{ color: "#C2703A" }} />,
  REFUND:     <FaArrowDown  style={{ color: "#3A6EA5" }} />,
};
const TXN_COLORS: Record<string, string> = {
  DEPOSIT: "#2E7D32", WITHDRAWAL: "#C62828", PURCHASE: "#C2703A", REFUND: "#3A6EA5",
};
const STATUS_STYLE: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { bg: "#FFF8E1", color: "#C2703A", icon: <FaClock /> },
  APPROVED: { bg: "#E8F5E9", color: "#2E7D32", icon: <FaCheckCircle /> },
  REJECTED: { bg: "#FFEBEE", color: "#C62828", icon: <FaTimesCircle /> },
};

type Tab = "transactions" | "withdrawals";

export default function SellerWalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("transactions");
  const [txnFilter, setTxnFilter] = useState("ALL");

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [wRes, wdRes] = await Promise.all([
        fetch("/api/wallet/seller/my", { credentials: "include" }),
        fetch("/api/wallet/seller/withdrawals", { credentials: "include" }),
      ]);
      const [wData, wdData] = await Promise.all([wRes.json(), wdRes.json()]);
      if (wData.success)  setWallet(wData.data);
      if (wdData.success) setWithdrawals(wdData.data || []);
    } catch { toast.error("Failed to load wallet"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  // Auto-refresh when window regains focus (e.g. seller switches back from dispatch page)
  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchData(true);
    });
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filteredTxns = wallet?.transactions.filter(t =>
    txnFilter === "ALL" || t.type === txnFilter
  ) || [];

  if (loading) return (
    <div className="medi-page space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#EEE4D9" }} />)}
    </div>
  );

  if (!wallet) return (
    <div className="medi-page text-center py-20" style={{ color: "#C62828" }}>
      Failed to load wallet data.
    </div>
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaWallet className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Seller Wallet</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Your earnings, withdrawals and transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: "#F5EDE3", color: "#5C4033", border: "1px solid #DDD0C4" }}>
            <FaSync className={refreshing ? "animate-spin" : ""} style={{ fontSize: 12 }} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button onClick={() => router.push("/dashboard/seller/wallet/withdraw")}
            className="medi-btn-accent flex items-center gap-2">
            <FaPlus /> Request Withdrawal
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Available Balance", value: `৳${wallet.balance.toFixed(2)}`, color: "#1B3A5C", big: true },
          { label: "Total Earned",      value: `৳${wallet.totalEarned.toFixed(2)}`, color: "#2E7D32" },
          { label: "Total Withdrawn",   value: `৳${wallet.totalWithdrawn.toFixed(2)}`, color: "#C62828" },
          { label: "Pending Requests",  value: `৳${wallet.pendingAmount.toFixed(2)}`, color: "#C2703A" },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="medi-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8A6650" }}>{c.label}</p>
            <p className={c.big ? "text-3xl font-black" : "text-xl font-bold"} style={{ color: c.color }}>{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["transactions", "withdrawals"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === t ? "#1B3A5C" : "#F5EDE3",
              color: tab === t ? "#FFF" : "#5C4033",
            }}>
            {t === "transactions" ? "Transaction History" : "Withdrawal Requests"}
          </button>
        ))}
      </div>

      {/* Transaction Tab */}
      <AnimatePresence mode="wait">
        {tab === "transactions" && (
          <motion.div key="txn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["ALL", "DEPOSIT", "WITHDRAWAL", "PURCHASE", "REFUND"].map(f => (
                <button key={f} onClick={() => setTxnFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: txnFilter === f ? "#1B3A5C" : "#EEE4D9",
                    color: txnFilter === f ? "#FFF" : "#5C4033",
                  }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="medi-card overflow-hidden">
              {filteredTxns.length === 0 ? (
                <div className="text-center py-16">
                  <FaHistory className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
                  <p style={{ color: "#8A6650" }}>No transactions found</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "#F5EDE3" }}>
                  {filteredTxns.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 hover:bg-[#FAFAF8] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                          style={{ background: `${TXN_COLORS[t.type]}15` }}>
                          {TXN_ICONS[t.type] || <FaArrowDown />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>
                            {t.description || t.type.charAt(0) + t.type.slice(1).toLowerCase()}
                          </p>
                          <p className="text-xs" style={{ color: "#8A6650" }}>
                            {new Date(t.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm"
                        style={{ color: TXN_COLORS[t.type] || "#1B3A5C" }}>
                        {t.type === "DEPOSIT" || t.type === "REFUND" ? "+" : "-"}৳{t.amount.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Withdrawals Tab */}
        {tab === "withdrawals" && (
          <motion.div key="wd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {withdrawals.length === 0 ? (
              <div className="medi-card text-center py-16">
                <FaWallet className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
                <p style={{ color: "#8A6650" }}>No withdrawal requests yet</p>
                <button onClick={() => router.push("/dashboard/seller/wallet/withdraw")}
                  className="medi-btn-accent mt-4">Make First Request</button>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((wd, i) => {
                  const s = STATUS_STYLE[wd.status] || STATUS_STYLE.PENDING;
                  return (
                    <motion.div key={wd.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }} className="medi-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-black" style={{ color: "#1B3A5C" }}>
                              ৳{wd.amount.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
                              style={{ background: s.bg, color: s.color }}>
                              {s.icon} {wd.status}
                            </span>
                          </div>
                          <div className="text-sm space-y-1" style={{ color: "#5C4033" }}>
                            <p>Bank: <strong>{wd.bankName}</strong></p>
                            <p>Account: <strong className="font-mono">{wd.accountNumber}</strong></p>
                            <p className="text-xs" style={{ color: "#8A6650" }}>
                              Requested: {new Date(wd.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {wd.adminNote && (
                          <div className="text-xs p-3 rounded-lg max-w-xs" style={{ background: "#FFF8F0", color: "#5C4033", border: "1px solid #DDD0C4" }}>
                            <p className="font-semibold mb-1" style={{ color: "#8A6650" }}>Admin Note:</p>
                            {wd.adminNote}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
