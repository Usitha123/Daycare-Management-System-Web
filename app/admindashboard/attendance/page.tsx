"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    CheckCircle2,
    Clock,
    User,
    XCircle,
    PlusCircle,
    Pencil,
    Trash2,
    FileText,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;

type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

type ChildOption = {
    id: string;
    full_name: string;
};

type AttendanceRecord = {
    id: string;
    child_id: string | null;
    date: string;
    status: AttendanceStatus;
    checked_in_by: string | null;
    notes: string | null;
    created_at: string;
    child: {
        full_name: string;
        class: { name: string } | null;
    } | null;
    checker: { full_name: string } | null;
};

const emptyForm = {
    child_id: "",
    date: new Date().toISOString().slice(0, 10),
    status: "present" as AttendanceStatus,
    notes: "",
};

function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function normalizeRelation<T>(value: T | T[] | null): T | null {
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
}

export default function AttendancePage() {
    const supabase = createClient();

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [children, setChildren] = useState<ChildOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const fetchChildren = async () => {
        const { data, error: fetchError } = await supabase
            .from("children")
            .select("id, full_name")
            .order("full_name");

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setChildren(data ?? []);
    };

    const fetchAttendance = async (date: string) => {
        setError("");
        const { data, error: fetchError } = await supabase
            .from("attendance")
            .select(`
                id,
                child_id,
                date,
                status,
                checked_in_by,
                notes,
                created_at,
                child:children!attendance_child_id_fkey (
                    full_name,
                    class:classes!children_class_id_fkey ( name )
                ),
                checker:profiles!attendance_checked_in_by_fkey ( full_name )
            `)
            .eq("date", date)
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
            return;
        }

        setRecords(
            (data ?? []).map((row) => {
                const child = normalizeRelation(row.child);
                const classInfo = child ? normalizeRelation(child.class) : null;
                const checker = normalizeRelation(row.checker);

                return {
                    id: row.id,
                    child_id: row.child_id,
                    date: row.date,
                    status: row.status as AttendanceStatus,
                    checked_in_by: row.checked_in_by,
                    notes: row.notes,
                    created_at: row.created_at,
                    child: child
                        ? { full_name: child.full_name, class: classInfo }
                        : null,
                    checker,
                };
            })
        );
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchChildren();
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchAttendance(filterDate);
            setLoading(false);
        };
        load();
    }, [filterDate]);

    const resetForm = () => {
        setForm({
            ...emptyForm,
            date: filterDate,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            date: filterDate,
        });
        setShowForm(true);
    };

    const openEdit = (record: AttendanceRecord) => {
        setEditingId(record.id);
        setForm({
            child_id: record.child_id ?? "",
            date: record.date,
            status: record.status,
            notes: record.notes ?? "",
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.child_id || !form.date) return;

        setSaving(true);
        setError("");

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const payload = {
            child_id: form.child_id,
            date: form.date,
            status: form.status,
            notes: form.notes || null,
            checked_in_by: user?.id ?? null,
        };

        const { error: saveError } = editingId
            ? await supabase.from("attendance").update(payload).eq("id", editingId)
            : await supabase.from("attendance").insert(payload);

        setSaving(false);

        if (saveError) {
            setError(
                saveError.message.includes("attendance_child_id_date_key")
                    ? "Attendance for this child on this date already exists."
                    : saveError.message
            );
            return;
        }

        resetForm();
        await fetchAttendance(filterDate);
    };

    const handleDelete = async (id: string, childName: string) => {
        if (!confirm(`Delete attendance record for "${childName}"?`)) return;

        setError("");
        const { error: deleteError } = await supabase.from("attendance").delete().eq("id", id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        if (editingId === id) resetForm();
        await fetchAttendance(filterDate);
    };

    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const lateCount = records.filter((r) => r.status === "late").length;

    const statusColor = (status: AttendanceStatus) => {
        if (status === "present") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
        if (status === "late") return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
        if (status === "excused") return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30";
        return "text-red-600 bg-red-50 dark:bg-red-950/30";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance</h1>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                    />
                    <button
                        onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Mark Attendance
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h2 className="font-semibold text-zinc-900 dark:text-white">
                        {editingId ? "Edit Attendance" : "Mark Attendance"}
                    </h2>

                    <select
                        className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                        value={form.child_id}
                        onChange={(e) => setForm({ ...form, child_id: e.target.value })}
                        disabled={!!editingId}
                    >
                        <option value="">Select child</option>
                        {children.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.full_name}
                            </option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            disabled={!!editingId}
                        />
                        <select
                            className="p-2 rounded-lg border dark:bg-zinc-800"
                            value={form.status}
                            onChange={(e) =>
                                setForm({ ...form, status: e.target.value as AttendanceStatus })
                            }
                        >
                            {ATTENDANCE_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {formatStatus(s)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        placeholder="Notes (optional)"
                        className="w-full p-2 rounded-lg border dark:bg-zinc-800 min-h-[80px]"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : editingId ? "Update Record" : "Save Record"}
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

            <div className="grid grid-cols-3 gap-4">
                <Stat
                    label="Present"
                    value={presentCount}
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                />
                <Stat
                    label="Absent"
                    value={absentCount}
                    icon={<XCircle className="h-5 w-5 text-red-500" />}
                />
                <Stat
                    label="Late"
                    value={lateCount}
                    icon={<Clock className="h-5 w-5 text-amber-500" />}
                />
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading attendance...</p>
            ) : records.length === 0 ? (
                <p className="text-sm text-zinc-500">No attendance records for this date.</p>
            ) : (
                <div className="space-y-3">
                    {records.map((r) => (
                        <div
                            key={r.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                                    <User className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {r.child?.full_name ?? "Unknown child"}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {r.child?.class?.name ?? "No class"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 text-sm text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {r.date}
                                </span>
                                {r.checker?.full_name && (
                                    <span className="text-xs">Marked by {r.checker.full_name}</span>
                                )}
                                {r.notes && (
                                    <span className="flex items-center gap-1 text-xs">
                                        <FileText className="h-3 w-3" />
                                        {r.notes}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(r.status)}`}
                                >
                                    {formatStatus(r.status)}
                                </span>
                                <button
                                    onClick={() => openEdit(r)}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                                    title="Edit"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(r.id, r.child?.full_name ?? "this child")
                                    }
                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
            <div className="mb-2">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
        </div>
    );
}
