"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaIdCard, FaUpload, FaCheckCircle, FaTimesCircle,
  FaClock, FaFilePdf, FaImage, FaLink, FaSpinner,
} from "react-icons/fa";

type LicenseStatus = "PENDING" | "VERIFIED" | "REJECTED";
interface License {
  id: string; licenseNumber: string; documentUrl: string;
  status: LicenseStatus; adminNote?: string; createdAt: string;
}

const STATUS_COLORS: Record<LicenseStatus, string> = {
  PENDING: "#C2703A", VERIFIED: "#2E7D32", REJECTED: "#C62828",
};
const STATUS_BG: Record<LicenseStatus, string> = {
  PENDING: "linear-gradient(135deg,#C2703A 0%,#A05A2C 100%)",
  VERIFIED: "linear-gradient(135deg,#2E7D32 0%,#1B5E20 100%)",
  REJECTED: "linear-gradient(135deg,#C62828 0%,#8B1A1A 100%)",
};

// ── Upload via backend (signed, secure) ────────────────────────────────────
async function uploadViaBackend(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/seller-license/upload");
    xhr.withCredentials = true;  // send auth cookie

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      // Try to parse JSON; if it fails, surface the raw response for debugging
      let data: any = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* not JSON */ }

      if (data && xhr.status === 200 && data.data?.url) {
        resolve(data.data.url);
      } else {
        // Show real error: parsed message OR raw response (truncated to 200 chars)
        const msg =
          data?.message ||
          (xhr.responseText
            ? `Server error (${xhr.status}): ${xhr.responseText.slice(0, 200)}`
            : `HTTP ${xhr.status} — empty response`);
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error — could not reach the server"));
    xhr.send(fd);
  });
}

