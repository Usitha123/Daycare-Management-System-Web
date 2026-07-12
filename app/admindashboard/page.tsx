"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  LogOut,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  CreditCard,
  Building2,
} from "lucide-react";

type AdminData = {
  totalChildren: number;
  classroomCount: number;
  totalStaff: number;
  complianceRate: number | null;
  alerts: { type: "success" | "warning"; message: string; time: string }[];
  loading: boolean;
  error: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<AdminData>({
    totalChildren: 0,
    classroomCount: 0,
    totalStaff: 0,
    complianceRate: null,
    alerts: [],
    loading: true,
    error: "",
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Children count
      const { count: totalChildren } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true });

      // Classrooms count
      const { count: classroomCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true });

      // Staff count (from staff table)
      const { count: totalStaff } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true });

      // Compliance rate = attendance rate this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthAttendance } = await supabase
        .from("attendance")
        .select("status")
        .gte("date", monthStart.toISOString().slice(0, 10));

      const presentCount = (monthAttendance || []).filter(
        (a) => a.status === "present" || a.status === "late"
      ).length;
      const totalAttended = (monthAttendance || []).length;
      const complianceRate =
        totalAttended > 0
          ? Math.round((presentCount / totalAttended) * 100)
          : null;

      // Build dynamic alerts
      const alerts: AdminData["alerts"] = [];

      if (totalAttended > 0 && complianceRate !== null && complianceRate < 90) {
        alerts.push({
          type: "warning",
          message: `Attendance rate is ${complianceRate}% this month — below 90% target`,
          time: "This month",
        });
      }

      // Backup-like message based on data health
      alerts.push({
        type: "success",
        message: `System healthy — ${totalChildren || 0} children enrolled across ${classroomCount || 0} classes`,
        time: "Today",
      });

      setData({
        totalChildren: totalChildren || 0,
        classroomCount: classroomCount || 0,
        totalStaff: totalStaff || 0,
        complianceRate,
        alerts,
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (err: any) {
      alert(`Logout failed: ${err.message}`);
    }
  };

  if (data.loading) {
    return (
      <div className="min-h-full space-y-6 relative">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
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
    <div className="min-h-full space-y-6 relative">
      {/* Background decoration blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-pink-100/40 dark:bg-pink-950/10 blur-3xl -z-10" />

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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Admin
            </h1>
          </div>
        </div>
      </header>

      {/* Role Badge */}
      <div className="flex">
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          System Administrator
        </div>
      </div>

      {/* System Overview */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          System Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="h-6 w-6 text-indigo-500" />}
            value={String(data.totalChildren)}
            label="Total Children"
          />
          <StatCard
            icon={<Building2 className="h-6 w-6 text-emerald-500" />}
            value={String(data.classroomCount)}
            label="Classrooms"
          />
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-amber-500" />}
            value={String(data.totalStaff)}
            label="Total Staff"
          />
          <StatCard
            icon={<ShieldCheck className="h-6 w-6 text-pink-500" />}
            value={
              data.complianceRate !== null
                ? `${data.complianceRate}%`
                : "—"
            }
            label="Compliance"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            icon={
              <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-full flex items-center justify-center text-indigo-500 mb-3">
                <CreditCard className="h-5 w-5" />
              </div>
            }
            label="Subscriptions"
            onClick={() => alert("Subscriptions: Coming soon")}
            hoverColor="indigo"
          />
          <ActionButton
            icon={
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                <PlusCircle className="h-5 w-5" />
              </div>
            }
            label="Add Classroom"
            onClick={() => alert("Add Classroom: Coming soon")}
            hoverColor="emerald"
          />
          <ActionButton
            icon={
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-full flex items-center justify-center text-amber-500 mb-3">
                <Users className="h-5 w-5" />
              </div>
            }
            label="Manage Users"
            onClick={() => alert("Manage Users: Coming soon")}
            hoverColor="amber"
          />
          <ActionButton
            icon={
              <div className="h-12 w-12 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-full flex items-center justify-center text-pink-500 mb-3">
                <Settings className="h-5 w-5" />
              </div>
            }
            label="Settings"
            onClick={() => alert("Settings: Coming soon")}
            hoverColor="pink"
          />
        </div>
      </section>

      {/* System Alerts */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          System Alerts
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.alerts.length === 0 ? (
            <div className="py-4 text-sm text-zinc-500 text-center">
              No alerts at this time.
            </div>
          ) : (
            data.alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                {alert.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {alert.message}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{alert.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Confirm Logout
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-semibold text-white transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat Card Component ── */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{label}</p>
    </div>
  );
}

/* ── Action Button Component ── */
function ActionButton({
  icon,
  label,
  onClick,
  hoverColor = "indigo",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  hoverColor?: string;
}) {
  const borderColorMap: Record<string, string> = {
    indigo:
      "hover:border-indigo-300 dark:hover:border-indigo-900",
    emerald:
      "hover:border-emerald-300 dark:hover:border-emerald-900",
    amber: "hover:border-amber-300 dark:hover:border-amber-900",
    pink: "hover:border-pink-300 dark:hover:border-pink-900",
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${
        borderColorMap[hoverColor] || borderColorMap.indigo
      } p-5 rounded-2xl shadow-sm flex flex-col items-center text-center transition cursor-pointer`}
    >
      {icon}
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
    </button>
  );
}
