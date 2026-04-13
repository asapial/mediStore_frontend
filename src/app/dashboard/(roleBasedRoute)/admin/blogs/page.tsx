"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FaNewspaper, FaSearch, FaTrash, FaEye, FaEdit, FaTimes, FaSave } from "react-icons/fa";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";

/* ─────────── Types ─────────── */
interface Blog {
  id:string; title:string; summary:string; content?:string; slug:string; image?:string; tags:string[];
  isPublished:boolean; isFeatured:boolean; createdAt:string;
  author:{id:string;name:string;image?:string};
}

/* ─────────── imgbb ─────────── */
const IMGBB_KEY = "e91ee091af74018e8539c64488ba645e";
async function uploadToImgbb(file: File): Promise<string> {
  const fd = new FormData(); fd.append("image", file);
  const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("Upload failed");
  return data.data.url as string;
}

/* ─────────── Image upload widget ─────────── */
function ImageUploadField({ value, onChange, label = "Cover Image" }: { value:string; onChange:(u:string)=>void; label?:string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { onChange(await uploadToImgbb(file)); toast.success("Image uploaded!"); }
    catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{color:"#8A6650"}}>{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder="https://… or use Upload"
          className="flex-1 border rounded-lg px-3 py-2 text-sm" style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
        <button type="button" onClick={()=>ref.current?.click()} disabled={uploading}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-bold transition"
          style={{borderColor:"#C2703A",color:"#C2703A",background:"#FFF3E0"}}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Upload className="w-3.5 h-3.5"/>}
          {uploading ? "…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <div className="mt-2 h-28 rounded-xl overflow-hidden relative bg-muted">
          <img src={value} alt="preview" className="w-full h-full object-cover" onError={e=>(e.currentTarget.style.display="none")}/>
          <button type="button" onClick={()=>onChange("")}
            className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70">
            <X className="w-3.5 h-3.5"/>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────── Shared field style ─────────── */
const F_STYLE = {borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"};
const CLS_INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40]";

/* ═════════════════ MAIN PAGE ═════════════════ */
export default function AdminBlogsPage() {
  const [blogs,   setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<"all"|"pending"|"published"|"featured">("all");

  /* edit state */
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [editForm, setEditForm] = useState({ title:"", summary:"", content:"", image:"", tags:"" });
  const [editSaving, setEditSaving] = useState(false);

  const load = () =>
    fetch("/api/blogs/admin/all",{credentials:"include"}).then(r=>r.json()).then(d=>setBlogs(d.data||[])).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const update = async (id:string, data:Partial<{isPublished:boolean;isFeatured:boolean}>) => {
    const res = await fetch(`/api/blogs/admin/${id}`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    if (res.ok){ toast.success("Blog updated"); load(); } else toast.error("Failed");
  };

  const del = async (id:string) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/blogs/admin/${id}`,{method:"DELETE",credentials:"include"});
    toast.success("Blog deleted"); load();
  };

  const openEdit = (b: Blog) => {
    setEditBlog(b);
    setEditForm({ title:b.title, summary:b.summary, content:b.content||"", image:b.image||"", tags:b.tags.join(", ") });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBlog) return;
    setEditSaving(true);
    try {
      const tags = editForm.tags.split(",").map(t=>t.trim()).filter(Boolean);
      const res = await fetch(`/api/blogs/${editBlog.id}`,{
        method:"PUT", credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ title:editForm.title, summary:editForm.summary, content:editForm.content, image:editForm.image||null, tags }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Blog updated successfully");
      setEditBlog(null); load();
    } catch(e:any){ toast.error(e.message); }
    finally { setEditSaving(false); }
  };

  const filtered = blogs.filter(b=>
    (filter==="all"||(filter==="pending"&&!b.isPublished)||(filter==="published"&&b.isPublished&&!b.isFeatured)||(filter==="featured"&&b.isFeatured)) &&
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = blogs.filter(b=>!b.isPublished).length;
  const featCount    = blogs.filter(b=>b.isFeatured).length;

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:"#1B3A5C"}}>
          <FaNewspaper className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#1B3A5C"}}>Blog Management</h1>
          <p className="text-sm" style={{color:"#8A6650"}}>{blogs.length} total · {pendingCount} pending · {featCount} featured on homepage</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {[
          {label:"Total",     val:blogs.length,                                 color:"#1B3A5C"},
          {label:"Pending",   val:pendingCount,                                 color:"#C2703A"},
          {label:"Published", val:blogs.filter(b=>b.isPublished).length,        color:"#2E7D32"},
          {label:"Featured",  val:featCount,                                    color:"#8A6650"},
        ].map(s=>(
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-3xl font-black" style={{color:s.color}}>{s.val}</p>
            <p className="text-xs font-semibold uppercase mt-1" style={{color:"#8A6650"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3 mb-5">
        {(["all","pending","published","featured"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="capitalize text-sm px-4 py-1.5 rounded-full font-semibold border transition-colors"
            style={filter===f?{background:"#1B3A5C",color:"#FFF",borderColor:"#1B3A5C"}:{background:"#FFF",color:"#5C4033",borderColor:"#DDD0C4"}}>
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <FaSearch className="absolute left-3 top-2.5" style={{color:"#8A6650",fontSize:12}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search blog titles…"
            className="border rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2703A40] w-60"
            style={{borderColor:"#DDD0C4",background:"#FFF",color:"#5C4033"}} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="medi-card h-20 animate-pulse"/>)}</div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
          {filtered.map((b,i)=>(
            <motion.div key={b.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
              className="medi-card p-4 flex gap-4 items-center flex-wrap"
              style={{borderLeft:`4px solid ${b.isFeatured?"#C2703A":b.isPublished?"#2E7D32":"#DDD0C4"}`}}>
              {b.image && <img src={b.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-bold truncate" style={{color:"#1B3A5C"}}>{b.title}</p>
                  {b.isFeatured  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#FFF3E0",color:"#C2703A"}}>⭐ Featured</span>}
                  {b.isPublished && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#E8F5E9",color:"#2E7D32"}}>Published</span>}
                  {!b.isPublished && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#FFF8E1",color:"#C2703A"}}>Pending Review</span>}
                </div>
                <p className="text-xs" style={{color:"#8A6650"}}>by {b.author.name} · {new Date(b.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {b.tags.map(t=><span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{background:"#F5EDE3",color:"#8A6650"}}>{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <a href={`/blog/${b.slug}`} target="_blank"
                  className="p-2 rounded-lg" style={{background:"#E3F0FB",color:"#3A6EA5"}} title="Preview blog">
                  <FaEye style={{fontSize:12}} />
                </a>
                {/* Edit button */}
                <button onClick={()=>openEdit(b)}
                  className="p-2 rounded-lg" style={{background:"#E8EBF5",color:"#3A5EA5"}} title="Edit blog content">
                  <FaEdit style={{fontSize:12}} />
                </button>
                <button onClick={()=>update(b.id,{isPublished:!b.isPublished})}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={b.isPublished?{background:"#F5EDE3",color:"#8A6650"}:{background:"#E8F5E9",color:"#2E7D32"}}>
                  {b.isPublished?"Unpublish":"Publish"}
                </button>
                <button onClick={()=>update(b.id,{isFeatured:!b.isFeatured})}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={b.isFeatured?{background:"#FFF3E0",color:"#C2703A"}:{background:"#F5EDE3",color:"#8A6650"}}>
                  {b.isFeatured?"Unfeature":"⭐ Feature"}
                </button>
                <button onClick={()=>del(b.id)} className="p-2 rounded-lg" style={{background:"#FFEBEE",color:"#C62828"}}>
                  <FaTrash style={{fontSize:12}} />
                </button>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          {filtered.length===0 && (
            <div className="text-center py-16 medi-card">
              <FaNewspaper className="mx-auto text-4xl mb-3 opacity-20" style={{color:"#1B3A5C"}} />
              <p style={{color:"#8A6650"}}>No blog posts found</p>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {editBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{background:"#1B3A5C"}}>
              <div className="flex items-center gap-2 text-white font-bold">
                <FaEdit /> Edit Blog Post
              </div>
              <button onClick={()=>setEditBlog(null)} className="text-white/70 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{color:"#8A6650"}}>Title *</label>
                <input value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))}
                  className={CLS_INPUT} style={F_STYLE} required />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{color:"#8A6650"}}>Summary *</label>
                <textarea value={editForm.summary} onChange={e=>setEditForm(p=>({...p,summary:e.target.value}))}
                  rows={3} className={`${CLS_INPUT} resize-none`} style={F_STYLE} required />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{color:"#8A6650"}}>Content *</label>
                <textarea value={editForm.content} onChange={e=>setEditForm(p=>({...p,content:e.target.value}))}
                  rows={12} className={`${CLS_INPUT} resize-none`} style={F_STYLE} required />
              </div>
              {/* imgbb image upload */}
              <ImageUploadField
                value={editForm.image}
                onChange={url=>setEditForm(p=>({...p,image:url}))}
                label="Cover Image (upload or paste URL)"
              />
              <div>
                <label className="text-xs font-semibold block mb-1" style={{color:"#8A6650"}}>Tags (comma-separated)</label>
                <input value={editForm.tags} onChange={e=>setEditForm(p=>({...p,tags:e.target.value}))}
                  className={CLS_INPUT} style={F_STYLE} />
              </div>

              <div className="flex gap-3 pt-2 flex-wrap">
                <button type="submit" disabled={editSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60"
                  style={{background:"#1B3A5C"}}>
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <FaSave />}
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" onClick={()=>setEditBlog(null)}
                  className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors"
                  style={{borderColor:"#DDD0C4",color:"#5C4033"}}>
                  Cancel
                </button>
                <p className="text-xs self-center" style={{color:"#8A6650"}}>
                  ℹ️ Admin edits do not require re-approval
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
