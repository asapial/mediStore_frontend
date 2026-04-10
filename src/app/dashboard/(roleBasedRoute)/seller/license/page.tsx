"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaIdCard, FaUpload, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

type LicenseStatus = "PENDING" | "VERIFIED" | "REJECTED";
interface License { id: string; licenseNumber: string; documentUrl: string; status: LicenseStatus; adminNote?: string; createdAt: string; }

const statusColors: Record<LicenseStatus, string> = {
  PENDING: "#C2703A", VERIFIED: "#2E7D32", REJECTED: "#C62828",
};

export default function SellerLicensePage() {
  const [license,    setLicense]    = useState<License | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [licenseNum, setLicenseNum] = useState("");
  const [docUrl,     setDocUrl]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLicense = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/seller-license/my", { credentials: "include" });
      const data = await res.json();
      setLicense(data.data);
      if (data.data) { setLicenseNum(data.data.licenseNumber); setDocUrl(data.data.documentUrl); }
    } catch { toast.error("Failed to load license"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLicense(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/seller-license", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNumber: licenseNum, documentUrl: docUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("License submitted for review!");
      fetchLicense();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const statusIcon = (s: LicenseStatus) =>
    s === "VERIFIED" ? <FaCheckCircle /> : s === "REJECTED" ? <FaTimesCircle /> : <FaClock />;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaIdCard className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>License Verification</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Submit your pharmacy seller license for admin verification</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Card */}
        {license && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-7 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${statusColors[license.status]} 0%, ${statusColors[license.status]}cc 100%)` }}>
            <div className="absolute -right-8 -bottom-8 text-[120px] opacity-10">
              {statusIcon(license.status)}
            </div>
            <p className="text-xs uppercase tracking-widest opacity-80 mb-2">License Status</p>
            <p className="text-4xl font-black mb-3">{license.status}</p>
            <p className="text-sm opacity-80 mb-1">License #: <strong>{license.licenseNumber}</strong></p>
            <p className="text-sm opacity-80">Submitted: {new Date(license.createdAt).toLocaleDateString()}</p>
            {license.adminNote && (
              <div className="mt-4 rounded-xl p-3 text-sm" style={{ background: "rgba(255,255,255,0.15)" }}>
                <strong>Admin Note: </strong>{license.adminNote}
              </div>
            )}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="medi-card p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaUpload style={{ color: "#C2703A" }} />
            {license ? "Update License" : "Submit License"}
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>License Number *</label>
            <input value={licenseNum} onChange={e => setLicenseNum(e.target.value)}
              placeholder="e.g., PHARM-2024-001234"
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Document URL *</label>
            <input type="url" value={docUrl} onChange={e => setDocUrl(e.target.value)}
              placeholder="https://drive.google.com/your-license.pdf"
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
          </div>
          {docUrl && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #DDD0C4" }}>
              <iframe src={docUrl} className="w-full h-40" title="License document preview" />
            </div>
          )}
          <button type="submit" disabled={submitting} className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Submitting…" : license ? "Resubmit for Review" : "Submit License"}
          </button>
          {license?.status === "VERIFIED" && (
            <p className="text-xs text-center" style={{ color: "#2E7D32" }}>
              ✓ Your license is verified. You can resubmit if it has been renewed.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
