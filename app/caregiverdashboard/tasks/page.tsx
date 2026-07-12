"use client";

import { useEffect, useState, useMemo } from "react";
import {
  PlusCircle, Search, Filter, Trash2, Pencil, Square, SquareCheck, Flag,
  Calendar, Clock, X, ListChecks,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Priority = "low" | "medium" | "high" | "urgent";
type TaskCategory = "cleaning" | "meals" | "health" | "education" | "play" | "other";
type FilterStatus = "all" | "active" | "completed";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: TaskCategory;
  due_date: string;
  due_time: string | null;
  done: boolean;
  created_at: string;
};

const PRIORITIES = [
  { value: "low" as Priority, label: "Low" }, { value: "medium" as Priority, label: "Medium" },
  { value: "high" as Priority, label: "High" }, { value: "urgent" as Priority, label: "Urgent" },
];

const CATEGORIES = [
  { value: "cleaning" as TaskCategory, label: "Cleaning", emoji: "🧹" }, { value: "meals" as TaskCategory, label: "Meals", emoji: "🍽️" },
  { value: "health" as TaskCategory, label: "Health", emoji: "💊" }, { value: "education" as TaskCategory, label: "Education", emoji: "📚" },
  { value: "play" as TaskCategory, label: "Play", emoji: "🎮" }, { value: "other" as TaskCategory, label: "Other", emoji: "📋" },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  high: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  urgent: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

const CATEGORY_EMOJIS: Record<TaskCategory, string> = {
  cleaning: "🧹", meals: "🍽️", health: "💊", education: "📚", play: "🎮", other: "📋",
};

export default function TasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as Priority, category: "other" as TaskCategory, due_date: new Date().toISOString().slice(0, 10), due_time: "" });

  const fetchTasks = async () => {
    const { data, error: fetchError } = await supabase
      .from("tasks").select("*").order("created_at", { ascending: false });
    if (fetchError) { setError(fetchError.message); return; }
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase()) && !(task.description ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus === "active" && task.done) return false;
      if (filterStatus === "completed" && !task.done) return false;
      if (filterCategory !== "all" && task.category !== filterCategory) return false;
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, search, filterStatus, filterCategory, filterPriority]);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const resetForm = () => { setForm({ title: "", description: "", priority: "medium", category: "other", due_date: new Date().toISOString().slice(0, 10), due_time: "" }); setEditingId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();

    if (editingId) {
      const { error: updateError } = await supabase.from("tasks").update({
        title: form.title, description: form.description || null, priority: form.priority,
        category: form.category, due_date: form.due_date, due_time: form.due_time || null,
      }).eq("id", editingId);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from("tasks").insert({
        title: form.title, description: form.description || null, priority: form.priority,
        category: form.category, due_date: form.due_date, due_time: form.due_time || null,
        created_by: user?.id ?? null,
      });
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }

    setSaving(false);
    resetForm();
    await fetchTasks();
  };

  const toggleTask = async (id: string, done: boolean) => {
    await supabase.from("tasks").update({ done: !done }).eq("id", id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = async (id: string, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const priorityLabel = (p: Priority) => PRIORITIES.find((pr) => pr.value === p)?.label ?? p;
  const categoryLabel = (c: TaskCategory) => CATEGORIES.find((ct) => ct.value === c)?.label ?? c;
  const categoryEmoji = (c: TaskCategory) => CATEGORY_EMOJIS[c];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Task Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">{completedCount} of {totalCount} tasks completed</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ ...form, due_date: new Date().toISOString().slice(0, 10) }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition shadow-sm">
          <PlusCircle className="h-4 w-4" /> New Task
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Daily Progress</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{progressPercent}%</span>
        </div>
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-amber-500/20" />
        </div>
        <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {(["all", "active", "completed"] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${filterStatus === s ? "bg-amber-500 text-white" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition cursor-pointer ${showFilters ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"}`}>
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as TaskCategory | "all")} className="w-full p-2 rounded-lg border dark:bg-zinc-800 text-sm">
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Priority</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | "all")} className="w-full p-2 rounded-lg border dark:bg-zinc-800 text-sm">
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{editingId ? "Edit Task" : "Create New Task"}</h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-3 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold focus:ring-2 focus:ring-amber-500/20" autoFocus />
            <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full p-3 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm resize-none focus:ring-2 focus:ring-amber-500/20" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="w-full p-2.5 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm">
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })} className="w-full p-2.5 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full p-2.5 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Due Time</label>
                <input type="time" value={form.due_time} onChange={(e) => setForm({ ...form, due_time: e.target.value })} className="w-full p-2.5 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Task" : "Create Task"}
              </button>
              <button onClick={resetForm} className="px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <ListChecks className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {search || filterCategory !== "all" || filterPriority !== "all" ? "No tasks match your filters." : "No tasks yet. Create your first task!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md ${task.done ? "opacity-70" : ""}`}>
              <div className="flex items-start gap-4">
                <button onClick={() => toggleTask(task.id, task.done)} className="shrink-0 mt-0.5 cursor-pointer">
                  {task.done ? <SquareCheck className="h-6 w-6 text-emerald-500" /> : <Square className="h-6 w-6 text-zinc-300 dark:text-zinc-600 hover:text-amber-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm ${task.done ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-white"}`}>{task.title}</h3>
                  {task.description && <p className={`text-xs mt-1 ${task.done ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}>{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                      <Flag className="h-3 w-3" />{priorityLabel(task.priority)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700">
                      {categoryEmoji(task.category)} {categoryLabel(task.category)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400"><Calendar className="h-3 w-3" />{task.due_date}</span>
                    {task.due_time && <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400"><Clock className="h-3 w-3" />{task.due_time}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingId(task.id); setForm({ title: task.title, description: task.description ?? "", priority: task.priority, category: task.category, due_date: task.due_date, due_time: task.due_time ?? "" }); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-600 cursor-pointer"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteTask(task.id, task.title)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
