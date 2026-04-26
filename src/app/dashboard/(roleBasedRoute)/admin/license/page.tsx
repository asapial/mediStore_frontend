"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaIdCard, FaCheckCircle, FaTimesCircle, FaClock,
  FaExternalLinkAlt, FaTrash,
} from "react-icons/fa";

type LicenseStatus = "PENDING" | "VERIFIED" | "REJECTED";
interface License {
  id: string; licenseNumber: string; documentUrl: string;
  status: LicenseStatus; adminNote?: string; createdAt: string;
  seller: { id: string; name: string; email: string };
}

const tabs: LicenseStatus[] = ["PENDING", "VERIFIED", "REJECTED"];
const TAB_COLORS: Record<LicenseStatus, string> = {
  PENDING: "#C2703A", VERIFIED: "#2E7D32", REJECTED: "#C62828",
};

export default function AdminLicensePage() {
  const [licenses,  setLicenses]  = useState<License[]>([]);
  const [tab,       setTab]       = useState<LicenseStatus>("PENDING");
  const [loading,   setLoading]   = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [acting,    setActing]    = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/seller-license", { credentials: "include" });
      const data = await res.json();
      setLicenses(data.data || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const review = async (sellerId: string, status: LicenseStatus) => {
    setActing(sellerId);
    try {
      const res = await fetch(`/api/seller-license/${sellerId}/review`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`License ${status.toLowerCase()}`);
      setReviewing(null); setAdminNote("");
      fetchAll();
    } catch { toast.error("Review failed"); }
    finally { setActing(null); }
  };

  const deleteLicense = async (licenseId: string, sellerName: string) => {
    if (!confirm(`Delete license for ${sellerName}? This cannot be undone.`)) return;
    setActing(licenseId);
    try {
      const res = await fetch(`/api/seller-license/${licenseId}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("License deleted");
      setLicenses(p => p.filter(l => l.id !== licenseId));
    } catch { toast.error("Delete failed"); }
    finally { setActing(null); }
  };

  const filtered = licenses.filter(l => l.status === tab);
  const count = (s: LicenseStatus) => licenses.filter(l => l.status === s).length;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaIdCard className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Seller License Verification</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Review, approve, and manage seller pharmacy licenses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tabs.map(t => (
          <div key={t} className="medi-card p-5 text-center">
            <p className="text-3xl font-black" style={{ color: TAB_COLORS[t] }}>{count(t)}</p>
            <p className="text-xs uppercase tracking-wide font-semibold mt-1" style={{ color: "#8A6650" }}>{t}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: tab === t ? TAB_COLORS[t] : "#F5EDE3",
              color: tab === t ? "#FFF" : "#5C4033",
              border: `1px solid ${TAB_COLORS[t]}`,
            }}>
            {t} ({count(t)})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading licenses…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaIdCard className="mx-auto text-4xl mb-3 opacity-20" style={{ color: TAB_COLORS[tab] }} />
          <p style={{ color: "#8A6650" }}>No {tab.toLowerCase()} licenses.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((lic, i) => (
              <motion.div key={lic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="medi-card p-5">
                {/* Seller info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "#1B3A5C" }}>
                    {lic.seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "#1B3A5C" }}>{lic.seller.name}</p>
                    <p className="text-xs truncate" style={{ color: "#8A6650" }}>{lic.seller.email}</p>
                  </div>
                  <span className={`badge-${lic.status.toLowerCase()}`}>{lic.status}</span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span style={{ color: "#8A6650" }}>License #</span>
                    <span className="font-mono font-bold" style={{ color: "#1B3A5C" }}>{lic.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#8A6650" }}>Submitted</span>
                    <span style={{ color: "#5C4033" }}>{new Date(lic.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <a
                  href={`/api/seller-license/document?sellerId=${lic.seller.id}&t=${Date.now()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs mb-4 font-semibold"
                  style={{ color: "#3A6EA5" }}
                >
                  <FaExternalLinkAlt /> View Document
                </a>

                {lic.adminNote && (
                  <div className="rounded-lg p-3 text-xs mb-4"
                    style={{ background: lic.status === "VERIFIED" ? "#E8F5E9" : "#FFEBEE", color: lic.status === "VERIFIED" ? "#2E7D32" : "#C62828" }}>
                    {lic.adminNote}
                  </div>
                )}

                {/* PENDING: review actions */}
                {lic.status === "PENDING" && (
                  reviewing === lic.seller.id ? (
                    <div className="space-y-2">
                      <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                        placeholder="Note (optional)" className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                        style={{ borderColor: "#DDD0C4", background: "#FFF" }} />
                      <div className="flex gap-2">
                        <button disabled={!!acting} onClick={() => review(lic.seller.id, "VERIFIED")}
                          className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                          style={{ background: "#2E7D32", color: "#FFF" }}>
                          <FaCheckCircle className="inline mr-1" /> Verify
                        </button>
                        <button disabled={!!acting} onClick={() => review(lic.seller.id, "REJECTED")}
                          className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                          style={{ background: "#C62828", color: "#FFF" }}>
                          <FaTimesCircle className="inline mr-1" /> Reject
                        </button>
                      </div>
                      <button onClick={() => { setReviewing(null); setAdminNote(""); }}
                        className="text-xs w-full text-center" style={{ color: "#8A6650" }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setReviewing(lic.seller.id)}
                      className="medi-btn-primary w-full text-sm flex items-center justify-center gap-1">
                      <FaClock /> Review License
                    </button>
                  )
                )}

                {/* VERIFIED / REJECTED: re-review + delete */}
                {(lic.status === "VERIFIED" || lic.status === "REJECTED") && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setReviewing(lic.seller.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#F5EDE3", color: "#5C4033", border: "1px solid #DDD0C4" }}>
                      Re-review
                    </button>
                    <button onClick={() => deleteLicense(lic.id, lic.seller.name)}
                      disabled={acting === lic.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                      style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #C62828" }}>
                      <FaTrash />
                    </button>
                  </div>
                )}

                {/* Re-review panel for VERIFIED/REJECTED */}
                {reviewing === lic.seller.id && lic.status !== "PENDING" && (
                  <div className="space-y-2 mt-3">
                    <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                      placeholder="Update note (optional)" className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                      style={{ borderColor: "#DDD0C4", background: "#FFF" }} />
                    <div className="flex gap-2">
                      <button disabled={!!acting} onClick={() => review(lic.seller.id, "VERIFIED")}
                        className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                        style={{ background: "#2E7D32", color: "#FFF" }}>Verify</button>
                      <button disabled={!!acting} onClick={() => review(lic.seller.id, "REJECTED")}
                        className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                        style={{ background: "#C62828", color: "#FFF" }}>Reject</button>
                    </div>
                    <button onClick={() => { setReviewing(null); setAdminNote(""); }}
                      className="text-xs w-full text-center" style={{ color: "#8A6650" }}>Cancel</button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
