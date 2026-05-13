"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";

interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  purchasePrice?: number;
  location?: string;
  assignments?: Array<{ employee: { firstName: string; lastName: string }; assignedAt: string }>;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "", brand: "", model: "",
    serialNumber: "", purchasePrice: "", location: "",
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Asset added!");
      setShowForm(false);
      fetchAssets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const categoryIcons: Record<string, string> = {
    LAPTOP: "💻", DESKTOP: "🖥️", PHONE: "📱", TABLET: "📟",
    MONITOR: "🖥️", KEYBOARD: "⌨️", MOUSE: "🖱️", OTHER: "📦",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track company devices and equipment</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading...</div>
        ) : assets.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">No assets yet.</div>
        ) : assets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{categoryIcons[asset.category.toUpperCase()] ?? "📦"}</div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(asset.status)}`}>{asset.status}</span>
            </div>
            <h3 className="font-semibold text-slate-900">{asset.name}</h3>
            <p className="text-xs text-slate-400">{asset.brand} {asset.model} · {asset.assetId}</p>
            {asset.serialNumber && <p className="text-xs text-slate-400">S/N: {asset.serialNumber}</p>}
            {asset.purchasePrice && <p className="text-sm font-medium text-slate-600 mt-2">{formatCurrency(asset.purchasePrice)}</p>}
            {asset.assignments && asset.assignments[0] && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Assigned to: <span className="font-medium text-slate-700">{asset.assignments[0].employee.firstName} {asset.assignments[0].employee.lastName}</span></p>
                <p className="text-xs text-slate-400">Since {formatDate(asset.assignments[0].assignedAt)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Asset</h2>
              <button onClick={() => setShowForm(false)}><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {[["name", "Asset Name", "text", true], ["brand", "Brand", "text", false], ["model", "Model", "text", false], ["serialNumber", "Serial Number", "text", false], ["purchasePrice", "Purchase Price ($)", "number", false], ["location", "Location", "text", false]].map(([k, l, t, r]) => (
                <div key={k as string}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{l as string}</label>
                  <input type={t as string} required={r as boolean} value={form[k as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [k as string]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select category...</option>
                  {["Laptop", "Desktop", "Phone", "Tablet", "Monitor", "Keyboard", "Mouse", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:bg-blue-400">
                  {submitting ? "Adding..." : "Add Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
