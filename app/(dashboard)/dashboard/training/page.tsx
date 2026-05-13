"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  category?: string;
  duration?: number;
  status: string;
  isMandatory: boolean;
  _count?: { enrollments: number; modules: number };
}

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", duration: "", isMandatory: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/training");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration: form.duration ? parseInt(form.duration) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Course created!");
      setShowForm(false);
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Training & LMS</h1>
          <p className="text-slate-500 text-sm mt-1">Manage courses and employee development</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">No courses yet.</div>
        ) : courses.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📚</div>
              <div className="flex gap-1.5">
                {c.isMandatory && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Mandatory</span>}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{c.status}</span>
              </div>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{c.title}</h3>
            <p className="text-xs text-slate-400">{c.category} {c.duration ? `· ${c.duration} min` : ""}</p>
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>{c._count?.modules ?? 0} modules</span>
              <span>{c._count?.enrollments ?? 0} enrolled</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Course</h2>
              <button onClick={() => setShowForm(false)}><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[["title", "Title", "text", true], ["category", "Category", "text", false], ["duration", "Duration (minutes)", "number", false]].map(([k, l, t, r]) => (
                <div key={k as string}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{l as string}</label>
                  <input type={t as string} required={r as boolean} value={form[k as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [k as string]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="mandatory" checked={form.isMandatory} onChange={(e) => setForm((f) => ({ ...f, isMandatory: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="mandatory" className="text-sm text-slate-700">Mandatory course</label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg">
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
