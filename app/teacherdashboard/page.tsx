"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translations, type Language } from "@/utils/translations";
import {
  Baby,
  BookOpen,
  Clock,
  Droplets,
  LogOut,
  Moon,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";

type Kid = {
  id: string;
  name: string;
  age: string;
  status: "Checked In" | "Checked Out";
};

export default function TeacherDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [lang, setLang] = useState<Language>("en");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [kids, setKids] = useState<Kid[]>([
    { id: "1", name: "Liam Johnson", age: "3yo", status: "Checked In" },
    { id: "2", name: "Olivia Smith", age: "4yo", status: "Checked In" },
    { id: "3", name: "Noah Williams", age: "3yo", status: "Checked Out" },
    { id: "4", name: "Ava Brown", age: "4yo", status: "Checked In" },
    { id: "5", name: "Lucas Davis", age: "3yo", status: "Checked Out" },
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

  const toggleStatus = (id: string) => {
    setKids((prevKids) =>
      prevKids.map((kid) => {
        if (kid.id === id) {
          const nextStatus = kid.status === "Checked In" ? "Checked Out" : "Checked In";
          alert(`Attendance Updated: ${kid.name} marked ${nextStatus}`);
          return { ...kid, status: nextStatus };
        }
        return kid;
      })
    );
  };

  const checkedInCount = kids.filter((k) => k.status === "Checked In").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans p-6 relative overflow-hidden">
      {/* Background decoration blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-purple-100/40 dark:bg-purple-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />

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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("goodMorning")}</p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {t("teacherName")}
              </h1>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-full shadow-sm text-sm font-semibold transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{lang === "en" ? "සිංහල" : "English"}</span>
          </button>
        </header>

        {/* Role Badge */}
        <div className="flex">
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            Preschool Educator
          </div>
        </div>

        {/* Classroom Status */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Classroom Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-purple-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Kids Present</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">{checkedInCount}/{kids.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-blue-500">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Next Activity (Story)</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1 font-mono">3:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions / Log Daily Activity */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Log Daily Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert("Activity: Log Meal interface is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-full flex items-center justify-center text-purple-500 mb-3">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Log Meal</span>
            </button>

            <button
              onClick={() => alert("Activity: Log Nap interface is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                <Moon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Log Nap</span>
            </button>

            <button
              onClick={() => alert("Activity: Log Potty interface is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-full flex items-center justify-center text-amber-500 mb-3">
                <Droplets className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Log Potty</span>
            </button>

            <button
              onClick={() => alert("Curriculum planner is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-full flex items-center justify-center text-pink-500 mb-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Curriculum</span>
            </button>
          </div>
        </section>

        {/* Classroom Roster */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Classroom Roster</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {kids.map((kid) => {
              const isCheckedIn = kid.status === "Checked In";
              return (
                <div key={kid.id} className="flex justify-between items-center p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{kid.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{kid.age}</p>
                  </div>
                  <button
                    onClick={() => toggleStatus(kid.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                      isCheckedIn
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                        : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                    }`}
                  >
                    {kid.status}
                  </button>
                </div>
              );
            })}
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
