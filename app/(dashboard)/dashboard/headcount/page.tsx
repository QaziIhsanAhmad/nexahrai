"use client";

import { useState } from "react";
import { toast } from "sonner";

const HEADCOUNT_DATA = [
  { id: "1", dept: "Engineering", q1Current: 40, q1Planned: 45, q2Current: 45, q2Planned: 52, q3Current: 52, q3Planned: 58, q4Current: 58, q4Planned: 60, approved: true },
  { id: "2", dept: "Marketing", q1Current: 18, q1Planned: 20, q2Current: 20, q2Planned: 22, q3Current: 22, q3Planned: 24, q4Current: 24, q4Planned: 25, approved: true },
  { id: "3", dept: "Sales", q1Current: 22, q1Planned: 25, q2Current: 25, q2Planned: 28, q3Current: 28, q3Planned: 30, q4Current: 30, q4Planned: 35, approved: false },
  { id: "4", dept: "HR", q1Current: 9, q1Planned: 10, q2Current: 10, q2Planned: 10, q3Current: 10, q3Planned: 12, q4Current: 12, q4Planned: 12, approved: true },
  { id: "5", dept: "Finance", q1Current: 14, q1Planned: 15, q2Current: 15, q2Planned: 16, q3Current: 16, q3Planned: 16, q4Current: 16, q4Planned: 18, approved: false },
  { id: "6", dept: "Data Science", q1Current: 8, q1Planned: 10, q2Current: 10, q2Planned: 12, q3Current: 12, q3Planned: 14, q4Current: 14, q4Planned: 16, approved: true },
];

const BUDGET_DATA = [
  { id: "1", category: "Salaries", budgeted: 4500000, actual: 4200000, currency: "USD" },
  { id: "2", category: "Benefits", budgeted: 900000, actual: 875000, currency: "USD" },
  { id: "3", category: "Training", budgeted: 150000, actual: 98000, currency: "USD" },
  { id: "4", category: "Recruitment", budgeted: 200000, actual: 145000, currency: "USD" },
  { id: "5", category: "Other", budgeted: 80000, actual: 62000, currency: "USD" },
];

export default function HeadcountPage() {
  const [tab, setTab] = useState<"headcount" | "budget">("headcount");
  const [headcountData, setHeadcountData] = useState(HEADCOUNT_DATA);

  const totalCurrent = HEADCOUNT_DATA.reduce((s, d) => s + d.q1Current, 0);
  const totalPlanned = HEADCOUNT_DATA.reduce((s, d) => s + d.q4Planned, 0);
  const totalBudgeted = BUDGET_DATA.reduce((s, d) => s + d.budgeted, 0);
  const totalActual = BUDGET_DATA.reduce((s, d) => s + d.actual, 0);

  function toggleApproved(id: string) {
    setHeadcountData(prev => prev.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
    toast.success("Status updated");
  }

  function formatM(n: number) {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    return `$${(n / 1000).toFixed(0)}k`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Headcount &amp; HR Budget</h1>
        <p className="text-slate-500 text-sm mt-1">Plan workforce growth and manage HR budgets</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Current Headcount", value: totalCurrent, color: "text-blue-600" },
          { label: "Planned Year-End", value: totalPlanned, color: "text-green-600" },
          { label: "Total HR Budget", value: formatM(totalBudgeted), color: "text-purple-600" },
          { label: "Budget Utilized", value: `${Math.round((totalActual / totalBudgeted) * 100)}%`, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["headcount", "budget"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "headcount" ? "Headcount Planning" : "HR Budget"}
            </button>
          ))}
        </div>

        {tab === "headcount" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  {["Q1", "Q2", "Q3", "Q4"].map(q => (
                    <th key={q} colSpan={2} className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-100">
                      {q} 2024
                    </th>
                  ))}
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-400">
                  <td />
                  {["Q1", "Q2", "Q3", "Q4"].map(q => (
                    <>
                      <td key={`${q}c`} className="text-center px-3 py-1 border-l border-slate-100">Current</td>
                      <td key={`${q}p`} className="text-center px-3 py-1">Planned</td>
                    </>
                  ))}
                  <td /><td />
                </tr>
              </thead>
              <tbody>
                {headcountData.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{row.dept}</td>
                    {[
                      [row.q1Current, row.q1Planned],
                      [row.q2Current, row.q2Planned],
                      [row.q3Current, row.q3Planned],
                      [row.q4Current, row.q4Planned],
                    ].map(([cur, plan], i) => (
                      <>
                        <td key={`c${i}`} className="px-3 py-3.5 text-center text-slate-600 border-l border-slate-100">{cur}</td>
                        <td key={`p${i}`} className="px-3 py-3.5 text-center">
                          <span className={`font-semibold ${plan > cur ? "text-green-600" : "text-slate-900"}`}>{plan}</span>
                          {plan > cur && <span className="text-xs text-green-500 ml-1">+{plan - cur}</span>}
                        </td>
                      </>
                    ))}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {row.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleApproved(row.id)} className="text-xs text-blue-600 hover:underline">
                        {row.approved ? "Revoke" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "budget" && (
          <div className="p-6 space-y-4">
            {BUDGET_DATA.map((b) => {
              const pct = Math.round((b.actual / b.budgeted) * 100);
              const variance = b.actual - b.budgeted;
              return (
                <div key={b.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{b.category}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variance < 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {variance < 0 ? `${formatM(Math.abs(variance))} under` : `${formatM(variance)} over`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="text-slate-500">Budgeted: <span className="font-semibold text-slate-900">{formatM(b.budgeted)}</span></span>
                    <span className="text-slate-500">Actual: <span className="font-semibold text-slate-900">{formatM(b.actual)}</span></span>
                    <span className="text-slate-500">Used: <span className={`font-semibold ${pct > 100 ? "text-red-600" : pct > 85 ? "text-amber-600" : "text-green-600"}`}>{pct}%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${pct > 100 ? "bg-red-500" : pct > 85 ? "bg-amber-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Total HR Budget</span>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Budgeted: <span className="font-semibold text-slate-900">{formatM(totalBudgeted)}</span></p>
                  <p className="text-sm text-slate-500">Actual: <span className="font-semibold text-green-600">{formatM(totalActual)}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
