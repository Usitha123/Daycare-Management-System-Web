"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Heart,
  HelpCircle,
  ShieldAlert,
  Square,
  SquareCheck,
  Baby,
  Sun,
  Moon,
  Utensils,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  due_time: string | null;
  done: boolean;
  priority: string;
};

type ActivityItem = {
  id: string;
  type: string;
  detail: string | null;
  logged_at: string;
  children: { full_name: string } | null;
};

type CaregiverData = {
  tasks: Task[];
  activities: ActivityItem[];
  childrenCount: number;
  shiftStart: string | null;
  shiftEnd: string | null;
  loading: boolean;
  error: string;
};

export default function CaregiverDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<CaregiverData>({
    tasks: [],
    activities: [],
    childrenCount: 0,
    shiftStart: null,
    shiftEnd: null,
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

      // Fetch staff shift info
      const { data: staff } = await supabase
        .from("staff")
        .select("shift_start, shift_end")
        .eq("profile_id", user.id)
        .maybeSingle();

      // Fetch today's tasks
      const today = new Date().toISOString().slice(0, 10);
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("due_date", today)
        .order("due_time");

      // Fetch children count
      const { count: childrenCount } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true });

      // Fetch today's activity feed
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: activities } = await supabase
        .from("activity_logs")
        .select("id, type, detail, logged_at, children:child_id(full_name)")
        .gte("logged_at", todayStart.toISOString())
        .order("logged_at", { ascending: false })
        .limit(10);

      setData({
        tasks: tasks || [],
        activities: (activities || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          detail: a.detail,
          logged_at: a.logged_at,
          children: Array.isArray(a.children)
            ? a.children[0] || null
            : a.children || null,
        })),
        childrenCount: childrenCount || 0,
        shiftStart: staff?.shift_start || null,
        shiftEnd: staff?.shift_end || null,
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

  const toggleTask = async (id: string) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic update
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }));

    const { error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", id);

    if (error) {
      // Revert on failure
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id ? { ...t, done: task.done } : t
        ),
      }));
    }
  };

  const completedCount = data.tasks.filter((t) => t.done).length;

  const formatTime = (time: string | null) => {
    if (!time) return "—";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour;
    return `${display}:${m} ${ampm}`;
  };

  const formatLoggedAt = (iso: string) => {
    const d = new Date(iso);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const activityIcons: Record<string, { icon: React.ReactNode; color: string }> = {
    meal: { icon: <Utensils className="h-4 w-4" />, color: "emerald" },
    nap: { icon: <Moon className="h-4 w-4" />, color: "indigo" },
    potty: { icon: <Baby className="h-4 w-4" />, color: "amber" },
    mood: { icon: <Heart className="h-4 w-4" />, color: "pink" },
    health: { icon: <AlertTriangle className="h-4 w-4" />, color: "red" },
    curriculum: { icon: <BookOpen className="h-4 w-4" />, color: "blue" },
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
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-amber-100/40 dark:bg-amber-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />

      <header className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl text-amber-500">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Hello, Caregiver
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Caregiver Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          Assisting Caregiver
        </div>
      </div>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          value={
            data.shiftStart && data.shiftEnd
              ? `${formatTime(data.shiftStart)} - ${formatTime(data.shiftEnd)}`
              : "8h"
          }
          label="Shift Today"
        />
        <Stat
          icon={<Baby className="h-5 w-5 text-indigo-500" />}
          value={String(data.childrenCount)}
          label="Children Enrolled"
        />
        <Stat
          icon={<SquareCheck className="h-5 w-5 text-emerald-500" />}
          value={`${completedCount}/${data.tasks.length}`}
          label="Tasks Done"
        />
        <Stat
          icon={<Sun className="h-5 w-5 text-amber-500" />}
          value={formatTime(data.shiftStart)}
          label="Clock In"
        />
      </div>

      {/* Shift Summary & Progress */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Shift Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl text-amber-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Active Shift
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {data.shiftStart && data.shiftEnd
                  ? `${formatTime(data.shiftStart)} - ${formatTime(data.shiftEnd)}`
                  : "8:00 AM - 4:00 PM"}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-emerald-500">
              <SquareCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tasks Completed
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {completedCount} / {data.tasks.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Support Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Report Incident"
            color="red"
          />
          <ActionButton
            icon={<HelpCircle className="h-5 w-5" />}
            label="Request Support"
            color="amber"
          />
          <ActionButton
            icon={<Heart className="h-5 w-5" />}
            label="Care Plans"
            color="emerald"
          />
          <ActionButton
            icon={<ShieldAlert className="h-5 w-5" />}
            label="Checklist Details"
            color="blue"
          />
        </div>
      </section>

      {/* Today's Activity Feed */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Today&apos;s Activity Feed
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          {data.activities.length === 0 ? (
            <p className="text-sm text-zinc-500 p-4 text-center">
              No activities logged today.
            </p>
          ) : (
            data.activities.map((a) => {
              const iconData = activityIcons[a.type] || {
                icon: <Baby className="h-4 w-4" />,
                color: "amber",
              };
              return (
                <ActivityItem
                  key={a.id}
                  icon={iconData.icon}
                  iconColor={iconData.color}
                  label={
                    a.children
                      ? `${a.children.full_name} — ${a.type}${a.detail ? ` (${a.detail})` : ""}`
                      : `${a.type}${a.detail ? `: ${a.detail}` : ""}`
                  }
                  time={formatLoggedAt(a.logged_at)}
                />
              );
            })
          )}
        </div>
      </section>

      {/* Assigned Tasks Checklist */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Assigned Tasks
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.tasks.length === 0 ? (
            <div className="p-5 text-sm text-zinc-500 text-center">
              No tasks assigned for today.
            </div>
          ) : (
            data.tasks.map((task) => (
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
                    className={`font-bold text-sm ${
                      task.done
                        ? "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {formatTime(task.due_time)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/* ── Stat Component ── */
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

/* ── Action Button ── */
function ActionButton({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    red: "hover:border-red-300 dark:hover:border-red-900",
    amber: "hover:border-amber-300 dark:hover:border-amber-900",
    emerald: "hover:border-emerald-300 dark:hover:border-emerald-900",
    blue: "hover:border-blue-300 dark:hover:border-blue-900",
  };

  const bgMap: Record<string, string> = {
    red: "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40 text-red-500",
    amber:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-500",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-500",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40 text-blue-500",
  };

  return (
    <button
      onClick={() => alert(`${label}: Coming soon`)}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${colorMap[color] || colorMap.amber} p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer`}
    >
      <div
        className={`h-12 w-12 ${bgMap[color] || bgMap.amber} rounded-full flex items-center justify-center border mb-3`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
    </button>
  );
}

/* ── Activity Item ── */
function ActivityItem({
  icon,
  iconColor,
  label,
  time,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  time: string;
}) {
  const iconBgMap: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500",
    indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500",
    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-500",
    pink: "bg-pink-50 dark:bg-pink-950/30 text-pink-500",
    red: "bg-red-50 dark:bg-red-950/30 text-red-500",
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-500",
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`p-2 rounded-lg ${iconBgMap[iconColor] || iconBgMap.amber}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {label}
        </p>
      </div>
      <span className="text-xs text-zinc-400">{time}</span>
    </div>
  );
}
