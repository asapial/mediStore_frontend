"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart, FaMapMarkerAlt, FaCreditCard,
  FaMoneyBillWave, FaChevronRight, FaCheckCircle,
} from "react-icons/fa";

// ── Bangladesh geo data ──────────────────────────────────────────────────────
const BD_GEO: Record<string, Record<string, Record<string, string[]>>> = {
  "Dhaka": {
    "Dhaka":          { "Savar": ["Savar Town","Ashulia","Hemayetpur","Banora"], "Gazipur Sadar": ["Tongi","Joydebpur","Gazipur","Chandana"], "Keraniganj": ["Keraniganj","Zinzira","Aganagar"], "Dohar": ["Dohar","Jainsharhat","Munshiganj Road"], "Nawabganj": ["Nawabganj","Baksho Ali"] },
    "Gazipur":        { "Gazipur Sadar": ["Joydebpur","Bhawal","Mirzpur"], "Kaliganj": ["Kaliganj","Pubail"], "Kaliakair": ["Kaliakair","Chandra"], "Kapasia": ["Kapasia","Ghagotia"], "Sreepur": ["Sreepur","Mawna"] },
    "Narayanganj":    { "Narayanganj Sadar": ["Narayanganj City","Fatullah","Siddhirganj"], "Araihazar": ["Araihazar","Brahmandi"], "Bandar": ["Bandar","Rupganj"], "Rupganj": ["Rupganj","Bholabo"] },
    "Manikganj":      { "Manikganj Sadar": ["Manikganj Town","Singair"], "Shibalaya": ["Shibalaya","Ghior"], "Saturia": ["Saturia","Baladakhal"], "Harirampur": ["Harirampur","Lesraganj"] },
    "Munshiganj":     { "Munshiganj Sadar": ["Munshiganj Town","Mirkadim"], "Sreenagar": ["Sreenagar","Hasara"], "Sirajdikhan": ["Sirajdikhan","Ruhitpur"] },
    "Narsingdi":      { "Narsingdi Sadar": ["Narsingdi Town","Pagar"], "Shibpur": ["Shibpur","Nilakhi"], "Palash": ["Palash","Ghorasal"] },
    "Kishoreganj":    { "Kishoreganj Sadar": ["Kishoreganj Town","Pakundia"], "Bajitpur": ["Bajitpur","Marichakanda"], "Kuliarchar": ["Kuliarchar","Hamil"] },
    "Tangail":        { "Tangail Sadar": ["Tangail Town","Kalihati"], "Mirzapur": ["Mirzapur","Gorai"], "Sakhipur": ["Sakhipur","Bhaluka"] },
    "Faridpur":       { "Faridpur Sadar": ["Faridpur Town","Boalmari"], "Madhukhali": ["Madhukhali","Boalia"], "Alfadanga": ["Alfadanga","Tengrikandi"] },
  },
  "Chittagong": {
    "Chittagong":     { "Pahartali": ["Khulshi","Patenga","Baizid"], "Kotwali": ["Anderkilla","Chawk Bazar","Jubilee Road"], "Double Mooring": ["Bandar","Agrabad","Halishahar"], "Panchlaish": ["GEC","Nasirabad","Oxygen"], "Bayazid": ["Bayazid","Shulkbahar"] },
    "Cox's Bazar":    { "Cox's Bazar Sadar": ["Cox's Bazar Town","Ukhia"], "Teknaf": ["Teknaf","Saint Martin"], "Ramu": ["Ramu","Khuniapalong"], "Moheshkhali": ["Moheshkhali","Kutubdia"] },
    "Comilla":        { "Comilla Sadar": ["Comilla Town","Kandirpar"], "Muradnagar": ["Muradnagar","Comilla Sadar South"], "Homna": ["Homna","Meghna"], "Laksam": ["Laksam","Nangalkot"] },
    "Feni":           { "Feni Sadar": ["Feni Town","Trunkroad"], "Chhagalnaiya": ["Chhagalnaiya","Sonagazi"], "Daganbhuiyan": ["Daganbhuiyan","Rajapur"] },
    "Lakshmipur":     { "Lakshmipur Sadar": ["Lakshmipur Town","Ramganj"], "Raipur": ["Raipur","Bhurbhuriaghat"] },
    "Noakhali":       { "Noakhali Sadar": ["Maijdee","Noakhali Town"], "Begumganj": ["Begumganj","Chaumuhani"], "Hatia": ["Hatia","Sonapur"] },
    "Brahmanbaria":   { "Brahmanbaria Sadar": ["Brahmanbaria Town","Medda"], "Ashuganj": ["Ashuganj","Sutang"], "Bancharampur": ["Bancharampur","Pirgachha"] },
  },
  "Rajshahi": {
    "Rajshahi":       { "Rajshahi City": ["Boalia","Rajpara","Motihar","Shaheb Bazar"], "Paba": ["Paba","Haripur"], "Godagari": ["Godagari","Rajabarihat"], "Tanore": ["Tanore","Kamargaon"] },
    "Natore":         { "Natore Sadar": ["Natore Town","Halsa"], "Singra": ["Singra","Chhatni"], "Gurudaspur": ["Gurudaspur","Khajura"] },
    "Chapai Nawabganj": { "Chapai Nawabganj Sadar": ["Chapai Nawabganj Town","Kansat"], "Shibganj": ["Shibganj","Mobarakpur"], "Gomastapur": ["Gomastapur","Rahnapur"] },
    "Bogra":          { "Bogra Sadar": ["Bogra Town","Thakurgaon"], "Shibganj": ["Shibganj","Kichak"], "Sherpur": ["Sherpur","Gabtali"] },
    "Sirajganj":      { "Sirajganj Sadar": ["Sirajganj Town","Enayetpur"], "Kazipur": ["Kazipur","Kalukhali"], "Belkuchi": ["Belkuchi","Shahzadpur"] },
    "Pabna":          { "Pabna Sadar": ["Pabna Town","Atgharia"], "Ishwardi": ["Ishwardi","Pakshi","Dasuria"], "Bera": ["Bera","Bhangura"] },
  },
  "Sylhet": {
    "Sylhet":         { "Sylhet Sadar": ["Sylhet City","Shahjalal","Ambarkhana","Bandar Bazar","Zindabazar"], "Beanibazar": ["Beanibazar","Murarichaur"], "Golapganj": ["Golapganj","Dhuliapur"], "Osmani Nagar": ["Natun Bazar","Taltola"] },
    "Moulvibazar":    { "Moulvibazar Sadar": ["Moulvibazar Town","Kamalganj"], "Sreemangal": ["Sreemangal","Rajnagar"], "Kulaura": ["Kulaura","Baralekha"] },
    "Habiganj":       { "Habiganj Sadar": ["Habiganj Town","Chunarughat"], "Madhabpur": ["Madhabpur","Bahubal"], "Nabiganj": ["Nabiganj","Shayestaganj"] },
    "Sunamganj":      { "Sunamganj Sadar": ["Sunamganj Town","Bishwamvarpur"], "Tahirpur": ["Tahirpur","Jagannathpur"], "Jamalganj": ["Jamalganj","Pagla"] },
  },
  "Khulna": {
    "Khulna":         { "Khulna City": ["Khalishpur","Sonadanga","Daulatpur","Boyra"], "Batiaghata": ["Batiaghata","Jalma"], "Dumuria": ["Dumuria","Atlia"], "Fultala": ["Fultala","Gilatola"] },
    "Jessore":        { "Jessore Sadar": ["Jessore Town","Chanchra"], "Chaugachha": ["Chaugachha","Jashore"], "Manirampur": ["Manirampur","Lohagara"], "Sharsha": ["Sharsha","Benapole"] },
    "Bagerhat":       { "Bagerhat Sadar": ["Bagerhat Town","Fakirhat"], "Mongla": ["Mongla","Rampal"], "Morrelganj": ["Morrelganj","Sarankhola"] },
    "Satkhira":       { "Satkhira Sadar": ["Satkhira Town","Tala"], "Kaliganj": ["Kaliganj","Shyamnagar"], "Assasuni": ["Assasuni","Debhata"] },
  },
  "Barishal": {
    "Barishal":       { "Barishal City": ["Kotwali","Bandar","Natullabad","Sadar Road"], "Agailjhara": ["Agailjhara","Gournadi"], "Babuganj": ["Babuganj","Barisal Sadar"], "Banaripara": ["Banaripara","Saidkhalay"] },
    "Patuakhali":     { "Patuakhali Sadar": ["Patuakhali Town","Lohalia"], "Bauphal": ["Bauphal","Baufal"], "Galachipa": ["Galachipa","Ratnapur"] },
    "Bhola":          { "Bhola Sadar": ["Bhola Town","Vola"], "Tazumuddin": ["Tazumuddin","Lalmohan"], "Daulatkhan": ["Daulatkhan","Charfasson"] },
    "Jhalokati":      { "Jhalokati Sadar": ["Jhalokati Town","Nalchity"], "Rajapur": ["Rajapur","Kathalia"] },
  },
  "Rangpur": {
    "Rangpur":        { "Rangpur City": ["Rangpur Sadar","Mahiganj","Badarganj","Mithapukur"], "Gangachara": ["Gangachara","Nohali"], "Kaunia": ["Kaunia","Haribhasha"] },
    "Dinajpur":       { "Dinajpur Sadar": ["Dinajpur Town","Khansama"], "Parbatipur": ["Parbatipur","Fulbari"], "Birampur": ["Birampur","Nawabganj"] },
    "Gaibandha":      { "Gaibandha Sadar": ["Gaibandha Town","Shajra"], "Gobindaganj": ["Gobindaganj","Palashbari"] },
    "Kurigram":       { "Kurigram Sadar": ["Kurigram Town","Ulipur"], "Nageshwari": ["Nageshwari","Bhurungamari"] },
    "Lalmonirhat":    { "Lalmonirhat Sadar": ["Lalmonirhat Town","Aditmari"], "Kaliganj": ["Kaliganj","Hatibandha"], "Hatibandha": ["Hatibandha","Singimari"] },
    "Nilphamari":     { "Nilphamari Sadar": ["Nilphamari Town","Saidpur"], "Jaldhaka": ["Jaldhaka","Dimla"] },
    "Panchagarh":     { "Panchagarh Sadar": ["Panchagarh Town","Boda"], "Tetulia": ["Tetulia","Atwari"] },
    "Thakurgaon":     { "Thakurgaon Sadar": ["Thakurgaon Town","Baliadangi"], "Pirganj": ["Pirganj","Haripur"] },
  },
  "Mymensingh": {
    "Mymensingh":     { "Mymensingh City": ["Kotwali","Mymenshingh Sadar","Shankipara","Char Nilokshia"], "Trishal": ["Trishal","Dhala"], "Phulpur": ["Phulpur","Gouripur"] },
    "Jamalpur":       { "Jamalpur Sadar": ["Jamalpur Town","Dewanganj"], "Islampur": ["Islampur","Madarganj"], "Melandaha": ["Melandaha","Sarishabari"] },
    "Sherpur":        { "Sherpur Sadar": ["Sherpur Town","Nalitabari"], "Nakla": ["Nakla","Naria"], "Jhenaigati": ["Jhenaigati","Sribordi"] },
    "Netrokona":      { "Netrokona Sadar": ["Netrokona Town","Atpara"], "Mohanganj": ["Mohanganj","Madan"], "Khaliajuri": ["Khaliajuri","Durgapur"] },
  },
};

