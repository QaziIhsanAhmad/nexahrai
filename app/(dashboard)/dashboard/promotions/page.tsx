"use client";

import { useState } from "react";
import { toast } from "sonner";

const DEMO_PROMOTIONS = [
  { id: "1", employee: "Alice Chen", currentRole: "Software Engineer", proposedRole: "Senior Engineer", dept: "Engineering", requestedBy: "Bob VP", date: "2024-02-01", effectiveDate: "2024-03-01", status: "PENDING", type: "PROMOTION" },
  { id: "2", employee: "Mark Davis", currentRole: "HR Coordinator", proposedRole: "HR Manager", dept: "HR", requestedBy: "Sarah Director", date: "2024-01-25", effectiveDate: "2024-02-15", status: "APPROVED", type: "PROMOTION" },
  { id: "3", employee: "Lucy Kim", currentRole: "Designer", proposedRole: "Lead Designer", dept: "Marketing → Creative", requestedBy: "Tom VP", date: "2024-02-10", effectiveDate: "2024-04-01", status: "PENDING", type: "PROMOTION" },
  { id: "4", employee: "James Wilson", currentRole: "Analyst", proposedRole: "Sr. Analyst", dept: "Finance", requestedBy: "Emma CFO", date: "2024-02-05", effectiveDate: "2024-03-15", status: "DEFERRED", type: "PROMOTION" },
  { id: "5", employee: "Eva Martinez", currentRole: "Sales Rep", proposedRole: "Sales Manager", dept: "Sales", requestedBy: "Noah VP", date: "2024-01-20", effectiveDate: "", status: "REJECTED", type: "PROMOTION" },
  { id: "6", employee: "Carlos Rivera", currentRole: "Backend Dev", proposedRole: "Frontend Dev", dept: "Engineering → Product", requestedBy: "Self", date: "2024-02-12", effectiveDate: "2024-03-01", status: "PENDING", type: "TRANSFER" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  DEFERRED: "bg-slate-100 text-slate-600",
};

const emptyForm = { employee: "", currentRole: "", proposedRole: "", dept: "", type: "PROMOTION", effectiveDate: "", notes: "" };

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState(DEMO_PROMOTIONS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [statusFilter, setStatusFilter] = useState("");

  const stats = {
    pending: promotions.filter(p => p.status === "PENDING").length,
    approved: promotions.filter(p => p.status === "APPROVED").length,
    transfers: promotions.filter(p => p.type === "TRANSFER").length,
    avgDays: 18,
  };

  const filtered = promotions.filter(p => !statusFilter || p.status === statusFilter);

  function updateStatus(id: string, status: string) {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    toast.success(`Promotion ${status.toLowerCase()}`);
  }

  function bulkApprove() {
    setPromotions(prev => prev.map(p => p.status === "PENDING" ? { ...p, status: "APPROVED" } : p));
    toast.success("All pending promotions approved");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPromotions(prev => [{
      id: Date.now().toString(),
      employee: form.employee,
      currentRole: form.currentRole,
      proposedRole: form.proposedRole,
      dept: form.dept,
      requestedBy: "Current User",
      date: new Date().toISOString().split("T")[0],
      effectiveDate: form.effectiveDate,
      status: "PENDING",
      type: form.type,
    }, ...prev]);
    toast.success("Promotion request submitted");
    setShowModal(false);
    setForm({ ...emptyForm });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions &amp; Transfers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage internal mobility and career advancement</p>
        </div>
        <div className="flex gap-2">
          {stats.pending > 0 && (
            <button onClick={bulkApprove}
              className="px-4 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium">
              Approve All Pending ({stats.pending})
            </button>
          )}
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Reviews", value: stats.pending, color: "text-amber-600" },
          { label: "Approved This Quarter", value: stats.approved, color: "text-green-600" },
          { label: "Transfers", value: stats.transfers, color: "text-blue-600" },
          { label: "Avg Days to Promote", value: `${stats.avgDays}d`, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {["PENDING", "APPROVED", "REJECTED", "DEFERRED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Employee", "Current Role", "Proposed Role/Dept", "Requested By", "Date", "Effective Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">{p.employee[0]}</div>
                      <span className="font-medium text-slate-900">{p.employee}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{p.currentRole}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-900">{p.proposedRole}</p>
                    <p className="text-xs text-slate-400">{p.dept}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{p.requestedBy}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{p.date}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{p.effectiveDate || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {p.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(p.id, "APPROVED")} className="text-xs text-green-600 hover:text-green-700 font-medium">Approve</button>
                        <button onClick={() => updateStatus(p.id, "REJECTED")} className="text-xs text-red-600 hover:text-red-700 font-medium">Reject</button>
                        <button onClick={() => updateStatus(p.id, "DEFERRED")} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Defer</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">New Promotion / Transfer Request</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee Name *</label>
                  <input required value={form.employee} onChange={(e) => setForm(f => ({ ...f, employee: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Request Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PROMOTION">Promotion</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date</label>
                  <input type="date" value={form.effectiveDate} onChange={(e) => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Role *</label>
                  <input required value={form.currentRole} onChange={(e) => setForm(f => ({ ...f, currentRole: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proposed Role *</label>
                  <input required value={form.proposedRole} onChange={(e) => setForm(f => ({ ...f, proposedRole: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input value={form.dept} onChange={(e) => setForm(f => ({ ...f, dept: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
