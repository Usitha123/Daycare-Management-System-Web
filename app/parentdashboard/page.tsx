"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translations, type Language } from "@/utils/translations";
import {
  ArrowLeft,
  Calendar,
  Coffee,
  CreditCard,
  LogOut,
  MapPin,
  Moon,
  QrCode,
  Sparkles,
  Sun,
  Utensils,
  Video,
} from "lucide-react";

export default function ParentDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [lang, setLang] = useState<Language>("en");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-pink-100/40 dark:bg-pink-950/10 blur-3xl -z-10" />
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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("helloParent")}</p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                Sarah Watson
              </h1>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white hover:bg-pink-600 rounded-full shadow-sm text-sm font-semibold transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{lang === "en" ? "සිංහල" : "English"}</span>
          </button>
        </header>

        {/* Role Badge */}
        <div className="flex">
          <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            Liam's Mother (Preschool A)
          </div>
        </div>

        {/* Child Current Status */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Liam's Status Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Card 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-xl text-pink-500">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Status</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">Checked In</p>
              </div>
            </div>

            {/* Status Card 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-purple-500">
                <Coffee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Next Scheduled Activity</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">Snack Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Parent Actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Parent Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert("QR code presented for check-in / check-out scanning.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-full flex items-center justify-center text-pink-500 mb-3">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Check-in QR</span>
            </button>

            <button
              onClick={() => alert("Live stream access is under construction.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-full flex items-center justify-center text-blue-500 mb-3">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Camera Feed</span>
            </button>

            <button
              onClick={() => alert("Liam's absence notification has been sent.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-full flex items-center justify-center text-amber-500 mb-3">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Report Absence</span>
            </button>

            <button
              onClick={() => alert("Redirecting to child fee payments portal.")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
            >
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Pay Invoice</span>
            </button>
          </div>
        </section>

        {/* Real-time Timeline */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Real-time Activity Timeline</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 relative">
            <div className="absolute left-[35px] top-[40px] bottom-[40px] w-0.5 bg-zinc-100 dark:bg-zinc-800" />

            {/* Timeline Item 1 */}
            <div className="flex gap-4 relative">
              <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-full flex items-center justify-center text-blue-500 z-10 shrink-0">
                <Moon className="h-4 w-4" />
              </div>
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-850 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Nap Time Started</h3>
                  <span className="text-xs text-zinc-400">1:45 PM</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Liam went to sleep soundly on his cot.</p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex gap-4 relative">
              <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-full flex items-center justify-center text-emerald-500 z-10 shrink-0">
                <Utensils className="h-4 w-4" />
              </div>
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-850 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Finished Lunch</h3>
                  <span className="text-xs text-zinc-400">1:15 PM</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Ate 100% of his turkey wrap and fruit bowl.</p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex gap-4 relative">
              <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-full flex items-center justify-center text-amber-500 z-10 shrink-0">
                <Sun className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Outdoor Play Activity</h3>
                  <span className="text-xs text-zinc-400">11:30 AM</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Played soccer and built sandcastles with friends.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
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
