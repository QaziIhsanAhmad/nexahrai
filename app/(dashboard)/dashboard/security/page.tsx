"use client";

import { useState } from "react";
import { toast } from "sonner";

const DEMO_SESSIONS = [
  { id: "1", device: "Chrome / macOS", ip: "192.168.1.1", location: "New York, US", lastActive: "2 mins ago", current: true },
  { id: "2", device: "Safari / iPhone", ip: "10.0.0.4", location: "London, UK", lastActive: "1 hour ago", current: false },
  { id: "3", device: "Firefox / Windows", ip: "172.16.0.8", location: "Dubai, AE", lastActive: "3 hours ago", current: false },
  { id: "4", device: "Edge / Windows", ip: "10.0.0.12", location: "Karachi, PK", lastActive: "Yesterday", current: false },
];

const LOGIN_HISTORY = [
  { date: "2024-02-15 09:00", ip: "192.168.1.1", location: "New York, US", status: "SUCCESS" },
  { date: "2024-02-14 18:30", ip: "10.0.0.4", location: "London, UK", status: "SUCCESS" },
  { date: "2024-02-14 08:00", ip: "88.88.88.1", location: "Unknown", status: "FAILED" },
  { date: "2024-02-13 12:15", ip: "172.16.0.8", location: "Dubai, AE", status: "SUCCESS" },
  { date: "2024-02-12 09:00", ip: "192.168.1.1", location: "New York, US", status: "SUCCESS" },
];

export default function SecurityPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24\n10.0.0.0/8");
  const [sessions, setSessions] = useState(DEMO_SESSIONS);

  function revokeSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success("Session revoked successfully");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security Center</h1>
        <p className="text-slate-500 text-sm mt-1">Manage authentication, sessions, and access controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
            </div>
            <button onClick={() => { setTwoFAEnabled(p => !p); toast.success(twoFAEnabled ? "2FA disabled" : "2FA setup started"); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFAEnabled ? "bg-blue-600" : "bg-slate-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFAEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          {twoFAEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              2FA is enabled and protecting your account
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center h-36">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-200 rounded-lg mx-auto flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">QR Code will appear here</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Scan with Google Authenticator or Authy to enable 2FA</p>
            </div>
          )}
        </div>

        {/* SSO */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">SSO Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Single Sign-On with SAML 2.0 / OIDC</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Enterprise</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p className="text-sm font-medium text-purple-700">Available on Enterprise Plan</p>
            <p className="text-xs text-purple-500 mt-1">Supports Okta, Azure AD, Google Workspace</p>
            <button onClick={() => toast.info("Upgrade to Enterprise to enable SSO")}
              className="mt-3 px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700">Upgrade Plan</button>
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">IP Whitelist</h3>
          <p className="text-sm text-slate-500 mb-3">Only allow logins from these IP ranges</p>
          <textarea rows={4} value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => toast.success("IP whitelist updated")}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Save Whitelist</button>
        </div>

        {/* Login History */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Recent Login History</h3>
          <div className="space-y-2">
            {LOGIN_HISTORY.map((l, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-slate-700 text-xs font-medium">{l.date}</p>
                  <p className="text-xs text-slate-400">{l.ip} · {l.location}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Active Sessions</h3>
            <p className="text-sm text-slate-500 mt-0.5">{sessions.length} active sessions</p>
          </div>
          <button onClick={() => { setSessions(prev => prev.filter(s => s.current)); toast.success("All other sessions revoked"); }}
            className="text-sm text-red-600 hover:text-red-700 font-medium">Revoke All Others</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Device", "IP Address", "Location", "Last Active", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="font-medium text-slate-900">{s.device}</span>
                      {s.current && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Current</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{s.ip}</td>
                  <td className="px-5 py-3.5 text-slate-600">{s.location}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.lastActive}</td>
                  <td className="px-5 py-3.5">
                    {!s.current && (
                      <button onClick={() => revokeSession(s.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
