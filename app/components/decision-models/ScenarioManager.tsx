"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, FolderOpen, Trash2, X, Loader2, AlertCircle, Check } from "lucide-react";
import type { ModelType, Scenario } from "./types";

interface ScenarioManagerProps {
  modelType: ModelType;
  onSave: (name: string) => Promise<void>;
  onLoad: (scenario: Scenario) => void;
}

export default function ScenarioManager({ modelType, onSave, onLoad }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showLoadList, setShowLoadList] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [error, setError] = useState("");

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/decision-scenarios?model_type=${modelType}`);
      if (!res.ok) throw new Error("Failed to fetch scenarios");
      const data = await res.json();
      setScenarios(data.scenarios || []);
    } catch (err: any) {
      setError(err.message || "Failed to load scenarios");
    } finally {
      setLoading(false);
    }
  }, [modelType]);

  useEffect(() => {
    if (showLoadList) fetchScenarios();
  }, [showLoadList, fetchScenarios]);

  const handleSave = async () => {
    if (!scenarioName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(scenarioName.trim());
      setScenarioName("");
      setShowSaveInput(false);
      fetchScenarios();
    } catch (err: any) {
      setError(err.message || "Failed to save scenario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/decision-scenarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setScenarios((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete scenario");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="relative flex items-center gap-2">
      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          {error}
          <button onClick={() => setError("")} className="ml-2 cursor-pointer"><X className="h-3 w-3" /></button>
        </div>
      )}

      <button onClick={() => { setShowSaveInput(!showSaveInput); setShowLoadList(false); }}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition cursor-pointer">
        <Save className="h-4 w-4" /> Save
      </button>

      <button onClick={() => { setShowLoadList(!showLoadList); setShowSaveInput(false); fetchScenarios(); }}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition cursor-pointer">
        <FolderOpen className="h-4 w-4" /> Load
      </button>

      {showSaveInput && (
        <div className="absolute top-full right-0 mt-2 z-40 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Save Current Scenario</p>
            <button onClick={() => setShowSaveInput(false)} className="cursor-pointer"><X className="h-4 w-4 text-zinc-400" /></button>
          </div>
          <div className="flex gap-2">
            <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Scenario name..." autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-zinc-800 dark:text-zinc-200" />
            <button onClick={handleSave} disabled={saving || !scenarioName.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-xs font-bold transition disabled:opacity-50 cursor-pointer">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {showLoadList && (
        <div className="absolute top-full right-0 mt-2 z-40 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Saved Scenarios</p>
            <button onClick={() => setShowLoadList(false)} className="cursor-pointer"><X className="h-4 w-4 text-zinc-400" /></button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>
          ) : scenarios.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">No saved scenarios yet</p>
          ) : (
            <div className="space-y-2">
              {scenarios.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                    <p className="text-[10px] text-zinc-400">{formatDate(s.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={() => { onLoad(s); setShowLoadList(false); }}
                      className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 text-[10px] font-bold transition cursor-pointer">Load</button>
                    <button onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
