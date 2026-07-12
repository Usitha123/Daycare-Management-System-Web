"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  User,
  Shield,
  Users,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type UserProfile = {
  id: string;
  full_name: string;
  role: "admin" | "manager" | "teacher" | "caregiver" | "parent";
  phone: string | null;
  created_at: string;
  updated_at: string;
};

const USER_ROLES = ["teacher", "caregiver", "parent", "manager", "admin"] as const;

const roleConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  admin: { icon: <Shield className="h-5 w-5" />, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30", label: "Admin" },
  manager: { icon: <Briefcase className="h-5 w-5" />, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30", label: "Manager" },
  teacher: { icon: <GraduationCap className="h-5 w-5" />, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", label: "Teacher" },
  caregiver: { icon: <HeartHandshake className="h-5 w-5" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30", label: "Caregiver" },
  parent: { icon: <Users className="h-5 w-5" />, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30", label: "Parent" },
};

const emptyForm = {
  email: "",
  password: "",
  full_name: "",
  role: "teacher" as string,
  phone: "",
};

export default function AdminUsersPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchUsers = async () => {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (fetchError) { setError(fetchError.message); return; }
    setUsers(data ?? []);
  };

  useEffect(() => {
    const load = async () => { setLoading(true); await fetchUsers(); setLoading(false); };
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleCounts = USER_ROLES.reduce(
    (acc, role) => {
      acc[role] = users.filter((u) => u.role === role).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = (role?: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, role: role || "teacher" });
    setShowForm(true);
  };

  const openEdit = (user: UserProfile) => {
    setEditingId(user.id);
    setForm({
      email: "",
      password: "",
      full_name: user.full_name,
      role: user.role,
      phone: user.phone ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name) return;
    setSaving(true);
    setError("");

    if (editingId) {
      // ── Update existing user ──
      const payload: Record<string, any> = {
        full_name: form.full_name,
        role: form.role,
        phone: form.phone || null,
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", editingId);

      setSaving(false);
      if (updateError) { setError(updateError.message); return; }

      // If role changed to/from a staff role, update staff record
      if (["teacher", "caregiver", "manager", "admin"].includes(form.role)) {
        // Check if staff record exists
        const { data: existingStaff } = await supabase
          .from("staff")
          .select("id")
          .eq("profile_id", editingId)
          .maybeSingle();

        if (!existingStaff) {
          await supabase.from("staff").insert({
            profile_id: editingId,
            role: form.role,
            shift_start: "08:00",
            shift_end: "16:00",
            status: "off",
          });
        } else {
          await supabase.from("staff").update({ role: form.role }).eq("profile_id", editingId);
        }
      }
    } else {
      // ── Create new user via Auth API ──
      if (!form.email || !form.password) {
        setSaving(false);
        setError("Email and password are required for new users.");
        return;
      }

      if (form.password.length < 6) {
        setSaving(false);
        setError("Password must be at least 6 characters.");
        return;
      }

      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            full_name: form.full_name,
            role: form.role,
            phone: form.phone || undefined,
          }),
        });

        const result = await res.json();
        setSaving(false);

        if (!res.ok) {
          setError(result.error || "Failed to create user");
          return;
        }
      } catch (err: any) {
        setSaving(false);
        setError(err.message || "Network error. Please try again.");
        return;
      }
    }

    resetForm();
    await fetchUsers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This will also remove their staff record if any.`)) return;

    setError("");

    // First delete staff record if exists
    await supabase.from("staff").delete().eq("profile_id", id);

    // Then delete the profile
    const { error: deleteError } = await supabase.from("profiles").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingId === id) resetForm();
    await fetchUsers();
  };

  const formatRole = (role: string) => role.charAt(0).toUpperCase() + role.slice(1);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Users Management</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openCreate("teacher")}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition"
          >
            <GraduationCap className="h-4 w-4" />
            Add Teacher
          </button>
          <button
            onClick={() => openCreate("manager")}
            className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium transition"
          >
            <Briefcase className="h-4 w-4" />
            Add Manager
          </button>
          <button
            onClick={() => openCreate("caregiver")}
            className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm font-medium transition"
          >
            <HeartHandshake className="h-4 w-4" />
            Add Caregiver
          </button>
          <button
            onClick={() => openCreate("parent")}
            className="flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 text-sm font-medium transition"
          >
            <Users className="h-4 w-4" />
            Add Parent
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <RoleStat
          icon={<Users className="h-5 w-5" />}
          label="All Users"
          count={users.length}
          active={roleFilter === "all"}
          onClick={() => setRoleFilter("all")}
          color="indigo"
        />
        {USER_ROLES.map((role) => {
          const config = roleConfig[role];
          return (
            <RoleStat
              key={role}
              icon={config.icon}
              label={config.label}
              count={roleCounts[role] || 0}
              active={roleFilter === role}
              onClick={() => setRoleFilter(role)}
              color={role === "admin" ? "purple" : role === "manager" ? "teal" : role === "teacher" ? "blue" : role === "caregiver" ? "amber" : "pink"}
            />
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          placeholder="Search users by name, role, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            {editingId ? "Edit User" : "New User"}
          </h2>

          {!editingId && (
            <div className="text-xs text-zinc-500 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-lg p-3">
              Creating a new user will send them an email confirmation. They can log in immediately with the credentials you set.
            </div>
          )}

          <input
            placeholder="Full name"
            className="w-full p-2 rounded-lg border dark:bg-zinc-800"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />

          {!editingId && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="p-2 rounded-lg border dark:bg-zinc-800"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                className="p-2 rounded-lg border dark:bg-zinc-800"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <select
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {formatRole(r)}
                </option>
              ))}
            </select>
            <input
              placeholder="Phone number"
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update User" : "Save User"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading users...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {search || roleFilter !== "all"
            ? "No users match your filters."
            : "No users found."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => {
            const config = roleConfig[user.role] || roleConfig.parent;
            return (
              <div
                key={user.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">
                      {user.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(user.created_at)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.full_name)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Role Stat Component ── */
function RoleStat({
  icon,
  label,
  count,
  active,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: active ? "bg-indigo-500 text-white border-indigo-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300",
    purple: active ? "bg-purple-500 text-white border-purple-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-300",
    teal: active ? "bg-teal-500 text-white border-teal-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-300",
    blue: active ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-300",
    amber: active ? "bg-amber-500 text-white border-amber-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-300",
    pink: active ? "bg-pink-500 text-white border-pink-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-pink-300",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${colorMap[color] || colorMap.indigo}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-left">
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-lg font-bold">{count}</p>
      </div>
    </button>
  );
}
