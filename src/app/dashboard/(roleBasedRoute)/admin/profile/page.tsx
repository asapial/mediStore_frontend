"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt, FaEdit, FaSave, FaSpinner, FaUsers,
  FaClipboardList, FaPills, FaWarehouse, FaStore,
  FaUser, FaSync, FaPhone, FaCheckCircle, FaTimesCircle, FaClock,
} from "react-icons/fa";

interface AdminProfile {
  id: string; name: string; email: string; image?: string; phone?: string;
  role: string; createdAt: string; updatedAt: string; isCompletedProfile: boolean;
  totalUsers: number; totalSellers: number; totalCustomers: number;
  totalOrders: number; totalMedicines: number; totalWarehouses: number;
}

function completionFields(p: AdminProfile) {
  return [
    { label: "Display Name",  done: !!p.name },
    { label: "Phone Number",  done: !!p.phone },
    { label: "Profile Photo", done: !!p.image },
  ];
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", image:"", phone:"" });

  const fetchProfile = useCallback(() => {
    setLoading(true);
    fetch("/api/profile/me", { credentials:"include" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message);
        const p = d.data as AdminProfile;
        setProfile(p);
        setForm({ name:p.name||"", image:p.image||"", phone:p.phone||"" });
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
      toast.success("Profile updated!");
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

  const stats = [
    {icon:<FaUsers/>,        label:"Total Users",       val:profile.totalUsers,      color:"#3A6EA5"},
    {icon:<FaStore/>,        label:"Sellers",            val:profile.totalSellers,    color:"#C2703A"},
    {icon:<FaUser/>,         label:"Customers",          val:profile.totalCustomers,  color:"#8B5CF6"},
    {icon:<FaClipboardList/>,label:"Total Orders",       val:profile.totalOrders,     color:"#10B981"},
    {icon:<FaPills/>,        label:"Medicines",          val:profile.totalMedicines,  color:"#F59E0B"},
    {icon:<FaWarehouse/>,    label:"Active Warehouses",  val:profile.totalWarehouses, color:"#0EA5E9"},
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#1B3A5C,#5C7AEA)"}}>
            <FaShieldAlt className="text-white text-lg"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Admin Profile</h1>
            <p className="text-sm" style={{color:"#8A6650"}}>Platform administrator account</p>
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
              <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{borderColor:"#1B3A5C"}}>
                {profile.image
                  ? <img src={profile.image} alt={profile.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{background:"#1B3A5C18",color:"#1B3A5C"}}>{profile.name.charAt(0).toUpperCase()}</div>}
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{background:"#1B3A5C"}}>
                <FaShieldAlt style={{fontSize:10}}/>
              </span>
            </div>
            <h2 className="text-lg font-black mb-0.5" style={{color:"#1B3A5C"}}>{profile.name}</h2>
            <p className="text-xs mb-1" style={{color:"#8A6650"}}>{profile.email}</p>
            {profile.phone && (
              <p className="text-xs mb-2 flex items-center justify-center gap-1" style={{color:"#3A6EA5"}}>
                <FaPhone style={{fontSize:10}}/> {profile.phone}
              </p>
            )}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{background:"#1B3A5C18",color:"#1B3A5C"}}>ADMIN · Full Access</span>
            <p className="text-[10px] mt-2" style={{color:"#8A6650"}}>
              Since {new Date(profile.createdAt).toLocaleDateString("en-BD",{year:"numeric",month:"long"})}
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

          {/* Platform stats sidebar */}
          <div className="medi-card p-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:"#8A6650"}}>Platform Overview</p>
            <div className="space-y-3">
              {stats.map(s => (
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
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-5">
          {/* Edit form */}
          <motion.div className="medi-card p-6" layout>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{color:"#1B3A5C"}}>Admin Account Settings</h3>
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
                        <FaPhone className="absolute left-3 top-3" style={{color:"#3A6EA5",fontSize:11}}/>
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
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60" style={{background:"#1B3A5C",color:"#FFF"}}>
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
                    {label:"Role",         value:"Administrator"},
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

          {/* Platform stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((s,i) => (
              <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="medi-card p-4 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{background:s.color+"18",color:s.color}}>{s.icon}</div>
                <p className="text-2xl font-black" style={{color:s.color}}>{s.val}</p>
                <p className="text-xs mt-1 font-semibold" style={{color:"#8A6650"}}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
