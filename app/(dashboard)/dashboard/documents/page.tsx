"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDate, formatNumber } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  isPublic: boolean;
  expiresAt?: string;
  tags: string[];
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  OFFER_LETTER: "📄", CONTRACT: "📑", WARNING_LETTER: "⚠️",
  EXPERIENCE_LETTER: "📜", CERTIFICATE: "🏆", POLICY: "📋",
  PAYSLIP: "💰", OTHER: "📁",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", type: "OTHER", fileUrl: "", tags: "", isPublic: false });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Document added!");
      setShowForm(false);
      fetchDocs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const docTypes = ["OFFER_LETTER", "CONTRACT", "WARNING_LETTER", "EXPERIENCE_LETTER", "CERTIFICATE", "POLICY", "PAYSLIP", "OTHER"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-slate-500 text-sm mt-1">HR documents, contracts, and certificates</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Document
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Document</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Tags</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Visibility</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No documents yet.</td></tr>
              ) : docs.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TYPE_ICONS[doc.type] ?? "📁"}</span>
                      <p className="font-medium text-slate-900">{doc.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{doc.type.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag) => <span key={tag} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${doc.isPublic ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {doc.isPublic ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{formatDate(doc.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium">Download</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Document</h2>
              <button onClick={() => setShowForm(false)}><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {docTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File URL</label>
                <input type="url" required value={form.fileUrl} onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                  placeholder="https://..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="hr, contract, 2026" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="public" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="public" className="text-sm text-slate-700">Make public (visible to all employees)</label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:bg-blue-400">
                  {submitting ? "Saving..." : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
