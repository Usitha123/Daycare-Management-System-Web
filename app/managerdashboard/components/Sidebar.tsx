"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Baby, Users, FileText, Settings, X, TrendingUp } from "lucide-react";

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainItems = [
    { href: "/managerdashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/managerdashboard/children", label: "Children", icon: Baby },
    { href: "/managerdashboard/staff", label: "Staff", icon: Users },
    { href: "/managerdashboard/reports", label: "Reports", icon: FileText },
    { href: "/managerdashboard/profit-analysis", label: "Profit Analysis", icon: TrendingUp },
  ];
  const bottomItems = [{ href: "/managerdashboard/settings", label: "Settings", icon: Settings }];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-5 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between mb-8">
        <Link href="/managerdashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white font-bold text-lg">M</div>
          <div><h1 className="text-lg font-bold text-teal-600 dark:text-teal-400">Manager Hub</h1></div>
        </Link>
        <button onClick={onClose} className="md:hidden rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button>
      </div>
      <nav className="flex-1 space-y-2">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-teal-500 text-white shadow-md" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-teal-600"}`}>
              <div className="w-8 flex justify-center flex-shrink-0"><Icon size={20} className={isActive ? "text-white" : "text-slate-400 dark:text-zinc-500"} /></div>
              <span className="ml-4 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="my-2 border-t border-slate-200 dark:border-zinc-800" />
      <nav className="space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-teal-500 text-white shadow-md" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-teal-600"}`}>
              <div className="w-8 flex justify-center flex-shrink-0"><Icon size={20} className={isActive ? "text-white" : "text-slate-400 dark:text-zinc-500"} /></div>
              <span className="ml-4 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
