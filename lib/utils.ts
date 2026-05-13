import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null, fmt = "MMM dd, yyyy") {
  if (!date) return "—";
  return format(new Date(date), fmt);
}

export function formatDateTime(date: Date | string | null) {
  if (!date) return "—";
  return format(new Date(date), "MMM dd, yyyy HH:mm");
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateEmployeeId(prefix = "EMP") {
  const ts = Date.now().toString().slice(-6);
  return `${prefix}${ts}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateWorkingDays(start: Date, end: Date, holidays: Date[] = []) {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.some(
      (h) => h.toDateString() === cur.toDateString()
    );
    if (!isWeekend && !isHoliday) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function calculateAge(dob: Date | string) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    pages: Math.ceil(items.length / limit),
    page,
    limit,
  };
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    HIRED: "bg-blue-100 text-blue-800",
    TERMINATED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    DRAFT: "bg-gray-100 text-gray-800",
    PROCESSING: "bg-yellow-100 text-yellow-800",
    FAILED: "bg-red-100 text-red-800",
    AVAILABLE: "bg-green-100 text-green-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_REPAIR: "bg-orange-100 text-orange-800",
    RETIRED: "bg-gray-100 text-gray-800",
    PRESENT: "bg-green-100 text-green-800",
    ABSENT: "bg-red-100 text-red-800",
    LATE: "bg-orange-100 text-orange-800",
    HALF_DAY: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}
