"use client";

import { useEffect, useState } from "react";
import { Baby, Search, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Kid = {
  id: string;
  full_name: string;
  date_of_birth: string;
  status: string;
  class?: { name: string } | null;
  parent?: { full_name: string } | null;
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

export default function TeacherChildrenPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from("children")
      .select(`id, full_name, date_of_birth, status, class:classes(name), parent:profiles!children_parent_id_fkey(full_name)`)
      .order("full_name");

    if (!error) {
      setChildren((data ?? []).map((row: any) => ({
        ...row,
        class: Array.isArray(row.class) ? row.class[0] ?? null : row.class,
        parent: Array.isArray(row.parent) ? row.parent[0] ?? null : row.parent,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchChildren(); }, []);

  const filtered = children.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const checkedIn = filtered.filter((c) => c.status === "checked_in").length;

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "checked_in" ? "checked_out" : "checked_in";
    await supabase.from("children").update({ status: newStatus }).eq("id", id);
    setChildren((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Classroom Roster</h1>
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold px-4 py-2 rounded-xl">
          <Users className="h-4 w-4 inline mr-1.5" />{checkedIn} / {filtered.length} Present
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search children..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading children...</p>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 p-6 text-center">No children match your search.</p>
          ) : filtered.map((kid) => (
            <div key={kid.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl"><Baby className="h-5 w-5 text-purple-500" /></div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{kid.full_name}</h3>
                  <p className="text-xs text-zinc-500">{calculateAge(kid.date_of_birth)} · {kid.class?.name ?? "No class"} · Parent: {kid.parent?.full_name ?? "N/A"}</p>
                </div>
              </div>
              <button onClick={() => toggleStatus(kid.id, kid.status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                  kid.status === "checked_in"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-500 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-slate-100"
                }`}>
                {kid.status === "checked_in" ? "Checked In" : "Checked Out"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
