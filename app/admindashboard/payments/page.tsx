"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Calendar, CreditCard, CheckCircle2, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatAmount } from "@/utils/currency";

type Payment = {
  id: string;
  invoice_id: string | null;
  child_id: string;
  parent_id: string;
  amount: number;
  method: string;
  payment_date: string;
  status: "completed" | "pending" | "failed";
  invoice?: { invoice_no: string } | null;
  child?: { full_name: string } | null;
  parent?: { full_name: string } | null;
};

const PAYMENT_METHODS = ["bank_transfer", "credit_card", "cash", "cheque", "online"] as const;
const PAYMENT_STATUSES = ["completed", "pending", "failed"] as const;

const emptyForm = {
  invoice_id: "",
  child_id: "",
  parent_id: "",
  amount: "",
  method: "bank_transfer" as string,
  payment_date: new Date().toISOString().slice(0, 10),
  status: "pending" as string,
};

export default function PaymentsPage() {
  const supabase = createClient();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [children, setChildren] = useState<{ id: string; full_name: string }[]>([]);
  const [parents, setParents] = useState<{ id: string; full_name: string }[]>([]);
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
      .from("payments")
      .select(`*, invoice:invoices(invoice_no), child:children(full_name), parent:profiles!payments_parent_id_fkey(full_name)`)
      .order("payment_date", { ascending: false });
    if (fetchError) { setError(fetchError.message); return; }
    setPayments((data ?? []).map((row: any) => ({
      ...row, amount: Number(row.amount),
      invoice: Array.isArray(row.invoice) ? row.invoice[0] ?? null : row.invoice,
      child: Array.isArray(row.child) ? row.child[0] ?? null : row.child,
      parent: Array.isArray(row.parent) ? row.parent[0] ?? null : row.parent,
    })));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchPayments(),
        supabase.from("children").select("id, full_name").order("full_name").then((r) => { if (!r.error) setChildren(r.data ?? []); }),
        supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name").then((r) => { if (!r.error) setParents(r.data ?? []); }),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = payments.filter((p) =>
    p.parent?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.child?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice?.invoice_no?.toLowerCase().includes(search.toLowerCase())
  );

  const totalReceived = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  const resetForm = () => {
    setForm({ ...emptyForm, payment_date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, payment_date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (p: Payment) => {
    setEditingId(p.id);
    setForm({
      invoice_id: p.invoice_id ?? "",
      child_id: p.child_id,
      parent_id: p.parent_id,
      amount: String(p.amount),
      method: p.method,
      payment_date: p.payment_date,
      status: p.status,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.parent_id || !form.child_id) return;
    setSaving(true); setError("");

    const payload = {
      invoice_id: form.invoice_id || null,
      child_id: form.child_id,
      parent_id: form.parent_id,
      amount: Number(form.amount),
      method: form.method,
      payment_date: form.payment_date,
      status: form.status,
    };

    const { error: saveError } = editingId
      ? await supabase.from("payments").update(payload).eq("id", editingId)
      : await supabase.from("payments").insert(payload);

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }

    resetForm();
    await fetchPayments();
  };

  const handleDelete = async (id: string, parentName: string) => {
    if (!confirm(`Delete payment from "${parentName}"? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("payments").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchPayments();
  };

  const formatMethod = (m: string) => m.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const statusColor = (status: string) => {
    if (status === "completed") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
    if (status === "pending") return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
    return "text-red-600 bg-red-50 dark:bg-red-950/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Payments</h1>
        <button onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4" /> {editingId ? "Cancel" : "Record Payment"}
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Total completed</p>
          <p className="text-2xl font-bold text-emerald-600">{formatAmount(totalReceived)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Total payments</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{payments.length}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Payment" : "Record Payment"}</h2>
          <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
            <option value="">Select parent</option>
            {parents.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          <select className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.child_id}
            onChange={(e) => setForm({ ...form, child_id: e.target.value })}>
            <option value="">Select child</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.01" placeholder="Amount" className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input type="date" className="p-2 rounded-lg border dark:bg-zinc-800" value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 rounded-lg border dark:bg-zinc-800" value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{formatMethod(m)}</option>)}
            </select>
            <select className="p-2 rounded-lg border dark:bg-zinc-800" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Payment" : "Save Payment"}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading payments...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">{search ? "No payments match your search." : "No payments recorded yet."}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${p.status === "completed" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-amber-50 dark:bg-amber-950/30"}`}>
                  <CreditCard className={`h-5 w-5 ${p.status === "completed" ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{p.parent?.full_name ?? "Unknown"}</p>
                  <p className="text-sm text-zinc-500">{p.child?.full_name ?? "No child"} · {formatMethod(p.method)}</p>
                  {p.invoice?.invoice_no && <p className="text-xs text-zinc-400">{p.invoice.invoice_no}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white">{formatAmount(p.amount)}</p>
                <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end mt-1">
                  <Calendar className="h-3 w-3" />{p.payment_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusColor(p.status)}`}>
                  {p.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                <button onClick={() => openEdit(p)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition"
                  title="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id, p.parent?.full_name ?? "unknown")}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
                  title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
