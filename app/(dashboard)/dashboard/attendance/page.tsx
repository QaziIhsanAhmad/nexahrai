"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/utils";

interface AttendanceLog {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  overtime?: number;
  status: string;
  employee: { firstName: string; lastName: string; employeeId: string };
}

interface LeaveRequest {
  id: string;
  status: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string; department?: { name: string } };
  leaveType: { name: string };
}

interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  leaveType: string;
}

export default function AttendancePage() {
  const [tab, setTab] = useState<"attendance" | "leave">("attendance");
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: "", startDate: "", endDate: "", reason: "",
  });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/attendance?from=${today}&to=${today}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeave = useCallback(async () => {
    setLoading(true);
    try {
      const [leavesRes, typesRes] = await Promise.all([
        fetch("/api/leave"),
        fetch("/api/leave/types"),
      ]);
      const leavesData = await leavesRes.json();
      const typesData = await typesRes.json();
      setLeaveRequests(Array.isArray(leavesData) ? leavesData : []);
      setLeaveTypes(Array.isArray(typesData) ? typesData : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "attendance") fetchAttendance();
    else fetchLeave();
  }, [tab, fetchAttendance, fetchLeave]);

  async function handleCheckin(action: "checkin" | "checkout") {
    setCheckinLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "checkin" ? "Checked in successfully!" : "Checked out successfully!");
      fetchAttendance();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handleLeaveApproval(id: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Leave ${action}d!`);
      fetchLeave();
    } catch {
      toast.error("Action failed");
    }
  }

  async function handleLeaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveForm.leaveTypeId) { toast.error("Select leave type"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Leave request submitted!");
      setShowLeaveForm(false);
      setLeaveForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
      fetchLeave();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statusColor: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    LATE: "bg-orange-100 text-orange-700",
    HALF_DAY: "bg-yellow-100 text-yellow-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance & Leave</h1>
          <p className="text-slate-500 text-sm mt-1">Track attendance and manage leave requests</p>
        </div>
        {tab === "attendance" && (
          <div className="flex gap-2">
            <button onClick={() => handleCheckin("checkin")} disabled={checkinLoading}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Check In
            </button>
            <button onClick={() => handleCheckin("checkout")} disabled={checkinLoading}
              className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Check Out
            </button>
          </div>
        )}
        {tab === "leave" && (
          <button onClick={() => setShowLeaveForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Request Leave
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["attendance", "leave"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            {t === "attendance" ? "Attendance Logs" : "Leave Requests"}
          </button>
        ))}
      </div>

      {/* Attendance Logs */}
      {tab === "attendance" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Today&apos;s Attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Check In</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Check Out</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Hours</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No attendance logs for today.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{log.employee.firstName} {log.employee.lastName}</p>
                        <p className="text-xs text-slate-400">{log.employee.employeeId}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(log.date)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : "—"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "—"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{log.totalHours ? `${log.totalHours.toFixed(1)}h` : "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor[log.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Requests */}
      {tab === "leave" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Leave Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Days</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
                ) : leaveRequests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No leave requests.</td></tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{req.employee.firstName} {req.employee.lastName}</p>
                        <p className="text-xs text-slate-400">{req.employee.department?.name}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{req.leaveType.name}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">{req.totalDays}d</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor[req.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {req.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleLeaveApproval(req.id, "approve")}
                              className="text-xs text-green-600 hover:text-green-700 font-medium">Approve</button>
                            <button onClick={() => handleLeaveApproval(req.id, "reject")}
                              className="text-xs text-red-600 hover:text-red-700 font-medium">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Request Form Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Request Leave</h2>
              <button onClick={() => setShowLeaveForm(false)}>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                <select value={leaveForm.leaveTypeId} onChange={(e) => setLeaveForm((f) => ({ ...f, leaveTypeId: e.target.value }))}
                  required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select leave type...</option>
                  {leaveTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.name} ({lt.daysAllowed}d/year)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea rows={3} required value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowLeaveForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg">
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
