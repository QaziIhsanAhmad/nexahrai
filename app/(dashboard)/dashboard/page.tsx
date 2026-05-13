import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getStats(companyId: string) {
  const [
    totalEmployees,
    activeJobs,
    pendingLeaves,
    todayAttendance,
    pendingOnboarding,
    openApplications,
  ] = await Promise.all([
    prisma.employee.count({ where: { companyId, employmentStatus: "ACTIVE" } }),
    prisma.jobPosting.count({ where: { companyId, isActive: true, isPublished: true } }),
    prisma.leaveRequest.count({ where: { companyId, status: "PENDING" } }),
    prisma.attendanceLog.count({
      where: {
        companyId,
        date: new Date(new Date().toDateString()),
        checkIn: { not: null },
      },
    }),
    prisma.onboarding.count({ where: { status: "PENDING", employee: { companyId } } }),
    prisma.application.count({
      where: { jobPosting: { companyId }, status: { in: ["APPLIED", "SCREENING"] } },
    }),
  ]);

  return {
    totalEmployees,
    activeJobs,
    pendingLeaves,
    todayAttendance,
    pendingOnboarding,
    openApplications,
  };
}

async function getRecentActivity(companyId: string) {
  const [recentEmployees, recentApplications, recentLeaves] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { department: true, position: true },
    }),
    prisma.application.findMany({
      where: { jobPosting: { companyId } },
      orderBy: { appliedAt: "desc" },
      take: 5,
      include: { candidate: true, jobPosting: true },
    }),
    prisma.leaveRequest.findMany({
      where: { companyId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { employee: { include: { user: true } }, leaveType: true },
    }),
  ]);

  return { recentEmployees, recentApplications, recentLeaves };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.companyId) return null;

  const [stats, activity] = await Promise.all([
    getStats(session.companyId),
    getRecentActivity(session.companyId),
  ]);

  const statCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      change: "+4 this month",
      positive: true,
      icon: "👥",
      color: "bg-blue-500",
      href: "/dashboard/employees",
    },
    {
      label: "Active Job Postings",
      value: stats.activeJobs,
      change: `${stats.openApplications} applications`,
      positive: true,
      icon: "💼",
      color: "bg-purple-500",
      href: "/dashboard/recruitment",
    },
    {
      label: "Pending Leave Requests",
      value: stats.pendingLeaves,
      change: "Requires approval",
      positive: stats.pendingLeaves === 0,
      icon: "🗓️",
      color: "bg-orange-500",
      href: "/dashboard/attendance?tab=leave",
    },
    {
      label: "Present Today",
      value: stats.todayAttendance,
      change: `of ${stats.totalEmployees} employees`,
      positive: true,
      icon: "✅",
      color: "bg-green-500",
      href: "/dashboard/attendance",
    },
    {
      label: "Pending Onboarding",
      value: stats.pendingOnboarding,
      change: "New joiners",
      positive: false,
      icon: "🎯",
      color: "bg-teal-500",
      href: "/dashboard/employees",
    },
    {
      label: "Open Applications",
      value: stats.openApplications,
      change: "To review",
      positive: true,
      icon: "📄",
      color: "bg-indigo-500",
      href: "/dashboard/recruitment",
    },
  ];

  const quickLinks = [
    { label: "Run Payroll", href: "/dashboard/payroll", icon: "💰", desc: "Process monthly salaries" },
    { label: "AI Resume Parser", href: "/dashboard/ai-tools?tab=resume", icon: "🤖", desc: "Parse & score resumes" },
    { label: "Post a Job", href: "/dashboard/recruitment", icon: "📢", desc: "Create new job posting" },
    { label: "Generate Report", href: "/dashboard/analytics", icon: "📊", desc: "HR analytics & insights" },
    { label: "HR Chatbot", href: "/dashboard/ai-tools?tab=chatbot", icon: "💬", desc: "AI policy assistant" },
    { label: "Add Employee", href: "/dashboard/employees", icon: "➕", desc: "Onboard new employee" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`w-2 h-2 rounded-full ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5 leading-tight">{card.label}</div>
            <div className={`text-[11px] mt-1 ${card.positive ? "text-green-600" : "text-orange-500"}`}>
              {card.change}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                <span className="text-xl">{link.icon}</span>
                <span className="text-xs font-medium text-slate-900 group-hover:text-blue-700">{link.label}</span>
                <span className="text-[10px] text-slate-400">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Employees</h2>
            <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {activity.recentEmployees.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No employees yet</p>
            ) : (
              activity.recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{emp.position?.title ?? "—"} · {emp.department?.name ?? "—"}</p>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">Active</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Pending Leaves</h2>
            <Link href="/dashboard/attendance?tab=leave" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {activity.recentLeaves.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No pending requests</p>
            ) : (
              activity.recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-600 flex-shrink-0 mt-0.5">
                    {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{leave.employee.firstName} {leave.employee.lastName}</p>
                    <p className="text-xs text-slate-400">{leave.leaveType.name} · {leave.totalDays}d</p>
                  </div>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Job Applications</h2>
          <Link href="/dashboard/recruitment" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
        </div>
        {activity.recentApplications.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No applications yet. <Link href="/dashboard/recruitment" className="text-blue-600">Post a job</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Candidate</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Job</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500">AI Score</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Applied</th>
                </tr>
              </thead>
              <tbody>
                {activity.recentApplications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5">
                      <p className="font-medium text-slate-900">{app.candidate.firstName} {app.candidate.lastName}</p>
                      <p className="text-xs text-slate-400">{app.candidate.email}</p>
                    </td>
                    <td className="py-2.5 text-slate-600">{app.jobPosting.title}</td>
                    <td className="py-2.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {app.aiScore ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${app.aiScore >= 70 ? "bg-green-500" : app.aiScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${app.aiScore}%` }} />
                          </div>
                          <span className="text-xs text-slate-600">{app.aiScore.toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
