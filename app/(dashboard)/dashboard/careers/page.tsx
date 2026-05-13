"use client";

import Link from "next/link";

export default function CareersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Career Path Mapping</h1>
        <p className="text-slate-500 text-sm mt-1">Visualize and plan employee career progression</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <svg className="w-10 h-10 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <p className="text-blue-700 font-medium mb-2">Career Path Mapping is part of the Succession module</p>
        <p className="text-blue-500 text-sm mb-4">View career ladders and level requirements in the Succession Planning section</p>
        <Link href="/dashboard/succession" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Go to Succession Planning
        </Link>
      </div>
    </div>
  );
}
