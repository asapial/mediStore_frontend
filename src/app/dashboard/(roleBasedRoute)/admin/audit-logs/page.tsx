"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaHistory, FaSearch, FaDownload, FaSpinner, FaFilter } from "react-icons/fa";

interface AuditLog {
  id: string; action: string; entity: string; entityId?: string;
  actor: string; actorRole: string; metadata?: string;
  createdAt: string; ipAddress?: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "#2E7D32", UPDATE: "#3A6EA5", DELETE: "#C62828",
  APPROVE: "#2E7D32", REJECT: "#C62828", LOGIN: "#C2703A", LOGOUT: "#8A6650",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/audit-logs", { credentials: "include" })
      .then(r => r.json()).then(d => setLogs(d.data || []))
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !search || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q);
    const matchAction = actionFilter === "ALL" || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const exportCSV = () => {
    const rows = [
      ["Time", "Action", "Entity", "Entity ID", "Actor", "Role", "IP"],
      ...filtered.map(l => [new Date(l.createdAt).toLocaleString(), l.action, l.entity, l.entityId || "", l.actor, l.actorRole, l.ipAddress || ""])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit_logs.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported");
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#5C4033" }}>
            <FaHistory className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Audit Logs</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Chronological record of all admin and system actions</p>
          </div>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "#1B3A5C20", color: "#1B3A5C" }}>
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-3 text-xs" style={{ color: "#8A6650" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search action, entity, or actor…"
            className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#DDD0C4", color: "#1B3A5C" }} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <FaFilter style={{ color: "#8A6650" }} />
          <button onClick={() => setActionFilter("ALL")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
            style={{ background: actionFilter === "ALL" ? "#1B3A5C" : "#EEE4D9", color: actionFilter === "ALL" ? "#FFF" : "#5C4033" }}>
            ALL
          </button>
          {uniqueActions.map(a => (
            <button key={a} onClick={() => setActionFilter(a)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
              style={{ background: actionFilter === a ? (ACTION_COLORS[a] || "#1B3A5C") : "#EEE4D9", color: actionFilter === a ? "#FFF" : "#5C4033" }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="medi-card p-4 mb-4 text-sm" style={{ color: "#8A6650" }}>
        Showing <strong style={{ color: "#1B3A5C" }}>{filtered.length}</strong> of {logs.length} total log entries
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="text-3xl animate-spin" style={{ color: "#5C4033" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="medi-card text-center py-16">
          <FaHistory className="mx-auto text-4xl mb-3 opacity-20" style={{ color: "#5C4033" }} />
          <p style={{ color: "#8A6650" }}>No audit log entries found</p>
        </div>
      ) : (
        <div className="medi-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#F5EDE3" }}>
                <tr>
                  {["Time", "Action", "Entity", "Actor", "Role", "IP"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A6650" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const color = ACTION_COLORS[log.action] || "#8A6650";
                  return (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: "1px solid #F5EDE3" }}>
                      <td className="py-3 px-4 text-xs font-mono" style={{ color: "#8A6650" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                          style={{ background: `${color}20`, color }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-xs" style={{ color: "#1B3A5C" }}>{log.entity}</p>
                        {log.entityId && <p className="font-mono text-[10px]" style={{ color: "#8A6650" }}>#{log.entityId.slice(-8)}</p>}
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: "#5C4033" }}>{log.actor}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "#EEE4D9", color: "#5C4033" }}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: "#8A6650" }}>{log.ipAddress || "—"}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
