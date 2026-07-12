"use client";

import { useEffect, useState } from "react";
import { Baby, MapPin, Coffee, Heart, Calendar, Clock, BookOpen, Moon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type ChildInfo = {
  id: string;
  full_name: string;
  date_of_birth: string;
  status: string;
  notes: string | null;
  class?: { name: string } | null;
};

type ActivityItem = {
  id: string;
  type: string;
  detail: string | null;
  logged_at: string;
};

function calculateAge(dateOfBirth: string) {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  if (years < 1) return `${Math.max(months, 0)} mo`;
  return months > 0 ? `${years}y ${months}mo` : `${years} years old`;
}

const activityIcon: Record<string, React.ReactNode> = {
  meal: <Coffee className="h-4 w-4 text-amber-400" />,
  nap: <MoonIcon className="h-4 w-4 text-indigo-400" />,
  potty: <Baby className="h-4 w-4 text-amber-500" />,
  mood: <Heart className="h-4 w-4 text-rose-400" />,
  health: <Heart className="h-4 w-4 text-red-400" />,
  curriculum: <BookOpen className="h-4 w-4 text-blue-400" />,
};

function MoonIcon(props: any) { return <Moon className={props.className} />; }

export default function ParentChildrenPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); setError("Not authenticated"); return; }

        // Fetch children for this parent
        const { data: childrenData, error: childrenError } = await supabase
          .from("children")
          .select(`id, full_name, date_of_birth, status, notes, class:classes(name)`)
          .eq("parent_id", user.id)
          .order("full_name");

        if (childrenError) { setError(childrenError.message); setLoading(false); return; }

        const mappedChildren = (childrenData ?? []).map((r: any) => ({
          ...r, class: Array.isArray(r.class) ? r.class[0] ?? null : r.class,
        }));
        setChildren(mappedChildren);

        // Fetch today's activities for these children
        if (mappedChildren.length > 0) {
          const childIds = mappedChildren.map((c: ChildInfo) => c.id);
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const { data: logsData } = await supabase
            .from("activity_logs")
            .select("id, child_id, type, detail, logged_at")
            .in("child_id", childIds)
            .gte("logged_at", todayStart.toISOString())
            .order("logged_at", { ascending: false });

          const grouped: Record<string, ActivityItem[]> = {};
          for (const log of logsData ?? []) {
            if (!grouped[log.child_id]) grouped[log.child_id] = [];
            grouped[log.child_id].push({
              id: log.id, type: log.type, detail: log.detail, logged_at: log.logged_at,
            });
          }
          setActivities(grouped);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-sm text-zinc-500">Loading children...</p>;
  if (error) return <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Children</h1>

      {children.length === 0 ? (
        <p className="text-sm text-zinc-500">No children registered to your account.</p>
      ) : children.map((child) => {
        const childActivities = activities[child.id] || [];
        return (
          <div key={child.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {child.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{child.full_name}</h2>
                <p className="text-sm text-zinc-500">{calculateAge(child.date_of_birth)} · {child.class?.name ?? "No class"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex items-center gap-3">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Current Status</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {child.status === "checked_in" ? "Checked In ✅" : "Checked Out"}
                  </p>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-4 rounded-xl flex items-center gap-3">
                <Coffee className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Notes</p>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{child.notes ?? "No notes"}</p>
                </div>
              </div>
            </div>

            {childActivities.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Today's Activity Feed</h3>
                <div className="space-y-2">
                  {childActivities.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      {activityIcon[a.type] || <Clock className="h-4 w-4 text-zinc-400" />}
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{a.detail || a.type}</span>
                      <span className="text-xs text-zinc-400 ml-auto">
                        {new Date(a.logged_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {childActivities.length === 0 && (
              <p className="text-sm text-zinc-400 italic">No activities recorded yet today.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
