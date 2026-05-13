"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BudgetPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/headcount");
  }, [router]);
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      Redirecting to HR Budget...
    </div>
  );
}
