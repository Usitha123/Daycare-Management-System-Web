"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translations, type Language } from "@/utils/translations";
import {
    AlertTriangle,
    Clock,
    Heart,
    HelpCircle,
    LogOut,
    ShieldAlert,
    Sparkles,
    Square,
    SquareCheck,
} from "lucide-react";

type Task = {
    id: string;
    title: string;
    time: string;
    done: boolean;
};

export default function CaregiverDashboard() {
    const router = useRouter();
    const supabase = createClient();

    const [lang, setLang] = useState<Language>("en");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const t = (key: keyof typeof translations.en) => {
        return translations[lang][key] || key;
    };

    const [tasks, setTasks] = useState<Task[]>([
        { id: "1", title: t("taskSanitize"), time: "8:30 AM", done: true },
        { id: "2", title: t("taskSnacks"), time: "10:00 AM", done: true },
        { id: "3", title: t("taskRestroom"), time: "11:30 AM", done: false },
        { id: "4", title: t("taskLunch"), time: "12:15 PM", done: false },
        { id: "5", title: t("taskTables"), time: "1:00 PM", done: false },
    ]);

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

    const toggleTask = (id: string) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id === id) {
                    return { ...task, done: !task.done };
                }
                return task;
            })
        );
    };

    const completedCount = tasks.filter((t) => t.done).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans p-6 relative overflow-hidden">
            {/* Background decoration blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-amber-100/40 dark:bg-amber-950/10 blur-3xl -z-10" />
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
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("helloCaregiver")}</p>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                                Ms. Clara Higgins
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-full shadow-sm text-sm font-semibold transition cursor-pointer"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>{lang === "en" ? "සිංහල" : "English"}</span>
                    </button>
                </header>

                {/* Role Badge */}
                <div className="flex">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-750 dark:text-amber-455 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {t("assistingCaregiver")}
                    </div>
                </div>

                {/* Shift Summary & Progress */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t("shiftSummary")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl text-amber-500">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("activeShift")}</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">8:00 AM - 4:00 PM</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-emerald-500">
                                <SquareCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("tasksDone")}</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                                    {completedCount} / {tasks.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Support Actions */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Support Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => alert("Incident report form has been initiated.")}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
                        >
                            <div className="h-12 w-12 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-full flex items-center justify-center text-red-500 mb-3">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Report Incident</span>
                        </button>

                        <button
                            onClick={() => alert("Support alert has been sent to the Manager.")}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
                        >
                            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-full flex items-center justify-center text-amber-500 mb-3">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Request Support</span>
                        </button>

                        <button
                            onClick={() => alert("Care plans database is under construction.")}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
                        >
                            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                                <Heart className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Care Plans</span>
                        </button>

                        <button
                            onClick={() => alert("Sanitation checklist details are under construction.")}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-900 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer"
                        >
                            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-full flex items-center justify-center text-blue-500 mb-3">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Checklist Details</span>
                        </button>
                    </div>
                </section>

                {/* Assigned Tasks Checklist */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t("assignedTasks")}</h2>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                        {tasks.map((task) => {
                            return (
                                <button
                                    type="button"
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className="w-full flex items-center gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition text-left cursor-pointer"
                                >
                                    <div className="shrink-0">
                                        {task.done ? (
                                            <SquareCheck className="h-6 w-6 text-emerald-500" />
                                        ) : (
                                            <Square className="h-6 w-6 text-zinc-300 dark:text-zinc-700" />
                                        )}
                                    </div>
                                    <div>
                                        <h3
                                            className={`font-bold text-sm ${task.done
                                                ? "text-zinc-400 dark:text-zinc-650 line-through decoration-zinc-300 dark:decoration-zinc-800"
                                                : "text-zinc-900 dark:text-zinc-50"
                                                }`}
                                        >
                                            {task.title}
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-1">{task.time}</p>
                                    </div>
                                </button>
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
