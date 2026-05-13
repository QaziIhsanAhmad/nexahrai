"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/currency";

const DEMO_CONTRACTORS = [
  { id: "1", name: "Alex Rivera", email: "alex@freelance.com", type: "FREELANCER", department: "Engineering", rate: 85, currency: "USD", rateType: "HOURLY", startDate: "2024-01-01", endDate: "2024-06-30", status: "ACTIVE" },
  { id: "2", name: "TechBridge Ltd.", email: "contact@techbridge.com", type: "VENDOR", department: "IT", rate: 12000, currency: "USD", rateType: "MONTHLY", startDate: "2023-10-01", endDate: "2024-09-30", status: "ACTIVE" },
  { id: "3", name: "Maria Santos", email: "maria@design.com", type: "CONTRACTOR", department: "Marketing", rate: 70, currency: "USD", rateType: "HOURLY", startDate: "2024-02-01", endDate: "2024-05-31", status: "ACTIVE" },
  { id: "4", name: "CloudOps Inc.", email: "ops@cloudops.com", type: "VENDOR", department: "Engineering", rate: 8500, currency: "USD", rateType: "MONTHLY", startDate: "2023-06-01", endDate: "2023-12-31", status: "EXPIRED" },
  { id: "5", name: "John Park", email: "john@consultant.com", type: "CONTRACTOR", department: "Finance", rate: 120, currency: "USD", rateType: "HOURLY", startDate: "2024-01-15", endDate: "2024-07-15", status: "ACTIVE" },
];

const TYPE_COLORS: Record<string, string> = {
  CONTRACTOR: "bg-blue-100 text-blue-700",
  FREELANCER: "bg-purple-100 text-purple-700",
  VENDOR: "bg-amber-100 text-amber-700",
};

const emptyForm = { name: "", email: "", type: "CONTRACTOR", department: "", rate: "", currency: "USD", rateType: "HOURLY", startDate: "", endDate: "" };

export default function ContractorsPage() {
  const [tab, setTab] = useState<"active" | "expired" | "vendors">("active");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [contractors, setContractors] = useState(DEMO_CONTRACTORS);

  const filtered = contractors.filter(c => {
    if (tab === "active") return c.status === "ACTIVE" && c.type !== "VENDOR";
    if (tab === "expired") return c.status === "EXPIRED";
    if (tab === "vendors") return c.type === "VENDOR";
    return true;
  });

  const stats = {
    total: contractors.length,
    active: contractors.filter(c => c.status === "ACTIVE").length,
    monthlyCost: contractors.filter(c => c.status === "ACTIVE" && c.rateType === "MONTHLY").reduce((s, c) => s + c.rate, 0),
    avgLength: 5.2,
  };

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setContractors(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      type: form.type,
      department: form.department,
      rate: parseFloat(form.rate) || 0,
      currency: form.currency,
      rateType: form.rateType,
      startDate: form.startDate,
      endDate: form.endDate,
      status: "ACTIVE",
    }]);
    toast.success("Contractor added successfully");
    setShowModal(false);
    setForm({ ...emptyForm });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contractors &amp; Freelancers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage external workforce and vendors</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Contractor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Contractors", value: stats.total, color: "text-blue-600" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Monthly Cost", value: `$${stats.monthlyCost.toLocaleString()}`, color: "text-purple-600" },
          { label: "Avg Contract Length", value: `${stats.avgLength} months`, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["active", "expired", "vendors"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "active" ? "Active" : t === "expired" ? "Expired" : "Vendors"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Name", "Type", "Department", "Rate", "Contract Period", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No contractors found</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>{c.type}</span></td>
                  <td className="px-5 py-3.5 text-slate-600">{c.department}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{c.currency} {c.rate.toLocaleString()}/{c.rateType === "HOURLY" ? "hr" : "mo"}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{c.startDate} → {c.endDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Contractor</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Company *</label>
                  <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["CONTRACTOR", "FREELANCER", "VENDOR"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate</label>
                  <input type="number" value={form.rate} onChange={(e) => setForm(f => ({ ...f, rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate Type</label>
                  <select value={form.rateType} onChange={(e) => setForm(f => ({ ...f, rateType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="HOURLY">Hourly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Add Contractor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
