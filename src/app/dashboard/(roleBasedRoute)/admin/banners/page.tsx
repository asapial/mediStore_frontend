"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaImage, FaPlus, FaEdit, FaTrash, FaPalette, FaCog, FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";

interface Banner { id:string; title:string; subtitle?:string; badge?:string; color:string; textColor:string; icon?:string; imageUrl?:string; link?:string; isActive:boolean; sortOrder:number; }

const FIELD_STYLE = { borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" };
const LABEL_STYLE = { color: "#5C4033" };
const INPUT_CLS   = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40]";
const SECTION_HDR = "flex items-center gap-2 font-bold text-base mb-4";
const EMPTY = { title:"", subtitle:"", badge:"", color:"#1B3A5C", textColor:"#FFFFFF", icon:"💊", imageUrl:"", link:"", isActive:true, sortOrder:0 };

export default function AdminBannersPage() {
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  const load = () => fetch("/api/banners",{credentials:"include"}).then(r=>r.json()).then(d=>setBanners(d.data||[]));
  useEffect(()=>{ load(); },[]);

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); setDone(false); };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/banners/${editing}` : "/api/banners";
      const res = await fetch(url,{method:editing?"PUT":"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,sortOrder:Number(form.sortOrder)})});
      const d   = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success(editing?"Banner updated!":"Banner created!");
      if (!editing) setDone(true);
      resetForm(); load();
    } catch(e:any){ toast.error(e.message); } finally{ setSaving(false); }
  };

  const del = async (id:string) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/banners/${id}`,{method:"DELETE",credentials:"include"});
    toast.success("Banner deleted"); load();
  };

  const startEdit = (b:Banner) => {
    setForm({title:b.title,subtitle:b.subtitle||"",badge:b.badge||"",color:b.color,textColor:b.textColor,icon:b.icon||"",imageUrl:b.imageUrl||"",link:b.link||"",isActive:b.isActive,sortOrder:b.sortOrder});
    setEditing(b.id); setShowForm(true); setDone(false);
  };

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <div onClick={toggle} className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ background: on ? "#2E7D32" : "#DDD0C4" }}>
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "none" }} />
    </div>
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#1B3A5C"}}>
            <FaImage className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Promo Banners</h1>
            <p className="text-sm" style={{color:"#8A6650"}}>{banners.length} banner{banners.length!==1?"s":""} · {banners.filter(b=>b.isActive).length} active</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={()=>{setShowForm(true);setEditing(null);setForm(EMPTY);}} className="medi-btn-primary flex items-center gap-2">
            <FaPlus /> Add Banner
          </button>
        )}
      </div>

      {done && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="flex items-center gap-3 rounded-xl p-4 mb-6"
          style={{background:"#E8F5E9",border:"1px solid #2E7D32"}}>
          <FaCheckCircle style={{color:"#2E7D32",fontSize:20}} />
          <p className="font-semibold text-sm" style={{color:"#2E7D32"}}>Banner created! You can add another one.</p>
          <button className="ml-auto text-xs underline" style={{color:"#2E7D32"}} onClick={()=>setDone(false)}>Dismiss</button>
        </motion.div>
      )}

      {showForm && (
        <div className="space-y-5 mb-8">
          {/* Section 1: Basic Info */}
          <div className="medi-card p-6">
            <p className={SECTION_HDR} style={{color:"#1B3A5C"}}>
              <FaImage style={{color:"#C2703A"}} /> {editing?"Edit":"Create"} Banner — Basic Info
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Vitamins & Supplements" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Badge Text</label>
                <input value={form.badge} onChange={e=>setForm(p=>({...p,badge:e.target.value}))} placeholder="e.g. Up to 35% off" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Subtitle</label>
                <input value={form.subtitle} onChange={e=>setForm(p=>({...p,subtitle:e.target.value}))} placeholder="e.g. Strengthen Your Immunity" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Link URL</label>
                <input value={form.link} onChange={e=>setForm(p=>({...p,link:e.target.value}))} placeholder="/shop?category=vitamins" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Icon (emoji)</label>
                <input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} placeholder="💊" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
            </div>
          </div>

          {/* Section 2: Appearance */}
          <div className="medi-card p-6">
            <p className={SECTION_HDR} style={{color:"#1B3A5C"}}>
              <FaPalette style={{color:"#C2703A"}} /> Appearance
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Background Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className="h-10 w-14 rounded-lg border cursor-pointer flex-shrink-0" style={{borderColor:"#DDD0C4"}} />
                  <input value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className={INPUT_CLS} style={FIELD_STYLE} placeholder="#1B3A5C" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Text Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.textColor} onChange={e=>setForm(p=>({...p,textColor:e.target.value}))} className="h-10 w-14 rounded-lg border cursor-pointer flex-shrink-0" style={{borderColor:"#DDD0C4"}} />
                  <input value={form.textColor} onChange={e=>setForm(p=>({...p,textColor:e.target.value}))} className={INPUT_CLS} style={FIELD_STYLE} placeholder="#FFFFFF" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Image URL (optional)</label>
                <input value={form.imageUrl} onChange={e=>setForm(p=>({...p,imageUrl:e.target.value}))} placeholder="https://…" className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
            </div>
            {/* Live Preview */}
            <div className="mt-4 rounded-xl p-5 relative overflow-hidden" style={{background:form.color}}>
              <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)"}} />
              <div className="relative z-10">
                {form.badge && <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-white/30 bg-white/20" style={{color:form.textColor}}>{form.badge}</span>}
                <p className="font-black text-xl mt-2" style={{color:form.textColor}}>{form.title||"Banner Title"}</p>
                <p className="text-sm opacity-80 mt-0.5" style={{color:form.textColor}}>{form.subtitle||"Subtitle text"}</p>
              </div>
              <div className="absolute right-4 bottom-4 text-5xl opacity-20 select-none">{form.icon}</div>
            </div>
          </div>

          {/* Section 3: Settings */}
          <div className="medi-card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className={SECTION_HDR+" mb-0"} style={{color:"#1B3A5C"}}>
                <FaCog style={{color:"#C2703A"}} /> Settings
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Sort Order (lower = first)</label>
                <input type="number" value={form.sortOrder} onChange={e=>setForm(p=>({...p,sortOrder:Number(e.target.value)}))} className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <span className="text-xs font-semibold" style={LABEL_STYLE}>Active / Visible</span>
                <Toggle on={form.isActive} toggle={()=>setForm(p=>({...p,isActive:!p.isActive}))} />
                <span className="text-xs" style={{color:form.isActive?"#2E7D32":"#8A6650"}}>{form.isActive?"Visible on homepage":"Hidden"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={save} disabled={saving} className="medi-btn-primary disabled:opacity-60 flex items-center gap-2 px-8">
              {saving?"Saving…":editing?"Update Banner":"Add Banner"}
            </button>
            <button onClick={resetForm} className="medi-btn-accent px-6">Cancel</button>
          </div>
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {banners.map((b,i)=>(
            <motion.div key={b.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="medi-card overflow-hidden">
              <div className="p-5 relative overflow-hidden min-h-[90px]" style={{background:b.color}}>
                <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)"}} />
                {b.badge && <span className="relative text-[10px] font-bold px-2 py-0.5 rounded border border-white/30 bg-white/20 mb-1 inline-block" style={{color:b.textColor}}>{b.badge}</span>}
                <p className="relative font-black text-base leading-snug" style={{color:b.textColor}}>{b.title}</p>
                {b.subtitle && <p className="relative text-xs opacity-80" style={{color:b.textColor}}>{b.subtitle}</p>}
                <div className="absolute right-3 bottom-3 text-4xl opacity-20 select-none">{b.icon}</div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-t" style={{borderColor:"#EEE4D9"}}>
                <div className="flex items-center gap-2">
                  {b.isActive
                    ? <FaEye style={{color:"#2E7D32",fontSize:13}} />
                    : <FaEyeSlash style={{color:"#8A6650",fontSize:13}} />}
                  <span className="text-xs font-semibold" style={{color:b.isActive?"#2E7D32":"#8A6650"}}>{b.isActive?"Active":"Hidden"}</span>
                  <span className="text-xs ml-2" style={{color:"#8A6650"}}>#{b.sortOrder}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>startEdit(b)} className="p-2 rounded-lg" style={{background:"#E3F0FB",color:"#3A6EA5"}}><FaEdit style={{fontSize:12}} /></button>
                  <button onClick={()=>del(b.id)} className="p-2 rounded-lg" style={{background:"#FFEBEE",color:"#C62828"}}><FaTrash style={{fontSize:12}} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {banners.length===0 && (
          <div className="col-span-full text-center py-16 medi-card">
            <FaImage className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#1B3A5C"}} />
            <p style={{color:"#8A6650"}}>No banners yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
