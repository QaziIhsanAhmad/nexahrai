import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardHero from "@/components/dashboard/DashboardHero";

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
  ] = await Promise.all([
    prisma.employee.count({ where: { companyId, employmentStatus: "ACTIVE" } }),
    prisma.jobPosting.count({ where: { companyId, isActive: true, isPublished: true } }),
    prisma.leaveRequest.count({ where: { companyId, status: "PENDING" } }),
    prisma.attendanceLog.count({
      where: { companyId, date: today, checkIn: { not: null } },
    }),
    prisma.leaveRequest.count({
      where: {
        companyId,
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today },
      },
    }),
    prisma.onboarding.count({ where: { status: "PENDING", employee: { companyId } } }),
    prisma.application.count({
      where: { jobPosting: { companyId }, status: { in: ["APPLIED", "SCREENING"] } },
    }),
  ]);

  return { totalEmployees, activeJobs, pendingLeaves, todayAttendance, onLeaveToday, pendingOnboarding, openApplications };
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

export default async function DashboardPage() {
  const session = await getSession();

  // No company linked yet — show onboarding prompt
  if (!session?.companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Set up your company</h2>
          <p className="text-slate-500 text-sm mb-6">Complete your company profile to unlock all HR features.</p>
          <Link href="/dashboard/settings" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  const [stats, activity, company] = await Promise.all([
    getStats(session.companyId),
    getRecentActivity(session.companyId),
    prisma.company.findUnique({ where: { id: session.companyId }, select: { name: true } }),
  ]);

  const statCards = [
    { label: "Total Employees", value: stats.totalEmployees, change: "Active headcount", icon: "👥", color: "bg-blue-500", href: "/dashboard/employees" },
    { label: "Active Jobs", value: stats.activeJobs, change: `${stats.openApplications} applications`, icon: "💼", color: "bg-purple-500", href: "/dashboard/recruitment" },
    { label: "Pending Leaves", value: stats.pendingLeaves, change: "Awaiting approval", icon: "🗓️", color: "bg-orange-500", href: "/dashboard/attendance?tab=leave" },
    { label: "Present Today", value: stats.todayAttendance, change: `of ${stats.totalEmployees} total`, icon: "✅", color: "bg-green-500", href: "/dashboard/attendance" },
    { label: "Pending Onboarding", value: stats.pendingOnboarding, change: "New joiners", icon: "🎯", color: "bg-teal-500", href: "/dashboard/employees" },
    { label: "Open Applications", value: stats.openApplications, change: "To review", icon: "📄", color: "bg-indigo-500", href: "/dashboard/recruitment" },
  ];

  const quickLinks = [
    { label: "Run Payroll", href: "/dashboard/payroll", icon: "💰", desc: "Process monthly salaries", color: "hover:border-green-200 hover:bg-green-50" },
    { label: "AI Resume Parser", href: "/dashboard/ai-tools?tab=resume", icon: "🤖", desc: "Parse & score resumes", color: "hover:border-purple-200 hover:bg-purple-50" },
    { label: "Post a Job", href: "/dashboard/recruitment", icon: "📢", desc: "Create new job posting", color: "hover:border-blue-200 hover:bg-blue-50" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "📊", desc: "HR analytics & insights", color: "hover:border-indigo-200 hover:bg-indigo-50" },
    { label: "HR Chatbot", href: "/dashboard/ai-tools?tab=chatbot", icon: "💬", desc: "AI policy assistant", color: "hover:border-teal-200 hover:bg-teal-50" },
    { label: "Add Employee", href: "/dashboard/employees", icon: "➕", desc: "Onboard a new hire", color: "hover:border-orange-200 hover:bg-orange-50" },
  ];

  const modules = [
    { label: "Benefits", href: "/dashboard/benefits", icon: "🏥", badge: "NEW" },
    { label: "Engagement", href: "/dashboard/engagement", icon: "💡", badge: "NEW" },
    { label: "Compliance", href: "/dashboard/compliance", icon: "⚖️", badge: "NEW" },
    { label: "Succession", href: "/dashboard/succession", icon: "🎯", badge: "NEW" },
    { label: "Time Tracking", href: "/dashboard/time-tracking", icon: "⏱️", badge: "NEW" },
    { label: "AI Insights", href: "/dashboard/ai-insights", icon: "🧠", badge: "NEW" },
    { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: "📚", badge: "NEW" },
    { label: "Integrations", href: "/dashboard/integrations", icon: "🔌", badge: "NEW" },
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`w-2 h-2 rounded-full ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5 leading-tight">{card.label}</div>
            <div className="text-[11px] mt-1 text-slate-400">{card.change}</div>
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
                className={`flex flex-col gap-1.5 p-3 rounded-lg border border-slate-100 transition-colors group ${link.color}`}>
                <span className="text-xl">{link.icon}</span>
                <span className="text-xs font-medium text-slate-900">{link.label}</span>
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
              <div className="text-center py-6">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm text-slate-400">No employees yet</p>
                <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Add your first employee →</Link>
              </div>
            ) : (
              activity.recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
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

        {/* Pending Leaves */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Pending Leaves</h2>
            <Link href="/dashboard/attendance?tab=leave" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {activity.recentLeaves.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-slate-400">No pending requests</p>
              </div>
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

      {/* Explore New Modules */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Explore New Modules</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recently added features for your HR platform</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {modules.map((m) => (
            <Link key={m.href} href={m.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-center group">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 leading-tight">{m.label}</span>
              <span className="text-[9px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{m.badge}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Job Applications</h2>
          <Link href="/dashboard/recruitment" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
        </div>
        {activity.recentApplications.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📋</div>
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
                  <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">Candidate</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">Job</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">Status</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">AI Score</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Applied</th>
                </tr>
              </thead>
              <tbody>
                {activity.recentApplications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-slate-900">{app.candidate.firstName} {app.candidate.lastName}</p>
                      <p className="text-xs text-slate-400">{app.candidate.email}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600 text-sm">{app.jobPosting.title}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-700"}`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
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
