"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  location?: string;
  employmentType: string;
  isPublished: boolean;
  isActive: boolean;
  openings: number;
  deadline?: string;
  createdAt: string;
  _count?: { applications: number };
}

interface Application {
  id: string;
  status: string;
  aiScore?: number;
  appliedAt: string;
  candidate: { firstName: string; lastName: string; email: string };
  jobPosting: { title: string };
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-slate-100 text-slate-700",
  SCREENING: "bg-blue-100 text-blue-700",
  AI_SCREENED: "bg-purple-100 text-purple-700",
  INTERVIEW_SCHEDULED: "bg-yellow-100 text-yellow-700",
  INTERVIEWED: "bg-orange-100 text-orange-700",
  OFFER_SENT: "bg-teal-100 text-teal-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-700",
};

export default function RecruitmentPage() {
  const [tab, setTab] = useState<"jobs" | "applications">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [screening, setScreening] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", requirements: "", responsibilities: "",
    skills: "", experience: "", education: "", location: "", isRemote: false,
    salaryMin: "", salaryMax: "", openings: "1", deadline: "", isPublished: true,
    employmentType: "FULL_TIME",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recruitment/jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recruitment/applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "jobs") fetchJobs();
    else fetchApplications();
  }, [tab, fetchJobs, fetchApplications]);

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/recruitment/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
          openings: parseInt(form.openings),
          deadline: form.deadline || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Job posted successfully!");
      setShowForm(false);
      fetchJobs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAIScreen(appId: string, resumeText: string) {
    setScreening(appId);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parse-resume", resumeText, applicationId: appId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`AI Score: ${data.matchScore?.toFixed(0) ?? "N/A"}%`);
      fetchApplications();
    } catch {
      toast.error("AI screening failed");
    } finally {
      setScreening(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recruitment</h1>
          <p className="text-slate-500 text-sm mt-1">Manage job postings and applications</p>
        </div>
        {tab === "jobs" && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Job
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["jobs", "applications"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            {t === "jobs" ? "Job Postings" : "Applications"}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {tab === "jobs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-slate-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-slate-400">No job postings yet.</div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900">{job.title}</h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${job.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {job.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    {job.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01" /></svg>
                    {job.employmentType.replace(/_/g, " ")} · {job.openings} opening{job.openings !== 1 ? "s" : ""}
                  </div>
                  {job.deadline && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Deadline: {formatDate(job.deadline)}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600">{job._count?.applications ?? 0} applications</span>
                  <span className="text-xs text-slate-400">{formatDate(job.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Applications Table */}
      {tab === "applications" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Candidate</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Job</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">AI Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Applied</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No applications yet.</td></tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{app.candidate.firstName} {app.candidate.lastName}</p>
                        <p className="text-xs text-slate-400">{app.candidate.email}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{app.jobPosting.title}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {app.aiScore ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${app.aiScore >= 70 ? "bg-green-500" : app.aiScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${app.aiScore}%` }} />
                            </div>
                            <span className="text-xs text-slate-700 font-medium">{app.aiScore.toFixed(0)}%</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAIScreen(app.id, "Sample resume text for demo")}
                            disabled={screening === app.id}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50">
                            {screening === app.id ? "Screening..." : "Run AI Screen"}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{formatDate(app.appliedAt)}</td>
                      <td className="px-5 py-3">
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Post a Job</h2>
              <button onClick={() => setShowForm(false)}>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea rows={4} required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input type="text" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"].map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Salary ($)</label>
                  <input type="number" value={form.salaryMin} onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Salary ($)</label>
                  <input type="number" value={form.salaryMax} onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Openings</label>
                  <input type="number" min="1" value={form.openings} onChange={(e) => setForm((f) => ({ ...f, openings: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="publish" checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="publish" className="text-sm text-slate-700">Publish immediately</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg">
                  {submitting ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
