"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaEdit, FaSave, FaSpinner, FaShoppingCart,
  FaCheckCircle, FaTimesCircle, FaClock, FaWallet,
  FaTruck, FaSync, FaPhone, FaMapMarkerAlt,
} from "react-icons/fa";

interface CustomerProfile {
  id: string; name: string; email: string; image?: string; phone?: string;
  role: string; createdAt: string; updatedAt: string; isCompletedProfile: boolean;
  wallet?: { balance: number };
  totalOrders: number; deliveredOrders: number; cancelledOrders: number; activeOrders: number;
}

const BD_DIVISIONS = [
  "Dhaka","Chittagong","Rajshahi","Khulna","Barisal","Sylhet","Rangpur","Mymensingh",
];

function completionFields(p: CustomerProfile) {
  return [
    { label: "Display Name",     done: !!p.name },
    { label: "Phone Number",     done: !!p.phone },
    { label: "Profile Photo",    done: !!p.image },
  ];
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", image:"", phone:"", preferredDivision:"" });

  const fetchProfile = useCallback(() => {
    setLoading(true);
    fetch("/api/profile/me", { credentials:"include" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message);
        const p = d.data as CustomerProfile;
        setProfile(p);
        setForm({ name:p.name||"", image:p.image||"", phone:p.phone||"", preferredDivision:"" });
      })
      .catch(e => toast.error(e.message||"Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/profile/me", {
        method:"PATCH", credentials:"include",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:form.name, image:form.image||undefined, phone:form.phone||undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Update failed");
      toast.success("Profile updated successfully!");
      setEditing(false); fetchProfile();
    } catch (err:any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="medi-page space-y-4">
      {[...Array(3)].map((_,i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{background:"#EEE4D9"}}/>)}
    </div>
  );
  if (!profile) return <div className="medi-page text-center py-20" style={{color:"#C62828"}}>Failed to load profile.</div>;

  const fields = completionFields(profile);
  const pct    = Math.round((fields.filter(f=>f.done).length / fields.length)*100);

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#C2703A,#F59E0B)"}}>
            <FaUser className="text-white text-lg"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>My Profile</h1>
            <p className="text-sm" style={{color:"#8A6650"}}>Manage your account &amp; delivery details</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{background:profile.isCompletedProfile?"#10B98118":"#F59E0B18", color:profile.isCompletedProfile?"#10B981":"#F59E0B"}}>
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
        {/* Left */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="medi-card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{borderColor:"#C2703A"}}>
                {profile.image
                  ? <img src={profile.image} alt={profile.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{background:"#F5EDE3",color:"#C2703A"}}>{profile.name.charAt(0).toUpperCase()}</div>}
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{background:"#C2703A"}}>
                <FaUser style={{fontSize:10}}/>
              </span>
            </div>
            <h2 className="text-lg font-black mb-0.5" style={{color:"#1B3A5C"}}>{profile.name}</h2>
            <p className="text-xs mb-1" style={{color:"#8A6650"}}>{profile.email}</p>
            {profile.phone && (
              <p className="text-xs mb-2 flex items-center justify-center gap-1" style={{color:"#C2703A"}}>
                <FaPhone style={{fontSize:10}}/> {profile.phone}
              </p>
            )}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{background:"#C2703A18",color:"#C2703A"}}>CUSTOMER</span>
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
                  style={{background:pct===100?"linear-gradient(90deg,#10B981,#059669)":"linear-gradient(90deg,#F59E0B,#C2703A)"}}/>
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

          {/* Order stats */}
          <div className="medi-card p-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:"#8A6650"}}>Order Summary</p>
            <div className="space-y-3">
              {[
                {icon:<FaShoppingCart/>, label:"Total Orders",  val:profile.totalOrders,     color:"#1B3A5C"},
                {icon:<FaTruck/>,        label:"Active",         val:profile.activeOrders,    color:"#C2703A"},
                {icon:<FaCheckCircle/>,  label:"Delivered",      val:profile.deliveredOrders, color:"#10B981"},
                {icon:<FaTimesCircle/>,  label:"Cancelled",      val:profile.cancelledOrders, color:"#EF4444"},
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
            <div className="medi-card p-5" style={{background:"linear-gradient(135deg,#C2703A,#F59E0B)",color:"#FFF"}}>
              <div className="flex items-center gap-2 mb-2"><FaWallet/><p className="text-xs font-semibold opacity-80">Wallet Balance</p></div>
              <p className="text-3xl font-black">৳{profile.wallet.balance.toFixed(2)}</p>
              <p className="text-xs opacity-60 mt-1">Available for purchases</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Preferred Delivery Area (checkout-style) ── */}
          <div className="medi-card overflow-hidden">
            <div className="px-5 py-3 flex items-center gap-2" style={{background:"linear-gradient(90deg,#C2703A10,#FFF)",borderBottom:"1px solid #EEE4D9"}}>
              <FaMapMarkerAlt style={{color:"#C2703A",fontSize:14}}/>
              <p className="font-bold text-sm" style={{color:"#1B3A5C"}}>Delivery Preference</p>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"#10B98118",color:"#10B981"}}>
                Used for order routing
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{color:"#8A6650"}}>Preferred Division</p>
                  <select value={form.preferredDivision} onChange={e => setForm(f=>({...f,preferredDivision:e.target.value}))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
                    style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}>
                    <option value="">— Select Division —</option>
                    {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{color:"#8A6650"}}>Contact Phone</p>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-3" style={{color:"#C2703A",fontSize:11}}/>
                    <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                      placeholder="+880 1xxx-xxxxxx"
                      className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
                      style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}/>
                  </div>
                </div>
              </div>
              <p className="text-[10px] mt-2" style={{color:"#8A6650"}}>
                💡 Your nearest warehouse is automatically calculated when you place an order. Phone number is needed for delivery.
              </p>
            </div>
          </div>

          {/* Account Settings */}
          <motion.div className="medi-card p-6" layout>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{color:"#1B3A5C"}}>Account Settings</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#EEE4D9",color:"#1B3A5C"}}>
                  <FaEdit/> Edit
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form key="form" onSubmit={handleSave} className="space-y-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-1.5" style={{color:"#8A6650"}}>
                        <FaUser className="inline mr-1" style={{fontSize:10}}/>Display Name *
                      </label>
                      <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                        style={{borderColor:"#DDD0C4",color:"#1B3A5C"}} required/>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-1.5" style={{color:"#8A6650"}}>
                        <FaPhone className="inline mr-1" style={{fontSize:10}}/>Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-3" style={{color:"#C2703A",fontSize:11}}/>
                        <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                          placeholder="+880 1xxx-xxxxxx"
                          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                          style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}/>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1.5" style={{color:"#8A6650"}}>Profile Image URL</label>
                    <input value={form.image} onChange={e => setForm(f=>({...f,image:e.target.value}))}
                      placeholder="https://..."
                      className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      style={{borderColor:"#DDD0C4",color:"#1B3A5C"}}/>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60" style={{background:"#C2703A",color:"#FFF"}}>
                      {saving ? <FaSpinner className="animate-spin"/> : <FaSave/>} Save Changes
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{background:"#EEE4D9",color:"#5C4033"}}>Cancel</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view" className="space-y-3" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {[
                    {label:"Full Name",    value:profile.name},
                    {label:"Email",        value:profile.email},
                    {label:"Phone",        value:profile.phone||"Not set — click Edit to add"},
                    {label:"Role",         value:"Customer"},
                    {label:"Member Since", value:new Date(profile.createdAt).toLocaleDateString()},
                    {label:"Last Updated", value:new Date(profile.updatedAt).toLocaleDateString()},
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-2 border-b text-sm" style={{borderColor:"#F5EDE3"}}>
                      <span style={{color:"#8A6650"}}>{r.label}</span>
                      <span className="font-semibold" style={{color:"#1B3A5C"}}>{r.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Delivery info card */}
          <div className="medi-card p-5" style={{background:"linear-gradient(90deg,#C2703A08,#FFF)",border:"1px solid #C2703A20"}}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:"#C2703A"}}>🛵 How Your Orders Are Delivered</p>
            <div className="text-xs space-y-1.5" style={{color:"#5C4033"}}>
              {[
                "1. You place an order — items split by seller into sub-orders",
                "2. Each seller ships to their nearest warehouse",
                "3. Items transfer to your nearest warehouse via inter-WH routing",
                "4. All items consolidated & packed at your local warehouse",
                "5. Single package dispatched to your delivery address 🏠",
              ].map(s => <p key={s}>{s}</p>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
