"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEdit, FaSave, FaWarehouse, FaMapMarkerAlt,
  FaStore, FaStar, FaPills, FaClipboardList, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaTruck,
  FaSync, FaIdCard, FaPhone, FaUser,
} from "react-icons/fa";

const BD_DIVISIONS = [
  "Dhaka","Chittagong","Rajshahi","Khulna","Barisal","Sylhet","Rangpur","Mymensingh",
];

interface NearestWH {
  id: string; name: string; city: string; address: string;
  phone?: string; isActive: boolean; distanceKm: string;
}
interface SellerProfile {
  id: string; name: string; email: string; image?: string; phone?: string;
  businessCity?: string; role: string; createdAt: string; updatedAt: string;
  isCompletedProfile: boolean;
  wallet?: { balance: number };
  sellerLicense?: { status: string; licenseNumber?: string };
  totalMedicines: number; totalSubOrders: number;
  totalReviews: number; totalRevenue: number;
  nearestOriginWarehouse?: NearestWH | null;
}

const LICENSE_COLOR: Record<string,string> = {
  VERIFIED:"#10B981", PENDING:"#F59E0B", REJECTED:"#EF4444",
};

function completionFields(p: SellerProfile) {
  return [
    { label: "Display Name",  done: !!p.name },
    { label: "Phone Number",  done: !!p.phone },
    { label: "Profile Photo", done: !!p.image },
    { label: "Business City", done: !!p.businessCity },
    { label: "License Filed", done: !!p.sellerLicense },
  ];
}

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", image:"", businessCity:"", phone:"", division:"" });

  const fetchProfile = useCallback(() => {
    setLoading(true);
    fetch("/api/profile/me", { credentials:"include" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message);
        const p = d.data as SellerProfile;
        setProfile(p);
        setForm({ name:p.name||"", image:p.image||"", businessCity:p.businessCity||"", phone:p.phone||"", division:"" });
      })
      .catch(e => toast.error(e.message||"Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const city = form.division && form.businessCity
        ? `${form.businessCity}, ${form.division}`
        : form.businessCity || form.division || undefined;
      const res = await fetch("/api/profile/me", {
        method:"PATCH", credentials:"include",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:form.name, image:form.image||undefined, businessCity:city, phone:form.phone||undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Update failed");
      toast.success("Profile updated! Nearest warehouse recalculated.");
      setEditing(false); fetchProfile();
    } catch (err:any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="medi-page space-y-4">
      {[...Array(4)].map((_,i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{background:"#EEE4D9"}} />)}
    </div>
  );
  if (!profile) return <div className="medi-page text-center py-20" style={{color:"#C62828"}}>Failed to load profile.</div>;

  const licStatus = profile.sellerLicense?.status ?? "NONE";
  const licColor  = LICENSE_COLOR[licStatus] ?? "#8A6650";
  const fields    = completionFields(profile);
  const pct       = Math.round((fields.filter(f=>f.done).length / fields.length)*100);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#1B3A5C,#3A6EA5)"}}>
            <FaStore className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Seller Profile</h1>
            <p className="text-sm" style={{color:"#8A6650"}}>Storefront · Contact · Dispatch location</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{background: profile.isCompletedProfile?"#10B98118":"#F59E0B18", color: profile.isCompletedProfile?"#10B981":"#F59E0B"}}>
            {profile.isCompletedProfile
              ? <><FaCheckCircle/> Profile Complete</>
              : <><FaClock/> {pct}% Complete — add missing info</>}
          </span>
          <button onClick={fetchProfile} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"#F5EDE3",color:"#5C4033"}}>
            <FaSync className={loading?"animate-spin":""} style={{fontSize:10}}/> Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="medi-card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{borderColor:"#1B3A5C"}}>
                {profile.image
                  ? <img src={profile.image} alt={profile.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{background:"#EEE4D9",color:"#1B3A5C"}}>{profile.name.charAt(0).toUpperCase()}</div>}
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{background:"#1B3A5C"}}>
                <FaStore style={{fontSize:10}}/>
              </span>
            </div>
            <h2 className="text-lg font-black mb-0.5" style={{color:"#1B3A5C"}}>{profile.name}</h2>
            <p className="text-xs mb-1" style={{color:"#8A6650"}}>{profile.email}</p>
            {profile.phone && (
              <p className="text-xs mb-2 flex items-center justify-center gap-1" style={{color:"#3A6EA5"}}>
                <FaPhone style={{fontSize:10}}/> {profile.phone}
              </p>
            )}
            {profile.businessCity && (
              <div className="flex items-center justify-center gap-1 mb-2">
                <FaMapMarkerAlt style={{color:"#C2703A",fontSize:11}}/>
                <span className="text-xs font-semibold" style={{color:"#C2703A"}}>{profile.businessCity}</span>
              </div>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{background:licColor+"18",color:licColor}}>
              <FaIdCard style={{fontSize:10}}/> License: {licStatus}
              {licStatus==="VERIFIED" && <FaCheckCircle style={{fontSize:10}}/>}
            </span>
            <p className="text-[10px] mt-2" style={{color:"#8A6650"}}>
              Member since {new Date(profile.createdAt).toLocaleDateString("en-BD",{year:"numeric",month:"long"})}
            </p>
          </div>

          {/* Completion */}
          <div className="medi-card p-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:"#8A6650"}}>Profile Completion</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{background:"#EEE4D9"}}>
                <motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:"easeOut"}}
                  style={{background: pct===100?"linear-gradient(90deg,#10B981,#059669)":"linear-gradient(90deg,#F59E0B,#C2703A)"}}/>
              </div>
              <span className="text-sm font-black" style={{color:pct===100?"#10B981":"#F59E0B"}}>{pct}%</span>
            </div>
            <div className="space-y-1.5">
              {fields.map(f => (
                <div key={f.label} className="flex items-center gap-2 text-xs">
                  {f.done ? <FaCheckCircle style={{color:"#10B981",fontSize:10}}/> : <FaTimesCircle style={{color:"#EF444460",fontSize:10}}/>}
                  <span style={{color:f.done?"#1B3A5C":"#8A6650"}}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="medi-card p-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:"#8A6650"}}>Store Statistics</p>
            <div className="space-y-3">
              {[
                {icon:<FaPills/>,         label:"Products Listed", val:profile.totalMedicines,            color:"#3A6EA5"},
                {icon:<FaClipboardList/>, label:"Sub-Orders",      val:profile.totalSubOrders,            color:"#C2703A"},
                {icon:<FaStar/>,          label:"Reviews",         val:profile.totalReviews,              color:"#F59E0B"},
                {icon:<FaMoneyBillWave/>, label:"Revenue (৳)",     val:`৳${profile.totalRevenue.toFixed(0)}`, color:"#10B981"},
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{background:s.color+"18",color:s.color}}>{s.icon}</span>
                    <span className="text-xs font-semibold" style={{color:"#5C4033"}}>{s.label}</span>
                  </div>
                  <span className="text-sm font-black" style={{color:s.color}}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet */}
          {profile.wallet && (
            <div className="medi-card p-5" style={{background:"linear-gradient(135deg,#1B3A5C,#3A6EA5)",color:"#FFF"}}>
              <p className="text-xs font-semibold opacity-70 mb-1">Wallet Balance</p>
              <p className="text-3xl font-black">৳{profile.wallet.balance.toFixed(2)}</p>
              <p className="text-xs opacity-50 mt-1">Auto-credited on delivery</p>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Business Location (checkout-style) ── */}
          <motion.div className="medi-card overflow-hidden" layout>
            <div className="px-5 py-3 flex items-center gap-2" style={{background:"linear-gradient(90deg,#C2703A12,#FFF)",borderBottom:"1px solid #EEE4D9"}}>
              <FaMapMarkerAlt style={{color:"#C2703A",fontSize:14}}/>
              <p className="font-bold text-sm" style={{color:"#1B3A5C"}}>Business Location &amp; Dispatch Address</p>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"#3B82F618",color:"#3B82F6"}}>
                Used for warehouse routing
              </span>
            </div>
            <div className="px-5 py-4">
              {profile.businessCity ? (
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#C2703A18",color:"#C2703A"}}>
                    <FaMapMarkerAlt style={{fontSize:20}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-base mb-0.5" style={{color:"#1B3A5C"}}>{profile.businessCity}</p>
                    <p className="text-xs" style={{color:"#8A6650"}}>Dispatch city / district — orders shipped from here</p>
                    {profile.phone && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{color:"#3A6EA5"}}>
                        <FaPhone style={{fontSize:10}}/> {profile.phone}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setEditing(true)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                    style={{background:"#EEE4D9",color:"#1B3A5C"}}>
                    <FaEdit style={{fontSize:10}}/> Edit
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-2" style={{color:"#F59E0B"}}>
                  <FaClock/>
                  <div>
                    <p className="text-sm font-bold">No dispatch address set</p>
                    <p className="text-xs" style={{color:"#8A6650"}}>Set your Business City below to auto-assign an origin warehouse.</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="ml-auto text-xs px-3 py-1.5 rounded-lg font-bold" style={{background:"#F59E0B",color:"#FFF"}}>
                    Add Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Origin Warehouse ── */}
          <motion.div className="medi-card overflow-hidden" layout>
            <div className="px-5 py-3 flex items-center gap-2" style={{background:"linear-gradient(90deg,#3B82F610,#FFF)",borderBottom:"1px solid #EEE4D9"}}>
              <FaTruck style={{color:"#3B82F6",fontSize:14}}/>
              <p className="font-bold text-sm" style={{color:"#1B3A5C"}}>Origin Warehouse — Where your shipments go first</p>
            </div>
            <div className="px-5 py-4">
              {profile.nearestOriginWarehouse ? (
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#3B82F618",color:"#3B82F6"}}>
                    <FaWarehouse style={{fontSize:20}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-base" style={{color:"#1B3A5C"}}>{profile.nearestOriginWarehouse.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:"#10B98118",color:"#10B981"}}>✅ Nearest</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt style={{color:"#C2703A",fontSize:11}}/>
                      <p className="text-xs" style={{color:"#5C4033"}}>{profile.nearestOriginWarehouse.address}, {profile.nearestOriginWarehouse.city}</p>
                    </div>
                    {profile.nearestOriginWarehouse.phone && <p className="text-xs mt-0.5" style={{color:"#8A6650"}}>📞 {profile.nearestOriginWarehouse.phone}</p>}
                    <p className="text-xs font-semibold mt-1" style={{color:"#3B82F6"}}>📏 ~{profile.nearestOriginWarehouse.distanceKm} km from your dispatch city</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-2" style={{color:"#F59E0B"}}>
                  <FaClock/>
                  <div>
                    <p className="text-sm font-bold">No dispatch city set</p>
                    <p className="text-xs" style={{color:"#8A6650"}}>Set your Business City to auto-assign an origin warehouse.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Edit Form ── */}
          <motion.div className="medi-card p-6" layout>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{color:"#1B3A5C"}}>Profile Settings</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#EEE4D9",color:"#1B3A5C"}}>
                  <FaEdit/> Edit
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form key="form" onSubmit={handleSave} className="space-y-4"
                  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-1.5" style={{color:"#8A6650"}}>
                        <FaUser className="inline mr-1" style={{fontSize:10}}/>Display Name *
                      </label>
                      <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                        style={{borderColor:"#DDD0C4",color:"#1B3A5C"}} required/>
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-1.5" style={{color:"#8A6650"}}>
                        <FaPhone className="inline mr-1" style={{fontSize:10}}/>Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-3" style={{color:"#3A6EA5",fontSize:11}}/>
                        <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                          placeholder="+880 1xxx-xxxxxx"
                          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                          style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}/>
                      </div>
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1.5" style={{color:"#8A6650"}}>Profile Image URL</label>
                    <input value={form.image} onChange={e => setForm(f=>({...f,image:e.target.value}))}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}/>
                  </div>

                  {/* ── Business Address section (checkout-style) ── */}
                  <div className="rounded-2xl overflow-hidden border" style={{borderColor:"#C2703A30"}}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{background:"linear-gradient(90deg,#C2703A10,#FFF)",borderBottom:"1px solid #EEE4D9"}}>
                      <FaMapMarkerAlt style={{color:"#C2703A",fontSize:12}}/>
                      <span className="text-xs font-black uppercase tracking-widest" style={{color:"#C2703A"}}>
                        Business / Dispatch Address
                      </span>
                      <span className="ml-auto text-[10px]" style={{color:"#8A6650"}}>Used to auto-assign origin warehouse</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Division */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{color:"#5C4033"}}>Division</label>
                        <select value={form.division} onChange={e => setForm(f=>({...f,division:e.target.value}))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
                          style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}>
                          <option value="">— Select Division —</option>
                          {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      {/* City / District */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{color:"#5C4033"}}>City / District / Area</label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-3" style={{color:"#C2703A"}}/>
                          <input value={form.businessCity} onChange={e => setForm(f=>({...f,businessCity:e.target.value}))}
                            placeholder="e.g. Dhaka, Comilla, Sylhet…"
                            className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                            style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}/>
                        </div>
                        <p className="text-[10px] mt-1" style={{color:"#8A6650"}}>
                          The nearest active warehouse will be auto-assigned as your origin dispatch point.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60" style={{background:"#1B3A5C",color:"#FFF"}}>
                      {saving ? <FaSpinner className="animate-spin"/> : <FaSave/>} Save &amp; Recalculate Warehouse
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{background:"#EEE4D9",color:"#5C4033"}}>Cancel</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view" className="space-y-3" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {[
                    {label:"Display Name",    value:profile.name},
                    {label:"Email Address",   value:profile.email},
                    {label:"Phone Number",    value:profile.phone||"Not set — click Edit to add"},
                    {label:"Business City",   value:profile.businessCity||"Not set — click Edit to add"},
                    {label:"License Status",  value:profile.sellerLicense?.status??"Not submitted"},
                    {label:"License Number",  value:profile.sellerLicense?.licenseNumber??"—"},
                    {label:"Member Since",    value:new Date(profile.createdAt).toLocaleDateString()},
                    {label:"Last Updated",    value:new Date(profile.updatedAt).toLocaleDateString()},
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-2 border-b text-sm" style={{borderColor:"#F5EDE3"}}>
                      <span style={{color:"#8A6650"}}>{r.label}</span>
                      <span className="font-semibold max-w-xs text-right" style={{color:"#1B3A5C"}}>{r.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Routing info */}
          <div className="medi-card p-5" style={{background:"linear-gradient(90deg,#6366F108,#FFF)",border:"1px solid #6366F120"}}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:"#6366F1"}}>🗺️ How Your Orders Are Routed</p>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{color:"#5C4033"}}>
              {[
                {icon:"🧑‍💻",text:"Customer orders"},
                {icon:"→",text:""},
                {icon:"📦",text:`Your items → ${profile.nearestOriginWarehouse?.name??"Origin WH"}`},
                {icon:"→",text:""},
                {icon:"🚚",text:"Transfer to customer's nearest WH"},
                {icon:"→",text:""},
                {icon:"📫",text:"Packed & dispatched"},
                {icon:"→",text:""},
                {icon:"🏠",text:"Delivered to customer"},
                {icon:"→",text:""},
                {icon:"💰",text:"Wallet credited"},
              ].map((s,i) => s.text
                ? <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg font-semibold" style={{background:"#F5EDE3"}}>{s.icon} {s.text}</span>
                : <span key={i} style={{color:"#DDD0C4"}}>{s.icon}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
