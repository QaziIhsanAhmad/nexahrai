"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ExitRequest {
  id: string;
  resignationType: string;
  lastWorkingDate: string;
  reason?: string;
  status: string;
  noticePeriod: number;
  clearanceItems: Array<{ id: string; department: string; item: string; status: string }>;
  employee: { firstName: string; lastName: string; employeeId: string; department?: { name: string }; position?: { title: string } };
}

export default function ExitPage() {
  const [requests, setRequests] = useState<ExitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    lastWorkingDate: "", reason: "", resignationType: "RESIGNATION", noticePeriod: "30",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exit");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, noticePeriod: parseInt(form.noticePeriod) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Resignation submitted. HR will be in touch.");
      setShowForm(false);
      fetchRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    CLEARED: "bg-teal-100 text-teal-700",
    COMPLETED: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exit Management</h1>
          <p className="text-slate-500 text-sm mt-1">Resignation, clearance and final settlement</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Submit Resignation
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <span className="text-4xl">🚪</span>
            <p className="text-slate-400 mt-3">No exit requests</p>
          </div>
        ) : requests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{req.employee.firstName} {req.employee.lastName}</h3>
                <p className="text-xs text-slate-400">{req.employee.position?.title} · {req.employee.department?.name}</p>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[req.status] ?? "bg-slate-100"}`}>
                {req.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div><p className="text-xs text-slate-400">Type</p><p className="font-medium">{req.resignationType}</p></div>
              <div><p className="text-xs text-slate-400">Last Working Day</p><p className="font-medium">{formatDate(req.lastWorkingDate)}</p></div>
              <div><p className="text-xs text-slate-400">Notice Period</p><p className="font-medium">{req.noticePeriod} days</p></div>
              {req.reason && <div><p className="text-xs text-slate-400">Reason</p><p className="font-medium truncate">{req.reason}</p></div>}
            </div>
            {req.clearanceItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">CLEARANCE CHECKLIST</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {req.clearanceItems.map((item) => (
                    <div key={item.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${item.status === "CLEARED" ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-600"}`}>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.status === "CLEARED" ? "bg-green-500" : "bg-slate-300"}`} />
                      {item.department}: {item.item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-red-600">Submit Resignation</h2>
              <button onClick={() => setShowForm(false)}><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-3 mb-4">
              ⚠️ This will initiate your exit process. Once submitted, HR will review and initiate the clearance process.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resignation Type</label>
                <select value={form.resignationType} onChange={(e) => setForm((f) => ({ ...f, resignationType: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="RESIGNATION">Voluntary Resignation</option>
                  <option value="RETIREMENT">Retirement</option>
                  <option value="MUTUAL_AGREEMENT">Mutual Agreement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Proposed Last Working Date</label>
                <input type="date" required value={form.lastWorkingDate} onChange={(e) => setForm((f) => ({ ...f, lastWorkingDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
                <textarea rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:bg-red-400">
                  {submitting ? "Submitting..." : "Submit Resignation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
