"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translations, type Language } from "@/utils/translations";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  LogOut,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  CreditCard,
  Building2,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [lang, setLang] = useState<Language>("en");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const t = (key: keyof typeof translations.en) => {
    return translations[lang][key] || key;
  };

  const formatTemplate = (template: string, vars: Record<string, string>) => {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || "");
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans p-6 relative overflow-hidden">
      {/* Background decoration blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-pink-100/40 dark:bg-pink-950/10 blur-3xl -z-10" />

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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("welcomeBack")}</p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {t("admin")}
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
            {t("sysAdmin")}
          </div>
        </div>

        {/* System Overview */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t("sysOverview")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <Users className="h-6 w-6 text-indigo-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">142</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("totalChildren")}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <Building2 className="h-6 w-6 text-emerald-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">8</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("classrooms")}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <BookOpen className="h-6 w-6 text-amber-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">24</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("totalStaff")}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <ShieldCheck className="h-6 w-6 text-pink-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">100%</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("compliance")}</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert(t("subConst"))}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-full flex items-center justify-center text-indigo-500 mb-3">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("subscriptions")}</span>
            </button>

            <button
              onClick={() => alert(t("classConst"))}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("addClassroom")}</span>
            </button>

            <button
              onClick={() => alert(t("userConst"))}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-full flex items-center justify-center text-amber-500 mb-3">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("manageUsers")}</span>
            </button>

            <button
              onClick={() => alert(t("settingConst"))}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-full flex items-center justify-center text-pink-500 mb-3">
                <Settings className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("settings")}</span>
            </button>
          </div>
        </section>

        {/* Recent System Alerts */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t("recentAlerts")}</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-start gap-4 py-4 first:pt-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("dbBackup")}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatTemplate(t("todayAt"), { time: "3:00 AM" })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 py-4 last:pb-0">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("ratioAlert")}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatTemplate(t("yesterdayAt"), { time: "4:32 PM" })}
                </p>
              </div>
            </div>
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
