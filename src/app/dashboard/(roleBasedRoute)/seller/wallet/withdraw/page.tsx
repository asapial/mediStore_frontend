"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUniversity, FaPaperPlane, FaArrowLeft, FaLock, FaInfoCircle } from "react-icons/fa";

export default function SellerWithdrawPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    branchName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount < 10) {
      toast.error("Minimum withdrawal amount is $10");
      return;
    }
    if (!form.bankName || !form.accountNumber) {
      toast.error("Bank name and account number are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/seller/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          branchName: form.branchName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      toast.success("Withdrawal request submitted! Pending admin approval.");
      router.push("/dashboard/seller/wallet");
    } catch (err: any) {
      toast.error(err.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/seller/wallet")}
          className="p-2 rounded-xl transition" style={{ background: "#EEE4D9", color: "#5C4033" }}>
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaUniversity className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>New Withdrawal Request</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Transfer your earnings to your bank account</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ background: "#E3F0FB", border: "1px solid #3A6EA5" }}>
          <FaInfoCircle style={{ color: "#3A6EA5", flexShrink: 0, marginTop: 2 }} />
          <div className="text-sm" style={{ color: "#1B3A5C" }}>
            <p className="font-semibold mb-1">Withdrawal Policy</p>
            <ul className="space-y-0.5 text-xs list-disc pl-4" style={{ color: "#3A6EA5" }}>
              <li>Minimum withdrawal: <strong>$10.00</strong></li>
              <li>Requests are reviewed and approved by admin within 1–3 business days</li>
              <li>Amount is deducted from your wallet only upon approval</li>
              <li>Make sure your bank details are accurate — errors may delay processing</li>
            </ul>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="medi-card p-6 space-y-5">

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1B3A5C" }}>
              Withdrawal Amount (USD) <span style={{ color: "#C62828" }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold" style={{ color: "#8A6650" }}>$</span>
              <input name="amount" type="number" min="10" step="0.01" value={form.amount}
                onChange={handleChange} placeholder="0.00" required
                className="w-full border rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
            </div>
            <p className="text-xs mt-1" style={{ color: "#8A6650" }}>Minimum: $10.00</p>
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1B3A5C" }}>
              Bank Name <span style={{ color: "#C62828" }}>*</span>
            </label>
            <input name="bankName" type="text" value={form.bankName}
              onChange={handleChange} placeholder="e.g. Dutch-Bangla Bank" required
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1B3A5C" }}>
              Account Number <span style={{ color: "#C62828" }}>*</span>
            </label>
            <input name="accountNumber" type="text" value={form.accountNumber}
              onChange={handleChange} placeholder="Your bank account number" required
              className="w-full border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none"
              style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
          </div>

          {/* Branch (optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1B3A5C" }}>
              Branch Name <span className="font-normal" style={{ color: "#8A6650" }}>(optional)</span>
            </label>
            <input name="branchName" type="text" value={form.branchName}
              onChange={handleChange} placeholder="e.g. Dhanmondi Branch"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ background: "#1B3A5C", color: "#FFF" }}>
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <><FaPaperPlane /> Submit Withdrawal Request</>
              )}
            </button>
            <div className="flex items-center justify-center gap-1 mt-3 text-xs" style={{ color: "#8A6650" }}>
              <FaLock /> Request is encrypted and secure
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
