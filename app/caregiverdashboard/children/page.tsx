"use client";

import { useEffect, useState } from "react";
import { Baby, Heart, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Child = {
  id: string;
  full_name: string;
  date_of_birth: string;
  class_id: string | null;
  status: string;
  notes: string | null;
  class?: { name: string } | null;
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

export default function CaregiverChildrenPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from("children")
      .select(`id, full_name, date_of_birth, class_id, status, notes, class:classes(name)`)
      .order("full_name");
    if (!error) {
      setChildren((data ?? []).map((r: any) => ({ ...r, class: Array.isArray(r.class) ? r.class[0] ?? null : r.class })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchChildren(); }, []);

  const filtered = children.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()));
  const checkedInCount = filtered.filter((c) => c.status === "checked_in").length;

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "checked_in" ? "checked_out" : "checked_in";
    await supabase.from("children").update({ status: newStatus }).eq("id", id);
    setChildren((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Children in My Care</h1>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold px-4 py-2 rounded-xl">
          {checkedInCount} / {filtered.length} Checked In
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search children..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading children...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 col-span-full">No children found.</p>
          ) : filtered.map((child) => (
            <div key={child.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl"><Baby className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{child.full_name}</h2>
                  <p className="text-sm text-zinc-500">{calculateAge(child.date_of_birth)} · {child.class?.name ?? "No class"}</p>
                </div>
              </div>

              {child.notes && (
                <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                  <Heart className="h-3 w-3 text-rose-400 mt-0.5 shrink-0" /><span>{child.notes}</span>
                </div>
              )}

              <button onClick={() => toggleStatus(child.id, child.status)}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  child.status === "checked_in"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                }`}>
                {child.status === "checked_in" ? "Checked In" : "Checked Out"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
