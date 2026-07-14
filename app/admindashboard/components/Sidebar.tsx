"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Building2,
  Receipt,
  FileText,
  CreditCard,
  Settings,
  X,
  Baby,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainMenuItems = [
    { href: "/admindashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admindashboard/activities", label: "Activities", icon: Calendar },
    { href: "/admindashboard/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/admindashboard/children", label: "Children", icon: Baby },
    { href: "/admindashboard/classes", label: "Classes", icon: Building2 },
    { href: "/admindashboard/users", label: "Users", icon: Users },
    { href: "/admindashboard/expenses", label: "Expenses", icon: Receipt },
    { href: "/admindashboard/additional-payments", label: "Addl. Payments", icon: DollarSign },
    { href: "/admindashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/admindashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/admindashboard/profit-analysis", label: "Profit Analysis", icon: TrendingUp },
    { href: "/admindashboard/decision-models", label: "Decision Models", icon: BarChart3 },
  ];

  const bottomMenuItems = [
    { href: "/admindashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        w-64
        bg-white dark:bg-zinc-900
        border-r border-slate-200 dark:border-zinc-800
        p-5
        flex flex-col
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/admindashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white font-bold text-lg">
            DC
          </div>

          <div>
            <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              Daycare Hub
            </h1>
          </div>
        </Link>

        <button
          onClick={onClose}
          className="md:hidden rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation - Main items */}
      <nav className="flex-1 space-y-2 overflow-y-auto sidebar-scroll">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center
                px-4 py-3
                rounded-xl
                transition-all duration-200
                ${isActive
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-indigo-600"
                }
              `}
            >
              {/* Fixed icon width */}
              <div className="w-8 flex justify-center flex-shrink-0">
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 dark:text-zinc-500"
                  }
                />
              </div>

              {/* Space between icon and text */}
              <span className="ml-4 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-2 border-t border-slate-200 dark:border-zinc-800" />

      {/* Bottom section - Settings */}
      <nav className="space-y-2">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center
                px-4 py-3
                rounded-xl
                transition-all duration-200
                ${isActive
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-indigo-600"
                }
              `}
            >
              {/* Fixed icon width */}
              <div className="w-8 flex justify-center flex-shrink-0">
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 dark:text-zinc-500"
                  }
                />
              </div>

              {/* Space between icon and text */}
              <span className="ml-4 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
