"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-200">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
