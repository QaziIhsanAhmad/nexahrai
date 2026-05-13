"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface OverviewStats {
  totalEmployees: number;
  activeEmployees: number;
  totalJobs: number;
  totalApplications: number;
  hiredThisYear: number;
  payrollThisYear: number;
  attendanceToday: number;
  pendingLeaves: number;
}

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [headcount, setHeadcount] = useState<Array<{ month: string; count: number }>>([]);
  const [recruitment, setRecruitment] = useState<{ pipeline: Array<{ status: string; _count: { id: number } }>; monthly: Array<{ month: string; applications: number; hired: number }> }>({ pipeline: [], monthly: [] });
  const [payroll, setPayroll] = useState<Array<{ month: string; gross: number; net: number; deductions: number }>>([]);
  const [departments, setDepartments] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, headcountRes, recruitmentRes, payrollRes, deptRes] = await Promise.all([
        fetch(`/api/analytics?type=overview&year=${year}`),
        fetch(`/api/analytics?type=headcount&year=${year}`),
        fetch(`/api/analytics?type=recruitment&year=${year}`),
        fetch(`/api/analytics?type=payroll&year=${year}`),
        fetch(`/api/analytics?type=departments`),
      ]);

      const [o, h, r, p, d] = await Promise.all([
        overviewRes.json(), headcountRes.json(), recruitmentRes.json(), payrollRes.json(), deptRes.json(),
      ]);

      setOverview(o);
      setHeadcount(Array.isArray(h) ? h : []);
      setRecruitment(r?.pipeline ? r : { pipeline: [], monthly: [] });
      setPayroll(Array.isArray(p) ? p : []);
      setDepartments(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  const statCards = overview ? [
    { label: "Total Employees", value: overview.totalEmployees, sub: `${overview.activeEmployees} active` },
    { label: "Hired This Year", value: overview.hiredThisYear, sub: `of ${overview.totalApplications} applicants` },
    { label: "Payroll (YTD)", value: formatCurrency(overview.payrollThisYear), sub: "Net paid out" },
    { label: "Present Today", value: overview.attendanceToday, sub: "checked in" },
    { label: "Open Jobs", value: overview.totalJobs, sub: "active postings" },
    { label: "Pending Leaves", value: overview.pendingLeaves, sub: "awaiting approval" },
  ] : [];

  const pipelineData = recruitment.pipeline.map((p) => ({
    name: p.status.replace(/_/g, " "),
    value: p._count.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">HR insights for {year}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5 leading-tight">{card.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Headcount Trend {year}</h2>
          {headcount.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={headcount}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Employees" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Recruitment Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Application Pipeline</h2>
          {pipelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pipelineData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No applications yet</div>
          )}
        </div>

        {/* Monthly Hiring */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Hiring Activity</h2>
          {recruitment.monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recruitment.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#dbeafe" name="Applications" radius={[3, 3, 0, 0]} />
                <Bar dataKey="hired" fill="#2563eb" name="Hired" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Payroll Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Payroll Overview</h2>
          {payroll.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payroll}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11, width: 70 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="gross" fill="#ddd6fe" name="Gross" radius={[3, 3, 0, 0]} />
                <Bar dataKey="net" fill="#7c3aed" name="Net" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No payroll data yet</div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-1 lg:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-4">Employees by Department</h2>
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" name="Employees" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No departments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
