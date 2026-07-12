"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  CreditCard,
  Baby,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatAmount } from "@/utils/currency";

type ActivityPayment = {
  id: string;
  child_id: string;
  activity_name: string;
  activity_date: string;
  amount: number;
  payment_method: string | null;
  status: "completed" | "pending" | "failed";
  notes: string | null;
  created_by: string | null;
  created_at: string;
  child: { full_name: string } | null;
};

const PAYMENT_METHODS = ["bank_transfer", "credit_card", "cash", "cheque", "online"] as const;
const PAYMENT_STATUSES = ["completed", "pending", "failed"] as const;

const emptyForm = {
  child_id: "",
  activity_name: "",
  activity_date: new Date().toISOString().slice(0, 10),
  amount: "",
  payment_method: "",
  status: "pending" as string,
  notes: "",
};

export default function AdditionalPaymentsPage() {
  const supabase = createClient();

  const [payments, setPayments] = useState<ActivityPayment[]>([]);
  const [children, setChildren] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPayments = async () => {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("additional_activity_payments")
      .select("*, child:children!additional_activity_payments_child_id_fkey(full_name)")
      .order("activity_date", { ascending: false });

    if (fetchError) { setError(fetchError.message); return; }
    setPayments((data ?? []).map((row: any) => ({
      ...row,
      amount: Number(row.amount),
      child: Array.isArray(row.child) ? row.child[0] ?? null : row.child,
    })));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchPayments(),
        supabase.from("children").select("id, full_name").order("full_name").then((r) => {
          if (!r.error) setChildren(r.data ?? []);
        }),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = payments.filter((p) =>
    p.activity_name.toLowerCase().includes(search.toLowerCase()) ||
    p.child?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (p.notes ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const resetForm = () => {
    setForm({ ...emptyForm, activity_date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, activity_date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (p: ActivityPayment) => {
    setEditingId(p.id);
    setForm({
      child_id: p.child_id,
      activity_name: p.activity_name,
      activity_date: p.activity_date,
      amount: String(p.amount),
      payment_method: p.payment_method ?? "",
      status: p.status,
      notes: p.notes ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.activity_name || !form.amount || !form.child_id) return;
    setSaving(true);
    setError("");

    const payload: Record<string, any> = {
      child_id: form.child_id,
      activity_name: form.activity_name,
      activity_date: form.activity_date,
      amount: Number(form.amount),
      payment_method: form.payment_method || null,
      status: form.status,
      notes: form.notes || null,
    };

    const { error: saveError } = editingId
      ? await supabase.from("additional_activity_payments").update(payload).eq("id", editingId)
      : await supabase.from("additional_activity_payments").insert(payload);

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }

    resetForm();
    await fetchPayments();
  };

  const handleDelete = async (id: string, activityName: string) => {
    if (!confirm(`Delete payment record for "${activityName}"? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("additional_activity_payments").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchPayments();
  };

  const formatMethod = (m: string | null) => {
    if (!m) return "—";
    return m.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const statusColor = (status: string) => {
    if (status === "completed") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50";
    if (status === "pending") return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50";
    return "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Additional Activity Payments</h1>
        <button
          onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" />
          {editingId ? "Cancel" : "Add Payment"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Total Records</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{payments.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Collected</p>
          <p className="text-2xl font-bold text-emerald-600">{formatAmount(totalCollected)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{formatAmount(totalPending)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Total Value</p>
          <p className="text-2xl font-bold text-indigo-600">{formatAmount(totalCollected + totalPending)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          placeholder="Search by activity, child, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            {editingId ? "Edit Activity Payment" : "New Activity Payment"}
          </h2>

          <select
            className="w-full p-2 rounded-lg border dark:bg-zinc-800"
            value={form.child_id}
            onChange={(e) => setForm({ ...form, child_id: e.target.value })}
          >
            <option value="">Select child</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Activity name (e.g. Swimming Gala)"
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.activity_name}
              onChange={(e) => setForm({ ...form, activity_name: e.target.value })}
            />
            <input
              type="date"
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.activity_date}
              onChange={(e) => setForm({ ...form, activity_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            >
              <option value="">No payment method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{formatMethod(m)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Notes (optional)"
            className="w-full p-2 rounded-lg border dark:bg-zinc-800 min-h-[60px]"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Payment" : "Save Payment"}
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

      {/* List */}
      {loading ? (
        <p className="text-sm text-zinc-500">Loading activity payments...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {search ? "No payments match your search." : "No activity payments recorded yet. Add your first one!"}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  p.status === "completed"
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : p.status === "pending"
                    ? "bg-amber-50 dark:bg-amber-950/30"
                    : "bg-red-50 dark:bg-red-950/30"
                }`}>
                  <CreditCard className={`h-5 w-5 ${
                    p.status === "completed" ? "text-emerald-500" :
                    p.status === "pending" ? "text-amber-500" : "text-red-500"
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{p.activity_name}</h3>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <Baby className="h-3.5 w-3.5" />
                    {p.child?.full_name ?? "Unknown child"}
                  </p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {p.activity_date}
                    {p.payment_method && <span> · {formatMethod(p.payment_method)}</span>}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-zinc-900 dark:text-white">{formatAmount(p.amount)}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor(p.status)}`}>
                  {p.status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : p.status === "pending" ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {p.notes && (
                  <div className="text-[10px] text-zinc-400 max-w-[120px] truncate hidden lg:block" title={p.notes}>
                    {p.notes}
                  </div>
                )}
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.activity_name)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
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
