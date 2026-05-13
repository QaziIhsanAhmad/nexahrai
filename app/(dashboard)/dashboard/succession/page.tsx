"use client";

import { useState } from "react";
import { toast } from "sonner";

const SUCCESSION_DATA = [
  { id: "1", position: "VP Engineering", currentHolder: "Alice Johnson", readyNow: ["Bob Chen", "Carol Lee"], readyIn1Year: ["Dave Kim"], readyIn2Years: ["Emma Wilson"] },
  { id: "2", position: "Head of HR", currentHolder: "Sarah Davis", readyNow: ["Mike Brown"], readyIn1Year: ["Lucy Wang", "Tom Harris"], readyIn2Years: [] },
  { id: "3", position: "CFO", currentHolder: "James Taylor", readyNow: [], readyIn1Year: ["Olivia Martin"], readyIn2Years: ["Noah Clark", "Sophia Lewis"] },
  { id: "4", position: "CTO", currentHolder: "Ryan White", readyNow: ["Alice Johnson"], readyIn1Year: ["Bob Chen"], readyIn2Years: ["Carol Lee"] },
];

const CAREER_LEVELS = [
  { level: "Junior", skills: ["Communication", "Teamwork", "Basic Technical Skills"], years: "0-2", employees: 28 },
  { level: "Mid", skills: ["Project Management", "Leadership Basics", "Problem Solving"], years: "2-5", employees: 42 },
  { level: "Senior", skills: ["Strategic Thinking", "Mentoring", "Advanced Technical"], years: "5-8", employees: 31 },
  { level: "Lead", skills: ["Team Leadership", "Architecture", "Cross-functional Collab"], years: "7-10", employees: 18 },
  { level: "Manager", skills: ["People Management", "Budgeting", "OKR Setting"], years: "8-12", employees: 12 },
  { level: "Director", skills: ["Department Strategy", "Executive Presence", "P&L Ownership"], years: "12+", employees: 6 },
];

const PROMOTIONS_DATA = [
  { id: "1", employee: "Alice Chen", currentRole: "Software Engineer", proposedRole: "Senior Engineer", dept: "Engineering", requestedBy: "Bob Manager", date: "2024-02-01", status: "PENDING" },
  { id: "2", employee: "Mark Davis", currentRole: "HR Coordinator", proposedRole: "HR Manager", dept: "HR", requestedBy: "Sarah Director", date: "2024-01-25", status: "APPROVED" },
  { id: "3", employee: "Lucy Kim", currentRole: "Designer", proposedRole: "Lead Designer", dept: "Marketing", requestedBy: "Tom VP", date: "2024-02-10", status: "PENDING" },
  { id: "4", employee: "James Wilson", currentRole: "Analyst", proposedRole: "Sr. Analyst", dept: "Finance", requestedBy: "Emma CFO", date: "2024-02-05", status: "DEFERRED" },
  { id: "5", employee: "Eva Martinez", currentRole: "Sales Rep", proposedRole: "Sales Manager", dept: "Sales", requestedBy: "Noah VP", date: "2024-01-20", status: "REJECTED" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  DEFERRED: "bg-slate-100 text-slate-600",
};

export default function SuccessionPage() {
  const [tab, setTab] = useState<"succession" | "careers" | "promotions">("succession");
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [promotions, setPromotions] = useState(PROMOTIONS_DATA);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Succession &amp; Career Planning</h1>
          <p className="text-slate-500 text-sm mt-1">Plan future leadership, career paths, and promotions</p>
        </div>
        {tab === "succession" && (
          <button onClick={() => setShowAddPlan(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Plan
          </button>
        )}
        {tab === "promotions" && (
          <button onClick={() => setShowNewPromotion(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Request
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["succession", "careers", "promotions"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "succession" ? "Succession Plans" : t === "careers" ? "Career Paths" : "Promotions & Transfers"}
            </button>
          ))}
        </div>

        {tab === "succession" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Position", "Current Holder", "Ready Now", "Ready in 1 Year", "Ready in 2 Years"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUCCESSION_DATA.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.position}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">{row.currentHolder[0]}</span>
                        {row.currentHolder}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.readyNow.length ? row.readyNow.map(n => <span key={n} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{n}</span>) : <span className="text-slate-400 text-xs">None</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.readyIn1Year.length ? row.readyIn1Year.map(n => <span key={n} className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{n}</span>) : <span className="text-slate-400 text-xs">None</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.readyIn2Years.length ? row.readyIn2Years.map(n => <span key={n} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{n}</span>) : <span className="text-slate-400 text-xs">None</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "careers" && (
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-6">Career ladder showing progression paths across the organization</p>
            <div className="flex items-stretch gap-3 overflow-x-auto pb-4">
              {CAREER_LEVELS.map((level, i) => (
                <div key={level.level} className="flex flex-col items-center min-w-[150px]">
                  {i > 0 && (
                    <div className="hidden" />
                  )}
                  <div className="w-full border border-slate-200 rounded-xl p-4 flex-1 hover:border-blue-300 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 ${
                      i === 0 ? "bg-slate-400" : i === 1 ? "bg-blue-400" : i === 2 ? "bg-blue-500" : i === 3 ? "bg-blue-600" : i === 4 ? "bg-indigo-600" : "bg-purple-600"
                    }`}>{level.level[0]}</div>
                    <h4 className="font-semibold text-slate-900 mb-1">{level.level}</h4>
                    <p className="text-xs text-slate-400 mb-3">{level.years} years · {level.employees} employees</p>
                    <div className="space-y-1">
                      {level.skills.map(s => (
                        <span key={s} className="block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  {i < CAREER_LEVELS.length - 1 && (
                    <div className="flex items-center justify-center mt-2">
                      <svg className="w-5 h-5 text-blue-400 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "promotions" && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Employee", "Current Role", "Proposed Role", "Department", "Requested By", "Date", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3.5 font-medium text-slate-900">{p.employee}</td>
                      <td className="px-4 py-3.5 text-slate-600">{p.currentRole}</td>
                      <td className="px-4 py-3.5 text-slate-600">{p.proposedRole}</td>
                      <td className="px-4 py-3.5 text-slate-500">{p.dept}</td>
                      <td className="px-4 py-3.5 text-slate-500">{p.requestedBy}</td>
                      <td className="px-4 py-3.5 text-slate-500">{p.date}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button onClick={() => { setPromotions(prev => prev.map(r => r.id === p.id ? { ...r, status: "APPROVED" } : r)); toast.success("Promotion approved!"); }}
                              className="text-xs text-green-600 hover:text-green-700 font-medium">Approve</button>
                            <button onClick={() => { setPromotions(prev => prev.map(r => r.id === p.id ? { ...r, status: "REJECTED" } : r)); toast.error("Promotion rejected"); }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Succession Plan</h2>
              <button onClick={() => setShowAddPlan(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Succession plan created!"); setShowAddPlan(false); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position Title *</label>
                <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Holder</label>
                <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddPlan(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Create Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Promotion Modal */}
      {showNewPromotion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">New Promotion Request</h2>
              <button onClick={() => setShowNewPromotion(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Promotion request submitted!"); setShowNewPromotion(false); }} className="p-6 space-y-4">
              {[["Employee Name", "text"], ["Current Role", "text"], ["Proposed Role", "text"], ["Department", "text"]].map(([label, type]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label} *</label>
                  <input required type={type} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewPromotion(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
