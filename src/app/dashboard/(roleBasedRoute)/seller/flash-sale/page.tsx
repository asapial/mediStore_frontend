"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaPlus, FaTrash, FaClipboardList, FaCheckCircle } from "react-icons/fa";

interface Medicine { id:string; name:string; price:number; stock:number; image?:string; }
interface FlashSale {
  id:string; originalPrice:number; discountPrice:number; saleStock:number; soldCount:number;
  startAt:string; endAt:string; isApproved:boolean; adminNote?:string; createdAt:string;
  medicine:{id:string;name:string;image?:string;price:number};
}

const FIELD_STYLE = { borderColor:"#DDD0C4", background:"#FFF", color:"#5C4033" };
const LABEL_STYLE = { color:"#5C4033" };
const INPUT_CLS   = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40]";
const SECTION_HDR = "flex items-center gap-2 font-bold text-base mb-4";
const EMPTY = { medicineId:"", discountPrice:"", saleStock:"", startAt:"", endAt:"" };

export default function SellerFlashSalePage() {
  const [sales,    setSales]    = useState<FlashSale[]>([]);
  const [meds,     setMeds]     = useState<Medicine[]>([]);
  const [form,     setForm]     = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  const loadSales = () => fetch("/api/flash-sales/my",{credentials:"include"}).then(r=>r.json()).then(d=>setSales(d.data||[]));
  const loadMeds  = () => fetch("/api/medicines/own",{credentials:"include"}).then(r=>r.json()).then(d=>setMeds(d.data?.medicines||d.data||[]));
  useEffect(()=>{ loadSales(); loadMeds(); },[]);

  const selMed  = meds.find(m=>m.id===form.medicineId);
  const discPct = selMed&&form.discountPrice ? Math.round(((selMed.price-Number(form.discountPrice))/selMed.price)*100) : 0;

  const submit = async () => {
    if (!form.medicineId||!form.discountPrice||!form.saleStock||!form.startAt||!form.endAt) { toast.error("All fields required"); return; }
    if (Number(form.discountPrice)>=(selMed?.price??Infinity)) { toast.error("Discount price must be less than original price"); return; }
    if (Number(form.saleStock)>(selMed?.stock??0)) { toast.error(`Not enough stock (available: ${selMed?.stock})`); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/flash-sales",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        medicineId:form.medicineId,discountPrice:Number(form.discountPrice),saleStock:Number(form.saleStock),
        startAt:new Date(form.startAt).toISOString(),endAt:new Date(form.endAt).toISOString(),
      })});
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Flash sale submitted for admin approval!");
      setDone(true); setForm(EMPTY); setShowForm(false); loadSales();
    } catch(e:any){ toast.error(e.message); } finally{ setSaving(false); }
  };

  const cancel = async (id:string) => {
    if (!confirm("Cancel this flash sale?")) return;
    await fetch(`/api/flash-sales/${id}`,{method:"DELETE",credentials:"include"});
    toast.success("Flash sale cancelled"); loadSales();
  };

  const statusOf = (s:FlashSale) => {
    if (s.isApproved&&new Date(s.endAt)>new Date()) return {label:"Live",style:{background:"#E8F5E9",color:"#2E7D32"}};
    if (s.isApproved)                              return {label:"Ended",style:{background:"#F3F4F6",color:"#6B7280"}};
    return {label:"Pending Approval",style:{background:"#FFF8E1",color:"#92400E"}};
  };

  const liveCount    = sales.filter(s=>s.isApproved&&new Date(s.endAt)>new Date()).length;
  const pendingCount = sales.filter(s=>!s.isApproved).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#C62828"}}>
            <FaBolt className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>My Flash Sales</h1>
            <p className="text-sm" style={{color:"#8A6650"}}>Submit products for flash sales — admin will review and approve</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={()=>{setShowForm(true);setDone(false);setForm(EMPTY);}} className="medi-btn-primary flex items-center gap-2">
            <FaPlus /> Create Flash Sale
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          {label:"Total Submissions", val:sales.length,   color:"#1B3A5C"},
          {label:"Live Now",          val:liveCount,       color:"#2E7D32"},
          {label:"Pending Approval",  val:pendingCount,    color:"#C2703A"},
        ].map(s=>(
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{color:s.color}}>{s.val}</p>
            <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {done && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="flex items-center gap-3 rounded-xl p-4 mb-6"
          style={{background:"#E8F5E9",border:"1px solid #2E7D32"}}>
          <FaCheckCircle style={{color:"#2E7D32",fontSize:20}} />
          <p className="font-semibold text-sm" style={{color:"#2E7D32"}}>Flash sale submitted! It will go live once admin approves.</p>
          <button className="ml-auto text-xs underline" style={{color:"#2E7D32"}} onClick={()=>setDone(false)}>Dismiss</button>
        </motion.div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="space-y-5 mb-8">
          {/* Section 1: Medicine selection */}
          <div className="medi-card p-6">
            <p className={SECTION_HDR} style={{color:"#1B3A5C"}}>
              <FaBolt style={{color:"#C62828"}} /> Select Medicine
            </p>
            <div>
              <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Medicine *</label>
              <select value={form.medicineId} onChange={e=>setForm(p=>({...p,medicineId:e.target.value}))} className={INPUT_CLS} style={FIELD_STYLE}>
                <option value="">Choose a medicine from your listings…</option>
                {meds.map(m=><option key={m.id} value={m.id}>{m.name} — ${m.price.toFixed(2)} (Stock: {m.stock})</option>)}
              </select>
            </div>
            {selMed && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                className="mt-4 flex items-center gap-4 p-4 rounded-xl" style={{background:"#F5EDE3",border:"1px solid #DDD0C4"}}>
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background:"#EEE4D9"}}>
                  {selMed.image?<img src={selMed.image} alt="" className="w-full h-full object-cover"/>:<span className="text-2xl">💊</span>}
                </div>
                <div>
                  <p className="font-bold" style={{color:"#1B3A5C"}}>{selMed.name}</p>
                  <p className="text-sm" style={{color:"#8A6650"}}>Original price: <strong style={{color:"#5C4033"}}>${selMed.price.toFixed(2)}</strong> · Available stock: <strong style={{color:"#5C4033"}}>{selMed.stock}</strong></p>
                </div>
                {discPct>0 && <span className="ml-auto font-black text-xl" style={{color:"#C62828"}}>-{discPct}%</span>}
              </motion.div>
            )}
          </div>

          {/* Section 2: Pricing & Stock */}
          <div className="medi-card p-6">
            <p className={SECTION_HDR} style={{color:"#1B3A5C"}}>
              <FaClipboardList style={{color:"#C2703A"}} /> Pricing & Stock
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Discounted Price ($) *</label>
                <input type="number" step="0.01" min="0" value={form.discountPrice}
                  onChange={e=>setForm(p=>({...p,discountPrice:e.target.value}))}
                  placeholder="e.g. 4.99" className={INPUT_CLS} style={FIELD_STYLE} />
                {selMed&&form.discountPrice&&<p className="text-xs mt-1" style={{color:discPct>0?"#2E7D32":"#C62828"}}>{discPct>0?`${discPct}% discount off original price`:"Price must be lower than original"}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Sale Stock Quantity *</label>
                <input type="number" min="1" value={form.saleStock}
                  onChange={e=>setForm(p=>({...p,saleStock:e.target.value}))}
                  placeholder="Units reserved for this sale" className={INPUT_CLS} style={FIELD_STYLE} />
                {selMed&&form.saleStock&&Number(form.saleStock)>selMed.stock&&<p className="text-xs mt-1" style={{color:"#C62828"}}>Exceeds available stock ({selMed.stock})</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="medi-card p-6">
            <p className={SECTION_HDR} style={{color:"#1B3A5C"}}>
              <FaBolt style={{color:"#C2703A"}} /> Sale Timeline
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>Start Date & Time *</label>
                <input type="datetime-local" value={form.startAt} onChange={e=>setForm(p=>({...p,startAt:e.target.value}))} className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={LABEL_STYLE}>End Date & Time *</label>
                <input type="datetime-local" value={form.endAt} onChange={e=>setForm(p=>({...p,endAt:e.target.value}))} className={INPUT_CLS} style={FIELD_STYLE} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button onClick={submit} disabled={saving} className="medi-btn-primary disabled:opacity-60 flex items-center gap-2 px-8">
              {saving?"Submitting…":"Submit for Approval"}
            </button>
            <button onClick={()=>{setShowForm(false);setForm(EMPTY);}} className="medi-btn-accent px-6">Cancel</button>
            <p className="text-xs" style={{color:"#8A6650"}}>Admin will review and approve before it goes live</p>
          </div>
        </div>
      )}

      {/* My Sales list */}
      <div className="space-y-4">
        <AnimatePresence>
        {sales.length===0 ? (
          <div className="text-center py-16 medi-card">
            <FaBolt className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#C62828"}} />
            <p style={{color:"#8A6650"}}>No flash sales yet. Create your first one!</p>
          </div>
        ) : sales.map((s,i)=>{
          const st      = statusOf(s);
          const discPct = Math.round(((s.originalPrice-s.discountPrice)/s.originalPrice)*100);
          return (
            <motion.div key={s.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="medi-card p-5" style={{borderLeft:`4px solid ${s.isApproved?"#2E7D32":"#C2703A"}`}}>
              <div className="flex flex-wrap gap-4 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background:"#F5EDE3"}}>
                  {s.medicine.image?<img src={s.medicine.image} alt="" className="w-full h-full object-cover"/>:<span className="text-2xl">💊</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold" style={{color:"#1B3A5C"}}>{s.medicine.name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={st.style}>{st.label}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{background:"#FFEBEE",color:"#C62828"}}>-{discPct}%</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{color:"#8A6650"}}>
                    <span>Original: <strong style={{color:"#5C4033"}}>${s.originalPrice.toFixed(2)}</strong></span>
                    <span>Sale: <strong style={{color:"#C62828"}}>${s.discountPrice.toFixed(2)}</strong></span>
                    <span>Stock: <strong style={{color:"#5C4033"}}>{s.saleStock}</strong> · Sold: <strong style={{color:"#5C4033"}}>{s.soldCount}</strong></span>
                  </div>
                  <p className="text-xs mt-1" style={{color:"#8A6650"}}>
                    🕐 {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleString()}
                  </p>
                  {s.adminNote && <p className="text-xs mt-1 italic" style={{color:"#C2703A"}}>Admin: {s.adminNote}</p>}
                </div>
                {!s.isApproved && (
                  <button onClick={()=>cancel(s.id)} className="p-2 rounded-lg flex-shrink-0" style={{background:"#FFEBEE",color:"#C62828"}}>
                    <FaTrash style={{fontSize:13}} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
}
