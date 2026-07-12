"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle, Calendar, CalendarDays, Clock, DollarSign, FilePlus, Megaphone, Sparkles, UserPlus, TrendingUp, Users, Baby,
} from "lucide-react";

type Registration = {
  id: string;
  child_name: string;
  parent_name: string;
  age: string;
  applied_date: string;
};

type ManagerData = {
  attendanceRate: number | null;
  monthlyRevenue: number;
  pendingRegistrations: Registration[];
  enrolledChildren: number;
  activeStaff: number;
  classroomCount: number;
  loading: boolean;
  error: string;
};

export default function ManagerDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<ManagerData>({
    attendanceRate: null,
    monthlyRevenue: 0,
    pendingRegistrations: [],
    enrolledChildren: 0,
    activeStaff: 0,
    classroomCount: 0,
    loading: true,
    error: "",
  });

  const fetchData = useCallback(async () => {
    try {
      // Today's attendance rate
      const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("date", new Date().toISOString().slice(0, 10));

      const presentCount = (todayAttendance || []).filter(
        (a) => a.status === "present" || a.status === "late"
      ).length;
      const totalCount = (todayAttendance || []).length;
      const attendanceRate =
        totalCount > 0
          ? Math.round((presentCount / totalCount) * 100)
          : null;

      // Monthly revenue
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("payment_date", monthStart.toISOString().slice(0, 10));

      const monthlyRevenue =
        (payments || []).reduce(
          (sum: number, p: any) => sum + parseFloat(p.amount || "0"),
          0
        ) || 0;

      // Pending registrations
      const { data: registrations } = await supabase
        .from("registrations")
        .select("*")
        .eq("status", "pending")
        .order("applied_date", { ascending: false });

      // Counts
      const { count: enrolledChildren } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true });

      const { count: activeStaff } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("status", "on_duty");

      const { count: classroomCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true });

      setData({
        attendanceRate,
        monthlyRevenue,
        pendingRegistrations: (registrations || []).map((r: any) => ({
          id: r.id,
          child_name: r.child_name,
          parent_name: r.parent_name,
          age: r.age,
          applied_date: r.applied_date,
        })),
        enrolledChildren: enrolledChildren || 0,
        activeStaff: activeStaff || 0,
        classroomCount: classroomCount || 0,
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

  const approveRegistration = async (id: string) => {
    // Optimistic update
    setData((prev) => ({
      ...prev,
      pendingRegistrations: prev.pendingRegistrations.filter((r) => r.id !== id),
    }));

    const { error } = await supabase
      .from("registrations")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      // Revert — re-fetch
      fetchData();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 dark:bg-emerald-950/10 blur-3xl -z-10" />

      <header className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 rounded-xl text-teal-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Good day
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Center Manager
            </h1>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          Center Director
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<Calendar className="h-5 w-5 text-indigo-500" />}
          value={data.attendanceRate !== null ? `${data.attendanceRate}%` : "—"}
          label="Daily Attendance"
        />
        <Stat
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          value={String(data.pendingRegistrations.length)}
          label="Pending Approvals"
        />
        <Stat
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
          value={formatCurrency(data.monthlyRevenue)}
          label="Monthly Revenue"
        />
        <Stat
          icon={<UserPlus className="h-5 w-5 text-amber-500" />}
          value={String(data.activeStaff)}
          label="Staff On Duty"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Daily Operations
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-zinc-500">Enrolled Children</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {data.enrolledChildren}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500">Active Staff</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {data.activeStaff}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500">Classrooms</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {data.classroomCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500">Occupancy</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {data.classroomCount > 0
                  ? `${Math.round((data.enrolledChildren / (data.classroomCount * 15)) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Action
            icon={<FilePlus className="h-5 w-5" />}
            label="Register Child"
            color="indigo"
          />
          <Action
            icon={<Clock className="h-5 w-5" />}
            label="Staff Shifts"
            color="emerald"
          />
          <Action
            icon={<Megaphone className="h-5 w-5" />}
            label="Parent Notices"
            color="amber"
          />
          <Action
            icon={<CalendarDays className="h-5 w-5" />}
            label="Event Calendar"
            color="pink"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Pending Registration Approvals
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
          {data.pendingRegistrations.length === 0 ? (
            <p className="text-sm text-zinc-500 p-4 text-center">
              No pending approvals.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.pendingRegistrations.map((app) => (
                <div
                  key={app.id}
                  className="flex justify-between items-center py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                      {app.child_name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Parent: {app.parent_name} (Age: {app.age})
                    </p>
                  </div>
                  <button
                    onClick={() => approveRegistration(app.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
    indigo:
      "hover:border-indigo-300 dark:hover:border-indigo-900",
    emerald:
      "hover:border-emerald-300 dark:hover:border-emerald-900",
    amber: "hover:border-amber-300 dark:hover:border-amber-900",
    pink: "hover:border-pink-300 dark:hover:border-pink-900",
  };
  const bgMap: Record<string, string> = {
    indigo:
      "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40 text-indigo-500",
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
