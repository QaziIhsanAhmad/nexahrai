"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Shift {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  breakMinutes: number;
  isActive: boolean;
  _count?: { assignments: number };
}

export default function SchedulingPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "MORNING", startTime: "09:00", endTime: "18:00",
    workingDays: ["MON", "TUE", "WED", "THU", "FRI"] as string[],
    breakMinutes: "60",
  });

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scheduling");
      const data = await res.json();
      setShifts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  function toggleDay(day: string) {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, breakMinutes: parseInt(form.breakMinutes) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Shift created!");
      setShowForm(false);
      fetchShifts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const typeColors: Record<string, string> = {
    MORNING: "bg-yellow-100 text-yellow-700",
    AFTERNOON: "bg-orange-100 text-orange-700",
    NIGHT: "bg-blue-100 text-blue-700",
    FLEXIBLE: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift & Scheduling</h1>
          <p className="text-slate-500 text-sm mt-1">Manage work shifts and duty rosters</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading...</div>
        ) : shifts.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">No shifts defined.</div>
        ) : shifts.map((shift) => (
          <div key={shift.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{shift.name}</h3>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeColors[shift.type] ?? "bg-slate-100 text-slate-600"}`}>{shift.type}</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <span>🕒</span>{shift.startTime} — {shift.endTime}
                <span className="text-xs text-slate-400">({shift.breakMinutes}min break)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {DAYS.map((d) => (
                  <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${shift.workingDays.includes(d) ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{d}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{shift._count?.assignments ?? 0} employees assigned</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Shift</h2>
              <button onClick={() => setShowForm(false)}><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shift Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["MORNING", "AFTERNOON", "NIGHT", "FLEXIBLE"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${form.workingDays.includes(d) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:bg-blue-400">
                  {submitting ? "Creating..." : "Create Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
