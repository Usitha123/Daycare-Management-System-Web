"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Clock, Utensils, Moon, Droplets, Heart, AlertTriangle, BookOpen, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Activity = {
  id: string;
  child_id: string | null;
  type: string;
  detail: string | null;
  logged_by: string | null;
  logged_at: string;
  child?: { full_name: string } | null;
};

const ACTIVITY_TYPES = ["meal", "nap", "potty", "mood", "health", "curriculum"] as const;

const activityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  meal: { icon: <Utensils className="h-5 w-5" />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100" },
  nap: { icon: <Moon className="h-5 w-5" />, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100" },
  potty: { icon: <Droplets className="h-5 w-5" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100" },
  mood: { icon: <Heart className="h-5 w-5" />, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-100" },
  health: { icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-100" },
  curriculum: { icon: <BookOpen className="h-5 w-5" />, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100" },
};

const emptyForm = { child_id: "", type: "meal", detail: "" };

export default function ActivitiesPage() {
  const supabase = createClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [children, setChildren] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setError("");
    const [logsRes, childrenRes] = await Promise.all([
      supabase.from("activity_logs").select(`*, child:children(full_name)`).order("logged_at", { ascending: false }),
      supabase.from("children").select("id, full_name").order("full_name"),
    ]);
    if (logsRes.error) { setError(logsRes.error.message); return; }
    setActivities((logsRes.data ?? []).map((row: any) => ({
      ...row, child: Array.isArray(row.child) ? row.child[0] ?? null : row.child,
    })));
    if (!childrenRes.error) setChildren(childrenRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = activities.filter((a) =>
    (a.child?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    (a.detail ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({ child_id: a.child_id ?? "", type: a.type, detail: a.detail ?? "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.detail) return;
    setSaving(true); setError("");

    if (editingId) {
      const { error: updateError } = await supabase.from("activity_logs").update({
        child_id: form.child_id || null, type: form.type, detail: form.detail,
      }).eq("id", editingId);
      setSaving(false);
      if (updateError) { setError(updateError.message); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from("activity_logs").insert({
        child_id: form.child_id || null, type: form.type, detail: form.detail, logged_by: user?.id ?? null,
      });
      setSaving(false);
      if (insertError) { setError(insertError.message); return; }
    }

    resetForm();
    await fetchData();
  };

  const handleDelete = async (id: string, childName: string) => {
    if (!confirm(`Delete activity for "${childName}"? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("activity_logs").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Activities</h1>
        <button onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4" /> {editingId ? "Cancel" : "Log Activity"}
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Activity" : "Log Activity"}</h2>
          <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.child_id}
            onChange={(e) => setForm({ ...form, child_id: e.target.value })}>
            <option value="">Select child</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input placeholder="Details" className="w-full p-2 rounded-lg border dark:bg-zinc-800"
            value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
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
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const config = activityConfig[a.type] || { icon: <Clock className="h-5 w-5" />, color: "text-zinc-500 bg-zinc-50" };
            return (
              <div key={a.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-2 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${config.color}`}>{config.icon}</div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                      </h2>
                      <p className="text-sm text-zinc-500">{a.child?.full_name ?? "Unknown child"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition"
                      title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(a.id, a.child?.full_name ?? "unknown")}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
                      title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{a.detail}</p>
                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />{new Date(a.logged_at).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
