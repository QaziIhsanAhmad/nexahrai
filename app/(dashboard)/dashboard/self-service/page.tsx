import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function SelfServicePage() {
  const session = await getSession();
  if (!session) return null;

  const employee = await prisma.employee.findFirst({
    where: { userId: session.userId },
    include: {
      department: true,
      position: true,
      manager: { select: { firstName: true, lastName: true } },
      user: { select: { email: true } },
      onboarding: { include: { tasks: { orderBy: { order: "asc" } } } },
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { leaveType: true },
      },
    },
  });

  const recentPayslip = employee ? await prisma.payrollItem.findFirst({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" },
    include: { payrollRun: true },
  }) : null;

  const links = [
    { label: "Request Leave", href: "/dashboard/attendance?tab=leave", icon: "🗓️", desc: "Apply for time off" },
    { label: "View Payslips", href: "/dashboard/payroll", icon: "💰", desc: "Download salary slips" },
    { label: "My Documents", href: "/dashboard/documents", icon: "📄", desc: "Access your files" },
    { label: "HR Chatbot", href: "/dashboard/ai-tools?tab=chatbot", icon: "💬", desc: "Ask HR questions" },
    { label: "My Performance", href: "/dashboard/performance", icon: "📊", desc: "View reviews and KPIs" },
    { label: "Training", href: "/dashboard/training", icon: "📚", desc: "Browse courses" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Portal</h1>
        <p className="text-slate-500 text-sm mt-1">Your employee self-service dashboard</p>
      </div>

      {employee ? (
        <>
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h2>
                <p className="text-slate-500">{employee.position?.title ?? "—"} · {employee.department?.name ?? "—"}</p>
                <p className="text-xs text-slate-400 mt-1">{employee.employeeId} · Joined {formatDate(employee.joinDate)}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">Basic Salary</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(employee.basicSalary)}</p>
                <p className="text-xs text-slate-400">{employee.employmentType.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
              {[
                { label: "Manager", value: employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "—" },
                { label: "Status", value: employee.employmentStatus.replace(/_/g, " ") },
                { label: "Email", value: employee.workEmail || employee.user?.email || "—" },
                { label: "Phone", value: employee.phone || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all group">
                <span className="text-2xl">{link.icon}</span>
                <p className="text-sm font-medium text-slate-900 mt-2 group-hover:text-blue-700">{link.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* Onboarding Checklist */}
          {employee.onboarding && employee.onboarding.status !== "COMPLETED" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Onboarding Checklist</h2>
              <div className="space-y-2">
                {employee.onboarding.tasks.map((task) => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${task.isCompleted ? "bg-green-50" : "bg-slate-50"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${task.isCompleted ? "bg-green-500" : "bg-slate-300"}`}>
                      {task.isCompleted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${task.isCompleted ? "text-green-700 line-through" : "text-slate-900"}`}>{task.title}</p>
                      <p className="text-xs text-slate-400">{task.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Leave Requests */}
          {employee.leaveRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">My Leave History</h2>
                <Link href="/dashboard/attendance?tab=leave" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
              </div>
              <div className="space-y-2">
                {employee.leaveRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{req.leaveType.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(req.startDate)} → {formatDate(req.endDate)} · {req.totalDays}d</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${req.status === "APPROVED" ? "bg-green-100 text-green-700" : req.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No employee profile found for your account.</p>
          <p className="text-xs text-slate-300 mt-1">Contact your HR team to set up your profile.</p>
        </div>
      )}
    </div>
  );
}
