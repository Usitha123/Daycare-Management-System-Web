"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translations, type Language } from "@/utils/translations";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  FilePlus,
  LogOut,
  Megaphone,
  Sparkles,
  UserPlus,
} from "lucide-react";

type Registration = {
  id: string;
  name: string;
  parent: string;
  age: string;
};

export default function ManagerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [lang, setLang] = useState<Language>("en");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [approvals, setApprovals] = useState<Registration[]>([
    { id: "1", name: "Emily Watson", parent: "Sarah Watson", age: "3" },
    { id: "2", name: "Leo Martinez", parent: "Carlos Martinez", age: "2" },
  ]);

  const t = (key: keyof typeof translations.en) => {
    return translations[lang][key] || key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "si" : "en"));
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (err: any) {
      alert(`${t("logoutError")}: ${err.message}`);
    }
  };

  const approveRegistration = (id: string, name: string) => {
    alert(`Approved: ${name} registration has been approved.`);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans p-6 relative overflow-hidden">
      {/* Background decoration blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 dark:bg-emerald-950/10 blur-3xl -z-10" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-3 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("goodDay")}</p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {t("centerManager")}
              </h1>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full shadow-sm text-sm font-semibold transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{lang === "en" ? "සිංහල" : "English"}</span>
          </button>
        </header>

        {/* Role Badge */}
        <div className="flex">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            {t("centerDirector")}
          </div>
        </div>

        {/* Daily Overview */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t("dailyOps")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <Calendar className="h-6 w-6 text-indigo-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">94%</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Daily Attendance</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">3</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Staff Alerts</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <DollarSign className="h-6 w-6 text-emerald-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">$12,400</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Monthly Revenue</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <UserPlus className="h-6 w-6 text-amber-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{approvals.length}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Pending Approvals</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert("Child registration form is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-full flex items-center justify-center text-indigo-500 mb-3">
                <FilePlus className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Register Child</span>
            </button>

            <button
              onClick={() => alert("Staff schedule manager is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Staff Shifts</span>
            </button>

            <button
              onClick={() => alert("Notice announcement broadcaster is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-full flex items-center justify-center text-amber-500 mb-3">
                <Megaphone className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Parent Notices</span>
            </button>

            <button
              onClick={() => alert("Center event planner is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-full flex items-center justify-center text-pink-500 mb-3">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Event Calendar</span>
            </button>
          </div>
        </section>

        {/* Pending Registration Approvals */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Pending Registration Approvals</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm overflow-hidden">
            {approvals.length === 0 ? (
              <p className="text-sm text-zinc-550 dark:text-zinc-400 p-4 text-center">No pending approvals remaining.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {approvals.map((app) => {
                  return (
                    <div key={app.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{app.name}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Parent: {app.parent} (Age: {app.age})
                        </p>
                      </div>
                      <button
                        onClick={() => approveRegistration(app.id, app.name)}
                        className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{t("confirmLogout")}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{t("areYouSureLogout")}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {t("no")}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-semibold text-white transition cursor-pointer"
              >
                {t("yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
