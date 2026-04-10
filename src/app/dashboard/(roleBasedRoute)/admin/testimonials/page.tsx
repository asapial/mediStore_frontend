"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaCommentDots, FaSearch, FaCheck, FaTimes, FaStar, FaTrash } from "react-icons/fa";

interface Testimonial {
  id:string; content:string; rating:number; isApproved:boolean; isFeatured:boolean; createdAt:string;
  user:{id:string;name:string;image?:string};
}

export default function AdminTestimonialsPage() {
  const [items,   setItems]   = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<"all"|"pending"|"approved"|"featured">("pending");

  const load = () => fetch("/api/testimonials/admin/all",{credentials:"include"}).then(r=>r.json()).then(d=>setItems(d.data||[])).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const update = async (id:string, data:Partial<{isApproved:boolean;isFeatured:boolean}>) => {
    const res = await fetch(`/api/testimonials/admin/${id}`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    if (res.ok){ toast.success("Updated"); load(); } else toast.error("Failed");
  };

  const del = async (id:string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/admin/${id}`,{method:"DELETE",credentials:"include"});
    toast.success("Deleted"); load();
  };

  const filtered = items.filter(t=>
    (filter==="all"||(filter==="pending"&&!t.isApproved)||(filter==="approved"&&t.isApproved&&!t.isFeatured)||(filter==="featured"&&t.isFeatured)) &&
    (t.user.name.toLowerCase().includes(search.toLowerCase())||t.content.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingCount = items.filter(t=>!t.isApproved).length;
  const featCount    = items.filter(t=>t.isFeatured).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#1B3A5C"}}>
          <FaCommentDots className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Testimonials</h1>
          <p className="text-sm" style={{color:"#8A6650"}}>{items.length} total · {pendingCount} pending approval · {featCount} featured on homepage</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          {label:"Total",    val:items.length,                              color:"#1B3A5C"},
          {label:"Pending",  val:pendingCount,                              color:"#C2703A"},
          {label:"Approved", val:items.filter(t=>t.isApproved).length,     color:"#2E7D32"},
          {label:"Featured", val:featCount,                                 color:"#8A6650"},
        ].map(s=>(
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{color:s.color}}>{s.val}</p>
            <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {(["all","pending","approved","featured"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="capitalize text-sm px-4 py-1.5 rounded-full font-semibold border transition-colors"
            style={filter===f?{background:"#1B3A5C",color:"#FFF",borderColor:"#1B3A5C"}:{background:"#FFF",color:"#5C4033",borderColor:"#DDD0C4"}}>
            {f} {f==="pending"?`(${pendingCount})`:""}
          </button>
        ))}
        <div className="relative ml-auto">
          <FaSearch className="absolute left-3 top-2.5" style={{color:"#8A6650",fontSize:12}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or content…"
            className="border rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40] w-64"
            style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">{Array.from({length:6}).map((_,i)=><div key={i} className="medi-card h-32 animate-pulse"/>)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
          {filtered.map((t,i)=>(
            <motion.div key={t.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="medi-card p-5"
              style={{borderLeft:`4px solid ${t.isFeatured?"#C2703A":t.isApproved?"#2E7D32":"#DDD0C4"}`}}>
              {/* User row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background:"#F5EDE3"}}>
                  {t.user.image
                    ? <img src={t.user.image} alt="" className="w-full h-full object-cover" />
                    : <span className="font-black text-sm" style={{color:"#C2703A"}}>{t.user.name.charAt(0)}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm" style={{color:"#1B3A5C"}}>{t.user.name}</p>
                    <span className="text-xs" style={{color:"#8A6650"}}>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s=>(
                      <FaStar key={s} style={{fontSize:11,color:s<=t.rating?"#C2703A":"#DDD0C4"}} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Content */}
              <p className="text-sm italic line-clamp-3 mb-3" style={{color:"#5C4033"}}>"{t.content}"</p>
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {t.isFeatured   && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#FFF3E0",color:"#C2703A"}}>⭐ Featured</span>}
                {t.isApproved   && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#E8F5E9",color:"#2E7D32"}}>Approved</span>}
                {!t.isApproved  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#FFF8E1",color:"#92400E"}}>Pending</span>}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t flex-wrap" style={{borderColor:"#EEE4D9"}}>
                {!t.isApproved ? (
                  <button onClick={()=>update(t.id,{isApproved:true})}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{background:"#2E7D32"}}>
                    <FaCheck style={{fontSize:10}} /> Approve
                  </button>
                ) : (
                  <button onClick={()=>update(t.id,{isApproved:false})}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg" style={{background:"#F5EDE3",color:"#8A6650"}}>
                    <FaTimes style={{fontSize:10}} /> Revoke
                  </button>
                )}
                <button onClick={()=>update(t.id,{isFeatured:!t.isFeatured})}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={t.isFeatured?{background:"#FFF3E0",color:"#C2703A"}:{background:"#F5EDE3",color:"#8A6650"}}>
                  {t.isFeatured?"Unfeature":"⭐ Feature"}
                </button>
                <button onClick={()=>del(t.id)} className="ml-auto p-2 rounded-lg" style={{background:"#FFEBEE",color:"#C62828"}}>
                  <FaTrash style={{fontSize:11}} />
                </button>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          {filtered.length===0 && (
            <div className="col-span-full text-center py-16 medi-card">
              <FaCommentDots className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#1B3A5C"}} />
              <p style={{color:"#8A6650"}}>No testimonials found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
