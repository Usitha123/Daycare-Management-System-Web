"use client";

import { useEffect, useState } from "react";
import { FileText, CreditCard, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatAmount } from "@/utils/currency";

type Invoice = {
  id: string;
  invoice_no: string;
  child_id: string;
  amount: number;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue";
  child?: { full_name: string } | null;
};

export default function ParentInvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); setError("Not authenticated"); return; }

        const { data, error: fetchError } = await supabase
          .from("invoices")
          .select(`*, child:children(full_name)`)
          .eq("parent_id", user.id)
          .order("due_date", { ascending: false });

        if (fetchError) { setError(fetchError.message); return; }
        setInvoices((data ?? []).map((row: any) => ({
          ...row,
          amount: Number(row.amount),
          child: Array.isArray(row.child) ? row.child[0] ?? null : row.child,
        })));
      } catch (err: any) {
        setError(err.message || "Failed to load invoices");
      }
      setLoading(false);
    };
    load();
  }, []);

  const totalDue = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);

  const statusColor = (status: string) => {
    if (status === "paid") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200";
    if (status === "overdue") return "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200";
    if (status === "sent") return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200";
    return "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 border-zinc-200";
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading invoices...</p>;
  if (error) return <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Invoices & Payments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <p className="text-sm text-zinc-500">Total Due</p>
          <p className="text-2xl font-bold text-red-500">{formatAmount(totalDue)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <p className="text-sm text-zinc-500">Invoice Count</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{invoices.length}</p>
          <p className="text-xs text-zinc-400 mt-1">{invoices.filter((i) => i.status === "paid").length} paid</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <p className="text-sm text-zinc-500">No invoices found for your account.</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/30 rounded-xl">
                  <FileText className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{inv.invoice_no}</p>
                  <p className="text-xs text-zinc-500">{inv.child?.full_name ?? "Unknown child"}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white">{formatAmount(inv.amount)}</p>
                <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" /> Due {inv.due_date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1 ${statusColor(inv.status)}`}>
                  {inv.status === "paid" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
                {inv.status !== "paid" && (
                  <button className="p-2 bg-pink-50 dark:bg-pink-950/30 text-pink-500 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950/50 transition cursor-pointer" title="Pay now">
                    <CreditCard className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
