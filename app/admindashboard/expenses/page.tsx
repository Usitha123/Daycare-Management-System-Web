"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Calendar, DollarSign, Tag, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatAmount } from "@/utils/currency";

const EXPENSE_CATEGORIES = [
  "supplies", "food", "maintenance", "utilities", "rent", "salaries", "other",
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

type Expense = {
  id: string;
  category: ExpenseCategory;
  description: string | null;
  amount: number;
  expense_date: string;
  created_by: string | null;
  created_at: string;
};

const emptyForm = {
  description: "",
  category: "supplies" as ExpenseCategory,
  amount: "",
  expense_date: new Date().toISOString().slice(0, 10),
};

export default function ExpensesPage() {
  const supabase = createClient();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchExpenses = async () => {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });
    if (fetchError) { setError(fetchError.message); return; }
    setExpenses((data ?? []).map((row) => ({ ...row, amount: Number(row.amount) })));
  };

  useEffect(() => {
    const load = async () => { setLoading(true); await fetchExpenses(); setLoading(false); };
    load();
  }, []);

  const filtered = expenses.filter((e) =>
    (e.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  const resetForm = () => {
    setForm({ ...emptyForm, expense_date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, expense_date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setForm({
      description: exp.description ?? "",
      category: exp.category,
      amount: String(exp.amount),
      expense_date: exp.expense_date,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true); setError("");

    const payload = {
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      expense_date: form.expense_date,
    };

    const { error: saveError } = editingId
      ? await supabase.from("expenses").update(payload).eq("id", editingId)
      : await supabase.from("expenses").insert(payload);

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }

    resetForm();
    await fetchExpenses();
  };

  const handleDelete = async (id: string, description: string) => {
    if (!confirm(`Delete expense "${description}"? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("expenses").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    if (editingId === id) resetForm();
    await fetchExpenses();
  };

  const formatCategory = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);

  const categoryColors: Record<string, string> = {
    supplies: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    food: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    maintenance: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    utilities: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
    rent: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    salaries: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
    other: "text-zinc-600 bg-zinc-50 dark:bg-zinc-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Expenses</h1>
        <button onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4" /> {editingId ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatAmount(total)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <p className="text-sm text-zinc-500">Total expenses (filtered)</p>
          <p className="text-2xl font-bold text-amber-600">{formatAmount(totalFiltered)}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Expense" : "New Expense"}</h2>
          <input placeholder="Description" className="w-full p-2 rounded-lg border dark:bg-zinc-800"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 rounded-lg border dark:bg-zinc-800" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{formatCategory(cat)}</option>
              ))}
            </select>
            <input type="number" step="0.01" min="0" placeholder="Amount" className="p-2 rounded-lg border dark:bg-zinc-800"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <input type="date" className="w-full p-2 rounded-lg border dark:bg-zinc-800" value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Expense" : "Save Expense"}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading expenses...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">{search ? "No expenses match your search." : "No expenses recorded yet."}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <div key={e.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${categoryColors[e.category] || "bg-zinc-50"}`}>
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">{e.description ?? "—"}</h2>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[e.category]}`}>
                    {formatCategory(e.category)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600 flex items-center gap-1 justify-end">
                  <DollarSign className="h-4 w-4" />{e.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end mt-1">
                  <Calendar className="h-3 w-3" />{e.expense_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(e)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition"
                  title="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(e.id, e.description ?? "this expense")}
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
