"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  FaShoppingCart, FaMapMarkerAlt, FaCreditCard,
  FaMoneyBillWave, FaChevronRight, FaCheckCircle,
  FaLocationArrow, FaTag, FaTimes, FaPercent,
} from "react-icons/fa";

// ── Stripe (loads lazily) ────────────────────────────────────────────────────
const getStripe = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  return loadStripe(key);
};

// ── Bangladesh geo data ──────────────────────────────────────────────────────
const BD_GEO: Record<string, Record<string, Record<string, string[]>>> = {
  "Dhaka": {
    "Dhaka": { "Savar": ["Savar Town","Ashulia","Hemayetpur"], "Gazipur Sadar": ["Tongi","Joydebpur","Gazipur"], "Keraniganj": ["Keraniganj","Zinzira"], "Dohar": ["Dohar","Jainsharhat"] },
    "Gazipur": { "Gazipur Sadar": ["Joydebpur","Bhawal"], "Kaliakair": ["Kaliakair","Chandra"], "Sreepur": ["Sreepur","Mawna"] },
    "Narayanganj": { "Narayanganj Sadar": ["Narayanganj City","Fatullah","Siddhirganj"], "Rupganj": ["Rupganj","Bholabo"] },
    "Manikganj": { "Manikganj Sadar": ["Manikganj Town"], "Shibalaya": ["Shibalaya","Ghior"] },
    "Narsingdi": { "Narsingdi Sadar": ["Narsingdi Town","Pagar"], "Palash": ["Palash","Ghorasal"] },
    "Tangail": { "Tangail Sadar": ["Tangail Town","Kalihati"], "Mirzapur": ["Mirzapur","Gorai"] },
    "Faridpur": { "Faridpur Sadar": ["Faridpur Town"], "Madhukhali": ["Madhukhali"] },
  },
  "Chittagong": {
    "Chittagong": { "Pahartali": ["Khulshi","Patenga","Baizid"], "Kotwali": ["Anderkilla","Chawk Bazar"], "Double Mooring": ["Bandar","Agrabad"], "Panchlaish": ["GEC","Nasirabad"] },
    "Cox's Bazar": { "Cox's Bazar Sadar": ["Cox's Bazar Town","Ukhia"], "Teknaf": ["Teknaf","Saint Martin"] },
    "Comilla": { "Comilla Sadar": ["Comilla Town","Kandirpar"], "Muradnagar": ["Muradnagar"] },
    "Noakhali": { "Noakhali Sadar": ["Maijdee"], "Begumganj": ["Chaumuhani"] },
    "Feni": { "Feni Sadar": ["Feni Town"], "Chhagalnaiya": ["Chhagalnaiya"] },
    "Brahmanbaria": { "Brahmanbaria Sadar": ["Brahmanbaria Town"], "Ashuganj": ["Ashuganj"] },
  },
  "Rajshahi": {
    "Rajshahi": { "Rajshahi City": ["Boalia","Rajpara","Motihar","Shaheb Bazar"], "Paba": ["Paba"] },
    "Bogra": { "Bogra Sadar": ["Bogra Town"], "Sherpur": ["Sherpur","Gabtali"] },
    "Sirajganj": { "Sirajganj Sadar": ["Sirajganj Town","Enayetpur"] },
    "Pabna": { "Pabna Sadar": ["Pabna Town"], "Ishwardi": ["Ishwardi","Pakshi"] },
    "Natore": { "Natore Sadar": ["Natore Town"] },
    "Chapai Nawabganj": { "Chapai Nawabganj Sadar": ["Chapai Town","Kansat"] },
  },
  "Sylhet": {
    "Sylhet": { "Sylhet City": ["Sylhet Sadar","Ambarkhana","Bandar Bazar","Zindabazar"], "Beanibazar": ["Beanibazar"], "Golapganj": ["Golapganj"] },
    "Moulvibazar": { "Moulvibazar Sadar": ["Moulvibazar Town"], "Sreemangal": ["Sreemangal"] },
    "Habiganj": { "Habiganj Sadar": ["Habiganj Town","Chunarughat"] },
    "Sunamganj": { "Sunamganj Sadar": ["Sunamganj Town"] },
  },
  "Khulna": {
    "Khulna": { "Khulna City": ["Khalishpur","Sonadanga","Daulatpur","Boyra"], "Batiaghata": ["Batiaghata"] },
    "Jessore": { "Jessore Sadar": ["Jessore Town"], "Sharsha": ["Benapole"] },
    "Bagerhat": { "Bagerhat Sadar": ["Bagerhat Town"], "Mongla": ["Mongla"] },
    "Satkhira": { "Satkhira Sadar": ["Satkhira Town"], "Kaliganj": ["Kaliganj"] },
  },
  "Barishal": {
    "Barishal": { "Barishal City": ["Kotwali","Natullabad","Sadar Road"], "Banaripara": ["Banaripara"] },
    "Patuakhali": { "Patuakhali Sadar": ["Patuakhali Town"] },
    "Bhola": { "Bhola Sadar": ["Bhola Town"] },
    "Jhalokati": { "Jhalokati Sadar": ["Jhalokati Town"] },
  },
  "Rangpur": {
    "Rangpur": { "Rangpur City": ["Rangpur Sadar","Mahiganj","Badarganj"], "Gangachara": ["Gangachara"] },
    "Dinajpur": { "Dinajpur Sadar": ["Dinajpur Town"], "Parbatipur": ["Parbatipur"] },
    "Gaibandha": { "Gaibandha Sadar": ["Gaibandha Town"] },
    "Kurigram": { "Kurigram Sadar": ["Kurigram Town","Ulipur"] },
    "Nilphamari": { "Nilphamari Sadar": ["Nilphamari Town","Saidpur"] },
  },
  "Mymensingh": {
    "Mymensingh": { "Mymensingh City": ["Kotwali","Shankipara","Char Nilokshia"], "Trishal": ["Trishal"] },
    "Jamalpur": { "Jamalpur Sadar": ["Jamalpur Town"], "Islampur": ["Islampur"] },
    "Sherpur": { "Sherpur Sadar": ["Sherpur Town","Nalitabari"] },
    "Netrokona": { "Netrokona Sadar": ["Netrokona Town"] },
  },
};

