"use client";

import { useEffect, useState } from "react";
import { PlusCircle, User, Calendar, Building2, DollarSign, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatAmount } from "@/utils/currency";

type Parent = {
    id: string;
    full_name: string;
};

type ClassOption = {
    id: string;
    name: string;
};

type Child = {
    id: string;
    full_name: string;
    date_of_birth: string;
    parent_id: string | null;
    class_id: string | null;
    monthly_fee: number;
    enrolled_at: string;
    created_at: string;
    parent: { full_name: string } | null;
    class: { name: string } | null;
};

const emptyForm = {
    full_name: "",
    date_of_birth: "",
    parent_id: "",
    class_id: "",
    monthly_fee: "0",
    enrolled_at: new Date().toISOString().slice(0, 10),
};

function calculateAge(dateOfBirth: string) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) {
        years--;
        months += 12;
    }

    if (years < 1) return `${Math.max(months, 0)} mo`;
    return months > 0 ? `${years}y ${months}mo` : `${years} years old`;
}

export default function ChildrenPage() {
    const supabase = createClient();

    const [children, setChildren] = useState<Child[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const fetchParents = async () => {
        const { data, error: fetchError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "parent")
            .order("full_name");

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setParents(data ?? []);
    };

    const fetchClasses = async () => {
        const { data, error: fetchError } = await supabase
            .from("classes")
            .select("id, name")
            .order("name");

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setClasses(data ?? []);
    };

    const filtered = children.filter((child) =>
        child.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (child.parent?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (child.class?.name ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const fetchChildren = async () => {
        setError("");
        const { data, error: fetchError } = await supabase
            .from("children")
            .select(`
                id,
                full_name,
                date_of_birth,
                parent_id,
                class_id,
                monthly_fee,
                enrolled_at,
                created_at,
                parent:profiles!children_parent_id_fkey ( full_name ),
                class:classes!children_class_id_fkey ( name )
            `)
            .order("full_name");

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setChildren(
            (data ?? []).map((row) => {
                const parent = Array.isArray(row.parent) ? row.parent[0] ?? null : row.parent;
                const classInfo = Array.isArray(row.class) ? row.class[0] ?? null : row.class;

                return {
                    id: row.id,
                    full_name: row.full_name,
                    date_of_birth: row.date_of_birth,
                    parent_id: row.parent_id,
                    class_id: row.class_id,
                    monthly_fee: Number(row.monthly_fee),
                    enrolled_at: row.enrolled_at,
                    created_at: row.created_at,
                    parent,
                    class: classInfo,
                };
            })
        );
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchChildren(), fetchParents(), fetchClasses()]);
            setLoading(false);
        };
        load();
    }, []);

    const resetForm = () => {
        setForm({
            ...emptyForm,
            enrolled_at: new Date().toISOString().slice(0, 10),
        });
        setEditingId(null);
        setShowForm(false);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            enrolled_at: new Date().toISOString().slice(0, 10),
        });
        setShowForm(true);
    };

    const openEdit = (child: Child) => {
        setEditingId(child.id);
        setForm({
            full_name: child.full_name,
            date_of_birth: child.date_of_birth,
            parent_id: child.parent_id ?? "",
            class_id: child.class_id ?? "",
            monthly_fee: String(child.monthly_fee),
            enrolled_at: child.enrolled_at,
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.full_name || !form.date_of_birth) return;

        setSaving(true);
        setError("");

        const payload = {
            full_name: form.full_name,
            date_of_birth: form.date_of_birth,
            parent_id: form.parent_id || null,
            class_id: form.class_id || null,
            monthly_fee: Number(form.monthly_fee) || 0,
            enrolled_at: form.enrolled_at || new Date().toISOString().slice(0, 10),
        };

        const { error: saveError } = editingId
            ? await supabase.from("children").update(payload).eq("id", editingId)
            : await supabase.from("children").insert(payload);

        setSaving(false);

        if (saveError) {
            setError(saveError.message);
            return;
        }

        resetForm();
        await fetchChildren();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete child "${name}"?`)) return;

        setError("");
        const { error: deleteError } = await supabase.from("children").delete().eq("id", id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        if (editingId === id) resetForm();
        await fetchChildren();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Children</h1>
                <button
                    onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add Child
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Search Bar */}
            {!showForm && (
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Search children by name, parent, or class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h2 className="font-semibold text-zinc-900 dark:text-white">
                        {editingId ? "Edit Child" : "New Child"}
                    </h2>

                    <input
                        placeholder="Full name"
                        className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.date_of_birth}
                            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                        />
                        <input
                            type="date"
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.enrolled_at}
                            onChange={(e) => setForm({ ...form, enrolled_at: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.parent_id}
                            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                        >
                            <option value="">No parent assigned</option>
                            {parents.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.full_name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.class_id}
                            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                        >
                            <option value="">No class assigned</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Monthly fee"
                        className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                        value={form.monthly_fee}
                        onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })}
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : editingId ? "Update Child" : "Save Child"}
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
                <p className="text-sm text-zinc-500">Loading children...</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-zinc-500">{search ? "No children match your search." : "No children enrolled yet."}</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((child) => (
                        <div
                            key={child.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                                        <User className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">{child.full_name}</h2>
                                        <p className="text-sm text-zinc-500">
                                            {calculateAge(child.date_of_birth)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEdit(child)}
                                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(child.id, child.full_name)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-sm text-zinc-500 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {child.class?.name ?? "No class assigned"}
                            </div>

                            <div className="text-sm text-zinc-500">
                                Parent: {child.parent?.full_name ?? "Not assigned"}
                            </div>

                            <div className="text-sm text-zinc-500 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                {formatAmount(child.monthly_fee)} / month
                            </div>

                            <div className="text-sm text-zinc-500 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Enrolled {child.enrolled_at}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
