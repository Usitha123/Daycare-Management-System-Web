"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    setConfirmOpen(false);
    router.push("/");
  };

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-200">

      {/* Left Section */}
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          aria-label="Open menu"
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Page Title (Optional) */}
        <h1 className="hidden md:block text-lg font-semibold text-slate-800 dark:text-zinc-200">
          Admin Dashboard
        </h1>
      </div>


      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-5">

        {/* Notification */}
        <button
          className="relative p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <Bell size={20} />

          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
        </button>


        {/* Divider */}
        <span className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />


        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            U
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-tight">
              Usitha
            </p>

            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Administrator
            </p>
          </div>

        </div>

        {/* Divider */}
        <span className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Logout Button */}
        <button
          onClick={() => setConfirmOpen(true)}
          title="Logout"
          className="flex items-center gap-2 p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={20} />
          <span className="hidden md:inline text-sm font-semibold">Logout</span>
        </button>

      </div>

      {/* ── Logout Confirmation Modal ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loggingOut && setConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <LogOut size={18} className="text-red-500" /> Log Out
              </h2>
              <button
                onClick={() => !loggingOut && setConfirmOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loggingOut}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-60"
              >
                No, stay
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-500/20 active:scale-95 cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5"
              >
                {loggingOut && <Loader2 size={14} className="animate-spin" />}
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
