"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { formatDate, getStatusColor } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currency";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  phone?: string;
  employmentStatus: string;
  employmentType: string;
  joinDate: string;
  basicSalary: number;
  currency?: string;
  department?: { name: string };
  position?: { title: string };
  manager?: { firstName: string; lastName: string };
  user?: { email: string };
}

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  departmentId: "", positionId: "",
  joinDate: new Date().toISOString().split("T")[0],
  employmentType: "FULL_TIME",
  basicSalary: "",
  currency: "USD",
  gender: "",
  nationality: "",
  postcode: "",
  city: "",
  country: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  // Postcode auto-location state
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [locationFound, setLocationFound] = useState<string | null>(null);
  const postcodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // Postcode auto-lookup with 600ms debounce
  function handlePostcodeChange(value: string) {
    setForm(f => ({ ...f, postcode: value }));
    setLocationFound(null);
    if (postcodeTimerRef.current) clearTimeout(postcodeTimerRef.current);
    if (!value.trim() || value.trim().length < 3) return;
    postcodeTimerRef.current = setTimeout(async () => {
      setPostcodeLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(value)}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data?.length > 0) {
          const result = data[0];
          const parts = (result.display_name || "").split(",").map((s: string) => s.trim());
          const city = parts[1] || parts[0] || "";
          const country = parts[parts.length - 1] || "";
          setForm(f => ({ ...f, city, country }));
          setLocationFound(`${city}, ${country}`);
        }
      } catch {
        // silently fail
      } finally {
        setPostcodeLoading(false);
      }
    }, 600);
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Employee added successfully");
      setShowForm(false);
      setForm({ ...emptyForm });
      fetchEmployees();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  }

  const statusOptions = ["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED", "RESIGNED"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your workforce</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, ID, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <button onClick={fetchEmployees}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading employees...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No employees found. Add your first employee.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-slate-400">{emp.employeeId} · {emp.user?.email || emp.workEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{emp.department?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{emp.position?.title ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {emp.employmentType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(emp.joinDate)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(emp.employmentStatus)}`}>
                        {emp.employmentStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {emp.currency || "USD"} {emp.basicSalary.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Employee</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["firstName", "First Name", "text", true],
                  ["lastName", "Last Name", "text", true],
                  ["email", "Work Email", "email", true],
                  ["phone", "Phone", "tel", false],
                  ["nationality", "Nationality", "text", false],
                  ["gender", "Gender", "text", false],
                  ["joinDate", "Join Date", "date", true],
                ] as [keyof typeof form, string, string, boolean][]).map(([key, label, type, required]) => (
                  <div key={key as string}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                    <input type={type} required={required}
                      value={form[key] as string}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}

                {/* Salary + Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary</label>
                  <input type="number" value={form.basicSalary} onChange={(e) => setForm(f => ({ ...f, basicSalary: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "FREELANCE"].map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                {/* Postcode with auto-fill */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Postcode / ZIP Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.postcode}
                      onChange={(e) => handlePostcodeChange(e.target.value)}
                      placeholder="e.g. SW1A 1AA or 10001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    {postcodeLoading && (
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </div>
                  {locationFound && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Location found: {locationFound}
                    </p>
                  )}
                </div>

                {/* City + Country auto-filled */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Auto-filled from postcode"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="Auto-filled from postcode"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors">
                  {submitting ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
