"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaSearch, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FlashSale {
  id:string; originalPrice:number; discountPrice:number; saleStock:number; soldCount:number;
  startAt:string; endAt:string; isApproved:boolean; adminNote?:string; createdAt:string;
  medicine:{id:string;name:string;image?:string;price:number};
  seller:{id:string;name:string;email:string};
}

export default function AdminFlashSalePage() {
  const [sales,    setSales]    = useState<FlashSale[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all"|"pending"|"approved">("pending");
  const [notes,    setNotes]    = useState<Record<string,string>>({});
  const [removing, setRemoving] = useState<string | null>(null);

  // AlertDialog state — stores the target sale to confirm removal
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const load = () =>
    fetch("/api/flash-sales/admin/all", { credentials: "include" })
      .then(r => r.json())
      .then(d => setSales(d.data || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const decide = async (id: string, approved: boolean) => {
    const res = await fetch(`/api/flash-sales/admin/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: approved, adminNote: notes[id] || "" }),
    });
    if (res.ok) { toast.success(approved ? "Flash sale approved!" : "Rejected"); load(); }
    else toast.error("Failed");
  };

  const confirmRemove = async () => {
    if (!confirmTarget) return;
    const { id } = confirmTarget;
    setConfirmTarget(null);
    setRemoving(id);
    try {
      const res = await fetch(`/api/flash-sales/admin/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Flash sale removed");
      setSales(prev => prev.filter(s => s.id !== id));
    } catch {
      toast.error("Could not remove flash sale");
    } finally {
      setRemoving(null);
    }
  };

  const pct = (o: number, d: number) => Math.round(((o - d) / o) * 100);
  const filtered = sales.filter(s =>
    (filter === "all" || (filter === "pending" && !s.isApproved) || (filter === "approved" && s.isApproved)) &&
    (s.medicine.name.toLowerCase().includes(search.toLowerCase()) || s.seller.name.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingCount = sales.filter(s => !s.isApproved).length;

  return (
    <div className="medi-page">

      {/* ── Shadcn AlertDialog (confirm removal) ───────────────────────────── */}
      <AlertDialog open={!!confirmTarget} onOpenChange={open => { if (!open) setConfirmTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Flash Sale?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently remove{" "}
              <strong className="text-foreground">&ldquo;{confirmTarget?.name}&rdquo;</strong>{" "}
              from flash sales. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
            >
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#C62828"}}>
          <FaBolt className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Flash Sale Approvals</h1>
          <p className="text-sm" style={{color:"#8A6650"}}>{pendingCount} pending review · {sales.filter(s=>s.isApproved).length} approved</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          {label:"Total Submissions", val:sales.length,                           color:"#1B3A5C"},
          {label:"Pending Approval",  val:pendingCount,                            color:"#C2703A"},
          {label:"Approved / Live",   val:sales.filter(s=>s.isApproved).length,   color:"#2E7D32"},
        ].map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{color:s.color}}>{s.val}</p>
            <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {(["all","pending","approved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="capitalize text-sm px-4 py-1.5 rounded-full font-semibold border transition-colors"
            style={filter===f ? {background:"#1B3A5C",color:"#FFF",borderColor:"#1B3A5C"} : {background:"#FFF",color:"#5C4033",borderColor:"#DDD0C4"}}>
            {f} {f==="pending" ? `(${pendingCount})` : ""}
          </button>
        ))}
        <div className="relative ml-auto">
          <FaSearch className="absolute left-3 top-2.5" style={{color:"#8A6650",fontSize:12}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search medicine or seller…"
            className="border rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40] w-64"
            style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="medi-card h-24 animate-pulse"/>)}</div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
          {filtered.map((s, i) => {
            const discPct     = pct(s.originalPrice, s.discountPrice);
            const isLive      = s.isApproved && new Date(s.endAt) > new Date();
            const saleStatus  = s.isApproved ? (isLive ? "Live" : "Ended") : "Pending";
            const statusStyle = isLive
              ? {bg:"#E8F5E9",color:"#2E7D32"}
              : s.isApproved
                ? {bg:"#F3F4F6",color:"#6B7280"}
                : {bg:"#FFF8E1",color:"#92400E"};

            return (
              <motion.div key={s.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className="medi-card p-5" style={{borderLeft:`4px solid ${s.isApproved?"#2E7D32":"#C2703A"}`}}>
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Medicine thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background:"#F5EDE3"}}>
                    {s.medicine.image ? <img src={s.medicine.image} alt="" className="w-full h-full object-cover"/> : <span className="text-2xl">💊</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold" style={{color:"#1B3A5C"}}>{s.medicine.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:statusStyle.bg,color:statusStyle.color}}>{saleStatus}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{background:"#FFEBEE",color:"#C62828"}}>-{discPct}%</span>
                    </div>
                    <p className="text-sm" style={{color:"#8A6650"}}>by <strong style={{color:"#5C4033"}}>{s.seller.name}</strong> · {s.seller.email}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{color:"#8A6650"}}>
                      <span>Original: <strong style={{color:"#5C4033"}}>${s.originalPrice.toFixed(2)}</strong></span>
                      <span>Sale price: <strong style={{color:"#C62828"}}>${s.discountPrice.toFixed(2)}</strong></span>
                      <span>Stock: <strong style={{color:"#5C4033"}}>{s.saleStock}</strong></span>
                      <span>Sold: <strong style={{color:"#5C4033"}}>{s.soldCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-xs mt-1" style={{color:"#8A6650"}}>
                      🕐 {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleString()}
                    </div>
                    {s.adminNote && <p className="text-xs mt-1 italic" style={{color:"#8A6650"}}>Note: {s.adminNote}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[220px]">
                    {!s.isApproved && (
                      <>
                        <label className="text-xs font-semibold" style={{color:"#5C4033"}}>Admin Note (optional)</label>
                        <input value={notes[s.id]||""} onChange={e=>setNotes(p=>({...p,[s.id]:e.target.value}))}
                          placeholder="Reason for approve/reject…"
                          className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C2703A40]"
                          style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
                        <div className="flex gap-2">
                          <button onClick={() => decide(s.id, true)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-bold text-xs text-white"
                            style={{background:"#2E7D32"}}><FaCheck/> Approve</button>
                          <button onClick={() => decide(s.id, false)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-bold text-xs text-white"
                            style={{background:"#C62828"}}><FaTimes/> Reject</button>
                        </div>
                      </>
                    )}

                    {/* Remove — opens AlertDialog */}
                    <button
                      onClick={() => setConfirmTarget({ id: s.id, name: s.medicine.name })}
                      disabled={removing === s.id}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs disabled:opacity-50 transition-opacity hover:opacity-80"
                      style={{background:"#FFEBEE", color:"#C62828", border:"1px solid #C62828"}}>
                      <FaTrash className="text-[10px]"/>
                      {removing === s.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 medi-card">
              <FaBolt className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#C62828"}} />
              <p style={{color:"#8A6650"}}>No flash sales found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
