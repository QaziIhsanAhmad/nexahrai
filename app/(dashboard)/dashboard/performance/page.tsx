"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  period: string;
  year: number;
  type: string;
  status: string;
  overallScore?: number;
  reviewee: { firstName: string; lastName: string; position?: { title: string } };
  reviewer: { firstName: string; lastName: string };
  createdAt: string;
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/performance");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    ACKNOWLEDGED: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Management</h1>
          <p className="text-slate-500 text-sm mt-1">KPIs, reviews and appraisals</p>
        </div>
        <button onClick={() => toast.info("Create review form — add employees and review cycles")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Review
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length, icon: "📋" },
          { label: "Completed", value: reviews.filter((r) => r.status === "COMPLETED").length, icon: "✅" },
          { label: "In Progress", value: reviews.filter((r) => r.status === "IN_PROGRESS").length, icon: "🔄" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <span className="text-3xl">{c.icon}</span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Reviewer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📊</span>
                      <p className="text-slate-500">No performance reviews yet</p>
                      <p className="text-slate-400 text-xs">Create review cycles to track employee performance</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{r.reviewee.firstName} {r.reviewee.lastName}</p>
                      <p className="text-xs text-slate-400">{r.reviewee.position?.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{r.reviewer.firstName} {r.reviewer.lastName}</td>
                    <td className="px-5 py-3.5 text-slate-600">{r.period} {r.year}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{r.type}</td>
                    <td className="px-5 py-3.5">
                      {r.overallScore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.overallScore}%` }} />
                          </div>
                          <span className="text-xs font-medium">{r.overallScore.toFixed(1)}</span>
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[r.status] ?? "bg-slate-100"}`}>
                        {r.status.replace(/_/g, " ")}
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