interface CartItem {
  id: string; cartId: string; medicineId: string; quantity: number;
  medicine: { id: string; name: string; image: string | null; price: number; stock: number; manufacturer: string };
}

type PaymentMethod = "COD" | "STRIPE";

export default function CheckoutPage() {
  const [items,         setItems]         = useState<CartItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [placingOrder,  setPlacingOrder]  = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [step,          setStep]          = useState<"address" | "review">("address");
  const [orderDone,     setOrderDone]     = useState(false);
  const router = useRouter();

  // Bangladesh address
  const [division,  setDivision]  = useState("");
  const [district,  setDistrict]  = useState("");
  const [upazila,   setUpazila]   = useState("");
  const [thana,     setThana]     = useState("");
  const [village,   setVillage]   = useState("");
  const [para,      setPara]      = useState("");
  const [houseNum,  setHouseNum]  = useState("");

  useEffect(() => {
    // Try sessionStorage first (from cart selection) then fall back to API
    const stored = sessionStorage.getItem("checkoutItems");
    if (stored) {
      try { setItems(JSON.parse(stored)); setLoading(false); return; } catch {}
    }
    fetch("/api/cart", { credentials: "include" })
      .then(r => r.json())
      .then(d => setItems(d.data?.items || []))
      .catch(() => toast.error("Failed to load cart"))
      .finally(() => setLoading(false));
  }, []);

  const divisions  = Object.keys(BD_GEO).sort();
  const districts  = division  ? Object.keys(BD_GEO[division] || {}).sort() : [];
  const upazilas   = district  ? Object.keys(BD_GEO[division]?.[district] || {}).sort() : [];
  const thanas     = upazila   ? (BD_GEO[division]?.[district]?.[upazila] || []) : [];

  const fullAddress = [
    houseNum, para, village, thana, upazila, district, division, "Bangladesh"
  ].filter(Boolean).join(", ");

  const subtotal = items.reduce((s, i) => s + i.quantity * i.medicine.price, 0);

  const validateAddress = () => {
    if (!division)  { toast.error("Select Division");   return false; }
    if (!district)  { toast.error("Select District");   return false; }
    if (!upazila)   { toast.error("Select Upazila");    return false; }
    if (!thana)     { toast.error("Select Thana");      return false; }
    if (!village)   { toast.error("Enter Village name"); return false; }
    if (!houseNum)  { toast.error("Enter House number / location"); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!validateAddress()) return;
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    setPlacingOrder(true);
    try {
      if (paymentMethod === "STRIPE") {
        toast.info("Redirecting to Stripe payment…");
        // TODO: integrate Stripe Checkout session here
        // const session = await createStripeSession({ items, address: fullAddress });
        // window.location.href = session.url;
        toast.error("Stripe integration requires NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to be configured.");
        setPlacingOrder(false);
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: fullAddress,
          items: items.map(i => ({ medicineId: i.medicineId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");

      // Clear cart after success
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

  // ── Order Success ──────────────────────────────────────────────────────────
  if (orderDone) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center medi-card p-12 max-w-md w-full">
        <FaCheckCircle className="mx-auto text-6xl mb-4" style={{ color: "#2E7D32" }} />
        <h2 className="text-2xl font-black mb-2" style={{ color: "#1B3A5C" }}>Order Placed!</h2>
        <p className="mb-2" style={{ color: "#8A6650" }}>Your order has been received and is being processed.</p>
        <p className="text-sm mb-6" style={{ color: "#8A6650" }}>Delivery to: <strong style={{ color: "#5C4033" }}>{fullAddress}</strong></p>
        <button onClick={() => router.push("/dashboard/customer/orders")} className="medi-btn-primary w-full">
          View My Orders
        </button>
      </motion.div>
    </div>
  );

  const SELECT_CLS = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none";
  const SELECT_STY = { borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" };

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#C2703A" }}>
          <FaShoppingCart className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Checkout</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>{items.length} item{items.length !== 1 ? "s" : ""} · ${subtotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Bangladesh Address ────────────────────── */}
          <div className="medi-card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-5" style={{ color: "#1B3A5C" }}>
              <FaMapMarkerAlt style={{ color: "#C2703A" }} /> Delivery Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Division */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Division *</label>
                <select value={division} onChange={e => { setDivision(e.target.value); setDistrict(""); setUpazila(""); setThana(""); }}
                  className={SELECT_CLS} style={SELECT_STY}>
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* District */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>District *</label>
                <select value={district} onChange={e => { setDistrict(e.target.value); setUpazila(""); setThana(""); }}
                  disabled={!division} className={SELECT_CLS} style={SELECT_STY}>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* Upazila */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Upazila *</label>
                <select value={upazila} onChange={e => { setUpazila(e.target.value); setThana(""); }}
                  disabled={!district} className={SELECT_CLS} style={SELECT_STY}>
                  <option value="">Select Upazila</option>
                  {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {/* Thana */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Thana / Area *</label>
                <select value={thana} onChange={e => setThana(e.target.value)}
                  disabled={!upazila} className={SELECT_CLS} style={SELECT_STY}>
                  <option value="">Select Thana</option>
                  {thanas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Village */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Village / Moholla *</label>
                <input value={village} onChange={e => setVillage(e.target.value)}
                  placeholder="e.g., Uttara, Dhanmondi"
                  className={SELECT_CLS} style={SELECT_STY} />
              </div>
              {/* Para */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Para / Block</label>
                <input value={para} onChange={e => setPara(e.target.value)}
                  placeholder="e.g., Block A, South Para"
                  className={SELECT_CLS} style={SELECT_STY} />
              </div>
              {/* House Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>House Number / Location *</label>
                <input value={houseNum} onChange={e => setHouseNum(e.target.value)}
                  placeholder="e.g., House 12, Road 5 — or GPS: 23.8103, 90.4125"
                  className={SELECT_CLS} style={SELECT_STY} />
              </div>
            </div>

            {/* Full address preview */}
            {fullAddress.replace(/,\s*Bangladesh$/, "").trim().length > 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 rounded-xl p-3 text-sm" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                <strong>📍 Full Address: </strong>{fullAddress}
              </motion.div>
            )}
          </div>

          {/* ── Payment Method ────────────────────────── */}
          <div className="medi-card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-5" style={{ color: "#1B3A5C" }}>
              <FaCreditCard style={{ color: "#C2703A" }} /> Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "COD",    icon: <FaMoneyBillWave style={{ fontSize: 24, color: "#2E7D32" }} />, label: "Cash on Delivery", desc: "Pay when your order arrives" },
                { key: "STRIPE", icon: <FaCreditCard    style={{ fontSize: 24, color: "#6772E5" }} />, label: "Pay by Card (Stripe)", desc: "Secure online payment via Stripe" },
              ].map(({ key, icon, label, desc }) => (
                <button key={key} onClick={() => setPaymentMethod(key as PaymentMethod)}
                  className="flex items-start gap-3 p-4 rounded-xl text-left transition-all border-2"
                  style={{
                    borderColor: paymentMethod === key ? (key === "STRIPE" ? "#6772E5" : "#2E7D32") : "#DDD0C4",
                    background:  paymentMethod === key ? (key === "STRIPE" ? "#EDE9FF" : "#E8F5E9") : "#FAFAFA",
                  }}>
                  {icon}
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>{desc}</p>
                    {key === "STRIPE" && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: "#6772E5" }}>
                        Requires Stripe API key configuration
                      </p>
                    )}
                  </div>
                  {paymentMethod === key && (
                    <FaCheckCircle className="ml-auto flex-shrink-0 mt-0.5"
                      style={{ color: key === "STRIPE" ? "#6772E5" : "#2E7D32" }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="medi-card p-6 sticky top-4">
            <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
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

            {/* Totals */}
            <div className="border-t pt-4 space-y-2" style={{ borderColor: "#DDD0C4" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A6650" }}>Items</span>
                <span style={{ color: "#5C4033" }}>{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A6650" }}>Subtotal</span>
                <span style={{ color: "#5C4033" }}>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A6650" }}>Delivery</span>
                <span style={{ color: "#2E7D32" }}>Free</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1" style={{ borderTop: "1px solid #DDD0C4" }}>
                <span style={{ color: "#1B3A5C" }}>Total</span>
                <span style={{ color: "#C2703A" }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={placingOrder || items.length === 0}
              className="medi-btn-accent w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-60">
              {placingOrder ? "Processing…" :
                paymentMethod === "STRIPE" ? "Pay with Stripe →" : "Place Order (COD)"}
              {!placingOrder && <FaChevronRight style={{ fontSize: 12 }} />}
            </button>

            <p className="text-xs text-center mt-2" style={{ color: "#8A6650" }}>
              {paymentMethod === "COD" ? "Cart will be cleared after successful order placement" : "You will be redirected to Stripe"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
