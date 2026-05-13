"use client";

import { useState } from "react";
import { toast } from "sonner";

const CHECKLIST = [
  { id: "1", title: "Data Processing Agreement", status: "COMPLIANT", category: "GDPR", lastChecked: "2024-02-01" },
  { id: "2", title: "Privacy Policy Updated", status: "COMPLIANT", category: "GDPR", lastChecked: "2024-01-15" },
  { id: "3", title: "Employee Data Consent", status: "NEEDS_ATTENTION", category: "GDPR", lastChecked: "2024-01-10" },
  { id: "4", title: "Right to Erasure Process", status: "NOT_CONFIGURED", category: "GDPR", lastChecked: "Never" },
  { id: "5", title: "Federal Tax Withholding", status: "COMPLIANT", category: "TAX", lastChecked: "2024-02-05" },
  { id: "6", title: "State Tax Registration", status: "COMPLIANT", category: "TAX", lastChecked: "2024-01-20" },
  { id: "7", title: "Payroll Tax Filings", status: "NEEDS_ATTENTION", category: "TAX", lastChecked: "2024-01-15" },
  { id: "8", title: "Equal Employment Opportunity", status: "COMPLIANT", category: "LABOR", lastChecked: "2024-01-25" },
  { id: "9", title: "Workplace Safety (OSHA)", status: "COMPLIANT", category: "LABOR", lastChecked: "2024-02-01" },
  { id: "10", title: "Minimum Wage Compliance", status: "COMPLIANT", category: "LABOR", lastChecked: "2024-01-30" },
  { id: "11", title: "FMLA Policy Documentation", status: "NEEDS_ATTENTION", category: "LABOR", lastChecked: "2023-12-15" },
];

const TAX_CONFIGS = [
  { country: "United States", type: "Federal", rate: "Varies (22-37%)", status: "CONFIGURED" },
  { country: "United States", type: "State (CA)", rate: "1-13.3%", status: "CONFIGURED" },
  { country: "United Kingdom", type: "PAYE", rate: "20-45%", status: "CONFIGURED" },
  { country: "Pakistan", type: "Income Tax", rate: "0-35%", status: "NEEDS_SETUP" },
  { country: "India", type: "TDS", rate: "0-30%", status: "NEEDS_SETUP" },
  { country: "UAE", type: "No Income Tax", rate: "0%", status: "CONFIGURED" },
];

const LABOR_COMPLIANCE = [
  { region: "United States (Federal)", status: "COMPLIANT", items: 12, issues: 0 },
  { region: "California (State)", status: "NEEDS_ATTENTION", items: 8, issues: 2 },
  { region: "United Kingdom", status: "COMPLIANT", items: 10, issues: 0 },
  { region: "European Union", status: "COMPLIANT", items: 15, issues: 0 },
  { region: "Pakistan", status: "NOT_CONFIGURED", items: 6, issues: 6 },
];

export default function CompliancePage() {
  const [tab, setTab] = useState<"overview" | "gdpr" | "tax" | "labor">("overview");
  const [dataRetention, setDataRetention] = useState("7");

  const statusColors: Record<string, string> = {
    COMPLIANT: "bg-green-100 text-green-700",
    NEEDS_ATTENTION: "bg-amber-100 text-amber-700",
    NOT_CONFIGURED: "bg-red-100 text-red-700",
    CONFIGURED: "bg-green-100 text-green-700",
    NEEDS_SETUP: "bg-amber-100 text-amber-700",
  };

  const statusIcons: Record<string, string> = {
    COMPLIANT: "✓",
    NEEDS_ATTENTION: "!",
    NOT_CONFIGURED: "×",
    CONFIGURED: "✓",
    NEEDS_SETUP: "!",
  };

  const overview = {
    compliant: CHECKLIST.filter(c => c.status === "COMPLIANT").length,
    attention: CHECKLIST.filter(c => c.status === "NEEDS_ATTENTION").length,
    notConfigured: CHECKLIST.filter(c => c.status === "NOT_CONFIGURED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance &amp; Legal</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor compliance, GDPR, tax, and labor law requirements</p>
        </div>
        <button onClick={() => toast.info("Compliance report exported")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["overview", "gdpr", "tax", "labor"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "gdpr" ? "GDPR & Privacy" : t === "tax" ? "Tax" : t === "labor" ? "Labor Law" : "Overview"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-700">{overview.compliant}</p>
                <p className="text-sm text-green-600 font-medium">Compliant</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-3xl font-bold text-amber-700">{overview.attention}</p>
                <p className="text-sm text-amber-600 font-medium">Needs Attention</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-3xl font-bold text-red-700">{overview.notConfigured}</p>
                <p className="text-sm text-red-600 font-medium">Not Configured</p>
              </div>
            </div>
            <div className="space-y-2">
              {CHECKLIST.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${statusColors[item.status]}`}>
                      {statusIcons[item.status]}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-400">Last checked: {item.lastChecked}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{item.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{item.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "gdpr" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Data Privacy Checklist</h3>
              <div className="space-y-2">
                {CHECKLIST.filter(c => c.category === "GDPR").map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${statusColors[item.status]}`}>
                        {statusIcons[item.status]}
                      </span>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    </div>
                    <button onClick={() => toast.success("Marked as reviewed")} className="text-xs text-blue-600 hover:underline">Review</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Data Retention Policy</h3>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee Data Retention (years)</label>
                  <select value={dataRetention} onChange={(e) => setDataRetention(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["1", "3", "5", "7", "10"].map(y => <option key={y} value={y}>{y} years</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => toast.success("Retention policy updated")} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Save Policy</button>
            </div>
          </div>
        )}

        {tab === "tax" && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Country", "Tax Type", "Rate", "Status", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TAX_CONFIGS.map((t, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{t.country}</td>
                      <td className="px-4 py-3 text-slate-600">{t.type}</td>
                      <td className="px-4 py-3 text-slate-600">{t.rate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{t.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toast.info("Opening tax configuration...")} className="text-xs text-blue-600 hover:underline">Configure</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "labor" && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              {LABOR_COMPLIANCE.map((l, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${statusColors[l.status]}`}>
                      {statusIcons[l.status]}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{l.region}</p>
                      <p className="text-xs text-slate-500">{l.items} requirements · {l.issues} issues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[l.status]}`}>{l.status.replace(/_/g, " ")}</span>
                    <button onClick={() => toast.info(`Opening ${l.region} compliance details`)} className="text-xs text-blue-600 hover:underline">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
