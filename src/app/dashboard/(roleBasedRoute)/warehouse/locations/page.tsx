"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWarehouse, FaMapMarkerAlt, FaSpinner, FaPhone,
  FaEdit, FaCheckCircle, FaClock, FaInfoCircle, FaTimesCircle,
} from "react-icons/fa";

interface Warehouse {
  id: string; name: string; address: string; city: string;
  phone?: string; lat?: number; lng?: number; isActive: boolean;
  manager: { id: string; name: string; email: string };
  _count?: { locationStocks: number; fulfillmentTasks: number };
}
interface LocationRequest {
  id: string; status: "PENDING" | "APPROVED" | "REJECTED";
  address?: string; city?: string; lat?: number; lng?: number; phone?: string;
  note?: string; adminNote?: string; createdAt: string;
  reviewedBy?: { name: string };
}
interface RequestForm {
  address: string; city: string; lat: string; lng: string; phone: string; note: string;
}

const STATUS_STYLE = {
  PENDING:  { bg: "#FFF8E1", color: "#C2703A", icon: <FaClock /> },
  APPROVED: { bg: "#E8F5E9", color: "#2E7D32", icon: <FaCheckCircle /> },
  REJECTED: { bg: "#FFEBEE", color: "#C62828", icon: <FaTimesCircle /> },
};

