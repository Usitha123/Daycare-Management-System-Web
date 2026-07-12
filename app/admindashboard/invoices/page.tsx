"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Calendar, FileText, User, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatAmount } from "@/utils/currency";

type Invoice = {
  id: string;
  invoice_no: string;
  child_id: string;
  parent_id: string;
  amount: number;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue";
  child?: { full_name: string } | null;
  parent?: { full_name: string } | null;
};

const emptyForm = {
  child_id: "",
  parent_id: "",
  amount: "",
  due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
};

export default function InvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [children, setChildren] = useState<{ id: string; full_name: string }[]>([]);
  const [parents, setParents] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchInvoices = async () => {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("invoices")
      .select(`*, child:children(full_name), parent:profiles!invoices_parent_id_fkey(full_name)`)
      .order("due_date", { ascending: false });
    if (fetchError) { setError(fetchError.message); return; }
    setInvoices((data ?? []).map((row: any) => ({
      ...row,
      amount: Number(row.amount),
      child: Array.isArray(row.child) ? row.child[0] ?? null : row.child,
      parent: Array.isArray(row.parent) ? row.parent[0] ?? null : row.parent,
    })));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchInvoices(),
        supabase.from("children").select("id, full_name").order("full_name").then((r) => { if (!r.error) setChildren(r.data ?? []); }),
        supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name").then((r) => { if (!r.error) setParents(r.data ?? []); }),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = invoices.filter((inv) =>
    inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
    inv.parent?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.child?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

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

  const openEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      child_id: inv.child_id,
      parent_id: inv.parent_id,
      amount: String(inv.amount),
      due_date: inv.due_date,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.parent_id || !form.child_id) return;
    setSaving(true); setError("");

    if (editingId) {
      const { error: updateError } = await supabase.from("invoices").update({
        child_id: form.child_id, parent_id: form.parent_id,
        amount: Number(form.amount), due_date: form.due_date,
      }).eq("id", editingId);
      setSaving(false);
      if (updateError) { setError(updateError.message); return; }
    } else {
      const nextNo = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;
      const { error: insertError } = await supabase.from("invoices").insert({
        invoice_no: nextNo, child_id: form.child_id, parent_id: form.parent_id,
        amount: Number(form.amount), due_date: form.due_date, status: "draft",
      });
      setSaving(false);
      if (insertError) { setError(insertError.message); return; }
    }

    resetForm();
    await fetchInvoices();
  };

  const handleDelete = async (id: string, invoiceNo: string) => {
    if (!confirm(`Delete invoice "${invoiceNo}"? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("invoices").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchInvoices();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("invoices").update({ status }).eq("id", id);
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: status as any } : inv));
  };

  const statusColor = (s: string) => {
    if (s === "paid") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50";
    if (s === "sent") return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50";
    if (s === "overdue") return "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50";
    return "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Invoices</h1>
        <button onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4" /> {editingId ? "Cancel" : "Create Invoice"}
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Invoice" : "Create Invoice"}</h2>
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
            <input type="number" step="0.01" min="0" placeholder="Amount" className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input type="date" className="p-2 rounded-lg border dark:bg-zinc-800" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          {editingId && (
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Status</label>
              <select className="w-full p-2 rounded-lg border dark:bg-zinc-800"
                value={invoices.find((i) => i.id === editingId)?.status || "draft"}
                onChange={(e) => updateStatus(editingId, e.target.value)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Invoice" : "Save Invoice"}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading invoices...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">{search ? "No invoices match your search." : "No invoices yet. Create your first invoice!"}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div key={inv.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{inv.invoice_no}</p>
                  <p className="text-sm text-zinc-500">
                    <User className="h-4 w-4 inline mr-1" />
                    {inv.parent?.full_name ?? "N/A"} · {inv.child?.full_name ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white">{formatAmount(inv.amount)}</p>
                <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end mt-1">
                  <Calendar className="h-3 w-3" />Due {inv.due_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(inv.status)}`}>
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
                <button onClick={() => openEdit(inv)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition"
                  title="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(inv.id, inv.invoice_no)}
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
