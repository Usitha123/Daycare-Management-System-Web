"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface TopbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export default function Topbar({ onToggleSidebar, title = "Teacher Dashboard" }: TopbarProps) {
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
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} aria-label="Open menu" className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
          <Menu size={22} />
        </button>
        <h1 className="hidden md:block text-lg font-semibold text-slate-800 dark:text-zinc-200">{title}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button className="relative p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
        </button>
        <span className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">T</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-tight">Teacher Jane</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">Preschool Educator</p>
          </div>
        </div>
        <span className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />

        <button onClick={() => setConfirmOpen(true)} title="Logout" className="flex items-center gap-2 p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all cursor-pointer">
          <LogOut size={20} />
          <span className="hidden md:inline text-sm font-semibold">Logout</span>
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !loggingOut && setConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2"><LogOut size={18} className="text-red-500" /> Log Out</h2>
              <button onClick={() => !loggingOut && setConfirmOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} disabled={loggingOut} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-60">No, stay</button>
              <button onClick={handleLogout} disabled={loggingOut} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-500/20 active:scale-95 cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5">
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
