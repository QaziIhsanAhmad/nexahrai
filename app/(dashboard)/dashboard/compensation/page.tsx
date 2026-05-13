"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";

const MARKET_DATA = [
  { position: "Software Engineer", yourMin: 85000, yourMax: 120000, p25: 80000, p50: 100000, p75: 125000, currency: "USD" },
  { position: "Product Manager", yourMin: 90000, yourMax: 130000, p25: 95000, p50: 120000, p75: 145000, currency: "USD" },
  { position: "Data Scientist", yourMin: 95000, yourMax: 135000, p25: 90000, p50: 115000, p75: 140000, currency: "USD" },
  { position: "UX Designer", yourMin: 75000, yourMax: 105000, p25: 80000, p50: 100000, p75: 120000, currency: "USD" },
  { position: "HR Manager", yourMin: 65000, yourMax: 90000, p25: 70000, p50: 85000, p75: 100000, currency: "USD" },
  { position: "Sales Manager", yourMin: 70000, yourMax: 110000, p25: 75000, p50: 95000, p75: 120000, currency: "USD" },
  { position: "DevOps Engineer", yourMin: 90000, yourMax: 125000, p25: 88000, p50: 110000, p75: 135000, currency: "USD" },
];

const DEPT_SALARY = [
  { dept: "Engineering", avg: 105000, pct: 90, count: 42 },
  { dept: "Product", avg: 110000, pct: 94, count: 12 },
  { dept: "Data Science", avg: 115000, pct: 98, count: 8 },
  { dept: "Marketing", avg: 78000, pct: 67, count: 18 },
  { dept: "HR", avg: 72000, pct: 62, count: 9 },
  { dept: "Finance", avg: 88000, pct: 75, count: 14 },
  { dept: "Sales", avg: 92000, pct: 79, count: 22 },
];

const EQUITY_STATS = [
  { group: "Male", count: 68, avg: 98500 },
  { group: "Female", count: 32, avg: 95200 },
  { group: "Non-binary", count: 4, avg: 97800 },
];

function getComparison(yourMax: number, p50: number): { label: string; cls: string } {
  const ratio = yourMax / p50;
  if (ratio < 0.95) return { label: "Below Market", cls: "bg-red-100 text-red-700" };
  if (ratio > 1.05) return { label: "Above Market", cls: "bg-green-100 text-green-700" };
  return { label: "At Market", cls: "bg-blue-100 text-blue-700" };
}

export default function CompensationPage() {
  const [tab, setTab] = useState<"market" | "distribution" | "equity">("market");

  const overallAvg = DEPT_SALARY.reduce((s, d) => s + d.avg * d.count, 0) / DEPT_SALARY.reduce((s, d) => s + d.count, 0);
  const gapPct = (((EQUITY_STATS[0].avg - EQUITY_STATS[1].avg) / EQUITY_STATS[0].avg) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compensation Benchmarking</h1>
        <p className="text-slate-500 text-sm mt-1">Compare your compensation against market data and ensure pay equity</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Avg Company Salary", value: formatCurrency(overallAvg, "USD"), color: "text-blue-600" },
          { label: "Roles Benchmarked", value: MARKET_DATA.length, color: "text-green-600" },
          { label: "At/Above Market", value: `${MARKET_DATA.filter(m => getComparison(m.yourMax, m.p50).label !== "Below Market").length}/${MARKET_DATA.length}`, color: "text-purple-600" },
          { label: "Gender Pay Gap", value: `${gapPct}%`, color: parseFloat(gapPct) < 3 ? "text-green-600" : "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["market", "distribution", "equity"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "market" ? "Market Comparison" : t === "distribution" ? "Salary Distribution" : "Pay Equity"}
            </button>
          ))}
        </div>

        {tab === "market" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Position", "Your Range", "Market P25", "Market P50 (Median)", "Market P75", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKET_DATA.map((row) => {
                  const cmp = getComparison(row.yourMax, row.p50);
                  return (
                    <tr key={row.position} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.position}</td>
                      <td className="px-5 py-3.5 text-slate-600">${(row.yourMin / 1000).toFixed(0)}k – ${(row.yourMax / 1000).toFixed(0)}k</td>
                      <td className="px-5 py-3.5 text-slate-500">${(row.p25 / 1000).toFixed(0)}k</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">${(row.p50 / 1000).toFixed(0)}k</td>
                      <td className="px-5 py-3.5 text-slate-500">${(row.p75 / 1000).toFixed(0)}k</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cmp.cls}`}>{cmp.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "distribution" && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Average Salary by Department</h3>
            <div className="space-y-3">
              {DEPT_SALARY.sort((a, b) => b.avg - a.avg).map((d) => (
                <div key={d.dept} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-slate-600">{d.dept}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 relative">
                    <div className={`h-4 rounded-full flex items-center pl-2 ${d.pct >= 90 ? "bg-blue-600" : d.pct >= 75 ? "bg-blue-400" : "bg-blue-300"}`}
                      style={{ width: `${d.pct}%` }}>
                      <span className="text-xs text-white font-medium">{d.count} emp</span>
                    </div>
                  </div>
                  <span className="w-24 text-sm font-semibold text-slate-900 text-right">{formatCurrency(d.avg, "USD")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "equity" && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {EQUITY_STATS.map((g) => (
                <div key={g.group} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{g.group}</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(g.avg, "USD")}</p>
                  <p className="text-xs text-slate-400 mt-1">{g.count} employees</p>
                </div>
              ))}
            </div>
            <div className={`p-4 rounded-xl border ${parseFloat(gapPct) < 3 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <svg className={`w-5 h-5 ${parseFloat(gapPct) < 3 ? "text-green-600" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {parseFloat(gapPct) < 3
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  }
                </svg>
                <h4 className={`font-semibold ${parseFloat(gapPct) < 3 ? "text-green-700" : "text-amber-700"}`}>
                  Gender Pay Gap: {gapPct}%
                </h4>
              </div>
              <p className={`text-sm ${parseFloat(gapPct) < 3 ? "text-green-600" : "text-amber-600"}`}>
                {parseFloat(gapPct) < 3
                  ? "Excellent! Your pay gap is within acceptable range (below 3%)."
                  : `Pay gap of ${gapPct}% detected. Consider reviewing compensation structures to ensure equity.`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
