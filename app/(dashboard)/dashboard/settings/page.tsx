"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface LeaveType {
  id: string;
  name: string;
  leaveType: string;
  daysAllowed: number;
  isPaid: boolean;
  carryForward: boolean;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"general" | "leave" | "roles">("general");
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leaveType: "ANNUAL", name: "", daysAllowed: "21", isPaid: true, carryForward: false,
  });
  const [submitting, setSubmitting] = useState(false);

  async function fetchLeaveTypes() {
    setLoading(true);
    try {
      const res = await fetch("/api/leave/types");
      const data = await res.json();
      setLeaveTypes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (tab === "leave") fetchLeaveTypes(); }, [tab]);

  async function handleCreateLeaveType(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/leave-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, daysAllowed: parseFloat(form.daysAllowed) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Leave type created!");
      setForm({ leaveType: "ANNUAL", name: "", daysAllowed: "21", isPaid: true, carryForward: false });
      fetchLeaveTypes();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "leave", label: "Leave Types" },
    { id: "roles", label: "Roles & Permissions" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure company settings and policies</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[["Company Name", "text"], ["Company Email", "email"], ["Phone", "tel"], ["Address", "text"], ["City", "text"], ["Country", "text"], ["Industry", "text"], ["Company Size", "text"]].map(([label, type]) => (
              <div key={label}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input type={type}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${label.toLowerCase()}`} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => toast.success("Settings saved!")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {tab === "leave" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Configure Leave Types</h2>
            <form onSubmit={handleCreateLeaveType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                <select value={form.leaveType} onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "EMERGENCY", "UNPAID", "COMPENSATORY"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Annual Leave, Sick Leave"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Days Allowed per Year</label>
                <input type="number" required min="0" step="0.5" value={form.daysAllowed} onChange={(e) => setForm((f) => ({ ...f, daysAllowed: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isPaid} onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))} className="w-4 h-4" />
                  Paid Leave
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.carryForward} onChange={(e) => setForm((f) => ({ ...f, carryForward: e.target.checked }))} className="w-4 h-4" />
                  Allow Carry Forward
                </label>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg text-sm font-medium">
                {submitting ? "Saving..." : "Add Leave Type"}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Configured Leave Types</h2>
            {loading ? (
              <p className="text-slate-400 text-sm text-center py-8">Loading...</p>
            ) : leaveTypes.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No leave types configured yet.</p>
            ) : (
              <div className="space-y-2">
                {leaveTypes.map((lt) => (
                  <div key={lt.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{lt.name}</p>
                      <p className="text-xs text-slate-400">{lt.leaveType} · {lt.daysAllowed} days/year</p>
                    </div>
                    <div className="flex gap-1.5">
                      {lt.isPaid && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>}
                      {lt.carryForward && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Carry Forward</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "roles" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Role Permissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase w-40">Permission</th>
                  {["Super Admin", "Admin", "HR Manager", "Manager", "Employee"].map((r) => (
                    <th key={r} className="text-center py-2 text-xs font-semibold text-slate-500 uppercase px-3">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Manage Companies", true, false, false, false, false],
                  ["Manage All Users", true, true, false, false, false],
                  ["Recruitment", true, true, true, false, false],
                  ["View Payroll", true, true, true, false, true],
                  ["Run Payroll", true, true, true, false, false],
                  ["Leave Approvals", true, true, true, true, false],
                  ["Performance Reviews", true, true, true, true, false],
                  ["Analytics", true, true, true, true, false],
                  ["Self-Service", true, true, true, true, true],
                ].map(([perm, ...roles]) => (
                  <tr key={perm as string} className="border-b border-slate-100">
                    <td className="py-2.5 text-slate-700 font-medium text-xs">{perm as string}</td>
                    {(roles as boolean[]).map((allowed, i) => (
                      <td key={i} className="text-center py-2.5 px-3">
                        {allowed
                          ? <span className="text-green-500">✓</span>
                          : <span className="text-slate-300">✗</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
