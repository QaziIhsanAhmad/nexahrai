"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: string;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  processedAt?: string;
  _count?: { items: number };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll");
      const data = await res.json();
      setRuns(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  async function handleRunPayroll() {
    setRunning(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Payroll for ${MONTHS[form.month - 1]} ${form.year} processed!`);
      fetchPayroll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to run payroll");
    } finally {
      setRunning(false);
    }
  }

  const statusColor: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    PROCESSING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const totalPaidOut = runs.filter((r) => r.status === "COMPLETED").reduce((sum, r) => sum + r.totalNet, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="text-slate-500 text-sm mt-1">Manage salary processing and payslips</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Paid Out (All Time)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalPaidOut)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Payroll Runs</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{runs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Last Run</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {runs[0] ? `${MONTHS[runs[0].month - 1]} ${runs[0].year}` : "—"}
          </p>
        </div>
      </div>

      {/* Run Payroll */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Run New Payroll</h2>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
            <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
            <select value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handleRunPayroll} disabled={running}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            {running ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : "Run Payroll"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Payroll is calculated based on attendance, leave records, and salary structures.
        </p>
      </div>

      {/* Payroll History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Payroll History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employees</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Gross Pay</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Deductions</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Net Pay</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No payroll runs yet.</td></tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{MONTHS[run.month - 1]} {run.year}</td>
                    <td className="px-5 py-3.5 text-slate-600">{run._count?.items ?? 0}</td>
                    <td className="px-5 py-3.5 text-slate-900 font-medium">{formatCurrency(run.totalGross)}</td>
                    <td className="px-5 py-3.5 text-red-600">{formatCurrency(run.totalDeductions)}</td>
                    <td className="px-5 py-3.5 text-green-700 font-semibold">{formatCurrency(run.totalNet)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor[run.status] ?? "bg-slate-100"}`}>
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
