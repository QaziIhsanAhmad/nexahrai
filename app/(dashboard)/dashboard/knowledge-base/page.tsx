"use client";

import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["All", "HR Policies", "Benefits", "Onboarding", "IT", "Finance", "General"];

const DEMO_ARTICLES = [
  { id: "1", title: "Remote Work Policy", category: "HR Policies", updatedAt: "2024-01-15", views: 234, isPublished: true, tags: ["remote", "policy"] },
  { id: "2", title: "Employee Benefits Guide 2024", category: "Benefits", updatedAt: "2024-02-01", views: 189, isPublished: true, tags: ["benefits", "guide"] },
  { id: "3", title: "New Employee Onboarding Checklist", category: "Onboarding", updatedAt: "2024-01-20", views: 312, isPublished: true, tags: ["onboarding", "checklist"] },
  { id: "4", title: "IT Equipment Setup Guide", category: "IT", updatedAt: "2024-01-10", views: 156, isPublished: true, tags: ["it", "setup"] },
  { id: "5", title: "Expense Reimbursement Policy", category: "Finance", updatedAt: "2024-01-25", views: 98, isPublished: true, tags: ["expense", "finance"] },
  { id: "6", title: "Code of Conduct", category: "HR Policies", updatedAt: "2023-12-15", views: 445, isPublished: true, tags: ["conduct", "policy"] },
  { id: "7", title: "PTO & Leave Policy", category: "HR Policies", updatedAt: "2024-02-05", views: 278, isPublished: true, tags: ["leave", "pto"] },
  { id: "8", title: "Performance Review Guide", category: "HR Policies", updatedAt: "2024-01-30", views: 167, isPublished: false, tags: ["performance", "review"] },
  { id: "9", title: "Health Insurance Overview", category: "Benefits", updatedAt: "2024-02-10", views: 203, isPublished: true, tags: ["health", "insurance"] },
];

const emptyForm = { title: "", category: "General", content: "", tags: "" };

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<typeof DEMO_ARTICLES[0] | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [articles, setArticles] = useState(DEMO_ARTICLES);

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newArt = {
      id: Date.now().toString(),
      title: form.title,
      category: form.category,
      updatedAt: new Date().toISOString().split("T")[0],
      views: 0,
      isPublished: false,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    setArticles(prev => [newArt, ...prev]);
    toast.success("Article created successfully!");
    setShowModal(false);
    setForm({ ...emptyForm });
  }

  const catColors: Record<string, string> = {
    "HR Policies": "bg-blue-100 text-blue-700",
    "Benefits": "bg-green-100 text-green-700",
    "Onboarding": "bg-purple-100 text-purple-700",
    "IT": "bg-amber-100 text-amber-700",
    "Finance": "bg-red-100 text-red-700",
    "General": "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-500 text-sm mt-1">Company wiki, policies, and documentation</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Article
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === c ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>
                {c}
                <span className="ml-2 text-xs text-slate-400">
                  {c === "All" ? articles.length : articles.filter(a => a.category === c).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => setSelectedArticle(a)}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[a.category] || "bg-slate-100 text-slate-600"}`}>{a.category}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {a.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{a.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Updated {a.updatedAt}</span>
                  <span>•</span>
                  <span>{a.views} views</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {a.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              No articles found. Try a different search or category.
            </div>
          )}
        </div>
      </div>

      {/* Article View */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[selectedArticle.category] || "bg-slate-100 text-slate-600"}`}>{selectedArticle.category}</span>
                <h2 className="text-lg font-semibold text-slate-900 mt-2">{selectedArticle.title}</h2>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4 text-sm text-slate-500">
                <span>Last updated: {selectedArticle.updatedAt}</span>
                <span>•</span>
                <span>{selectedArticle.views} views</span>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed">This article covers important information about {selectedArticle.title.toLowerCase()}. The full content would be loaded from the database in a production environment.</p>
                <p className="text-slate-600 leading-relaxed mt-3">Key points include organizational policies, procedures, and guidelines that all employees should be aware of.</p>
              </div>
              <div className="flex gap-2 pt-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">New Article</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.filter(c => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea rows={5} value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write the article content here..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="policy, hr, guide"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Create Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
