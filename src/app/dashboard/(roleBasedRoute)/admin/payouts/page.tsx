"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaCheck, FaTimes, FaFilter, FaSpinner, FaDownload } from "react-icons/fa";

interface WithdrawalRequest {
  id: string; amount: number; status: "PENDING" | "APPROVED" | "REJECTED";
  bankName: string; accountNumber: string; branchName?: string;
  adminNote?: string; processedAt?: string; createdAt: string;
  seller: { id: string; name: string; email: string; wallet?: { balance: number } };
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: "#FFF8E1", color: "#C2703A" },
  APPROVED: { bg: "#E8F5E9", color: "#2E7D32" },
  REJECTED: { bg: "#FFEBEE", color: "#C62828" },
};

export default function AdminPayoutsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processing, setProcessing] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== "ALL" ? `/api/wallet/admin/withdrawals?status=${statusFilter}` : "/api/wallet/admin/withdrawals";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setRequests(data.data || []);
    } catch { toast.error("Failed to load withdrawal requests"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const processRequest = async () => {
    if (!noteModal) return;
    setProcessing(noteModal.id);
    try {
      const res = await fetch(`/api/wallet/admin/withdrawals/${noteModal.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: noteModal.action, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Request ${noteModal.action.toLowerCase()} successfully`);
      setNoteModal(null); setAdminNote(""); fetchRequests();
    } catch (err: any) { toast.error(err.message); }
    finally { setProcessing(null); }
  };

  const exportCSV = () => {
    const rows = [
      ["Seller", "Email", "Amount", "Bank", "Account", "Status", "Date", "Admin Note"],
      ...requests.map(r => [r.seller.name, r.seller.email, r.amount, r.bankName, r.accountNumber, r.status, new Date(r.createdAt).toLocaleDateString(), r.adminNote || ""])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payouts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const pending  = requests.filter(r => r.status === "PENDING").length;
  const approved = requests.filter(r => r.status === "APPROVED").length;
  const totalAmt = requests.filter(r => r.status === "APPROVED").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="medi-page">
      {/* Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="medi-card p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-lg mb-3" style={{ color: "#1B3A5C" }}>
              {noteModal.action === "APPROVED" ? "✅ Approve" : "❌ Reject"} Withdrawal
            </h3>
            <p className="text-sm mb-4" style={{ color: "#8A6650" }}>
              {noteModal.action === "APPROVED"
                ? "Amount will be deducted from seller wallet and marked as processed."
                : "The seller's balance will be preserved. Please provide a reason."}
            </p>
            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
              placeholder={noteModal.action === "REJECTED" ? "Rejection reason (required)…" : "Optional note for seller…"}
              rows={3} className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none mb-4"
              style={{ borderColor: "#DDD0C4" }} />
            <div className="flex gap-3">
              <button onClick={processRequest} disabled={!!processing || (noteModal.action === "REJECTED" && !adminNote.trim())}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{ background: noteModal.action === "APPROVED" ? "#2E7D32" : "#C62828", color: "#FFF" }}>
                {processing ? <FaSpinner className="animate-spin" /> : noteModal.action === "APPROVED" ? <FaCheck /> : <FaTimes />}
                Confirm {noteModal.action === "APPROVED" ? "Approval" : "Rejection"}
              </button>
              <button onClick={() => { setNoteModal(null); setAdminNote(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#EEE4D9", color: "#5C4033" }}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaMoneyBillWave className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Payout Management</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Review and process seller withdrawal requests</p>
          </div>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "#1B3A5C20", color: "#1B3A5C" }}>
          <FaDownload /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Pending Review",   value: pending,              color: "#C2703A" },
          { label: "Approved",         value: approved,             color: "#2E7D32" },
          { label: "Total Paid Out",   value: `$${totalAmt.toFixed(0)}`, color: "#1B3A5C" },
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <FaFilter style={{ color: "#8A6650", marginTop: 8 }} />
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition"
            style={{ background: statusFilter === s ? "#1B3A5C" : "#EEE4D9", color: statusFilter === s ? "#FFF" : "#5C4033" }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#1B3A5C" }} /></div>
      ) : requests.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaMoneyBillWave className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No withdrawal requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, i) => {
            const s = STATUS_STYLE[req.status];
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="medi-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-black" style={{ color: "#1B3A5C" }}>${req.amount.toFixed(2)}</span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: s.bg, color: s.color }}>{req.status}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <div><span style={{ color: "#8A6650" }}>Seller: </span><strong style={{ color: "#1B3A5C" }}>{req.seller.name}</strong></div>
                      <div><span style={{ color: "#8A6650" }}>Email: </span><span style={{ color: "#5C4033" }}>{req.seller.email}</span></div>
                      <div><span style={{ color: "#8A6650" }}>Bank: </span><span style={{ color: "#5C4033" }}>{req.bankName}</span></div>
                      <div><span style={{ color: "#8A6650" }}>Account: </span><span className="font-mono text-xs" style={{ color: "#5C4033" }}>{req.accountNumber}</span></div>
                      {req.branchName && <div><span style={{ color: "#8A6650" }}>Branch: </span><span style={{ color: "#5C4033" }}>{req.branchName}</span></div>}
                      <div><span style={{ color: "#8A6650" }}>Requested: </span><span style={{ color: "#5C4033" }}>{new Date(req.createdAt).toLocaleDateString()}</span></div>
                    </div>
                    {req.adminNote && (
                      <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: "#F5EDE3", color: "#5C4033" }}>
                        Admin note: {req.adminNote}
                      </p>
                    )}
                  </div>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setNoteModal({ id: req.id, action: "APPROVED" })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                        style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                        <FaCheck /> Approve
                      </button>
                      <button onClick={() => setNoteModal({ id: req.id, action: "REJECTED" })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                        style={{ background: "#FFEBEE", color: "#C62828" }}>
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
