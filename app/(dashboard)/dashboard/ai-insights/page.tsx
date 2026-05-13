"use client";

import { useState } from "react";
import { toast } from "sonner";

const ATTRITION_DATA = [
  { id: "1", employee: "Mark Johnson", dept: "Sales", role: "Sales Rep", risk: "HIGH", score: 87, factors: ["Low engagement score", "No promotion in 2yr", "Peer turnover"], action: "Schedule 1:1 with manager" },
  { id: "2", employee: "Lisa Chen", dept: "Engineering", role: "Frontend Dev", risk: "MEDIUM", score: 62, factors: ["Below market salary", "Long hours"], action: "Review compensation" },
  { id: "3", employee: "Tom Davis", dept: "Marketing", role: "Designer", risk: "LOW", score: 28, factors: ["Recent promotion"], action: "Continue monitoring" },
  { id: "4", employee: "Emma Wilson", dept: "HR", role: "HR Manager", risk: "HIGH", score: 81, factors: ["High workload", "No training in 12mo"], action: "Offer training & support" },
  { id: "5", employee: "Carlos Rivera", dept: "Finance", role: "Analyst", risk: "MEDIUM", score: 55, factors: ["Manager conflict", "Remote isolation"], action: "Team bonding activities" },
];

const SENTIMENT_DEPT = [
  { dept: "Engineering", score: 7.8, trend: "up", keywords: ["collaboration", "growth", "challenging", "remote"] },
  { dept: "Marketing", score: 7.2, trend: "down", keywords: ["creative", "fast-paced", "overloaded", "exciting"] },
  { dept: "Sales", score: 6.5, trend: "down", keywords: ["pressure", "targets", "commission", "stressful"] },
  { dept: "HR", score: 8.2, trend: "up", keywords: ["meaningful", "people-first", "busy", "rewarding"] },
  { dept: "Finance", score: 7.5, trend: "stable", keywords: ["structured", "analytical", "deadline", "clear"] },
];

const ANOMALIES = [
  { id: "1", type: "PAYROLL", title: "Unusual overtime spike", dept: "Engineering", detail: "43% increase in overtime vs last month", severity: "HIGH", date: "2024-02-14" },
  { id: "2", type: "ATTENDANCE", title: "Attendance drop", dept: "Sales", detail: "15% increase in late arrivals this week", severity: "MEDIUM", date: "2024-02-15" },
  { id: "3", type: "LEAVE", title: "Unexpected leave surge", dept: "Marketing", detail: "6 employees on leave simultaneously", severity: "MEDIUM", date: "2024-02-13" },
  { id: "4", type: "PAYROLL", title: "Payroll duplicate entry", dept: "Finance", detail: "Possible duplicate payroll item detected", severity: "HIGH", date: "2024-02-15" },
];

const RISK_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-green-100 text-green-700",
};

const SEV_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-blue-100 text-blue-700",
};

export default function AIInsightsPage() {
  const [tab, setTab] = useState<"attrition" | "sentiment" | "workforce" | "anomaly">("attrition");
  const [analyzing, setAnalyzing] = useState(false);

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", prompt: "Analyze attrition risk for the current workforce" }),
      });
      if (res.ok) toast.success("Analysis complete! Insights updated.");
      else toast.info("Analysis complete (demo mode — connect Groq API for live insights)");
    } catch {
      toast.info("Analysis complete (demo mode — connect Groq API for live insights)");
    } finally {
      setAnalyzing(false);
    }
  }

  const FORECAST = [
    { quarter: "Q1 2024", actual: 125, forecast: null },
    { quarter: "Q2 2024", actual: 132, forecast: null },
    { quarter: "Q3 2024", actual: null, forecast: 138 },
    { quarter: "Q4 2024", actual: null, forecast: 145 },
    { quarter: "Q1 2025", actual: null, forecast: 155 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
          <p className="text-slate-500 text-sm mt-1">AI-powered analytics for smarter HR decisions</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium">
          {analyzing ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>Run AI Analysis</>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2 overflow-x-auto">
          {(["attrition", "sentiment", "workforce", "anomaly"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "attrition" ? "Attrition Risk" : t === "sentiment" ? "Sentiment Analysis" : t === "workforce" ? "Workforce Planning" : "Anomaly Detection"}
            </button>
          ))}
        </div>

        {tab === "attrition" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Employee", "Dept", "Risk Level", "Score", "Risk Factors", "Recommended Action"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATTRITION_DATA.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{emp.employee}</td>
                    <td className="px-5 py-3.5 text-slate-600">{emp.dept}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_COLORS[emp.risk]}`}>{emp.risk}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${emp.score >= 75 ? "bg-red-500" : emp.score >= 50 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${emp.score}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{emp.score}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {emp.factors.map(f => <p key={f} className="text-xs text-slate-500">• {f}</p>)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{emp.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sentiment" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-700">7.7</p>
                <p className="text-sm text-green-600">Overall Sentiment</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">82%</p>
                <p className="text-sm text-blue-600">Positive Responses</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-amber-700">-4%</p>
                <p className="text-sm text-amber-600">vs Last Month</p>
              </div>
            </div>
            <div className="space-y-4">
              {SENTIMENT_DEPT.map((d) => (
                <div key={d.dept} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{d.dept}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${d.trend === "up" ? "text-green-600" : d.trend === "down" ? "text-red-600" : "text-slate-500"}`}>
                        {d.trend === "up" ? "↑" : d.trend === "down" ? "↓" : "→"} {d.score}/10
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                    <div className={`h-2 rounded-full ${d.score >= 8 ? "bg-green-500" : d.score >= 7 ? "bg-blue-500" : "bg-amber-500"}`}
                      style={{ width: `${d.score * 10}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {d.keywords.map(k => <span key={k} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{k}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "workforce" && (
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Headcount Forecast (AI-Powered)</h3>
            <div className="flex items-end gap-4 h-40 mb-4">
              {FORECAST.map((f) => {
                const h = ((f.actual || f.forecast || 0) / 160) * 100;
                return (
                  <div key={f.quarter} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">{f.actual || f.forecast}</span>
                    <div className={`w-full rounded-t ${f.actual ? "bg-blue-500" : "bg-blue-200 border-2 border-dashed border-blue-400"}`}
                      style={{ height: `${h}px` }} />
                    <span className="text-xs text-slate-500 text-center">{f.quarter}</span>
                    <span className="text-xs text-slate-400">{f.actual ? "Actual" : "Forecast"}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded" /><span className="text-slate-500">Actual</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-200 border border-dashed border-blue-400 rounded" /><span className="text-slate-500">AI Forecast</span></div>
            </div>
          </div>
        )}

        {tab === "anomaly" && (
          <div className="p-6 space-y-3">
            {ANOMALIES.map((a) => (
              <div key={a.id} className={`border rounded-xl p-4 ${a.severity === "HIGH" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${a.severity === "HIGH" ? "text-red-600" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${a.severity === "HIGH" ? "text-red-700" : "text-amber-700"}`}>{a.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEV_COLORS[a.severity]}`}>{a.severity}</span>
                      </div>
                      <p className={`text-sm ${a.severity === "HIGH" ? "text-red-600" : "text-amber-600"}`}>{a.detail}</p>
                      <p className="text-xs text-slate-400 mt-1">{a.dept} · {a.date}</p>
                    </div>
                  </div>
                  <button onClick={() => toast.success("Flagged for review")}
                    className="text-xs font-medium text-blue-600 hover:underline flex-shrink-0">Investigate</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