export default function SellerLicensePage() {
  const [license,    setLicense]    = useState<License | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [licenseNum, setLicenseNum] = useState("");
  const [docUrl,     setDocUrl]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Upload state
  const [uploadMode,     setUploadMode]     = useState<"url" | "file">("file");
  const [uploading,      setUploading]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile,   setUploadedFile]   = useState<{ name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLicense = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/seller-license/my", { credentials: "include" });
      const data = await res.json();
      setLicense(data.data);
      if (data.data) {
        setLicenseNum(data.data.licenseNumber);
        setDocUrl(data.data.documentUrl);
      }
    } catch { toast.error("Failed to load license"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLicense(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, or PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadedFile(null);
    try {
      const url = await uploadViaBackend(file, pct => setUploadProgress(pct));
      setDocUrl(url);
      setUploadedFile({ name: file.name, type: file.type });
      toast.success("Document uploaded successfully ✓");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl) { toast.error("Please upload a document or provide a URL"); return; }
    setSubmitting(true);
    try {
      const res  = await fetch("/api/seller-license", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNumber: licenseNum, documentUrl: docUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("License submitted for review!");
      fetchLicense();
    } catch (err: any) { toast.error(err.message || "Submission failed"); }
    finally { setSubmitting(false); }
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  // PDFs are uploaded with resource_type:"image" so Cloudinary serves them at
  // .../image/upload/.../filename.pdf — detecting by .pdf extension is sufficient.
  const isPdf   = (url: string) => /\.pdf(\?|$)/i.test(url);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaIdCard className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>License Verification</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>
            Submit your pharmacy seller license for admin review
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Status card ──────────────────────────────────────────── */}
        <AnimatePresence>
          {license && (
            <motion.div key="status" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-7 text-white relative overflow-hidden"
              style={{ background: STATUS_BG[license.status] }}>
              <div className="absolute -right-8 -bottom-8 text-[110px] opacity-10">
                {license.status === "VERIFIED" ? <FaCheckCircle /> : license.status === "REJECTED" ? <FaTimesCircle /> : <FaClock />}
              </div>
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">License Status</p>
              <p className="text-4xl font-black mb-4">{license.status}</p>
              <div className="space-y-1 text-sm opacity-80">
                <p>License #: <strong>{license.licenseNumber}</strong></p>
                <p>Submitted: {new Date(license.createdAt).toLocaleDateString()}</p>
              </div>
              {license.adminNote && (
                <div className="mt-4 rounded-xl p-3 text-sm" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <strong>Admin Note: </strong>{license.adminNote}
                </div>
              )}
              {/* Document proxy link — opens through our backend so Cloudinary
                  CDN restrictions don't block delivery in the browser */}
              <a
                href="/api/seller-license/document"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                {(uploadedFile?.type === "application/pdf" || isPdf(license.documentUrl))
                  ? <FaFilePdf /> : <FaImage />} View Document
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submission form ───────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="medi-card p-6 space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
            <FaUpload style={{ color: "#C2703A" }} />
            {license ? "Update License" : "Submit License"}
          </h2>

          {/* License Number */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>License Number *</label>
            <input value={licenseNum} onChange={e => setLicenseNum(e.target.value)}
              placeholder="e.g., PHARM-2024-001234"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} required />
          </div>

          {/* Upload mode toggle */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#5C4033" }}>Document *</p>
            <div className="flex gap-2 mb-3">
              {[
                { k: "file", label: "Upload File", icon: <FaUpload /> },
                { k: "url",  label: "Paste URL",   icon: <FaLink /> },
              ].map(({ k, label, icon }) => (
                <button key={k} type="button" onClick={() => setUploadMode(k as any)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: uploadMode === k ? "#1B3A5C" : "#F5EDE3",
                    color: uploadMode === k ? "#FFF" : "#5C4033",
                    border: "1px solid #DDD0C4",
                  }}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* File upload */}
            {uploadMode === "file" && (
              <div>
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed py-8 transition-colors hover:border-[#C2703A]"
                  style={{ borderColor: "#DDD0C4", background: "#FAFAFA" }}>
                  {uploading ? (
                    <>
                      <FaSpinner className="text-2xl animate-spin" style={{ color: "#C2703A" }} />
                      <p className="text-sm font-semibold" style={{ color: "#C2703A" }}>
                        Uploading… {uploadProgress}%
                      </p>
                      <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: "#EEE4D9" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: "#C2703A" }} />
                      </div>
                    </>
                  ) : uploadedFile ? (
                    <>
                      {uploadedFile.type === "application/pdf"
                        ? <FaFilePdf className="text-3xl" style={{ color: "#C62828" }} />
                        : <FaImage className="text-3xl" style={{ color: "#3A6EA5" }} />}
                      <p className="text-sm font-semibold" style={{ color: "#2E7D32" }}>
                        ✓ {uploadedFile.name}
                      </p>
                      <p className="text-xs" style={{ color: "#8A6650" }}>Click to replace</p>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-2xl" style={{ color: "#8A6650" }} />
                      <p className="text-sm font-semibold" style={{ color: "#5C4033" }}>
                        Click to upload PDF or image
                      </p>
                      <p className="text-xs" style={{ color: "#8A6650" }}>
                        JPG, PNG, WEBP, PDF — max 10 MB
                      </p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,application/pdf,image/*"
                    className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
              </div>
            )}

            {/* Manual URL */}
            {uploadMode === "url" && (
              <input type="url" value={docUrl} onChange={e => setDocUrl(e.target.value)}
                placeholder="https://drive.google.com/your-license.pdf"
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
            )}

            {/* Preview after upload / URL provided */}
            {docUrl && !uploading && (
              <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid #DDD0C4" }}>
                {isImage(docUrl) ? (
                  <img src={docUrl} alt="License preview" className="w-full max-h-48 object-contain bg-gray-50" />
                ) : (
                  <div className="flex items-center gap-3 p-4" style={{ background: "#FFF3E0" }}>
                    <FaFilePdf style={{ color: "#C62828", fontSize: 28 }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#5C4033" }}>Document ready</p>
                      <a href={`/api/seller-license/document?url=${encodeURIComponent(docUrl)}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs underline" style={{ color: "#3A6EA5" }}>Open in new tab ↗</a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting || uploading || loading}
            className="medi-btn-accent w-full disabled:opacity-60">
            {submitting ? "Submitting…" : license ? "Resubmit for Review" : "Submit License"}
          </button>

          {license?.status === "VERIFIED" && (
            <p className="text-xs text-center" style={{ color: "#2E7D32" }}>
              ✓ Your license is verified. You may resubmit if it has been renewed.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
