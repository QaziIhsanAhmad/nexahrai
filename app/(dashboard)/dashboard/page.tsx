import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardHero from "@/components/dashboard/DashboardHero";

async function resolveCompanyId(session: { userId: string; companyId: string | null }) {
  if (session.companyId) return session.companyId;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { companyId: true },
  });
  return user?.companyId ?? null;
}

async function getStats(companyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalEmployees,
    activeJobs,
    pendingLeaves,
    todayAttendance,
    onLeaveToday,
    pendingOnboarding,
    openApplications,
    departments,
    upcomingHolidays,
  ] = await Promise.all([
    prisma.employee.count({ where: { companyId, employmentStatus: "ACTIVE" } }),
    prisma.jobPosting.count({ where: { companyId, isActive: true, isPublished: true } }),
    prisma.leaveRequest.count({ where: { companyId, status: "PENDING" } }),
    prisma.attendanceLog.count({ where: { companyId, date: today, checkIn: { not: null } } }),
    prisma.leaveRequest.count({
      where: { companyId, status: "APPROVED", startDate: { lte: today }, endDate: { gte: today } },
    }),
    prisma.onboarding.count({ where: { status: "PENDING", employee: { companyId } } }),
    prisma.application.count({
      where: { jobPosting: { companyId }, status: { in: ["APPLIED", "SCREENING"] } },
    }),
    prisma.department.findMany({
      where: { companyId },
      include: { _count: { select: { employees: true } } },
      take: 6,
    }),
    prisma.holiday.findMany({
      where: { companyId, date: { gte: today } },
      orderBy: { date: "asc" },
      take: 3,
    }),
  ]);

  return {
    totalEmployees, activeJobs, pendingLeaves, todayAttendance,
    onLeaveToday, pendingOnboarding, openApplications, departments, upcomingHolidays,
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
      take: 4,
      include: { employee: { include: { user: true } }, leaveType: true },
    }),
  ]);
  return { recentEmployees, recentApplications, recentLeaves };
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-slate-100 text-slate-700",
  SCREENING: "bg-yellow-100 text-yellow-700",
  AI_SCREENED: "bg-purple-100 text-purple-700",
  INTERVIEW_SCHEDULED: "bg-blue-100 text-blue-700",
  INTERVIEWED: "bg-indigo-100 text-indigo-700",
  OFFER_SENT: "bg-orange-100 text-orange-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const DEPT_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-teal-500",
];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const companyId = await resolveCompanyId(session);

  if (!companyId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-3xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Set up your company</h2>
          <p className="text-slate-500 mb-2">Complete your company profile to unlock all HR features and start managing your workforce.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link href="/dashboard/settings"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
            <Link href="/dashboard/employees"
              className="border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              Add Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [stats, activity, company] = await Promise.all([
    getStats(companyId),
    getRecentActivity(companyId),
    prisma.company.findUnique({ where: { id: companyId }, select: { name: true, plan: true } }),
  ]);

  const attendancePct = stats.totalEmployees > 0
    ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100)
    : 0;

  const hrScore = Math.min(100, Math.round(
    (attendancePct * 0.3) +
    (stats.pendingLeaves === 0 ? 25 : Math.max(0, 25 - stats.pendingLeaves * 3)) +
    (stats.totalEmployees > 0 ? 25 : 0) +
    (stats.openApplications > 0 ? 20 : 0)
  ));

  const scoreColor = hrScore >= 75 ? "text-green-500" : hrScore >= 50 ? "text-yellow-500" : "text-red-500";
  const maxDeptCount = Math.max(...stats.departments.map(d => d._count.employees), 1);

  const quickActions = [
    { label: "Add Employee", href: "/dashboard/employees", icon: "👤", gradient: "from-blue-500 to-blue-600", desc: "Onboard new hire" },
    { label: "Run Payroll", href: "/dashboard/payroll", icon: "💰", gradient: "from-green-500 to-emerald-600", desc: "Process salaries" },
    { label: "Post a Job", href: "/dashboard/recruitment", icon: "📢", gradient: "from-purple-500 to-purple-600", desc: "Create listing" },
    { label: "HR Chatbot", href: "/dashboard/ai-tools?tab=chatbot", icon: "🤖", gradient: "from-indigo-500 to-indigo-600", desc: "AI assistant" },
    { label: "AI Insights", href: "/dashboard/ai-insights", icon: "🧠", gradient: "from-pink-500 to-rose-600", desc: "Workforce analytics" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "📊", gradient: "from-orange-500 to-amber-600", desc: "View reports" },
  ];

  const newModules = [
    { label: "Benefits", href: "/dashboard/benefits", icon: "🏥" },
    { label: "Engagement", href: "/dashboard/engagement", icon: "💡" },
    { label: "Compliance", href: "/dashboard/compliance", icon: "⚖️" },
    { label: "Succession", href: "/dashboard/succession", icon: "🎯" },
    { label: "Time Tracking", href: "/dashboard/time-tracking", icon: "⏱️" },
    { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: "📚" },
    { label: "Compensation", href: "/dashboard/compensation", icon: "💹" },
    { label: "Integrations", href: "/dashboard/integrations", icon: "🔌" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <DashboardHero
        name={session.name}
        companyName={company?.name ?? "Your Company"}
        pendingApprovals={stats.pendingLeaves}
        newApplications={stats.openApplications}
        onLeaveToday={stats.onLeaveToday}
        presentToday={stats.todayAttendance}
        totalEmployees={stats.totalEmployees}
      />

      {/* Top row: HR Score + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* HR Health Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">HR Health Score</p>
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke={hrScore >= 75 ? "#22c55e" : hrScore >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(hrScore / 100) * 251.2} 251.2`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{hrScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <p className={`text-sm font-semibold ${scoreColor}`}>
            {hrScore >= 75 ? "Excellent" : hrScore >= 50 ? "Good" : "Needs Attention"}
          </p>
          <p className="text-xs text-slate-400 mt-1">Based on attendance, leaves & hiring</p>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href}
                className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
                  {a.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-700 group-hover:text-blue-600 text-center leading-tight">{a.label}</span>
                <span className="text-[10px] text-slate-400 hidden sm:block">{a.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Employees", value: stats.totalEmployees, icon: "👥", bg: "bg-blue-50", text: "text-blue-600", href: "/dashboard/employees" },
          { label: "Active Jobs", value: stats.activeJobs, icon: "💼", bg: "bg-purple-50", text: "text-purple-600", href: "/dashboard/recruitment" },
          { label: "Pending Leaves", value: stats.pendingLeaves, icon: "🗓️", bg: "bg-orange-50", text: "text-orange-600", href: "/dashboard/attendance?tab=leave" },
          { label: "Present Today", value: `${stats.todayAttendance}/${stats.totalEmployees}`, icon: "✅", bg: "bg-green-50", text: "text-green-600", href: "/dashboard/attendance" },
          { label: "On Leave", value: stats.onLeaveToday, icon: "🌴", bg: "bg-teal-50", text: "text-teal-600", href: "/dashboard/attendance?tab=leave" },
          { label: "Onboarding", value: stats.pendingOnboarding, icon: "🎯", bg: "bg-pink-50", text: "text-pink-600", href: "/dashboard/employees" },
          { label: "Applications", value: stats.openApplications, icon: "📄", bg: "bg-indigo-50", text: "text-indigo-600", href: "/dashboard/recruitment" },
        ].map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-xl border border-slate-200 p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center text-base mb-2`}>
              {c.icon}
            </div>
            <div className={`text-xl font-bold ${c.text}`}>{c.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Departments</h3>
            <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          {stats.departments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🏢</p>
              <p className="text-sm text-slate-400">No departments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.departments.map((dept, i) => (
                <div key={dept.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 truncate max-w-[60%]">{dept.name}</span>
                    <span className="text-slate-500 text-xs">{dept._count.employees} people</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${DEPT_COLORS[i % DEPT_COLORS.length]} transition-all`}
                      style={{ width: `${(dept._count.employees / maxDeptCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Employees */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Employees</h3>
            <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {activity.recentEmployees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm text-slate-400">No employees yet</p>
                <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Add your first →</Link>
              </div>
            ) : activity.recentEmployees.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  ["bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500","bg-pink-500"][i % 5]
                }`}>
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{emp.position?.title ?? "—"} · {emp.department?.name ?? "—"}</p>
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Leaves + Upcoming Holidays */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Pending Leaves</h3>
              <Link href="/dashboard/attendance?tab=leave" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </div>
            <div className="space-y-2.5">
              {activity.recentLeaves.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-xs text-slate-400">All clear!</p>
                </div>
              ) : activity.recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                    {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{leave.employee.firstName} {leave.employee.lastName}</p>
                    <p className="text-[10px] text-slate-400">{leave.leaveType.name} · {leave.totalDays}d</p>
                  </div>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">Pending</span>
                </div>
              ))}
            </div>
          </div>

          {stats.upcomingHolidays.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                <span>🎌</span> Upcoming Holidays
              </h3>
              <div className="space-y-2">
                {stats.upcomingHolidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">{h.name}</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Modules Strip */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Explore New Modules</h3>
            <p className="text-slate-400 text-xs mt-0.5">Recently added to your HR platform</p>
          </div>
          <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-full font-bold">8 NEW</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {newModules.map((m) => (
            <Link key={m.href} href={m.href}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all hover:scale-105 group">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-[10px] font-medium text-slate-300 group-hover:text-white text-center leading-tight">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Recent Job Applications</h3>
          <Link href="/dashboard/recruitment" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {activity.recentApplications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm font-medium text-slate-700">No applications yet</p>
            <p className="text-xs text-slate-400 mt-1">Post a job to start receiving applications</p>
            <Link href="/dashboard/recruitment"
              className="inline-flex items-center gap-1.5 mt-4 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Post a Job →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Candidate", "Job", "Status", "AI Score", "Applied"].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activity.recentApplications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{app.candidate.firstName} {app.candidate.lastName}</p>
                      <p className="text-xs text-slate-400">{app.candidate.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{app.jobPosting.title}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-700"}`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {app.aiScore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${app.aiScore >= 70 ? "bg-green-500" : app.aiScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${app.aiScore}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{app.aiScore.toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="py-3 text-xs text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</td>
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
