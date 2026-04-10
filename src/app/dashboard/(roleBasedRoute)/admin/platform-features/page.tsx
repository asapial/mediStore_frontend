"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";

interface Feature { id:string; title:string; description:string; icon:string; isActive:boolean; sortOrder:number; }

const FIELD_STYLE = { borderColor:"#DDD0C4", background:"#FFF", color:"#5C4033" };
const LABEL_STYLE = { color:"#5C4033" };
const INPUT_CLS   = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40]";
const SECTION_HDR = "flex items-center gap-2 font-bold text-base mb-4";
const EMPTY = { title:"", description:"", icon:"🚚", isActive:true, sortOrder:0 };

export default function AdminPlatformFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  const load = () => fetch("/api/platform-features",{credentials:"include"}).then(r=>r.json()).then(d=>setFeatures(d.data||[]));
  useEffect(()=>{ load(); },[]);

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const save = async () => {
    if (!form.title.trim()||!form.description.trim()||!form.icon.trim()) { toast.error("All fields required"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/platform-features/${editing}` : "/api/platform-features";
      const res = await fetch(url,{method:editing?"PUT":"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,sortOrder:Number(form.sortOrder)})});
      const d   = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success(editing?"Feature updated!":"Feature created!");
      if (!editing) setDone(true);
      resetForm(); load();
    } catch(e:any){ toast.error(e.message); } finally{ setSaving(false); }
  };

  const del = async (id:string) => {
    if (!confirm("Delete this feature?")) return;
    await fetch(`/api/platform-features/${id}`,{method:"DELETE",credentials:"include"});
    toast.success("Deleted"); load();
  };

  const startEdit = (f:Feature) => {
    setForm({title:f.title,description:f.description,icon:f.icon,isActive:f.isActive,sortOrder:f.sortOrder});
    setEditing(f.id); setShowForm(true); setDone(false);
  };

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <div onClick={toggle} className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ background: on ? "#2E7D32" : "#DDD0C4" }}>
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "none" }} />
    </div>
  );

  // Quick actions icons
  const SUGGESTIONS = ["🚚","🏥","💬","🔒","💊","⭐","🎁","🔬","💳","🌿","🩺","📦"];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#1B3A5C"}}>
            <FaStar className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Platform Features Strip</h1>
            <p className="text-sm" style={{color:"#8A6650"}}>{features.length} feature{features.length!==1?"s":""} · shown below the promo banners on homepage</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={()=>{setShowForm(true);setEditing(null);setForm(EMPTY);}} className="medi-btn-primary flex items-center gap-2">
            <FaPlus /> Add Feature
          </button>
        )}
      </div>

      {done && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="flex items-center gap-3 rounded-xl p-4 mb-6"
          style={{background:"#E8F5E9",border:"1px solid #2E7D32"}}>
          <FaCheckCircle style={{color:"#2E7D32",fontSize:20}} />
          <p className="font-semibold text-sm" style={{color:"#2E7D32"}}>Feature created! You can add another one.</p>
          <button className="ml-auto text-xs underline" style={{color:"#2E7D32"}} onClick={()=>setDone(false)}>Dismiss</button>
        </motion.div>
      )}

      {showForm && (
        <div className="space-y-5 mb-8">
          <div className="medi-card p-6">
            <p className={SECTION_HDR} style={{color:"#1B3A5C"}}>
              <FaStar style={{color:"#C2703A"}} /> {editing?"Edit":"Create"} Platform Feature
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Free Shipping" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Icon (emoji) *</label>
                <input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} placeholder="🚚" className={INPUT_CLS} style={FIELD_STYLE} />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTIONS.map(s=>(
                    <button key={s} type="button" onClick={()=>setForm(p=>({...p,icon:s}))}
                      className={`text-lg p-1.5 rounded-lg border transition-colors ${form.icon===s?"border-[#C2703A] bg-orange-50":"border-transparent hover:bg-muted"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Description *</label>
                <input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="e.g. On all orders over $30" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Sort Order (lower = first)</label>
                <input type="number" value={form.sortOrder} onChange={e=>setForm(p=>({...p,sortOrder:Number(e.target.value)}))} className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <span className="text-xs font-semibold" style={LABEL_STYLE}>Active / Visible</span>
                <Toggle on={form.isActive} toggle={()=>setForm(p=>({...p,isActive:!p.isActive}))} />
                <span className="text-xs" style={{color:form.isActive?"#2E7D32":"#8A6650"}}>{form.isActive?"Showing on homepage":"Hidden"}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-5 p-4 rounded-xl flex items-center gap-3" style={{background:"#F9F5F1",border:"1px solid #DDD0C4"}}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:"#E8F5F0"}}>
                {form.icon}
              </div>
              <div>
                <p className="font-bold text-sm" style={{color:"#1B3A5C"}}>{form.title||"Feature Title"}</p>
                <p className="text-xs" style={{color:"#8A6650"}}>{form.description||"Feature description"}</p>
              </div>
              <span className="ml-auto text-xs px-2 py-1 rounded-full font-semibold" style={{background:form.isActive?"#E8F5E9":"#F5EDE3",color:form.isActive?"#2E7D32":"#8A6650"}}>{form.isActive?"Active":"Hidden"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={save} disabled={saving} className="medi-btn-primary disabled:opacity-60 flex items-center gap-2 px-8">
              {saving?"Saving…":editing?"Update Feature":"Add Feature"}
            </button>
            <button onClick={resetForm} className="medi-btn-accent px-6">Cancel</button>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {features.map((f,i)=>(
            <motion.div key={f.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="medi-card p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:"#F5EDE3"}}>
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{color:"#1B3A5C"}}>{f.title}</p>
                  <p className="text-xs leading-snug" style={{color:"#8A6650"}}>{f.description}</p>
                  <span className="text-[10px] font-semibold" style={{color:"#8A6650"}}>order #{f.sortOrder}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3" style={{borderColor:"#EEE4D9"}}>
                <div className="flex items-center gap-2">
                  {f.isActive ? <FaEye style={{color:"#2E7D32",fontSize:12}} /> : <FaEyeSlash style={{color:"#8A6650",fontSize:12}} />}
                  <span className="text-xs font-semibold" style={{color:f.isActive?"#2E7D32":"#8A6650"}}>{f.isActive?"Active":"Hidden"}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>startEdit(f)} className="p-1.5 rounded-lg" style={{background:"#E3F0FB",color:"#3A6EA5"}}><FaEdit style={{fontSize:11}} /></button>
                  <button onClick={()=>del(f.id)} className="p-1.5 rounded-lg" style={{background:"#FFEBEE",color:"#C62828"}}><FaTrash style={{fontSize:11}} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {features.length===0 && (
          <div className="col-span-full text-center py-16 medi-card">
            <FaStar className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#1B3A5C"}} />
            <p style={{color:"#8A6650"}}>No features yet. Add your first platform feature!</p>
          </div>
        )}
      </div>
    </div>
  );
}