interface CartItem {
  id: string; cartId: string; medicineId: string; quantity: number;
  medicine: { id: string; name: string; image: string | null; price: number; stock: number; manufacturer: string };
}
type PaymentMethod = "COD" | "STRIPE";

export default function CheckoutPage() {
  const router = useRouter();
  const [items,         setItems]         = useState<CartItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [placingOrder,  setPlacingOrder]  = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [orderDone,     setOrderDone]     = useState(false);

  // Bangladesh address
  const [division,  setDivision]  = useState("");
  const [district,  setDistrict]  = useState("");
  const [upazila,   setUpazila]   = useState("");
  const [thana,     setThana]     = useState("");
  const [village,   setVillage]   = useState("");
  const [para,      setPara]      = useState("");
  const [houseNum,  setHouseNum]  = useState("");
  const [landmark,  setLandmark]  = useState("");

  // Geolocation
  const [locating, setLocating] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Coupon
  const [couponCode,     setCouponCode]     = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [discount,       setDiscount]       = useState(0);
  const [couponApplied,  setCouponApplied]  = useState(false);

  // Stripe
  const [stripePaymentId, setStripePaymentId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutItems");
    if (stored) {
      try { setItems(JSON.parse(stored)); setLoading(false); return; } catch {}
    }
    fetch("/api/cart", { credentials: "include" })
      .then(r => r.json())
      .then(d => setItems(d.data?.items || []))
      .finally(() => setLoading(false));
  }, []);

  const divisions  = Object.keys(BD_GEO).sort();
  const districts  = division ? Object.keys(BD_GEO[division] || {}).sort() : [];
  const upazilas   = district ? Object.keys(BD_GEO[division]?.[district] || {}).sort() : [];
  const thanas     = upazila  ? (BD_GEO[division]?.[district]?.[upazila] || []) : [];

  const subtotal  = items.reduce((s, i) => s + i.quantity * i.medicine.price, 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const fullAddress = [houseNum, landmark, para, village, thana, upazila, district, division, "Bangladesh"]
    .filter(Boolean).join(", ");

  // ── Auto-locate ──────────────────────────────────────────────────────────────
  const autoLocate = async () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGeoCoords({ lat, lng });
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
          const data = await res.json();
          const addr = data.address || {};
          // Try to extract Bangladesh address parts
          setVillage(addr.suburb || addr.neighbourhood || addr.village || addr.town || "");
          setPara(addr.quarter || addr.hamlet || "");
          setHouseNum(addr.house_number || "");
          setLandmark(addr.road || addr.amenity || "");
          toast.success("Location detected! Please verify and adjust the address.");
        } catch { toast.error("Could not resolve address from location"); }
        setLocating(false);
      },
      () => { toast.error("Location access denied"); setLocating(false); }
    );
  };

  // ── Apply coupon ─────────────────────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return; }
    if (couponApplied) { toast.info("Remove current coupon first"); return; }
    setCouponApplying(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid coupon");
      const disc = data.data?.discountAmount ?? data.data?.discount ?? 0;
      setDiscount(disc);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save $${disc.toFixed(2)}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setCouponApplying(false); }
  };

  const removeCoupon = () => { setDiscount(0); setCouponApplied(false); setCouponCode(""); };

  // ── Place order ──────────────────────────────────────────────────────────────
  const validateAddress = () => {
    if (!division) { toast.error("Select Division"); return false; }
    if (!district) { toast.error("Select District"); return false; }
    if (!upazila)  { toast.error("Select Upazila");  return false; }
    if (!thana)    { toast.error("Select Thana");    return false; }
    if (!village)  { toast.error("Enter Village / Moholla"); return false; }
    if (!houseNum) { toast.error("Enter House number / location"); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!validateAddress()) return;
    if (items.length === 0) { toast.error("Cart is empty"); return; }
    setPlacingOrder(true);
    try {
      if (paymentMethod === "STRIPE") {
        // Create payment intent → redirect to Stripe
        const piRes = await fetch("/api/payments/intent", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Math.round(finalTotal * 100), currency: "usd" }),
        });
        const piData = await piRes.json();
        if (!piRes.ok) throw new Error(piData.message || "Stripe session failed");

        // Store pending order data for after payment
        sessionStorage.setItem("pendingOrder", JSON.stringify({
          address: fullAddress,
          items: items.map(i => ({ medicineId: i.medicineId, quantity: i.quantity })),
          couponCode: couponApplied ? couponCode : undefined,
        }));
        sessionStorage.setItem("stripeClientSecret", piData.data.clientSecret);
        router.push("/dashboard/customer/stripe-payment");
        return;
      }

      // COD flow
      const res = await fetch("/api/orders", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: fullAddress,
          items: items.map(i => ({ medicineId: i.medicineId, quantity: i.quantity })),
          ...(couponApplied ? { couponCode } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      await fetch("/api/cart/clear", { method: "DELETE", credentials: "include" }).catch(() => {});
      sessionStorage.removeItem("checkoutItems");
      setOrderDone(true);
    } catch (err: any) {
      toast.error(err.message || "Error placing order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <p style={{ color: "#8A6650" }}>Loading checkout…</p>
    </div>
  );

  if (orderDone) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center medi-card p-12 max-w-md w-full">
        <FaCheckCircle className="mx-auto text-6xl mb-4" style={{ color: "#2E7D32" }} />
        <h2 className="text-2xl font-black mb-2" style={{ color: "#1B3A5C" }}>Order Placed!</h2>
        <p className="mb-1" style={{ color: "#8A6650" }}>Your order has been received.</p>
        <p className="text-sm mb-6 font-mono" style={{ color: "#5C4033" }}>📍 {fullAddress}</p>
        <button onClick={() => router.push("/dashboard/customer/orders")} className="medi-btn-primary w-full">
          View My Orders
        </button>
      </motion.div>
    </div>
  );

  const SEL = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none";
  const STY = { borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" };

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaShoppingCart className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Checkout</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>{items.length} item{items.length !== 1 ? "s" : ""} · Total: ${finalTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Delivery Address ──────────────────────────────────────── */}
          <div className="medi-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1B3A5C" }}>
                <FaMapMarkerAlt style={{ color: "#C2703A" }} /> Delivery Address
              </h2>
              <button onClick={autoLocate} disabled={locating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-60"
                style={{ background: "#E3F0FB", color: "#3A6EA5", border: "1px solid #3A6EA5" }}>
                <FaLocationArrow style={{ fontSize: 11 }} />
                {locating ? "Detecting…" : "Use My Location"}
              </button>
            </div>

            {/* OSM Map preview when geo coords available */}
            {geoCoords && (
              <div className="rounded-xl overflow-hidden mb-5 border" style={{ borderColor: "#DDD0C4" }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoCoords.lng - 0.005},${geoCoords.lat - 0.005},${geoCoords.lng + 0.005},${geoCoords.lat + 0.005}&layer=mapnik&marker=${geoCoords.lat},${geoCoords.lng}`}
                  width="100%" height="200" style={{ border: "none" }}
                  title="Delivery Location" />
                <div className="px-3 py-2 text-xs" style={{ background: "#F5EDE3", color: "#8A6650" }}>
                  📍 GPS: {geoCoords.lat.toFixed(5)}, {geoCoords.lng.toFixed(5)} · Verify the dropdown fields above
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Division */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Division *</label>
                <select value={division} onChange={e => { setDivision(e.target.value); setDistrict(""); setUpazila(""); setThana(""); }}
                  className={SEL} style={STY}>
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* District */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>District *</label>
                <select value={district} onChange={e => { setDistrict(e.target.value); setUpazila(""); setThana(""); }}
                  disabled={!division} className={SEL} style={STY}>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* Upazila */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Upazila *</label>
                <select value={upazila} onChange={e => { setUpazila(e.target.value); setThana(""); }}
                  disabled={!district} className={SEL} style={STY}>
                  <option value="">Select Upazila</option>
                  {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {/* Thana */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Thana / Area *</label>
                <select value={thana} onChange={e => setThana(e.target.value)}
                  disabled={!upazila} className={SEL} style={STY}>
                  <option value="">Select Thana</option>
                  {thanas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Village */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Village / Moholla *</label>
                <input value={village} onChange={e => setVillage(e.target.value)}
                  placeholder="e.g., Uttara, Dhanmondi, Banani" className={SEL} style={STY} />
              </div>
              {/* Para */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Para / Block / Sector</label>
                <input value={para} onChange={e => setPara(e.target.value)}
                  placeholder="e.g., Block A, South Para, Sector 7" className={SEL} style={STY} />
              </div>
              {/* House Number */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>House No. / Flat / Building *</label>
                <input value={houseNum} onChange={e => setHouseNum(e.target.value)}
                  placeholder="e.g., House 12, Flat 3B, Road 5" className={SEL} style={STY} />
              </div>
              {/* Landmark */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Landmark / Road</label>
                <input value={landmark} onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g., Near City Hospital, Main Road" className={SEL} style={STY} />
              </div>
            </div>

            {/* Address Preview */}
            {fullAddress.replace(/, ?Bangladesh$/, "").trim().length > 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 rounded-xl p-3 text-sm" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                <strong>📍 Full address: </strong>{fullAddress}
              </motion.div>
            )}
          </div>

          {/* ── Coupon ───────────────────────────────────────────────── */}
          <div className="medi-card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4" style={{ color: "#1B3A5C" }}>
              <FaTag style={{ color: "#C2703A" }} /> Coupon Code
            </h2>
            {couponApplied ? (
              <div className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#E8F5E9", border: "1px solid #2E7D32" }}>
                <div className="flex items-center gap-2">
                  <FaCheckCircle style={{ color: "#2E7D32" }} />
                  <span className="font-bold" style={{ color: "#2E7D32" }}>{couponCode}</span>
                  <span className="text-sm" style={{ color: "#5C4033" }}>— You save ${discount.toFixed(2)}</span>
                </div>
                <button onClick={removeCoupon}
                  className="p-1 rounded-full" style={{ color: "#C62828" }}>
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  placeholder="Enter coupon code (e.g. SAVE10)"
                  className="flex-1 border rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider uppercase"
                  style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#1B3A5C" }} />
                <button onClick={applyCoupon} disabled={couponApplying || !couponCode.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: "#C2703A", color: "#FFF" }}>
                  {couponApplying ? "…" : "Apply"}
                </button>
              </div>
            )}
            {!couponApplied && (
              <p className="text-xs mt-2" style={{ color: "#8A6650" }}>
                <FaPercent className="inline mr-1" />Have a promotional code? Enter it above to get a discount.
              </p>
            )}
          </div>

          {/* ── Payment Method ────────────────────────────────────────── */}
          <div className="medi-card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4" style={{ color: "#1B3A5C" }}>
              <FaCreditCard style={{ color: "#C2703A" }} /> Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "COD",    icon: <FaMoneyBillWave className="text-2xl" style={{ color: "#2E7D32" }} />,
                  label: "Cash on Delivery", desc: "Pay when your order arrives at your door" },
                { key: "STRIPE", icon: <FaCreditCard className="text-2xl" style={{ color: "#6772E5" }} />,
                  label: "Pay Online (Card)", desc: "Secure payment via Stripe · All major cards" },
              ].map(({ key, icon, label, desc }) => (
                <button key={key} onClick={() => setPaymentMethod(key as PaymentMethod)}
                  className="flex items-start gap-3 p-4 rounded-xl text-left transition-all border-2"
                  style={{
                    borderColor: paymentMethod === key
                      ? (key === "STRIPE" ? "#6772E5" : "#2E7D32")
                      : "#DDD0C4",
                    background: paymentMethod === key
                      ? (key === "STRIPE" ? "#EDE9FF" : "#E8F5E9")
                      : "#FAFAFA",
                  }}>
                  {icon}
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>{desc}</p>
                  </div>
                  {paymentMethod === key && (
                    <FaCheckCircle style={{ color: key === "STRIPE" ? "#6772E5" : "#2E7D32", flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
            {paymentMethod === "STRIPE" && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
              <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: "#FFF3E0", color: "#C2703A" }}>
                ⚠ <strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</strong> is not configured. Add it to <code>.env.local</code> to enable card payments.
              </div>
            )}
          </div>
        </div>

        {/* ── Order Summary ────────────────────────────────────────────── */}
        <div>
          <div className="medi-card p-6 sticky top-4">
            <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#EEE4D9" }}>
                    {item.medicine.image
                      ? <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">💊</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#1B3A5C" }}>{item.medicine.name}</p>
                    <p className="text-xs" style={{ color: "#8A6650" }}>×{item.quantity} × ${item.medicine.price.toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: "#C2703A" }}>
                    ${(item.quantity * item.medicine.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2" style={{ borderColor: "#DDD0C4" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A6650" }}>Subtotal</span>
                <span style={{ color: "#5C4033" }}>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#2E7D32" }}>Coupon Discount</span>
                  <span style={{ color: "#2E7D32" }}>–${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A6650" }}>Delivery</span>
                <span style={{ color: "#2E7D32" }}>Free</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t" style={{ borderColor: "#DDD0C4" }}>
                <span style={{ color: "#1B3A5C" }}>Total</span>
                <span style={{ color: "#C2703A" }}>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={placingOrder || items.length === 0}
              className="medi-btn-accent w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-60">
              {placingOrder ? "Processing…" :
                paymentMethod === "STRIPE" ? "Pay Securely with Stripe →" : "Place Order (Cash on Delivery)"}
              {!placingOrder && <FaChevronRight style={{ fontSize: 12 }} />}
            </button>

            <p className="text-xs text-center mt-2" style={{ color: "#8A6650" }}>
              {paymentMethod === "COD"
                ? "Your cart will be cleared after successful order"
                : "You will be redirected to Stripe's secure payment page"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
