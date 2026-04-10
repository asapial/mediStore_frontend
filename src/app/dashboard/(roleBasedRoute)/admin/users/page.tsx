"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers, FaSearch, FaUserEdit, FaUserSlash, FaUserCheck,
  FaChevronLeft, FaChevronRight, FaSave, FaTimes, FaShieldAlt,
} from "react-icons/fa";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";
interface User {
  id: string; name: string; email: string; image: string | null;
  role: Role; isBanned: boolean; createdAt: string;
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "#C62828", SELLER: "#3A6EA5", CUSTOMER: "#2E7D32",
};
const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<User[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [page,       setPage]       = useState(1);
  const [editing,    setEditing]    = useState<User | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [banning,    setBanning]    = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.data || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const toggleBan = async (u: User) => {
    setBanning(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}/ban`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban: !u.isBanned }),
      });
      if (!res.ok) throw new Error();
      toast.success(u.isBanned ? "User unbanned" : "User banned");
      setUsers(p => p.map(x => x.id === u.id ? { ...x, isBanned: !u.isBanned } : x));
    } catch { toast.error("Action failed"); }
    finally { setBanning(null); }
  };

  const saveUser = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, role: editing.role }),
      });
      if (!res.ok) throw new Error();
      toast.success("User updated");
      setUsers(p => p.map(x => x.id === editing.id ? { ...x, name: editing.name, role: editing.role } : x));
      setEditing(null);
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  // Filter
  const filtered = users.filter(u => {
    const matchRole   = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = [
    { label: "Total",     val: users.length,                           color: "#1B3A5C" },
    { label: "Admins",    val: users.filter(u => u.role === "ADMIN").length,    color: "#C62828" },
    { label: "Sellers",   val: users.filter(u => u.role === "SELLER").length,   color: "#3A6EA5" },
    { label: "Customers", val: users.filter(u => u.role === "CUSTOMER").length, color: "#2E7D32" },
    { label: "Banned",    val: users.filter(u => u.isBanned).length,           color: "#C2703A" },
  ];

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <FaUsers className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Manage Users</h1>
          <p className="text-sm" style={{ color: "#8A6650" }}>{users.length} registered users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-7">
        {stats.map(s => (
          <div key={s.label} className="medi-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs uppercase font-semibold mt-1" style={{ color: "#8A6650" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <FaSearch className="absolute left-3 top-3" style={{ color: "#8A6650", fontSize: 12 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full border rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
        </div>
        <div className="flex gap-2">
          {(["ALL", "CUSTOMER", "SELLER", "ADMIN"] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: roleFilter === r ? (r === "ALL" ? "#1B3A5C" : ROLE_COLORS[r as Role] || "#1B3A5C") : "#F5EDE3",
                color: roleFilter === r ? "#FFF" : "#5C4033",
                border: "1px solid #DDD0C4",
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-16" style={{ color: "#8A6650" }}>Loading users…</p>
      ) : paged.length === 0 ? (
        <div className="text-center py-16 medi-card">
          <FaUsers className="mx-auto text-5xl mb-3 opacity-20" style={{ color: "#1B3A5C" }} />
          <p style={{ color: "#8A6650" }}>No users found.</p>
        </div>
      ) : (
        <>
          <div className="medi-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wide"
              style={{ background: "#F5EDE3", color: "#8A6650", borderBottom: "1px solid #DDD0C4" }}>
              <div className="col-span-4">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <AnimatePresence>
              {paged.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-12 gap-2 px-5 py-3 items-center"
                  style={{
                    borderBottom: i < paged.length - 1 ? "1px solid #EEE4D9" : "none",
                    background: u.isBanned ? "#FFF5F5" : "transparent",
                  }}>

                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3">
                    <img src={u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1B3A5C&color=fff&size=40`}
                      alt={u.name} className="w-9 h-9 rounded-full flex-shrink-0 object-cover" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "#1B3A5C" }}>{u.name}</p>
                      <p className="text-xs" style={{ color: "#8A6650" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3 text-xs truncate" style={{ color: "#5C4033" }}>{u.email}</div>

                  {/* Role badge */}
                  <div className="col-span-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: ROLE_COLORS[u.role] + "18", color: ROLE_COLORS[u.role] }}>
                      {u.role === "ADMIN" && <FaShieldAlt className="inline mr-1" style={{ fontSize: 10 }} />}
                      {u.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`badge-${u.isBanned ? "rejected" : "instock"}`} style={{ fontSize: "0.65rem" }}>
                      {u.isBanned ? "Banned" : "Active"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => setEditing({ ...u })}
                      className="p-2 rounded-lg transition" title="Edit"
                      style={{ background: "#E3F0FB", color: "#3A6EA5" }}>
                      <FaUserEdit style={{ fontSize: 13 }} />
                    </button>
                    <button onClick={() => toggleBan(u)} disabled={banning === u.id}
                      title={u.isBanned ? "Unban" : "Ban"}
                      className="p-2 rounded-lg transition disabled:opacity-40"
                      style={{ background: u.isBanned ? "#E8F5E9" : "#FFEBEE", color: u.isBanned ? "#2E7D32" : "#C62828" }}>
                      {u.isBanned ? <FaUserCheck style={{ fontSize: 13 }} /> : <FaUserSlash style={{ fontSize: 13 }} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm" style={{ color: "#8A6650" }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg disabled:opacity-40"
                style={{ background: "#F5EDE3", color: "#5C4033" }}>
                <FaChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) => n === "..." ? (
                  <span key={`e${i}`} className="text-sm px-1" style={{ color: "#8A6650" }}>…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n as number)}
                    className="w-8 h-8 rounded-lg text-sm font-semibold"
                    style={{
                      background: page === n ? "#1B3A5C" : "#F5EDE3",
                      color: page === n ? "#FFF" : "#5C4033",
                    }}>{n}</button>
                ))
              }
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg disabled:opacity-40"
                style={{ background: "#F5EDE3", color: "#5C4033" }}>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={e => e.target === e.currentTarget && setEditing(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="medi-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: "#1B3A5C" }}>Edit User</h2>
                <button onClick={() => setEditing(null)} style={{ color: "#8A6650" }}><FaTimes /></button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-3 mb-5">
                <img src={editing.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(editing.name)}&background=1B3A5C&color=fff&size=80`}
                  alt={editing.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold" style={{ color: "#1B3A5C" }}>{editing.name}</p>
                  <p className="text-xs" style={{ color: "#8A6650" }}>{editing.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Display Name</label>
                  <input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm"
                    style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#5C4033" }}>Role</label>
                  <select value={editing.role} onChange={e => setEditing(p => p ? { ...p, role: e.target.value as Role } : p)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm"
                    style={{ borderColor: "#DDD0C4", background: "#FFF", color: "#5C4033" }}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveUser} disabled={saving}
                    className="flex-1 medi-btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                    <FaSave /> {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "#F5EDE3", color: "#5C4033", border: "1px solid #DDD0C4" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
