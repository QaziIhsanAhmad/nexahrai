"use client";

import { useEffect, useState } from "react";

interface Props {
  name: string;
  companyName: string;
  pendingApprovals: number;
  newApplications: number;
  onLeaveToday: number;
  presentToday: number;
  totalEmployees: number;
}

function getGreeting(hour: number) {
  if (hour < 12) return { text: "Good Morning", icon: "☀️", sub: "Start your day with clarity." };
  if (hour < 17) return { text: "Good Afternoon", icon: "🌤️", sub: "Stay focused, you're doing great." };
  if (hour < 21) return { text: "Good Evening", icon: "🌆", sub: "Wrapping up for the day?" };
  return { text: "Good Night", icon: "🌙", sub: "Late night hustle detected." };
}

function getDayMessage(day: number) {
  const msgs = [
    "A fresh week begins — let's make it count.",
    "Monday is behind you, momentum is building.",
    "Midweek check-in — keep the pace.",
    "Over the hump! Thursday's almost here.",
    "TGIF! Let's close the week strong.",
    "Saturday grind? Respect.",
    "Sunday planning — tomorrow starts today.",
  ];
  return msgs[day];
}

export default function DashboardHero({
  name,
  companyName,
  pendingApprovals,
  newApplications,
  onLeaveToday,
  presentToday,
  totalEmployees,
}: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting = getGreeting(hour);
  const firstName = name.split(" ")[0];

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const attendancePct = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  const urgentCount = pendingApprovals + newApplications;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 md:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left — greeting */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{greeting.icon}</span>
            <span className="text-blue-200 text-sm font-medium">{greeting.text}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {firstName}!
          </h1>
          <p className="text-blue-200 text-sm mt-1">{greeting.sub}</p>
          <p className="text-blue-300/70 text-xs mt-1">{getDayMessage(now.getDay())}</p>

          {/* Urgent banner */}
          {urgentCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="font-medium">
                {urgentCount} item{urgentCount > 1 ? "s" : ""} need your attention
              </span>
            </div>
          )}
        </div>

        {/* Right — clock + date */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums">
            {timeStr}
          </div>
          <div className="text-blue-200 text-sm">{dateStr}</div>
          <div className="text-blue-300/70 text-xs mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {companyName}
          </div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <div className="text-2xl font-bold">{pendingApprovals}</div>
          <div className="text-blue-200 text-xs mt-0.5">Pending Approvals</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <div className="text-2xl font-bold">{newApplications}</div>
          <div className="text-blue-200 text-xs mt-0.5">New Applications</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <div className="text-2xl font-bold">{onLeaveToday}</div>
          <div className="text-blue-200 text-xs mt-0.5">On Leave Today</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{presentToday}</span>
            <span className="text-blue-300 text-xs">/ {totalEmployees}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${attendancePct}%` }}
              />
            </div>
            <span className="text-blue-200 text-[10px]">{attendancePct}%</span>
          </div>
          <div className="text-blue-200 text-xs mt-0.5">Present Today</div>
        </div>
      </div>
    </div>
  );
}
