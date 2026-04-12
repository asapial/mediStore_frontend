"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaSearch, FaTrash, FaDownload } from "react-icons/fa";

interface Subscriber { id:string; email:string; name?:string; subscribedAt:string; }

export default function AdminNewsletterPage() {
  const [subs,    setSubs]    = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const load = () => fetch("/api/newsletter",{credentials:"include"}).then(r=>r.json()).then(d=>setSubs(d.data||[])).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const del = async (id:string) => {
    if (!confirm("Remove this subscriber?")) return;
    await fetch(`/api/newsletter/${id}`,{method:"DELETE",credentials:"include"});
    toast.success("Subscriber removed"); load();
  };

  const exportCSV = () => {
    const csv = ["Name,Email,Subscribed At",...subs.map(s=>`"${s.name||""}","${s.email}","${new Date(s.subscribedAt).toLocaleString()}"`)].join("\n");
    const a = document.createElement("a"); a.href=`data:text/csv;charset=utf-8,${encodeURI(csv)}`; a.download="subscribers.csv"; a.click();
  };

  const filtered = subs.filter(s=>
    s.email.toLowerCase().includes(search.toLowerCase())||
    (s.name||"").toLowerCase().includes(search.toLowerCase())
  );

  const thisMonth = subs.filter(s=>new Date(s.subscribedAt).getMonth()===new Date().getMonth()).length;
  const today     = subs.filter(s=>new Date(s.subscribedAt).toDateString()===new Date().toDateString()).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#1B3A5C"}}>
          <FaEnvelope className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Newsletter Subscribers</h1>
          <p className="text-sm" style={{color:"#8A6650"}}>{subs.length} total subscribers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          {label:"Total Subscribers", val:subs.length,   color:"#1B3A5C"},
          {label:"This Month",        val:thisMonth,      color:"#2E7D32"},
          {label:"Today",             val:today,          color:"#C2703A"},
        ].map(s=>(
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{color:s.color}}>{s.val}</p>
            <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Export */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2.5" style={{color:"#8A6650",fontSize:12}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search email or name…"
            className="border rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40] w-72"
            style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
        </div>
        <button onClick={exportCSV}
          className="medi-btn-accent flex items-center gap-2 ml-auto">
          <FaDownload style={{fontSize:12}} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:8}).map((_,i)=><div key={i} className="h-12 rounded-xl animate-pulse" style={{background:"#F5EDE3"}}/>)}</div>
      ) : (
        <div className="medi-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:"1px solid #EEE4D9",background:"#FAF5F0"}}>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase" style={{color:"#8A6650"}}>#</th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase" style={{color:"#8A6650"}}>Name</th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase" style={{color:"#8A6650"}}>Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase" style={{color:"#8A6650"}}>Subscribed</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
              {filtered.map((s,i)=>(
                <motion.tr key={s.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                  style={{borderBottom:"1px solid #EEE4D9"}}
                  className="hover:bg-[#FAF5F0] transition-colors">
                  <td className="px-5 py-3 text-xs" style={{color:"#8A6650"}}>{i+1}</td>
                  <td className="px-5 py-3 font-semibold" style={{color:"#5C4033"}}>
                    {s.name || <span style={{color:"#DDD0C4",fontStyle:"italic"}}>—</span>}
                  </td>
                  <td className="px-5 py-3 font-medium" style={{color:"#1B3A5C"}}>{s.email}</td>
                  <td className="px-5 py-3 text-xs" style={{color:"#8A6650"}}>{new Date(s.subscribedAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={()=>del(s.id)} className="p-1.5 rounded-lg" style={{background:"#FFEBEE",color:"#C62828"}}>
                      <FaTrash style={{fontSize:11}} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
              {filtered.length===0 && (
                <tr><td colSpan={5} className="text-center py-16" style={{color:"#8A6650"}}>
                  <FaEnvelope className="mx-auto text-3xl mb-2 opacity-20" style={{color:"#1B3A5C"}} />
                  No subscribers found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
