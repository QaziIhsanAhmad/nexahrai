"use client";

import { useState } from "react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEKLY_DATA = [
  { employee: "Alice Chen", hours: [8, 7.5, 8, 8, 6, 0, 0], dept: "Engineering" },
  { employee: "Bob Martinez", hours: [7, 8, 7.5, 8, 7, 3, 0], dept: "Marketing" },
  { employee: "Carol Lee", hours: [8, 8, 8, 8, 8, 0, 0], dept: "Engineering" },
  { employee: "Dave Kim", hours: [6, 7, 8, 7.5, 8, 0, 0], dept: "Data Science" },
  { employee: "Emma Wilson", hours: [8, 8, 7, 8, 7.5, 0, 0], dept: "HR" },
];

const TIME_LOGS = [
  { id: "1", date: "2024-02-15", employee: "Alice Chen", project: "NextGen App", task: "Frontend Dev", hours: 8, billable: true, notes: "" },
  { id: "2", date: "2024-02-15", employee: "Bob Martinez", project: "Q1 Campaign", task: "Content Strategy", hours: 7, billable: false, notes: "Meeting with client" },
  { id: "3", date: "2024-02-15", employee: "Carol Lee", project: "API Migration", task: "Testing", hours: 8, billable: true, notes: "" },
  { id: "4", date: "2024-02-14", employee: "Dave Kim", project: "ML Model v2", task: "Model Training", hours: 6, billable: true, notes: "GPU time" },
  { id: "5", date: "2024-02-14", employee: "Emma Wilson", project: "HR Platform", task: "Documentation", hours: 8, billable: false, notes: "" },
];

const emptyForm = { date: new Date().toISOString().split("T")[0], employee: "", project: "", task: "", hours: "", billable: false, notes: "" };

export default function TimeTrackingPage() {
  const [tab, setTab] = useState<"weekly" | "logs">("weekly");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [logs, setLogs] = useState(TIME_LOGS);

  const totalHours = WEEKLY_DATA.reduce((s, e) => s + e.hours.reduce((a, b) => a + b, 0), 0);
  const billableHours = logs.filter(l => l.billable).reduce((s, l) => s + l.hours, 0);
  const avgDaily = (totalHours / (WEEKLY_DATA.length * 5)).toFixed(1);
  const projects = [...new Set(logs.map(l => l.project))].length;

  function getCellColor(h: number) {
    if (h === 0) return "bg-slate-100 text-slate-400";
    if (h >= 8) return "bg-green-100 text-green-700";
    if (h >= 6) return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  }

  function handleLog(e: React.FormEvent) {
    e.preventDefault();
    setLogs(prev => [{
      id: Date.now().toString(),
      date: form.date,
      employee: form.employee,
      project: form.project,
      task: form.task,
      hours: parseFloat(form.hours) || 0,
      billable: form.billable,
      notes: form.notes,
    }, ...prev]);
    toast.success("Time logged successfully");
    setShowModal(false);
    setForm({ ...emptyForm });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Tracking</h1>
          <p className="text-slate-500 text-sm mt-1">Track team hours, projects, and billable time</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Log Time
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Hours This Week", value: `${totalHours}h`, color: "text-blue-600" },
          { label: "Billable Hours", value: `${billableHours}h`, color: "text-green-600" },
          { label: "Active Projects", value: projects, color: "text-purple-600" },
          { label: "Avg Daily Hours", value: `${avgDaily}h`, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex gap-1 pt-2">
          {(["weekly", "logs"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "weekly" ? "Weekly View" : "Time Logs"}
            </button>
          ))}
        </div>

        {tab === "weekly" && (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                  {DAYS.map(d => (
                    <th key={d} className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">{d}</th>
                  ))}
                  <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {WEEKLY_DATA.map((row) => {
                  const total = row.hours.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={row.employee} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-900">{row.employee}</p>
                        <p className="text-xs text-slate-400">{row.dept}</p>
                      </td>
                      {row.hours.map((h, i) => (
                        <td key={i} className="px-3 py-3 text-center">
                          <span className={`inline-block w-10 py-0.5 rounded text-xs font-medium ${getCellColor(h)}`}>
                            {h > 0 ? `${h}h` : "—"}
                          </span>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center font-semibold text-slate-900">{total}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "logs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Date", "Employee", "Project / Task", "Hours", "Billable", "Notes"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-slate-600">{log.date}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{log.employee}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-900">{log.project}</p>
                      <p className="text-xs text-slate-400">{log.task}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{log.hours}h</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.billable ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {log.billable ? "Billable" : "Internal"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{log.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Log Time</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleLog} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
                  <input required value={form.employee} onChange={(e) => setForm(f => ({ ...f, employee: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                  <input value={form.project} onChange={(e) => setForm(f => ({ ...f, project: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Task</label>
                  <input value={form.task} onChange={(e) => setForm(f => ({ ...f, task: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hours *</label>
                  <input type="number" step="0.5" min="0.5" max="24" required value={form.hours} onChange={(e) => setForm(f => ({ ...f, hours: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="billable" checked={form.billable} onChange={(e) => setForm(f => ({ ...f, billable: e.target.checked }))} />
                  <label htmlFor="billable" className="text-sm text-slate-700">Billable hours</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Log Time</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
