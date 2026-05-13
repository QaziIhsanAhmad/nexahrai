"use client";

import { useState } from "react";
import { toast } from "sonner";

type IntegrationStatus = "CONNECTED" | "NOT_CONNECTED" | "COMING_SOON";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  color: string;
  icon: string;
}

const INTEGRATIONS: Integration[] = [
  // Productivity
  { id: "slack", name: "Slack", description: "Send HR notifications and alerts to Slack channels", category: "Productivity", status: "CONNECTED", color: "bg-purple-100", icon: "S" },
  { id: "teams", name: "Microsoft Teams", description: "Integrate HR workflows with Teams notifications", category: "Productivity", status: "NOT_CONNECTED", color: "bg-blue-100", icon: "T" },
  { id: "google-ws", name: "Google Workspace", description: "Sync with Google Calendar and Drive", category: "Productivity", status: "CONNECTED", color: "bg-red-100", icon: "G" },
  { id: "outlook", name: "Outlook", description: "Email notifications and calendar sync", category: "Productivity", status: "NOT_CONNECTED", color: "bg-blue-100", icon: "O" },
  // Accounting
  { id: "quickbooks", name: "QuickBooks", description: "Sync payroll data with QuickBooks accounting", category: "Accounting", status: "CONNECTED", color: "bg-green-100", icon: "QB" },
  { id: "xero", name: "Xero", description: "Accounting and payroll synchronization", category: "Accounting", status: "NOT_CONNECTED", color: "bg-blue-100", icon: "X" },
  { id: "sap", name: "SAP", description: "Enterprise ERP integration for HR data", category: "Accounting", status: "COMING_SOON", color: "bg-slate-100", icon: "SAP" },
  // HR Systems
  { id: "bamboohr", name: "BambooHR", description: "Migrate or sync employee data from BambooHR", category: "HR Systems", status: "NOT_CONNECTED", color: "bg-green-100", icon: "B" },
  { id: "workday", name: "Workday", description: "Two-way sync with Workday HCM", category: "HR Systems", status: "COMING_SOON", color: "bg-orange-100", icon: "W" },
  // Payroll
  { id: "adp", name: "ADP", description: "Payroll processing via ADP integration", category: "Payroll", status: "COMING_SOON", color: "bg-red-100", icon: "ADP" },
  { id: "gusto", name: "Gusto", description: "Automated payroll sync with Gusto", category: "Payroll", status: "NOT_CONNECTED", color: "bg-green-100", icon: "Gu" },
  // Calendar
  { id: "gcal", name: "Google Calendar", description: "Sync leave and attendance with Google Calendar", category: "Calendar", status: "CONNECTED", color: "bg-blue-100", icon: "GC" },
  { id: "outlook-cal", name: "Outlook Calendar", description: "Sync with Outlook Calendar for meetings and leave", category: "Calendar", status: "NOT_CONNECTED", color: "bg-blue-100", icon: "OC" },
  // Biometric
  { id: "zkteco", name: "ZKTeco", description: "Biometric time & attendance device integration", category: "Biometric Devices", status: "NOT_CONNECTED", color: "bg-slate-100", icon: "ZK" },
  { id: "hid", name: "HID Global", description: "Smart card and biometric access control", category: "Biometric Devices", status: "COMING_SOON", color: "bg-slate-100", icon: "HID" },
];

const CATEGORIES = ["All", "Productivity", "Accounting", "HR Systems", "Payroll", "Calendar", "Biometric Devices"];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const filtered = integrations.filter(i => activeCategory === "All" || i.category === activeCategory);

  function toggleConnect(id: string) {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (i.status === "CONNECTED") {
        toast.success(`${i.name} disconnected`);
        return { ...i, status: "NOT_CONNECTED" as IntegrationStatus };
      } else {
        toast.success(`${i.name} connected successfully!`);
        return { ...i, status: "CONNECTED" as IntegrationStatus };
      }
    }));
  }

  const statusBadge: Record<IntegrationStatus, { text: string; cls: string }> = {
    CONNECTED: { text: "Connected", cls: "bg-green-100 text-green-700" },
    NOT_CONNECTED: { text: "Not Connected", cls: "bg-slate-100 text-slate-500" },
    COMING_SOON: { text: "Coming Soon", cls: "bg-amber-100 text-amber-600" },
  };

  const counts = {
    connected: integrations.filter(i => i.status === "CONNECTED").length,
    available: integrations.filter(i => i.status === "NOT_CONNECTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrations Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Connect NexaHR AI with your favorite tools</p>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-slate-500"><span className="font-semibold text-green-600">{counts.connected}</span> connected</span>
          <span className="text-slate-500"><span className="font-semibold text-slate-700">{counts.available}</span> available</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === c ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((intg) => {
          const badge = statusBadge[intg.status];
          return (
            <div key={intg.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${intg.color} rounded-xl flex items-center justify-center text-sm font-bold text-slate-700`}>
                    {intg.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{intg.name}</h3>
                    <span className="text-xs text-slate-400">{intg.category}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.text}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4 min-h-[40px]">{intg.description}</p>
              {intg.status === "COMING_SOON" ? (
                <button disabled className="w-full py-2 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed">Coming Soon</button>
              ) : intg.status === "CONNECTED" ? (
                <button onClick={() => toggleConnect(intg.id)}
                  className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Disconnect</button>
              ) : (
                <button onClick={() => toggleConnect(intg.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Connect</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
