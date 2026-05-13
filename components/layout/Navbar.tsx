"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface NavbarProps {
  user: { name: string; email: string; role: string };
}

function LiveGreeting({ name }: { name: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return (
      <span className="text-sm font-medium text-slate-500">
        Welcome, <span className="text-slate-900 font-semibold">{name.split(" ")[0]}</span>
      </span>
    );
  }

  const h = now.getHours();
  const icon = h < 12 ? "☀️" : h < 17 ? "🌤️" : h < 21 ? "🌆" : "🌙";
  const label = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end leading-none mr-1">
        <span className="text-[11px] text-slate-400">{date}</span>
        <span className="text-xs font-semibold text-slate-700 tabular-nums">{time}</span>
      </div>
      <div className="h-7 w-px bg-slate-200 hidden md:block" />
      <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
        <span className="text-base leading-none">{icon}</span>
        {label},{" "}
        <span className="text-slate-900 font-semibold">{name.split(" ")[0]}</span>
      </span>
    </div>
  );
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    HR_MANAGER: "HR Manager",
    MANAGER: "Manager",
    EMPLOYEE: "Employee",
  };

  const roleBadgeColor: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    HR_MANAGER: "bg-green-100 text-green-700",
    MANAGER: "bg-orange-100 text-orange-700",
    EMPLOYEE: "bg-slate-100 text-slate-700",
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <LiveGreeting name={user.name} />

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link
          href="/dashboard?panel=notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(user.name)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-900 leading-none">{user.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{roleLabel[user.role] ?? user.role}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-medium text-sm text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className={`inline-flex mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadgeColor[user.role] ?? "bg-slate-100 text-slate-700"}`}>
                  {roleLabel[user.role] ?? user.role}
                </span>
              </div>
              <div className="py-1">
                <Link href="/dashboard/self-service" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  My Profile
                </Link>
                <Link href="/dashboard/settings" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </Link>
                <hr className="my-1 border-slate-100" />
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
