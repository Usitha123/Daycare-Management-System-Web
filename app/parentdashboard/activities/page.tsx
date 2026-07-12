"use client";

import { useEffect, useState } from "react";
import { Moon, Utensils, Sun, Baby, Heart, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type ChildInfo = {
  id: string;
  full_name: string;
};

type ActivityLog = {
  id: string;
  child_id: string;
  type: string;
  detail: string | null;
  logged_at: string;
  child?: { full_name: string } | null;
};

const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  meal: { icon: <Utensils className="h-4 w-4" />, color: "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-500" },
  nap: { icon: <Moon className="h-4 w-4" />, color: "bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900 text-blue-500" },
  potty: { icon: <Baby className="h-4 w-4" />, color: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-500" },
  mood: { icon: <Heart className="h-4 w-4" />, color: "bg-pink-50 dark:bg-pink-950 border-pink-100 dark:border-pink-900 text-pink-500" },
  health: { icon: <AlertTriangle className="h-4 w-4" />, color: "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900 text-red-500" },
  curriculum: { icon: <BookOpen className="h-4 w-4" />, color: "bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-900 text-purple-500" },
};

export default function ParentActivitiesPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); setError("Not authenticated"); return; }

        // Fetch children for this parent
        const { data: childrenData } = await supabase
          .from("children")
          .select("id, full_name")
          .eq("parent_id", user.id)
          .order("full_name");

        setChildren(childrenData ?? []);

        if (childrenData && childrenData.length > 0) {
          const childIds = childrenData.map((c) => c.id);
          const { data: logsData, error: logsError } = await supabase
            .from("activity_logs")
            .select(`*, child:children(full_name)`)
            .in("child_id", childIds)
            .order("logged_at", { ascending: false });

          if (logsError) { setError(logsError.message); return; }
          setActivities((logsData ?? []).map((r: any) => ({
            ...r, child: Array.isArray(r.child) ? r.child[0] ?? null : r.child,
          })));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activities.filter((a) => {
    if (selectedChild !== "all" && a.child_id !== selectedChild) return false;
    if (!a.logged_at?.startsWith(filterDate)) return false;
    return true;
  });

  if (loading) return <p className="text-sm text-zinc-500">Loading activities...</p>;
  if (error) return <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Activity Timeline</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 rounded-lg border dark:bg-zinc-800 text-xs" />
        </div>
      </div>

      {children.length > 1 && (
        <div className="flex gap-2">
          <button onClick={() => setSelectedChild("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedChild === "all"
                ? "bg-pink-500 text-white"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-pink-50"
            }`}>All Children</button>
          {children.map((c) => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedChild === c.id
                  ? "bg-pink-500 text-white"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-pink-50"
              }`}>{c.full_name.split(" ")[0]}</button>
          ))}
        </div>
      )}

      {children.length === 0 ? (
        <p className="text-sm text-zinc-500">No children registered to your account.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No activities found for the selected filters.</p>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 relative">
          <div className="absolute left-[35px] top-[40px] bottom-[40px] w-0.5 bg-zinc-100 dark:bg-zinc-800" />

          {filtered.map((activity) => {
            const config = ACTIVITY_ICONS[activity.type] || { icon: <Clock className="h-4 w-4" />, color: "bg-zinc-50 text-zinc-500" };
            const titleMap: Record<string, string> = {
              meal: "Meal Time", nap: "Nap Time", potty: "Potty Break",
              mood: "Mood Update", health: "Health Note", curriculum: "Learning Activity",
            };
            return (
              <div key={activity.id} className="flex gap-4 relative">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border z-10 shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                        {titleMap[activity.type] || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </h3>
                      {activity.child?.full_name && (
                        <p className="text-xs text-zinc-400">{activity.child.full_name}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(activity.logged_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  {activity.detail && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{activity.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
