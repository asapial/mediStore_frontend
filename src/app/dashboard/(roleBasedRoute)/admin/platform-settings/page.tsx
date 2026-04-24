"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaCog, FaSave, FaSpinner, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface PlatformSetting {
  id: string; key: string; value: string; description?: string; category: string;
}

const SETTING_LABELS: Record<string, { label: string; description: string; type: "number" | "boolean" | "text" }> = {
  PLATFORM_FEE_PERCENT:      { label: "Platform Fee (%)",          description: "Percentage deducted from seller earnings per order",             type: "number" },
  MIN_WITHDRAWAL_AMOUNT:     { label: "Min Withdrawal Amount ($)", description: "Minimum amount sellers can request for withdrawal",              type: "number" },
  MAX_WITHDRAWAL_AMOUNT:     { label: "Max Withdrawal Amount ($)", description: "Maximum amount per single withdrawal request",                   type: "number" },
  BASE_DELIVERY_FEE:         { label: "Base Delivery Fee ($)",     description: "Fixed fee added to every delivery",                             type: "number" },
  PER_KM_DELIVERY_RATE:      { label: "Per-KM Delivery Rate ($)",  description: "Additional fee per kilometer from nearest warehouse",           type: "number" },
  LOW_STOCK_DEFAULT_THRESHOLD:{ label: "Low Stock Threshold",      description: "Default units below which stock alert is triggered",            type: "number" },
  GUEST_CHECKOUT_ENABLED:    { label: "Guest Checkout",            description: "Allow non-registered users to place orders",                    type: "boolean" },
  TWO_FA_REQUIRED:           { label: "2FA Required",              description: "Force all users to enable two-factor authentication",           type: "boolean" },
  COD_ENABLED:               { label: "Cash on Delivery",          description: "Allow cash on delivery as payment option",                      type: "boolean" },
};

export default function AdminPlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/platform-features", { credentials: "include" });
      const data = await res.json();
      const s: PlatformSetting[] = data.data || [];
      setSettings(s);
      const vals: Record<string, string> = {};
      s.forEach(p => { vals[p.key] = p.value; });
      setLocalValues(vals);
    } catch { toast.error("Failed to load settings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveSetting = async (key: string) => {
    setSaving(key);
    try {
      const existing = settings.find(s => s.key === key);
      const method = existing ? "PATCH" : "POST";
      const url = existing ? `/api/platform-features/${existing.id}` : "/api/platform-features";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: localValues[key] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`"${SETTING_LABELS[key]?.label || key}" saved`);
      fetchSettings();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(null); }
  };

  const toggleBoolean = (key: string) => {
    const current = localValues[key] === "true";
    setLocalValues(v => ({ ...v, [key]: String(!current) }));
  };

  if (loading) return (
    <div className="medi-page space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#EEE4D9" }} />)}
    </div>
  );

  const groupedKeys = {
    "💰 Finance & Fees": ["PLATFORM_FEE_PERCENT", "MIN_WITHDRAWAL_AMOUNT", "MAX_WITHDRAWAL_AMOUNT"],
    "🚚 Delivery Rules": ["BASE_DELIVERY_FEE", "PER_KM_DELIVERY_RATE"],
    "📦 Inventory Defaults": ["LOW_STOCK_DEFAULT_THRESHOLD"],
    "⚙️ Feature Flags": ["GUEST_CHECKOUT_ENABLED", "TWO_FA_REQUIRED", "COD_ENABLED"],
  };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaCog className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Platform Settings</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>Configure global platform rules and feature flags</p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedKeys).map(([groupTitle, keys]) => (
          <div key={groupTitle}>
            <h2 className="text-base font-bold mb-4 pb-2 border-b" style={{ color: "#1B3A5C", borderColor: "#EEE4D9" }}>
              {groupTitle}
            </h2>
            <div className="space-y-3">
              {keys.map(key => {
                const meta = SETTING_LABELS[key];
                const value = localValues[key] ?? "";
                const isBoolean = meta?.type === "boolean";
                const isBool = value === "true";
                return (
                  <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="medi-card p-5 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{meta?.label || key}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>{meta?.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isBoolean ? (
                        <>
                          <button onClick={() => toggleBoolean(key)}
                            className="text-2xl transition" style={{ color: isBool ? "#2E7D32" : "#DDD0C4" }}>
                            {isBool ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          <span className="text-xs font-bold" style={{ color: isBool ? "#2E7D32" : "#C62828" }}>
                            {isBool ? "Enabled" : "Disabled"}
                          </span>
                        </>
                      ) : (
                        <input type="number" value={value}
                          onChange={e => setLocalValues(v => ({ ...v, [key]: e.target.value }))}
                          className="w-28 border rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none"
                          style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
                      )}
                      <button onClick={() => saveSetting(key)} disabled={saving === key}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-60"
                        style={{ background: "#1B3A5C", color: "#FFF" }}>
                        {saving === key ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
