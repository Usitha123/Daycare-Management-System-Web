"use client";

import { useEffect, useState } from "react";
import { PlusCircle, UtensilsCrossed, Moon, Droplets, BookOpen, Clock, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type ActivityType = "meal" | "nap" | "potty" | "curriculum";

type ActivityLog = {
  id: string;
  child_id: string | null;
  type: string;
  detail: string | null;
  logged_by: string | null;
  logged_at: string;
  child?: { full_name: string } | null;
};

const ACTIVITY_TYPES = ["meal", "nap", "potty", "curriculum"] as const;

const ACTIVITY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  meal: { label: "Meal", icon: <UtensilsCrossed className="h-5 w-5" />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100" },
  nap: { label: "Nap", icon: <Moon className="h-5 w-5" />, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100" },
  potty: { label: "Potty", icon: <Droplets className="h-5 w-5" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100" },
  curriculum: { label: "Curriculum", icon: <BookOpen className="h-5 w-5" />, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-100" },
};

const emptyForm = { child_id: "", type: "meal" as ActivityType, detail: "" };

export default function TeacherActivitiesPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [children, setChildren] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const [logsRes, childrenRes] = await Promise.all([
      supabase.from("activity_logs").select(`*, child:children(full_name)`).order("logged_at", { ascending: false }),
      supabase.from("children").select("id, full_name").order("full_name"),
    ]);
    if (logsRes.error) { setError(logsRes.error.message); return; }
    setLogs((logsRes.data ?? []).map((r: any) => ({ ...r, child: Array.isArray(r.child) ? r.child[0] ?? null : r.child })));
    if (!childrenRes.error) setChildren(childrenRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = logs.filter((l) =>
    search === "" ||
    (l.child?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    l.type.toLowerCase().includes(search.toLowerCase()) ||
    (l.detail ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (a: ActivityLog) => {
    setEditingId(a.id);
    setForm({ child_id: a.child_id ?? "", type: a.type as ActivityType, detail: a.detail ?? "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.child_id) return;
    setSaving(true); setError("");

    if (editingId) {
      const { error: updateError } = await supabase.from("activity_logs").update({
        child_id: form.child_id, type: form.type, detail: form.detail,
      }).eq("id", editingId);
      setSaving(false);
      if (updateError) { setError(updateError.message); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from("activity_logs").insert({
        child_id: form.child_id, type: form.type, detail: form.detail, logged_by: user?.id ?? null,
      });
      setSaving(false);
      if (insertError) { setError(insertError.message); return; }
    }

    resetForm();
    await fetchData();
  };

  const handleDelete = async (id: string, childName: string) => {
    if (!confirm(`Delete activity for "${childName}"?`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("activity_logs").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Daily Activities</h1>
        <button onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition">
          <PlusCircle className="h-4 w-4" /> {editingId ? "Cancel" : "Log Activity"}
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-purple-500/20" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Activity" : "New Activity Log"}</h2>
          <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.child_id}
            onChange={(e) => setForm({ ...form, child_id: e.target.value })}>
            <option value="">Select child</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}>
            {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input placeholder="Details..." className="w-full p-2 rounded-lg border dark:bg-zinc-800"
            value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Activity" : "Save Activity"}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading activities...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">{search ? "No activities match your search." : "No activities logged yet."}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const config = ACTIVITY_CONFIG[log.type] || { label: log.type, icon: <Clock className="h-5 w-5" />, color: "text-zinc-500 bg-zinc-50" };
            return (
              <div key={log.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-start gap-4 hover:shadow-sm transition">
                <div className={`p-2.5 rounded-xl border ${config.color}`}>{config.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{log.child?.full_name ?? "Unknown"}</p>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">{new Date(log.logged_at).toLocaleTimeString()}</span>
                      <button onClick={() => openEdit(log)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-purple-500 transition"
                        title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(log.id, log.child?.full_name ?? "unknown")}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
                        title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {log.detail && <p className="text-sm text-zinc-500 mt-1">{log.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