export default function WarehouseLocationsPage() {
  const [warehouse,  setWarehouse]  = useState<Warehouse | null>(null);
  const [request,    setRequest]    = useState<LocationRequest | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RequestForm>({
    address: "", city: "", lat: "", lng: "", phone: "", note: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const meRes  = await fetch("/api/auth/me",   { credentials: "include" });
        const meData = await meRes.json();
        const userId = meData?.user?.id;
        if (!userId) { setError("Not authenticated"); return; }

        const whRes  = await fetch("/api/warehouses", { credentials: "include" });
        const whData = await whRes.json();
        const wh: Warehouse | undefined = (whData.data || []).find(
          (w: Warehouse) => w.manager?.id === userId
        );
        if (!wh) { setError("No warehouse assigned to your account."); return; }
        setWarehouse(wh);
        setForm({ address: wh.address || "", city: wh.city || "",
          lat: wh.lat?.toString() || "", lng: wh.lng?.toString() || "",
          phone: wh.phone || "", note: "" });

        // Fetch latest location request for this warehouse
        const reqRes  = await fetch(`/api/warehouses/location-requests/all?status=PENDING`, { credentials: "include" });
        // Note: WAREHOUSE role can't hit this admin endpoint — we'll handle 403 gracefully
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          const myReq = (reqData.data || []).find((r: any) => r.warehouse?.id === wh.id);
          setRequest(myReq || null);
        }
      } catch {
        setError("Failed to load warehouse data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouse) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouse.id}/location-request`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address || undefined,
          city:    form.city    || undefined,
          lat:     form.lat     ? parseFloat(form.lat)  : undefined,
          lng:     form.lng     ? parseFloat(form.lng)  : undefined,
          phone:   form.phone   || undefined,
          note:    form.note    || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("✅ Location change request submitted! Admin will review and approve.");
      setRequest({ ...d.data, status: "PENDING", createdAt: new Date().toISOString() });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: "#1B3A5C" }} />
        <p className="text-sm" style={{ color: "#8A6650" }}>Loading warehouse location...</p>
      </div>
    </div>
  );

  if (error || !warehouse) return (
    <div className="medi-page text-center py-24">
      <FaWarehouse className="text-5xl mx-auto mb-4 opacity-20" style={{ color: "#1B3A5C" }} />
      <p className="font-bold text-lg" style={{ color: "#1B3A5C" }}>{error || "Warehouse not found"}</p>
    </div>
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaMapMarkerAlt className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Warehouse Location</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Your assigned location — request changes for admin approval</p>
          </div>
        </div>
        {!request || request.status !== "PENDING" ? (
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: showForm ? "#EEE4D9" : "#1B3A5C", color: showForm ? "#5C4033" : "#FFF" }}>
            <FaEdit /> {showForm ? "Cancel" : "Request Location Change"}
          </button>
        ) : null}
      </div>

      {/* Info banner */}
      <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
        style={{ background: "#0EA5E908", color: "#0EA5E9", border: "1px solid #0EA5E930" }}>
        <FaInfoCircle className="flex-shrink-0 mt-0.5" />
        <span>Your warehouse location is <strong>managed by Admin</strong>. Submit a change request — admin will review and apply it.</span>
      </div>

      {/* Pending / Last Request Status */}
      {request && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-2xl border"
          style={{ background: STATUS_STYLE[request.status].bg, borderColor: STATUS_STYLE[request.status].color + "40" }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: STATUS_STYLE[request.status].color }}>{STATUS_STYLE[request.status].icon}</span>
            <p className="font-bold text-sm" style={{ color: STATUS_STYLE[request.status].color }}>
              Location Change Request — {request.status}
            </p>
          </div>
          <div className="text-xs space-y-1" style={{ color: "#5C4033" }}>
            {request.address && <p>New address: <strong>{request.address}</strong></p>}
            {request.city    && <p>New city: <strong>{request.city}</strong></p>}
            {request.lat     && <p>New GPS: <strong>{request.lat}, {request.lng}</strong></p>}
            {request.phone   && <p>New phone: <strong>{request.phone}</strong></p>}
            {request.note    && <p>Note: <em>{request.note}</em></p>}
            {request.adminNote && (
              <p className="mt-2 px-3 py-2 rounded-lg font-semibold"
                style={{ background: "rgba(0,0,0,0.05)", color: "#1B3A5C" }}>
                Admin note: {request.adminNote}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: "#8A6650" }}>
              Submitted: {new Date(request.createdAt).toLocaleString()}
              {request.reviewedBy && ` · Reviewed by ${request.reviewedBy.name}`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Current Location (read-only) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="medi-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaWarehouse style={{ color: "#0EA5E9", fontSize: 18 }} />
          <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>{warehouse.name}</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: warehouse.isActive ? "#E8F5E9" : "#FFEBEE", color: warehouse.isActive ? "#2E7D32" : "#C62828" }}>
            {warehouse.isActive ? "● Active" : "○ Inactive"}
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Address",         value: warehouse.address,  icon: <FaMapMarkerAlt style={{ color: "#C2703A" }} /> },
            { label: "City",            value: warehouse.city,     icon: <FaMapMarkerAlt style={{ color: "#3A6EA5" }} /> },
            { label: "Phone",           value: warehouse.phone || "—", icon: <FaPhone style={{ color: "#512DA8" }} /> },
            { label: "GPS Coordinates", value: warehouse.lat ? `${warehouse.lat?.toFixed(5)}, ${warehouse.lng?.toFixed(5)}` : "Not set",
              icon: <FaMapMarkerAlt style={{ color: "#10B981" }} /> },
          ].map(field => (
            <div key={field.label} className="rounded-xl p-4" style={{ background: "#F9F6F2", border: "1px solid #EEE4D9" }}>
              <div className="flex items-center gap-2 mb-1">{field.icon}
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A6650" }}>{field.label}</p>
              </div>
              <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{field.value}</p>
            </div>
          ))}
        </div>
        {warehouse._count && (
          <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: "#EEE4D9" }}>
            <span className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: "#0EA5E918", color: "#0EA5E9" }}>
              {warehouse._count.locationStocks} SKUs in stock
            </span>
            <span className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: "#D9770618", color: "#D97706" }}>
              {warehouse._count.fulfillmentTasks} fulfillment tasks
            </span>
          </div>
        )}
      </motion.div>

      {/* Change Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="medi-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <FaClock style={{ color: "#C2703A" }} />
              <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Request Location Change</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFF8E1", color: "#C2703A" }}>
                Pending Admin Approval
              </span>
            </div>
            <p className="text-xs" style={{ color: "#8A6650" }}>
              Fill only the fields you want to update. Admin will review and apply them.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "New Address", key: "address", placeholder: "Full street address" },
                { label: "City",        key: "city",    placeholder: "City name" },
                { label: "Latitude",    key: "lat",     placeholder: "e.g. 23.8103", type: "number" },
                { label: "Longitude",   key: "lng",     placeholder: "e.g. 90.4125", type: "number" },
                { label: "Phone",       key: "phone",   placeholder: "Contact number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>{f.label}</label>
                  <input type={f.type || "text"} step={f.type === "number" ? "any" : undefined}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#DDD0C4" }} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5C4033" }}>Reason / Note for Admin</label>
              <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="Briefly explain why the location needs updating..."
                rows={3} className="w-full border rounded-xl px-4 py-2 text-sm resize-none focus:outline-none"
                style={{ borderColor: "#DDD0C4" }} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{ background: "#1B3A5C", color: "#FFF" }}>
                {submitting ? <FaSpinner className="animate-spin" /> : <FaEdit />}
                {submitting ? "Submitting..." : "Submit Change Request"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#EEE4D9", color: "#5C4033" }}>
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
