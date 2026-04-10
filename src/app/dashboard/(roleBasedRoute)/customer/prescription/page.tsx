"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileMedical, FaUpload, FaCheckCircle, FaTimesCircle, FaClock,
} from "react-icons/fa";

type RxStatus = "PENDING" | "APPROVED" | "REJECTED";
interface Prescription {
  id: string;
  imageUrl: string;
  notes?: string;
  status: RxStatus;
  adminNote?: string;
  createdAt: string;
}

const statusBadge: Record<RxStatus, string> = {
  PENDING:  "badge-pending",
  APPROVED: "badge-approved",
  REJECTED: "badge-rejected",
};
const StatusIcon: Record<RxStatus, React.ReactNode> = {
  PENDING:  <FaClock className="inline mr-1" />,
  APPROVED: <FaCheckCircle className="inline mr-1" />,
  REJECTED: <FaTimesCircle className="inline mr-1" />,
};

export default function CustomerPrescriptionPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRx = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/prescriptions/my", { credentials: "include" });
      const data = await res.json();
      setPrescriptions(data.data || []);
    } catch { toast.error("Failed to load prescriptions"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRx(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) { toast.error("Please enter an image URL"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Prescription uploaded!");
      setImageUrl(""); setNotes("");
      fetchRx();
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C62828" }}>
          <FaFileMedical className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Prescriptions</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Upload and track your prescription status</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="medi-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#1B3A5C" }}>
          <FaUpload style={{ color: "#C2703A" }} /> Upload New Prescription
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#5C4033" }}>
              Prescription Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/prescription.jpg"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033", "--tw-ring-color": "#3A6EA5" } as any}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#5C4033" }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions for the pharmacist..."
              className="w-full border rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 transition"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="medi-btn-accent flex items-center gap-2 disabled:opacity-60"
          >
            <FaUpload /> {submitting ? "Uploading…" : "Upload Prescription"}
          </button>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16" style={{ color: "#8A6650" }}>Loading prescriptions…</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#8A6650" }}>
          <FaFileMedical className="mx-auto text-4xl mb-3 opacity-30" />
          <p>No prescriptions uploaded yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <AnimatePresence>
            {prescriptions.map((rx, i) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="medi-card overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={rx.imageUrl}
                    alt="Prescription"
                    className="w-full h-44 object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=Prescription"; }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={statusBadge[rx.status]}>
                      {StatusIcon[rx.status]} {rx.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs mb-1" style={{ color: "#8A6650" }}>
                    Submitted {new Date(rx.createdAt).toLocaleDateString()}
                  </p>
                  {rx.notes && <p className="text-sm mb-2" style={{ color: "#5C4033" }}>{rx.notes}</p>}
                  {rx.adminNote && (
                    <div
                      className="rounded-lg p-3 text-sm mt-2"
                      style={{ background: rx.status === "APPROVED" ? "#E8F5E9" : "#FFEBEE", color: rx.status === "APPROVED" ? "#2E7D32" : "#C62828" }}
                    >
                      <strong>Admin note: </strong>{rx.adminNote}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
