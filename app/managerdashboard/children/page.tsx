"use client";

import { useEffect, useState } from "react";
import { Baby, User, Calendar, CheckCircle, XCircle, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Registration = {
  id: string;
  child_name: string;
  parent_name: string;
  age: string;
  status: "pending" | "approved" | "rejected";
  applied_date: string;
};

export default function ManagerChildrenPage() {
  const supabase = createClient();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchRegistrations = async () => {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .order("applied_date", { ascending: false });
    if (fetchError) { setError(fetchError.message); return; }
    setRegistrations(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const filtered = registrations.filter((r) =>
    r.child_name.toLowerCase().includes(search.toLowerCase()) ||
    r.parent_name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = filtered.filter((r) => r.status === "pending").length;

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setSaving(true); setError("");
    const { error: updateError } = await supabase.from("registrations").update({ status }).eq("id", id);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Children Registration</h1>
        <span className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold px-4 py-2 rounded-xl">
          {pendingCount} Pending
        </span>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search by name or parent..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading registrations...</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No registrations found.</p>
          ) : filtered.map((reg) => (
            <div key={reg.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-xl"><Baby className="h-5 w-5 text-teal-500" /></div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{reg.child_name}</h3>
                  <p className="text-xs text-zinc-500"><User className="h-3 w-3 inline mr-1" />{reg.parent_name} · Age: {reg.age}</p>
                  <p className="text-xs text-zinc-400"><Calendar className="h-3 w-3 inline mr-1" />Applied: {reg.applied_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {reg.status === "pending" ? (
                  <>
                    <button onClick={() => updateStatus(reg.id, "approved")} disabled={saving}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 transition cursor-pointer">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => updateStatus(reg.id, "rejected")} disabled={saving}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50 transition cursor-pointer">
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </>
                ) : (
                  <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold ${
                    reg.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    {reg.status === "approved" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
