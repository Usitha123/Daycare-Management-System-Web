"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Baby, BookOpen, Clock, Droplets, Moon, Sparkles, Users, UtensilsCrossed, Sun, Star,
} from "lucide-react";

type Kid = {
  id: string;
  full_name: string;
  date_of_birth: string;
  status: "checked_in" | "checked_out";
};

type TeacherData = {
  children: Kid[];
  activitiesToday: number;
  nextTask: { title: string; due_time: string } | null;
  shiftStart: string | null;
  className: string | null;
  loading: boolean;
  error: string;
};

export default function TeacherDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<TeacherData>({
    children: [],
    activitiesToday: 0,
    nextTask: null,
    shiftStart: null,
    className: null,
    loading: true,
    error: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setData((d) => ({ ...d, loading: false, error: "Not authenticated" }));
        return;
      }

      // Get teacher's class
      const { data: classData } = await supabase
        .from("classes")
        .select("id, name")
        .eq("teacher_id", user.id)
        .maybeSingle();

      // Get children (filtered by class if teacher has one)
      let childrenQuery = supabase
        .from("children")
        .select("id, full_name, date_of_birth, status")
        .order("full_name");

      if (classData) {
        childrenQuery = childrenQuery.eq("class_id", classData.id);
      }

      const { data: children } = await childrenQuery;

      // Activities today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: activitiesToday } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .gte("logged_at", todayStart.toISOString());

      // Next scheduled task for today
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, due_time")
        .eq("done", false)
        .order("due_time")
        .limit(1);

      // Staff shift info
      const { data: staff } = await supabase
        .from("staff")
        .select("shift_start")
        .eq("profile_id", user.id)
        .maybeSingle();

      setData({
        children: children || [],
        activitiesToday: activitiesToday || 0,
        nextTask: tasks && tasks.length > 0 ? tasks[0] : null,
        shiftStart: staff?.shift_start
          ? staff.shift_start.slice(0, 5)
          : "8:00 AM",
        className: classData?.name || null,
        loading: false,
        error: "",
      });
    } catch (err: any) {
      setData((d) => ({
        ...d,
        loading: false,
        error: err.message || "Failed to load data",
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = async (id: string) => {
    const kid = data.children.find((c) => c.id === id);
    if (!kid) return;

    const newStatus = kid.status === "checked_in" ? "checked_out" : "checked_in";

    // Optimistic update
    setData((prev) => ({
      ...prev,
      children: prev.children.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      ),
    }));

    const { error } = await supabase
      .from("children")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      // Revert on failure
      setData((prev) => ({
        ...prev,
        children: prev.children.map((c) =>
          c.id === id ? { ...c, status: kid.status } : c
        ),
      }));
    }
  };

  const checkedInCount = data.children.filter(
    (k) => k.status === "checked_in"
  ).length;

  const formatShift = (time: string | null) => {
    if (!time) return "8:00 AM";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  if (data.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard: {data.error}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-purple-100/40 dark:bg-purple-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />

      <header className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-purple-500">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Good morning
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Teacher Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          Preschool Educator{data.className ? ` · ${data.className}` : ""}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<Users className="h-5 w-5 text-purple-500" />}
          value={`${checkedInCount}/${data.children.length}`}
          label="Kids Present"
        />
        <Stat
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          value={data.nextTask ? data.nextTask.due_time?.slice(0, 5) || "—" : "—"}
          label={data.nextTask ? `Next: ${data.nextTask.title}` : "No tasks"}
        />
        <Stat
          icon={<Sun className="h-5 w-5 text-amber-500" />}
          value={formatShift(data.shiftStart)}
          label="Day Started"
        />
        <Stat
          icon={<BookOpen className="h-5 w-5 text-pink-500" />}
          value={String(data.activitiesToday)}
          label="Activities Today"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Classroom Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-purple-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kids Present
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {checkedInCount}/{data.children.length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-blue-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {data.nextTask ? `Next: ${data.nextTask.title}` : "Next Activity"}
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1 font-mono">
                {data.nextTask
                  ? data.nextTask.due_time?.slice(0, 5)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Log Daily Activity
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Action
            icon={<UtensilsCrossed className="h-5 w-5" />}
            label="Log Meal"
            color="purple"
          />
          <Action
            icon={<Moon className="h-5 w-5" />}
            label="Log Nap"
            color="emerald"
          />
          <Action
            icon={<Droplets className="h-5 w-5" />}
            label="Log Potty"
            color="amber"
          />
          <Action
            icon={<BookOpen className="h-5 w-5" />}
            label="Curriculum"
            color="pink"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Classroom Roster
        </h2>
        {data.children.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-sm text-zinc-500">
            No children enrolled in your class yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.children.map((kid) => (
              <div
                key={kid.id}
                className="flex justify-between items-center p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                    <Baby className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                      {kid.full_name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {new Date().getFullYear() -
                        new Date(kid.date_of_birth).getFullYear()}
                      yo
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(kid.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    kid.status === "checked_in"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-100"
                      : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50 hover:bg-red-100"
                  }`}
                >
                  {kid.status === "checked_in" ? "Checked In" : "Checked Out"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
      <div className="mb-2">{icon}</div>
      <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function Action({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  const borderMap: Record<string, string> = {
    purple:
      "hover:border-purple-300 dark:hover:border-purple-900",
    emerald:
      "hover:border-emerald-300 dark:hover:border-emerald-900",
    amber: "hover:border-amber-300 dark:hover:border-amber-900",
    pink: "hover:border-pink-300 dark:hover:border-pink-900",
  };
  const bgMap: Record<string, string> = {
    purple:
      "bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40 text-purple-500",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-500",
    amber:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-500",
    pink: "bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/40 text-pink-500",
  };
  return (
    <button
      onClick={() => alert(`${label}: Coming soon`)}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${borderMap[color]} p-5 rounded-2xl flex flex-col items-center text-center transition cursor-pointer`}
    >
      <div
        className={`h-12 w-12 ${bgMap[color]} rounded-full flex items-center justify-center border mb-3`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
    </button>
  );
}
