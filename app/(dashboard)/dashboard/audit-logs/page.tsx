"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string };
  changes?: Record<string, unknown>;
}

const DEMO_LOGS: AuditLog[] = [
  { id: "1", action: "LOGIN", entity: "User", entityId: "u1", ipAddress: "192.168.1.1", createdAt: "2024-02-15T09:00:00Z", user: { name: "Alice Johnson", email: "alice@company.com" } },
  { id: "2", action: "CREATED", entity: "Employee", entityId: "emp123", ipAddress: "192.168.1.2", createdAt: "2024-02-15T09:15:00Z", user: { name: "Bob HR", email: "bob@company.com" } },
  { id: "3", action: "UPDATED", entity: "Employee", entityId: "emp456", ipAddress: "10.0.0.5", createdAt: "2024-02-15T10:30:00Z", user: { name: "Carol Admin", email: "carol@company.com" } },
  { id: "4", action: "DELETED", entity: "Document", entityId: "doc789", ipAddress: "10.0.0.8", createdAt: "2024-02-15T11:00:00Z", user: { name: "Alice Johnson", email: "alice@company.com" } },
  { id: "5", action: "LOGOUT", entity: "User", entityId: "u2", ipAddress: "192.168.1.1", createdAt: "2024-02-15T12:00:00Z", user: { name: "Dave Manager", email: "dave@company.com" } },
  { id: "6", action: "CREATED", entity: "PayrollRun", entityId: "pr001", ipAddress: "10.0.0.3", createdAt: "2024-02-14T14:00:00Z", user: { name: "Bob HR", email: "bob@company.com" } },
  { id: "7", action: "UPDATED", entity: "LeaveRequest", entityId: "lr202", ipAddress: "10.0.0.4", createdAt: "2024-02-14T15:30:00Z", user: { name: "Carol Admin", email: "carol@company.com" } },
  { id: "8", action: "LOGIN", entity: "User", entityId: "u3", ipAddress: "172.16.0.1", createdAt: "2024-02-14T08:00:00Z", user: { name: "Eve Employee", email: "eve@company.com" } },
  { id: "9", action: "CREATED", entity: "Asset", entityId: "ast005", ipAddress: "10.0.0.5", createdAt: "2024-02-13T16:00:00Z", user: { name: "Bob HR", email: "bob@company.com" } },
  { id: "10", action: "UPDATED", entity: "Company", entityId: "c01", ipAddress: "10.0.0.1", createdAt: "2024-02-13T09:00:00Z", user: { name: "Carol Admin", email: "carol@company.com" } },
];

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-green-100 text-green-700",
  UPDATED: "bg-blue-100 text-blue-700",
  DELETED: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-slate-100 text-slate-600",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(DEMO_LOGS);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        if (data.logs?.length) setLogs(data.logs);
      }
    } catch {
      // Use demo data if API not ready
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter((l) => {
    const matchSearch = !search || l.user?.name.toLowerCase().includes(search.toLowerCase()) || l.entity.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Track all system activities and changes</p>
        </div>
        <button onClick={() => toast.info("Exporting audit logs...")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search user, entity, action..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Actions</option>
          {["CREATED", "UPDATED", "DELETED", "LOGIN", "LOGOUT"].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="date" className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Timestamp", "User", "Action", "Entity", "Entity ID", "IP Address"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading audit logs...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No logs found.</td></tr>
              ) : paginated.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{log.user?.name ?? "System"}</p>
                    <p className="text-xs text-slate-400">{log.user?.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}>{log.action}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{log.entity}</td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{log.entityId ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{log.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-500">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
