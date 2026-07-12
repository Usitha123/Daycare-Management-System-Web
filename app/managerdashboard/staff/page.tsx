"use client";

import { useEffect, useState } from "react";
import { Users, User, Clock, BadgeCheck, Search, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type StaffProfile = {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
};

type StaffRecord = {
  id: string;
  profile_id: string;
  role: string;
  shift_start: string;
  shift_end: string;
  status: "on_duty" | "off" | "break";
  profile?: StaffProfile | null;
};

const STAFF_ROLES = ["teacher", "caregiver", "manager", "admin"] as const;
const STAFF_STATUSES = ["on_duty", "off", "break"] as const;

const emptyForm = {
  profile_id: "",
  role: "teacher" as string,
  shift_start: "08:00",
  shift_end: "16:00",
  status: "on_duty" as string,
};

export default function StaffPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchStaff = async () => {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("staff")
      .select(`*, profile:profiles!staff_profile_id_fkey(id, full_name, role, phone)`)
      .order("created_at", { ascending: false });

    if (fetchError) { setError(fetchError.message); return; }
    setStaff((data ?? []).map((row: any) => ({
      ...row,
      profile: Array.isArray(row.profile) ? row.profile[0] ?? null : row.profile,
    })));
  };

  const fetchProfiles = async () => {
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("id, full_name, role, phone")
      .in("role", ["teacher", "caregiver", "manager", "admin"])
      .order("full_name");
    if (!fetchError) setProfiles(data ?? []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStaff(), fetchProfiles()]);
      setLoading(false);
    };
    load();
  }, []);

  // Get existing staff profile_ids to exclude from dropdown
  const existingProfileIds = new Set(staff.map((s) => s.profile_id));

  const filtered = staff.filter((s) =>
    s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const onDutyCount = filtered.filter((s) => s.status === "on_duty").length;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s: StaffRecord) => {
    setEditingId(s.id);
    setForm({
      profile_id: s.profile_id,
      role: s.role,
      shift_start: s.shift_start,
      shift_end: s.shift_end,
      status: s.status,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.profile_id) return;
    setSaving(true); setError("");

    const payload = {
      profile_id: form.profile_id,
      role: form.role,
      shift_start: form.shift_start,
      shift_end: form.shift_end,
      status: form.status,
    };

    const { error: saveError } = editingId
      ? await supabase.from("staff").update(payload).eq("id", editingId)
      : await supabase.from("staff").insert(payload);

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }

    resetForm();
    await fetchStaff();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from staff? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("staff").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchStaff();
  };

  const formatRole = (role: string) => role.charAt(0).toUpperCase() + role.slice(1);
  const formatShift = (start: string, end: string) => {
    const f = (t: string) => {
      const [h, m] = t.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const display = hour > 12 ? hour - 12 : hour;
      return `${display}:${m} ${ampm}`;
    };
    return `${f(start)} - ${f(end)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Staff Management</h1>
        <div className="flex items-center gap-2">
          <span className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 text-sm font-semibold px-4 py-2 rounded-xl">
            <BadgeCheck className="h-4 w-4 inline mr-1" />{onDutyCount} On Duty
          </span>
          <button onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
            <PlusCircle className="h-4 w-4" /> {editingId ? "Cancel" : "Add Staff"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search staff by name or role..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-teal-500/20" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Staff" : "Add Staff Member"}</h2>

          {!editingId && (
            <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.profile_id}
              onChange={(e) => {
                const profile = profiles.find((p) => p.id === e.target.value);
                setForm({ ...form, profile_id: e.target.value, role: profile?.role || form.role });
              }}>
              <option value="">Select profile</option>
              {profiles
                .filter((p) => !existingProfileIds.has(p.id) || editingId)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name} ({formatRole(p.role)})</option>
                ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 rounded-lg border dark:bg-zinc-800" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={!!editingId}>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{formatRole(r)}</option>)}
            </select>
            <select className="p-2 rounded-lg border dark:bg-zinc-800" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STAFF_STATUSES.map((s) => (
                <option key={s} value={s}>{s === "on_duty" ? "On Duty" : s === "off" ? "Off" : "Break"}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Shift Start</label>
              <input type="time" className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                value={form.shift_start} onChange={(e) => setForm({ ...form, shift_start: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Shift End</label>
              <input type="time" className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                value={form.shift_end} onChange={(e) => setForm({ ...form, shift_end: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Staff" : "Add Staff"}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading staff...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 col-span-full text-center py-8">
              {search ? "No staff match your search." : "No staff records yet. Add your first staff member!"}
            </p>
          ) : filtered.map((s) => (
            <div key={s.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${s.status === "on_duty" ? "bg-teal-50 dark:bg-teal-950/30" : s.status === "break" ? "bg-amber-50 dark:bg-amber-950/30" : "bg-zinc-50 dark:bg-zinc-800"}`}>
                    <User className={`h-5 w-5 ${s.status === "on_duty" ? "text-teal-500" : s.status === "break" ? "text-amber-500" : "text-zinc-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">{s.profile?.full_name ?? "Unknown"}</h3>
                    <p className="text-xs text-zinc-500">{formatRole(s.role)}</p>
                    {s.profile?.phone && <p className="text-[10px] text-zinc-400">{s.profile.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-teal-500 transition"
                    title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(s.id, s.profile?.full_name ?? "this staff")}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
                    title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />{formatShift(s.shift_start, s.shift_end)}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  s.status === "on_duty" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                  s.status === "break" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
                  "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {s.status === "on_duty" ? "On Duty" : s.status === "break" ? "On Break" : "Off"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
