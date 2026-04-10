"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface Medicine {
  id:string; name:string; image?:string; price:number; stock:number; isFeatured:boolean; manufacturer:string;
  category:{id:string;name:string};
  seller:{id:string;name:string;email:string};
  reviews?:{rating:number}[];
}

const avgRating = (reviews?: {rating:number}[]) => {
  if (!reviews || reviews.length === 0) return 0;
  return reviews.reduce((s,r)=>s+r.rating, 0) / reviews.length;
};

export default function AdminFeaturedProductsPage() {
  const [meds,     setMeds]     = useState<Medicine[]>([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState<string|null>(null);
  const [filter,   setFilter]   = useState<"all"|"featured"|"unfeatured">("all");

  useEffect(()=>{
    fetch("/api/medicines",{credentials:"include"})
      .then(r=>r.json())
      .then(d=>setMeds(d.data?.medicines||d.data||[]))
      .finally(()=>setLoading(false));
  },[]);

  const toggle = async (m:Medicine) => {
    setToggling(m.id);
    const res = await fetch(`/api/medicines/${m.id}/feature`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({isFeatured:!m.isFeatured})});
    if (res.ok) {
      setMeds(prev=>prev.map(x=>x.id===m.id?{...x,isFeatured:!x.isFeatured}:x));
      toast.success(m.isFeatured?"Removed from featured":"Added to featured!");
    } else { toast.error("Failed to update"); }
    setToggling(null);
  };

  const filtered = meds.filter(m=>
    (filter==="all"||(filter==="featured"&&m.isFeatured)||(filter==="unfeatured"&&!m.isFeatured)) &&
    (m.name.toLowerCase().includes(search.toLowerCase())||m.seller.name.toLowerCase().includes(search.toLowerCase())||m.category.name.toLowerCase().includes(search.toLowerCase()))
  );

  const featuredCount = meds.filter(m=>m.isFeatured).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#1B3A5C"}}>
          <FaStar className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Featured Products</h1>
          <p className="text-sm" style={{color:"#8A6650"}}>Toggle products to appear in the homepage featured section</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{color:"#1B3A5C"}}>{meds.length}</p>
          <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>Total Medicines</p>
        </div>
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{color:"#C2703A"}}>{featuredCount}</p>
          <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>Featured</p>
        </div>
        <div className="medi-card p-4 text-center">
          <p className="text-3xl font-black" style={{color:"#8A6650"}}>{meds.length-featuredCount}</p>
          <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>Not Featured</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {(["all","featured","unfeatured"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="capitalize text-sm px-4 py-1.5 rounded-full font-semibold border transition-colors"
            style={filter===f?{background:"#1B3A5C",color:"#FFF",borderColor:"#1B3A5C"}:{background:"#FFF",color:"#5C4033",borderColor:"#DDD0C4"}}>
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <FaSearch className="absolute left-3 top-2.5" style={{color:"#8A6650",fontSize:12}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search medicines, sellers, categories…"
            className="border rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40] w-72"
            style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i)=><div key={i} className="medi-card h-28 animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
          {filtered.map((m,i)=>{
            const rating = avgRating(m.reviews);
            return (
              <motion.div key={m.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}
                className="medi-card p-4 transition-all"
                style={m.isFeatured?{borderColor:"#C2703A",borderWidth:2,background:"#FFF9F5"}:{}}>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center" style={{background:"#F5EDE3"}}>
                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">💊</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{color:"#1B3A5C"}}>{m.name}</p>
                        <p className="text-xs" style={{color:"#8A6650"}}>by {m.seller.name}</p>
                        <p className="text-xs" style={{color:"#8A6650"}}>{m.category.name} · stock: {m.stock}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-sm" style={{color:"#2E7D32"}}>${m.price.toFixed(2)}</span>
                          {rating > 0 && <span className="text-xs" style={{color:"#C2703A"}}>★ {rating.toFixed(1)}</span>}
                        </div>
                      </div>
                      <button onClick={()=>toggle(m)} disabled={toggling===m.id}
                        className="text-2xl flex-shrink-0 disabled:opacity-40 transition-transform hover:scale-110">
                        {m.isFeatured
                          ? <FaToggleOn style={{color:"#C2703A"}} />
                          : <FaToggleOff style={{color:"#DDD0C4"}} />}
                      </button>
                    </div>
                    <p className="text-[10px] truncate mt-0.5" style={{color:"#8A6650"}}>{m.seller.email}</p>
                  </div>
                </div>
                {m.isFeatured && (
                  <div className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{background:"#FFF3E0",color:"#C2703A"}}>⭐ Shown on Homepage</div>
                )}
              </motion.div>
            );
          })}
          </AnimatePresence>
          {filtered.length===0 && (
            <div className="col-span-full text-center py-16 medi-card">
              <FaStar className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#1B3A5C"}} />
              <p style={{color:"#8A6650"}}>No medicines found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
