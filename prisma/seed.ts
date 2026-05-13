import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding NexaHR database...");

  // ─── Company ──────────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { slug: "demo-corp" },
    update: {},
    create: {
      name: "Demo Corporation",
      slug: "demo-corp",
      email: "info@demo.com",
      phone: "+1-555-0100",
      address: "123 Business Ave",
      city: "San Francisco",
      country: "USA",
      industry: "Technology",
      size: "50-200",
      plan: "PROFESSIONAL",
    },
  });

  console.log("✅ Company created:", company.name);

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const hrPassword = await bcrypt.hash("Hr@123", 12);
  const managerPassword = await bcrypt.hash("Manager@123", 12);
  const empPassword = await bcrypt.hash("Emp@123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@nexahrail.com" },
    update: {},
    create: {
      email: "admin@nexahrail.com",
      password: adminPassword,
      name: "System Administrator",
      role: "SUPER_ADMIN",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: adminPassword,
      name: "Alex Johnson",
      role: "ADMIN",
      companyId: company.id,
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: "hr@demo.com" },
    update: {},
    create: {
      email: "hr@demo.com",
      password: hrPassword,
      name: "Sarah Williams",
      role: "HR_MANAGER",
      companyId: company.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {},
    create: {
      email: "manager@demo.com",
      password: managerPassword,
      name: "Michael Chen",
      role: "MANAGER",
      companyId: company.id,
    },
  });

  const empUser = await prisma.user.upsert({
    where: { email: "emp@demo.com" },
    update: {},
    create: {
      email: "emp@demo.com",
      password: empPassword,
      name: "Emily Davis",
      role: "EMPLOYEE",
      companyId: company.id,
    },
  });

  console.log("✅ Users created");

  // ─── Departments ──────────────────────────────────────────────────────────
  const depts = await Promise.all([
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Engineering" } },
      update: {},
      create: { name: "Engineering", code: "ENG", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Human Resources" } },
      update: {},
      create: { name: "Human Resources", code: "HR", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Marketing" } },
      update: {},
      create: { name: "Marketing", code: "MKT", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Finance" } },
      update: {},
      create: { name: "Finance", code: "FIN", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Sales" } },
      update: {},
      create: { name: "Sales", code: "SLS", companyId: company.id },
    }),
  ]);

  console.log("✅ Departments created");

  // ─── Positions ────────────────────────────────────────────────────────────
  const positions = await Promise.all([
    prisma.position.create({ data: { title: "Software Engineer", companyId: company.id, departmentId: depts[0].id, minSalary: 80000, maxSalary: 120000 } }),
    prisma.position.create({ data: { title: "HR Manager", companyId: company.id, departmentId: depts[1].id, minSalary: 70000, maxSalary: 100000 } }),
    prisma.position.create({ data: { title: "Engineering Manager", companyId: company.id, departmentId: depts[0].id, minSalary: 120000, maxSalary: 160000 } }),
    prisma.position.create({ data: { title: "Marketing Specialist", companyId: company.id, departmentId: depts[2].id, minSalary: 60000, maxSalary: 90000 } }),
  ]);

  console.log("✅ Positions created");

  // ─── Employees ────────────────────────────────────────────────────────────
  const adminEmp = await prisma.employee.upsert({
    where: { companyId_employeeId: { companyId: company.id, employeeId: "ADM001" } },
    update: {},
    create: {
      employeeId: "ADM001",
      userId: adminUser.id,
      companyId: company.id,
      firstName: "Alex",
      lastName: "Johnson",
      workEmail: "admin@demo.com",
      departmentId: depts[1].id,
      positionId: positions[1].id,
      joinDate: new Date("2023-01-01"),
      basicSalary: 90000,
      employmentType: "FULL_TIME",
    },
  });

  const hrEmp = await prisma.employee.upsert({
    where: { companyId_employeeId: { companyId: company.id, employeeId: "HR001" } },
    update: {},
    create: {
      employeeId: "HR001",
      userId: hrUser.id,
      companyId: company.id,
      firstName: "Sarah",
      lastName: "Williams",
      workEmail: "hr@demo.com",
      departmentId: depts[1].id,
      positionId: positions[1].id,
      joinDate: new Date("2023-03-01"),
      basicSalary: 80000,
      managerId: adminEmp.id,
      employmentType: "FULL_TIME",
    },
  });

  const managerEmp = await prisma.employee.upsert({
    where: { companyId_employeeId: { companyId: company.id, employeeId: "MGR001" } },
    update: {},
    create: {
      employeeId: "MGR001",
      userId: managerUser.id,
      companyId: company.id,
      firstName: "Michael",
      lastName: "Chen",
      workEmail: "manager@demo.com",
      departmentId: depts[0].id,
      positionId: positions[2].id,
      joinDate: new Date("2022-06-01"),
      basicSalary: 130000,
      managerId: adminEmp.id,
      employmentType: "FULL_TIME",
    },
  });

  const emp = await prisma.employee.upsert({
    where: { companyId_employeeId: { companyId: company.id, employeeId: "EMP001" } },
    update: {},
    create: {
      employeeId: "EMP001",
      userId: empUser.id,
      companyId: company.id,
      firstName: "Emily",
      lastName: "Davis",
      workEmail: "emp@demo.com",
      departmentId: depts[0].id,
      positionId: positions[0].id,
      joinDate: new Date("2024-01-15"),
      basicSalary: 95000,
      managerId: managerEmp.id,
      employmentType: "FULL_TIME",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    },
  });

  console.log("✅ Employees created");

  // ─── Onboarding ───────────────────────────────────────────────────────────
  await prisma.onboarding.upsert({
    where: { employeeId: emp.id },
    update: {},
    create: {
      employeeId: emp.id,
      status: "PENDING",
      tasks: {
        create: [
          { title: "Submit ID documents", category: "DOCUMENTS", order: 1 },
          { title: "Sign employment contract", category: "DOCUMENTS", order: 2 },
          { title: "IT equipment setup", category: "IT", order: 3, isCompleted: true, completedAt: new Date() },
          { title: "HR orientation session", category: "ORIENTATION", order: 4 },
          { title: "Department introduction", category: "ORIENTATION", order: 5 },
          { title: "Benefits enrollment", category: "BENEFITS", order: 6 },
        ],
      },
    },
  });

  console.log("✅ Onboarding tasks created");

  // ─── Leave Types ──────────────────────────────────────────────────────────
  const leaveTypeData = [
    { leaveType: "ANNUAL" as const, name: "Annual Leave", daysAllowed: 21, isPaid: true, carryForward: true },
    { leaveType: "SICK" as const, name: "Sick Leave", daysAllowed: 14, isPaid: true, carryForward: false },
    { leaveType: "MATERNITY" as const, name: "Maternity Leave", daysAllowed: 90, isPaid: true, carryForward: false },
    { leaveType: "PATERNITY" as const, name: "Paternity Leave", daysAllowed: 14, isPaid: true, carryForward: false },
    { leaveType: "EMERGENCY" as const, name: "Emergency Leave", daysAllowed: 3, isPaid: true, carryForward: false },
    { leaveType: "UNPAID" as const, name: "Unpaid Leave", daysAllowed: 30, isPaid: false, carryForward: false },
  ];

  for (const lt of leaveTypeData) {
    await prisma.leaveTypeSetting.upsert({
      where: { companyId_leaveType: { companyId: company.id, leaveType: lt.leaveType } },
      update: {},
      create: { ...lt, companyId: company.id },
    });
  }

  console.log("✅ Leave types created");

  // ─── Sample Job Postings ──────────────────────────────────────────────────
  await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      positionId: positions[0].id,
      title: "Senior React Developer",
      description: "We are looking for a Senior React Developer to join our engineering team. You will work on building cutting-edge web applications.",
      requirements: "5+ years of experience with React, TypeScript, and modern frontend development.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
      experience: "5+ years",
      employmentType: "FULL_TIME",
      location: "San Francisco, CA",
      isRemote: true,
      salaryMin: 110000,
      salaryMax: 150000,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      openings: 2,
      createdById: hrUser.id,
    },
  });

  await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      title: "Marketing Manager",
      description: "Join our growing marketing team to drive brand awareness and lead generation campaigns.",
      skills: ["Marketing Strategy", "SEO", "Content Marketing", "Analytics", "Social Media"],
      experience: "3+ years",
      employmentType: "FULL_TIME",
      location: "New York, NY",
      isRemote: false,
      salaryMin: 80000,
      salaryMax: 110000,
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      openings: 1,
      createdById: hrUser.id,
    },
  });

  console.log("✅ Job postings created");

  // ─── Sample Candidates & Applications ─────────────────────────────────────
  const candidate1 = await prisma.candidate.create({
    data: {
      firstName: "James",
      lastName: "Wilson",
      email: "james.wilson@email.com",
      phone: "+1-555-0200",
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      experience: 6,
      summary: "Experienced full-stack developer with 6 years of React expertise.",
    },
  });

  const job = await prisma.jobPosting.findFirst({ where: { companyId: company.id, title: "Senior React Developer" } });
  if (job) {
    await prisma.application.create({
      data: {
        jobPostingId: job.id,
        candidateId: candidate1.id,
        status: "AI_SCREENED",
        aiScore: 87.5,
        aiSummary: "Strong candidate with excellent React skills and relevant experience.",
        aiSkillsMatch: { matched: ["React", "TypeScript", "Node.js"], missing: ["GraphQL"] },
      },
    });
  }

  console.log("✅ Applications created");

  // ─── Attendance Logs ──────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkIn = new Date(today);
  checkIn.setHours(9, 0, 0, 0);
  const checkOut = new Date(today);
  checkOut.setHours(18, 0, 0, 0);

  await prisma.attendanceLog.upsert({
    where: { employeeId_date: { employeeId: emp.id, date: today } },
    update: {},
    create: {
      employeeId: emp.id,
      companyId: company.id,
      date: today,
      checkIn,
      checkOut,
      totalHours: 9,
      overtime: 1,
      status: "PRESENT",
    },
  });

  console.log("✅ Attendance logs created");

  // ─── Assets ───────────────────────────────────────────────────────────────
  const laptop = await prisma.asset.create({
    data: {
      companyId: company.id,
      assetId: "ASSET-0001",
      name: "MacBook Pro 14\"",
      category: "Laptop",
      brand: "Apple",
      model: "MacBook Pro M3",
      serialNumber: "MBP-2024-001",
      purchasePrice: 2499,
      status: "ASSIGNED",
      location: "San Francisco Office",
    },
  });

  await prisma.assetAssignment.create({
    data: {
      assetId: laptop.id,
      employeeId: emp.id,
      assignedAt: new Date(),
      condition: "New",
    },
  });

  console.log("✅ Assets created");

  // ─── Shifts ───────────────────────────────────────────────────────────────
  await prisma.shift.create({
    data: {
      companyId: company.id,
      name: "Standard Day Shift",
      type: "MORNING",
      startTime: "09:00",
      endTime: "18:00",
      workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
      breakMinutes: 60,
      isActive: true,
    },
  });

  await prisma.shift.create({
    data: {
      companyId: company.id,
      name: "Night Shift",
      type: "NIGHT",
      startTime: "22:00",
      endTime: "06:00",
      workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
      breakMinutes: 30,
      isActive: true,
    },
  });

  console.log("✅ Shifts created");

  // ─── Courses ──────────────────────────────────────────────────────────────
  const course = await prisma.course.create({
    data: {
      companyId: company.id,
      title: "Code of Conduct & Ethics",
      description: "All employees must complete this mandatory compliance course.",
      category: "Compliance",
      isMandatory: true,
      status: "PUBLISHED",
      duration: 120,
      createdById: hrUser.id,
      modules: {
        create: [
          { title: "Company Values", type: "VIDEO", duration: 30, order: 1 },
          { title: "Code of Conduct", type: "PDF", duration: 45, order: 2 },
          { title: "Ethics Assessment", type: "QUIZ", duration: 30, order: 3 },
        ],
      },
    },
  });

  await prisma.courseEnrollment.create({
    data: { courseId: course.id, employeeId: emp.id, status: "IN_PROGRESS", progress: 33 },
  });

  console.log("✅ Courses created");

  // ─── Holidays ─────────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const holidays = [
    { name: "New Year's Day", date: new Date(`${currentYear}-01-01`) },
    { name: "Memorial Day", date: new Date(`${currentYear}-05-26`) },
    { name: "Independence Day", date: new Date(`${currentYear}-07-04`) },
    { name: "Labor Day", date: new Date(`${currentYear}-09-01`) },
    { name: "Thanksgiving", date: new Date(`${currentYear}-11-27`) },
    { name: "Christmas Day", date: new Date(`${currentYear}-12-25`) },
  ];

  for (const h of holidays) {
    await prisma.holiday.create({
      data: { companyId: company.id, name: h.name, date: h.date, type: "PUBLIC" },
    });
  }

  console.log("✅ Holidays created");

  // ─── Announcements ────────────────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      companyId: company.id,
      title: "Welcome to NexaHR AI!",
      content: "We are excited to launch our new HR management platform. Explore all features and let us know your feedback.",
      type: "GENERAL",
      audience: "ALL",
      publishedAt: new Date(),
      isPinned: true,
      createdById: adminUser.id,
    },
  });

  console.log("✅ Announcements created");

  // ─── Company Policies ─────────────────────────────────────────────────────
  await prisma.companyPolicy.create({
    data: {
      companyId: company.id,
      title: "Annual Leave Policy",
      category: "Leave",
      content: `ANNUAL LEAVE POLICY

1. All full-time employees are entitled to 21 days of paid annual leave per year.
2. Leave must be approved by the direct manager at least 2 weeks in advance.
3. Maximum 5 days can be carried forward to the next year.
4. Leave during probation period is not permitted without HR approval.
5. Emergency leave requests will be reviewed on a case-by-case basis.`,
      version: "1.0",
      isActive: true,
      publishedAt: new Date(),
    },
  });

  await prisma.companyPolicy.create({
    data: {
      companyId: company.id,
      title: "Work From Home Policy",
      category: "Work Arrangement",
      content: `WORK FROM HOME (WFH) POLICY

1. Employees may work from home up to 2 days per week with manager approval.
2. Core hours (10 AM - 4 PM) must be maintained regardless of location.
3. Employees must be reachable via Slack/Teams during work hours.
4. WFH equipment and internet connectivity are the employee's responsibility.
5. This policy is subject to business needs and performance requirements.`,
      version: "1.0",
      isActive: true,
      publishedAt: new Date(),
    },
  });

  console.log("✅ Policies created");

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────────────");
  console.log("📧 Login credentials:");
  console.log("  Super Admin: admin@nexahrail.com / Admin@123");
  console.log("  Admin:       admin@demo.com / Admin@123");
  console.log("  HR Manager:  hr@demo.com / Hr@123");
  console.log("  Manager:     manager@demo.com / Manager@123");
  console.log("  Employee:    emp@demo.com / Emp@123");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
