"use client";

import React, { useState } from "react";
import { translations, type Language } from "@/utils/translations";
import {
  Calendar, Coffee, CreditCard, MapPin, Moon, QrCode, Sparkles, Sun, Utensils, Video, Baby, Heart,
} from "lucide-react";

export default function ParentDashboard() {
  const [lang, setLang] = useState<Language>("en");

  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;
  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "si" : "en"));

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-pink-100/40 dark:bg-pink-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />

      <header className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-xl text-pink-500">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("helloParent")}</p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sarah Watson</h1>
          </div>
        </div>
        <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white hover:bg-pink-600 rounded-full shadow-sm text-sm font-semibold transition cursor-pointer">
          <Sparkles className="h-4 w-4" /><span>{lang === "en" ? "සිංහල" : "English"}</span>
        </button>
      </header>

      <div className="flex">
        <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          Liam's Mother · Preschool A
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<MapPin className="h-5 w-5 text-emerald-500" />} value="Checked In" label="Liam's Status" />
        <Stat icon={<Coffee className="h-5 w-5 text-purple-500" />} value="Snack Time" label="Next Activity" />
        <Stat icon={<Baby className="h-5 w-5 text-pink-500" />} value="3yo" label="Age" />
        <Stat icon={<Sun className="h-5 w-5 text-amber-500" />} value="8:05 AM" label="Drop-off Time" />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Liam's Status Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-xl text-pink-500"><MapPin className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Status</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">Checked In ✅</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-purple-500"><Coffee className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Next Scheduled Activity</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">Snack Time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Parent Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Action icon={<QrCode className="h-5 w-5" />} label="Check-in QR" color="pink" />
          <Action icon={<Video className="h-5 w-5" />} label="Camera Feed" color="blue" />
          <Action icon={<Calendar className="h-5 w-5" />} label="Report Absence" color="amber" />
          <Action icon={<CreditCard className="h-5 w-5" />} label="Pay Invoice" color="emerald" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Real-time Activity Timeline</h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 relative">
          <div className="absolute left-[35px] top-[40px] bottom-[40px] w-0.5 bg-zinc-100 dark:bg-zinc-800" />

          <TimelineItem icon={<Moon className="h-4 w-4" />} iconColor="bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900 text-blue-500" title="Nap Time Started" time="1:45 PM" description="Liam went to sleep soundly on his cot." />
          <TimelineItem icon={<Utensils className="h-4 w-4" />} iconColor="bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-500" title="Finished Lunch" time="1:15 PM" description="Ate 100% of his turkey wrap and fruit bowl." />
          <TimelineItem icon={<Sun className="h-4 w-4" />} iconColor="bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-500" title="Outdoor Play Activity" time="11:30 AM" description="Played soccer and built sandcastles with friends." />
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl"><div className="mb-2">{icon}</div><p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p><p className="text-xs text-zinc-500">{label}</p></div>;
}

function Action({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  const borderMap: Record<string, string> = { pink: "hover:border-pink-300 dark:hover:border-pink-900", blue: "hover:border-blue-300 dark:hover:border-blue-900", amber: "hover:border-amber-300 dark:hover:border-amber-900", emerald: "hover:border-emerald-300 dark:hover:border-emerald-900" };
  const bgMap: Record<string, string> = { pink: "bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/40 text-pink-500", blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40 text-blue-500", amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-500", emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-500" };
  return (
    <button onClick={() => alert(`${label}: Coming soon`)}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${borderMap[color]} p-5 rounded-2xl flex flex-col items-center text-center transition cursor-pointer`}>
      <div className={`h-12 w-12 ${bgMap[color]} rounded-full flex items-center justify-center border mb-3`}>{icon}</div>
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
    </button>
  );
}

function TimelineItem({ icon, iconColor, title, time, description }: { icon: React.ReactNode; iconColor: string; title: string; time: string; description: string }) {
  return (
    <div className="flex gap-4 relative">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center border z-10 shrink-0 ${iconColor}`}>{icon}</div>
      <div className="flex-1 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <span className="text-xs text-zinc-400">{time}</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{description}</p>
      </div>
    </div>
  );
}
