import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexaHR AI — HR Automation Platform",
  description:
    "Full-stack HR management system with AI-powered recruitment, payroll, attendance, performance, and more.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
