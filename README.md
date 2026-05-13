# NexaHR AI — HR Management Platform

A full-stack, multi-tenant HR Management System built with Next.js, Prisma, PostgreSQL, and AI powered by Groq (Llama 3 — free & open-source).

**Live:** [nexahrai.vercel.app](https://nexahrai.vercel.app)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Render) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Auth | JWT (jose) + RBAC |
| AI | Groq API — Llama 3 (free, open-source) |
| Email | Resend |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Deployment | Vercel (app) + Render (database) |

---

## Modules

### Recruitment & Talent
- **Jobs & Postings** — Create and manage job listings, track applications through pipeline
- **AI Resume Parser** — AI-powered resume screening with match scoring
- **Internal Talent Marketplace** — Internal job board, skill matching, employee profiles
- **Succession Planning** — Position succession maps with ready-now/ready-later candidates
- **Career Path Mapping** — Visual career ladder from Junior to Director level
- **Promotion & Transfer Management** — Approval workflows for promotions and transfers

### Workforce Management
- **Employee Management** — Full employee lifecycle, org chart, profiles with postcode auto-fill
- **Contractor & Freelancer Management** — Contractors, freelancers, and vendor workforce
- **Attendance** — Check-in/check-out, daily logs, overtime tracking
- **Leave Management** — Leave requests, approval workflows, balance tracking
- **Time Tracking** — Remote team time logs, project/task tracking, billable hours
- **Shift & Scheduling** — Shift creation, employee assignment, schedule management

### HR Operations
- **Payroll** — Multi-currency payroll runs, payslip generation, salary structures
- **Benefits Administration** — Health, dental, vision, retirement plans with enrollment management
- **Performance Management** — 360-degree reviews, KPI tracking, goal setting
- **Compensation Benchmarking** — Market comparison (p25/p50/p75), pay equity analysis
- **Training & LMS** — Course creation, enrollment, progress tracking, certifications
- **Documents** — Document management, versioning, employee document sharing
- **Assets** — Asset registry, assignment tracking, depreciation
- **Exit / Resign** — Resignation workflow, clearance checklist, final settlement

### Employee Experience
- **Engagement Surveys** — Pulse surveys, annual surveys, custom survey builder
- **eNPS & Anonymous Feedback** — Employee Net Promoter Score, anonymous feedback collection
- **Knowledge Base** — Company wiki, HR policies, SOPs, searchable by category

### Compliance & Legal
- **Compliance Center** — Compliance checklist with status tracking
- **GDPR & Privacy** — Data privacy controls, consent management, data retention policies
- **Tax Compliance** — Country-wise tax configuration table
- **Labor Law Tracker** — Regional compliance tracker

### AI Intelligence
- **HR Chatbot** — Conversational HR assistant (Llama 3 via Groq)
- **Interview AI** — AI-generated interview questions + answer evaluation
- **Policy Generator** — AI-drafted HR documents (offer letters, warning letters, policies)
- **AI Insights** — Attrition risk prediction, sentiment analysis, payroll anomaly detection, workforce planning

### Security & Admin
- **Audit Logs** — Full activity log: who did what, when, from where
- **Security Center** — 2FA setup, active session management, IP whitelist, login history
- **Integrations Hub** — Connect Slack, Teams, Google Workspace, QuickBooks, Xero, biometric devices, and more

### Self-Service & Planning
- **My Portal** — Employee self-service for leave, payslips, documents, profile
- **Headcount Planning** — Quarterly headcount planning by department
- **HR Budget** — Budget vs actual tracking by category (Salaries, Benefits, Training, Recruitment)
- **Executive Analytics** — Dashboard with KPIs, charts, workforce trends

### Billing & Subscription
| Plan | Price | Employees |
|------|-------|-----------|
| Free | $0 | Up to 2 |
| Starter | $29/mo | Up to 10 |
| Professional | $79/mo | Up to 50 |
| Enterprise | $199/mo | Unlimited |

---

## Multi-Currency Support

14 currencies supported across all salary, payroll, and benefit fields:

USD · EUR · GBP · PKR · INR · AED · SAR · AUD · CAD · JPY · CNY · BRL · SGD · CHF

---

## Auto-Location from Postcode

In the employee form, typing a postcode automatically resolves the city and country using the OpenStreetMap Nominatim API (free, no API key required).

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# Auth
NEXTAUTH_SECRET=your-secret-32-chars
NEXTAUTH_URL=https://yourdomain.com

# AI (free — get key at console.groq.com, no credit card)
GROQ_API_KEY=gsk_...

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

### Optional (Stripe — for paid plans)

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/QaziIhsanAhmad/nexahrai.git
cd nexahrai

# 2. Install
npm install

# 3. Set up .env.local (copy variables above)

# 4. Push schema & seed
npx prisma db push
npx prisma db seed

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Vercel (Frontend + API)
1. Connect GitHub repo to Vercel
2. Add all environment variables in Vercel → Settings → Environment Variables
3. Deploy — Vercel auto-deploys on every push to `main`

### Render (PostgreSQL)
1. Create a PostgreSQL instance on Render
2. Copy the external connection string to `DATABASE_URL`
3. Enable external access: Render → Database → Access Control → Allow All

### Schema Migration (after changes)
```bash
npx prisma db push
```

---

## Roles & Permissions

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full access to all modules and settings |
| ADMIN | All HR modules, user management |
| HR_MANAGER | HR operations, recruitment, payroll |
| MANAGER | Team attendance, leave approvals, performance |
| EMPLOYEE | Self-service portal only |

---

## Data Models

The schema covers 35+ models across all HR domains:

`Company` · `User` · `Session` · `Employee` · `Department` · `Position` · `JobPosting` · `Candidate` · `Application` · `Interview` · `AttendanceLog` · `LeaveRequest` · `LeaveBalance` · `PayrollRun` · `PayrollItem` · `SalaryStructure` · `PerformanceReview` · `KPI` · `Document` · `Asset` · `Course` · `CourseEnrollment` · `Shift` · `ExitRequest` · `Benefit` · `BenefitEnrollment` · `EngagementSurvey` · `SurveyQuestion` · `SurveyResponse` · `KnowledgeArticle` · `SuccessionPlan` · `TimeLog` · `BudgetPlan` · `HeadcountPlan` · `AuditLog` · `Notification` · `ChatMessage` · `CompanyPolicy`
