"use client";

import { useState } from "react";
import { toast } from "sonner";

const OPENINGS = [
  { id: "1", title: "Senior Frontend Developer", department: "Engineering", type: "PROMOTION", skills: ["React", "TypeScript", "Node.js"], location: "Remote", postedDate: "2024-02-01", applicants: 8 },
  { id: "2", title: "Product Manager", department: "Product", type: "TRANSFER", skills: ["Agile", "Roadmapping", "Stakeholder Mgmt"], location: "New York", postedDate: "2024-02-05", applicants: 5 },
  { id: "3", title: "AI/ML Engineer", department: "Data Science", type: "PROJECT", skills: ["Python", "TensorFlow", "ML Ops"], location: "Remote", postedDate: "2024-02-10", applicants: 12 },
  { id: "4", title: "HR Business Partner", department: "HR", type: "TRANSFER", skills: ["HRBP", "Change Mgmt", "Coaching"], location: "London", postedDate: "2024-02-12", applicants: 3 },
  { id: "5", title: "Finance Analyst Lead", department: "Finance", type: "PROMOTION", skills: ["Excel", "Power BI", "FP&A"], location: "Hybrid", postedDate: "2024-02-15", applicants: 6 },
];

const EMPLOYEE_SKILLS = [
  { id: "1", name: "Alice Chen", dept: "Engineering", role: "Software Engineer", skills: ["React", "TypeScript", "Python", "AWS"], score: 92 },
  { id: "2", name: "Bob Martinez", dept: "Marketing", role: "Marketing Analyst", skills: ["Google Analytics", "SEO", "Content Strategy"], score: 78 },
  { id: "3", name: "Carol Lee", dept: "Engineering", role: "Full Stack Dev", skills: ["React", "Node.js", "TypeScript", "PostgreSQL"], score: 88 },
  { id: "4", name: "Dave Kim", dept: "Data Science", role: "Data Analyst", skills: ["Python", "SQL", "TensorFlow", "ML Ops"], score: 95 },
  { id: "5", name: "Emma Wilson", dept: "HR", role: "HR Coordinator", skills: ["HRBP", "Coaching", "Recruiting"], score: 82 },
  { id: "6", name: "Frank Davis", dept: "Finance", role: "Senior Analyst", skills: ["Excel", "Power BI", "FP&A", "SAP"], score: 89 },
];

const TYPE_COLORS: Record<string, string> = {
  PROMOTION: "bg-blue-100 text-blue-700",
  TRANSFER: "bg-purple-100 text-purple-700",
  PROJECT: "bg-green-100 text-green-700",
};

export default function TalentMarketplacePage() {
  const [tab, setTab] = useState<"openings" | "profiles">("openings");
  const [search, setSearch] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState<typeof OPENINGS[0] | null>(null);

  const filteredOpenings = OPENINGS.filter(o =>
    !search || o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredProfiles = EMPLOYEE_SKILLS.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate match scores vs selected opening
  function getMatchScore(emp: typeof EMPLOYEE_SKILLS[0], opening: typeof OPENINGS[0]): number {
    const matches = opening.skills.filter(s => emp.skills.some(es => es.toLowerCase().includes(s.toLowerCase()))).length;
    return Math.round((matches / opening.skills.length) * 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Talent Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">Connect employees with internal opportunities</p>
        </div>
        <button onClick={() => setShowPostModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post Opportunity
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles, skills, employees..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["openings", "profiles"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "openings" ? `Internal Openings (${filteredOpenings.length})` : `Talent Profiles (${filteredProfiles.length})`}
            </button>
          ))}
        </div>

        {tab === "openings" && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpenings.map((o) => (
              <div key={o.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setSelectedOpening(o)}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[o.type]}`}>{o.type}</span>
                  <span className="text-xs text-slate-400">{o.postedDate}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{o.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{o.department} · {o.location}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {o.skills.map(s => <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{s}</span>)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{o.applicants} interested</span>
                  <button onClick={(e) => { e.stopPropagation(); toast.success("Application submitted!"); }}
                    className="text-blue-600 font-medium hover:text-blue-700">Apply →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "profiles" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Employee", "Department", "Current Role", "Skills", selectedOpening ? "Match Score" : "Skill Score"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((e) => {
                  const matchPct = selectedOpening ? getMatchScore(e, selectedOpening) : e.score;
                  return (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">{e.name[0]}</div>
                          <span className="font-medium text-slate-900">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{e.dept}</td>
                      <td className="px-5 py-3.5 text-slate-600">{e.role}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {e.skills.slice(0, 3).map(s => <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{s}</span>)}
                          {e.skills.length > 3 && <span className="text-xs text-slate-400">+{e.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${matchPct >= 80 ? "bg-green-500" : matchPct >= 60 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${matchPct}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${matchPct >= 80 ? "text-green-600" : matchPct >= 60 ? "text-amber-600" : "text-red-600"}`}>{matchPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOpening && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          Filtering talent profiles matching: <strong>{selectedOpening.title}</strong>
          <button onClick={() => setSelectedOpening(null)} className="ml-3 underline">Clear filter</button>
        </div>
      )}

      {showPostModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Post Internal Opportunity</h2>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Opportunity posted!"); setShowPostModal(false); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Title *</label>
                <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["PROMOTION", "TRANSFER", "PROJECT"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input placeholder="React, TypeScript, Leadership" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Post Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
