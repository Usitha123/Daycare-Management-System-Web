"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Building2, Users, User, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Teacher = {
    id: string;
    full_name: string;
};

type ClassRoom = {
    id: string;
    name: string;
    min_age_months: number;
    max_age_months: number;
    teacher_id: string | null;
    capacity: number;
    created_at: string;
    profiles: { full_name: string } | null;
};

const emptyForm = {
    name: "",
    min_age_months: "",
    max_age_months: "",
    teacher_id: "",
    capacity: "15",
};

function formatAgeRange(minMonths: number, maxMonths: number) {
    const format = (months: number) => {
        if (months < 12) return `${months} mo`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem ? `${years}y ${rem}mo` : `${years}y`;
    };
    return `${format(minMonths)} – ${format(maxMonths)}`;
}

export default function ClassesPage() {
    const supabase = createClient();

    const [classes, setClasses] = useState<ClassRoom[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const fetchTeachers = async () => {
        const { data, error: fetchError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "teacher")
            .order("full_name");

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setTeachers(data ?? []);
    };

    const fetchClasses = async () => {
        setError("");
        const { data, error: fetchError } = await supabase
            .from("classes")
            .select(`
                id,
                name,
                min_age_months,
                max_age_months,
                teacher_id,
                capacity,
                created_at,
                profiles ( full_name )
            `)
            .order("name");

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setClasses(
            (data ?? []).map((row: any) => ({
                ...row,
                profiles: Array.isArray(row.profiles)
                    ? row.profiles[0] ?? null
                    : row.profiles ?? null,
            }))
        );
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchClasses(), fetchTeachers()]);
            setLoading(false);
        };
        load();
    }, []);

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

    const openEdit = (cls: ClassRoom) => {
        setEditingId(cls.id);
        setForm({
            name: cls.name,
            min_age_months: String(cls.min_age_months),
            max_age_months: String(cls.max_age_months),
            teacher_id: cls.teacher_id ?? "",
            capacity: String(cls.capacity),
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.min_age_months || !form.max_age_months) return;

        setSaving(true);
        setError("");

        const payload = {
            name: form.name,
            min_age_months: Number(form.min_age_months),
            max_age_months: Number(form.max_age_months),
            teacher_id: form.teacher_id || null,
            capacity: Number(form.capacity) || 15,
        };

        const { error: saveError } = editingId
            ? await supabase.from("classes").update(payload).eq("id", editingId)
            : await supabase.from("classes").insert(payload);

        setSaving(false);

        if (saveError) {
            setError(saveError.message);
            return;
        }

        resetForm();
        await fetchClasses();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete class "${name}"?`)) return;

        setError("");
        const { error: deleteError } = await supabase.from("classes").delete().eq("id", id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        if (editingId === id) resetForm();
        await fetchClasses();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Classes</h1>
                <button
                    onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add Class
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h2 className="font-semibold text-zinc-900 dark:text-white">
                        {editingId ? "Edit Class" : "New Class"}
                    </h2>

                    <input
                        placeholder="Class name"
                        className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            min="0"
                            placeholder="Min age (months)"
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.min_age_months}
                            onChange={(e) => setForm({ ...form, min_age_months: e.target.value })}
                        />
                        <input
                            type="number"
                            min="0"
                            placeholder="Max age (months)"
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.max_age_months}
                            onChange={(e) => setForm({ ...form, max_age_months: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.teacher_id}
                            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                        >
                            <option value="">No teacher assigned</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.full_name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="1"
                            placeholder="Capacity"
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.capacity}
                            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : editingId ? "Update Class" : "Save Class"}
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
                <p className="text-sm text-zinc-500">Loading classes...</p>
            ) : classes.length === 0 ? (
                <p className="text-sm text-zinc-500">No classes yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                                        <Building2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">{cls.name}</h2>
                                        <p className="text-sm text-zinc-500">
                                            {formatAgeRange(cls.min_age_months, cls.max_age_months)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEdit(cls)}
                                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cls.id, cls.name)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-sm text-zinc-500 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {cls.profiles?.full_name ?? "No teacher assigned"}
                            </div>

                            <div className="text-sm text-zinc-500 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Capacity: {cls.capacity}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
