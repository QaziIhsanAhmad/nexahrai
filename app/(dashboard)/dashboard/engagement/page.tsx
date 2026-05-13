"use client";

import { useState } from "react";
import { toast } from "sonner";

const DEMO_SURVEYS = [
  { id: "1", title: "Q1 Employee Pulse Survey", type: "PULSE", responses: 82, total: 100, avgScore: 7.8, status: "ACTIVE", created: "2024-01-15" },
  { id: "2", title: "Annual Engagement Survey 2024", type: "ANNUAL", responses: 95, total: 100, avgScore: 8.2, status: "COMPLETED", created: "2023-12-01" },
  { id: "3", title: "Manager Effectiveness Survey", type: "CUSTOM", responses: 45, total: 60, avgScore: 7.1, status: "ACTIVE", created: "2024-02-01" },
  { id: "4", title: "Benefits Satisfaction Survey", type: "CUSTOM", responses: 30, total: 100, avgScore: 6.9, status: "DRAFT", created: "2024-02-20" },
];

const PULSE_RESULTS = [
  { month: "Oct", score: 7.2 },
  { month: "Nov", score: 7.5 },
  { month: "Dec", score: 7.8 },
  { month: "Jan", score: 8.1 },
  { month: "Feb", score: 7.9 },
  { month: "Mar", score: 8.3 },
];

const DEPT_SENTIMENT = [
  { dept: "Engineering", score: 8.4, pct: 84 },
  { dept: "Marketing", score: 7.9, pct: 79 },
  { dept: "Sales", score: 7.2, pct: 72 },
  { dept: "HR", score: 8.8, pct: 88 },
  { dept: "Finance", score: 7.6, pct: 76 },
];

const emptyForm = { title: "", type: "PULSE", description: "", isAnonymous: true };

export default function EngagementPage() {
  const [tab, setTab] = useState<"surveys" | "enps" | "pulse">("surveys");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  // eNPS demo data
  const promoters = 45;
  const passives = 35;
  const detractors = 20;
  const enps = promoters - detractors; // = 25

  const typeColor: Record<string, string> = {
    PULSE: "bg-blue-100 text-blue-700",
    ANNUAL: "bg-purple-100 text-purple-700",
    ENPS: "bg-green-100 text-green-700",
    CUSTOM: "bg-amber-100 text-amber-700",
  };

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-slate-100 text-slate-600",
    DRAFT: "bg-yellow-100 text-yellow-700",
  };

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Survey created successfully!");
    setShowModal(false);
    setForm({ ...emptyForm });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Engagement &amp; Surveys</h1>
          <p className="text-slate-500 text-sm mt-1">Measure and improve employee experience</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Survey
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["surveys", "enps", "pulse"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "surveys" ? "Surveys" : t === "enps" ? "eNPS" : "Pulse Results"}
            </button>
          ))}
        </div>

        {tab === "surveys" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Survey", "Type", "Response Rate", "Avg Score", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_SURVEYS.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Created {s.created}</p>
                    </td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor[s.type]}`}>{s.type}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(s.responses / s.total) * 100}%` }} />
                        </div>
                        <span className="text-slate-600 text-xs">{s.responses}/{s.total}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${s.avgScore >= 8 ? "text-green-600" : s.avgScore >= 7 ? "text-amber-600" : "text-red-600"}`}>{s.avgScore}/10</span>
                    </td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[s.status]}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "enps" && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <p className="text-sm text-slate-500 mb-2">Employee Net Promoter Score</p>
                <div className={`text-6xl font-bold mb-2 ${enps >= 50 ? "text-green-600" : enps >= 20 ? "text-amber-600" : "text-red-600"}`}>{enps}</div>
                <p className="text-slate-500 text-sm">{enps >= 50 ? "Excellent" : enps >= 20 ? "Good" : "Needs Improvement"} — Based on 100 responses</p>
              </div>
              {/* Gauge */}
              <div className="relative w-64 h-32 mx-auto mb-8">
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="w-64 h-32 rounded-t-full overflow-hidden flex">
                    <div className="bg-red-400 flex-none" style={{ width: `${detractors}%` }} />
                    <div className="bg-yellow-400 flex-none" style={{ width: `${passives}%` }} />
                    <div className="bg-green-400 flex-none" style={{ width: `${promoters}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Promoters", value: promoters, color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", desc: "Score 9-10" },
                  { label: "Passives", value: passives, color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", desc: "Score 7-8" },
                  { label: "Detractors", value: detractors, color: "bg-red-500", text: "text-red-700", bg: "bg-red-50", desc: "Score 0-6" },
                ].map((item) => (
                  <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                    <p className={`text-3xl font-bold ${item.text}`}>{item.value}%</p>
                    <p className={`font-semibold ${item.text} mt-1`}>{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "pulse" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Monthly Sentiment Trend</h3>
              <div className="flex items-end gap-3 h-32">
                {PULSE_RESULTS.map((r) => (
                  <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">{r.score}</span>
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(r.score / 10) * 100}px` }} />
                    <span className="text-xs text-slate-500">{r.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Department Sentiment</h3>
              <div className="space-y-3">
                {DEPT_SENTIMENT.map((d) => (
                  <div key={d.dept} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-slate-600">{d.dept}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${d.pct >= 80 ? "bg-green-500" : d.pct >= 70 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className={`text-sm font-semibold w-12 text-right ${d.score >= 8 ? "text-green-600" : d.score >= 7.5 ? "text-blue-600" : "text-amber-600"}`}>{d.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Create Survey</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Survey Title *</label>
                <input required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Survey Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["PULSE", "ENPS", "ANNUAL", "CUSTOM"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="anon" checked={form.isAnonymous}
                    onChange={(e) => setForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
                  <label htmlFor="anon" className="text-sm text-slate-700">Anonymous responses</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Create Survey</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
