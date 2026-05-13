"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/currency";

const DEMO_BENEFITS = [
  { id: "1", name: "Medical Insurance", category: "HEALTH", provider: "Aetna", cost: 450, currency: "USD", enrolled: 87, isActive: true },
  { id: "2", name: "Dental Plan", category: "DENTAL", provider: "Delta Dental", cost: 85, currency: "USD", enrolled: 74, isActive: true },
  { id: "3", name: "Vision Coverage", category: "VISION", provider: "VSP", cost: 30, currency: "USD", enrolled: 61, isActive: true },
  { id: "4", name: "Life Insurance", category: "LIFE", provider: "MetLife", cost: 25, currency: "USD", enrolled: 91, isActive: true },
  { id: "5", name: "401(k) Retirement", category: "RETIREMENT", provider: "Fidelity", cost: 200, currency: "USD", enrolled: 68, isActive: true },
  { id: "6", name: "HSA Account", category: "OTHER", provider: "HealthEquity", cost: 50, currency: "USD", enrolled: 45, isActive: false },
];

const DEMO_ENROLLMENTS = [
  { id: "1", employee: "Alice Johnson", benefit: "Medical Insurance", status: "ACTIVE", startDate: "2024-01-01" },
  { id: "2", employee: "Bob Martinez", benefit: "Dental Plan", status: "ACTIVE", startDate: "2024-01-01" },
  { id: "3", employee: "Carol White", benefit: "401(k) Retirement", status: "ACTIVE", startDate: "2023-06-15" },
  { id: "4", employee: "David Chen", benefit: "Vision Coverage", status: "ACTIVE", startDate: "2024-03-01" },
  { id: "5", employee: "Emma Davis", benefit: "Life Insurance", status: "INACTIVE", startDate: "2022-01-01" },
  { id: "6", employee: "Frank Wilson", benefit: "Medical Insurance", status: "ACTIVE", startDate: "2024-02-15" },
];

const CATEGORY_COLORS: Record<string, string> = {
  HEALTH: "bg-red-100 text-red-700",
  DENTAL: "bg-blue-100 text-blue-700",
  VISION: "bg-purple-100 text-purple-700",
  LIFE: "bg-green-100 text-green-700",
  RETIREMENT: "bg-amber-100 text-amber-700",
  OTHER: "bg-slate-100 text-slate-600",
};

const emptyForm = { name: "", category: "HEALTH", provider: "", cost: "", currency: "USD", description: "" };

export default function BenefitsPage() {
  const [tab, setTab] = useState<"benefits" | "enrollments">("benefits");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [benefits, setBenefits] = useState(DEMO_BENEFITS);

  const totalMonthlyCost = benefits.filter((b) => b.isActive).reduce((sum, b) => sum + b.cost, 0);
  const totalEnrolled = Math.max(...benefits.map((b) => b.enrolled));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const newBenefit = {
      id: Date.now().toString(),
      name: form.name,
      category: form.category,
      provider: form.provider,
      cost: parseFloat(form.cost) || 0,
      currency: form.currency,
      enrolled: 0,
      isActive: true,
    };
    setBenefits((prev) => [...prev, newBenefit]);
    toast.success("Benefit plan added successfully");
    setShowModal(false);
    setForm({ ...emptyForm });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benefits Administration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage employee benefit plans and enrollments</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Benefit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Benefits", value: benefits.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Plans", value: benefits.filter(b => b.isActive).length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Enrolled Employees", value: totalEnrolled, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Monthly Cost/Employee", value: `$${totalMonthlyCost.toLocaleString()}`, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["benefits", "enrollments"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "benefits" ? "Benefit Plans" : "Enrollments"}
            </button>
          ))}
        </div>

        {tab === "benefits" && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b) => (
              <div key={b.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[b.category]}`}>{b.category}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{b.name}</h3>
                <p className="text-xs text-slate-500 mb-3">Provider: {b.provider || "—"}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">${b.cost}/mo</span>
                  <span className="text-slate-500">{b.enrolled} enrolled</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "enrollments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Employee", "Benefit Plan", "Start Date", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_ENROLLMENTS.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{e.employee}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.benefit}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.startDate}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${e.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Benefit Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name *</label>
                  <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Medical Insurance" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["HEALTH", "DENTAL", "VISION", "LIFE", "RETIREMENT", "OTHER"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                  <input value={form.provider} onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Aetna" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Cost</label>
                  <input type="number" value={form.cost} onChange={(e) => setForm(f => ({ ...f, cost: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Add Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
