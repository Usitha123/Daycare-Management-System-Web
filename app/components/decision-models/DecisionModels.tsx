"use client";

import { useState, useRef } from "react";
import {
  Users, BarChart3, Calculator, TrendingUp, DollarSign,
  BookOpen, Lightbulb, Download
} from "lucide-react";
import StaffingModel from "./StaffingModel";
import CostOptimisationModel from "./CostOptimisationModel";
import BreakEvenModel from "./BreakEvenModel";
import GrowthModel from "./GrowthModel";
import ProfitAnalysisModel from "./ProfitAnalysisModel";
import ScenarioManager from "./ScenarioManager";
import { downloadCSV } from "@/app/components/profit-analysis/export/DataExport";
import type { ModelHandle, Scenario } from "./types";

type ModelTab = "staffing" | "cost" | "breakeven" | "growth" | "profit";

const TABS: { id: ModelTab; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { id: "staffing", label: "Staffing LP", icon: Users, color: "blue", description: "Linear Programming staff optimization model" },
  { id: "cost", label: "Cost Optim.", icon: BarChart3, color: "teal", description: "Cost optimization & projection" },
  { id: "breakeven", label: "Break-even", icon: Calculator, color: "emerald", description: "Break-even & sensitivity analysis" },
  { id: "growth", label: "Growth", icon: TrendingUp, color: "amber", description: "Enrollment growth & 5-year forecast" },
  { id: "profit", label: "Profit", icon: DollarSign, color: "purple", description: "Multi-stream revenue & cost analysis" },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500 hover:bg-blue-600",
  teal: "bg-teal-500 hover:bg-teal-600",
  emerald: "bg-emerald-500 hover:bg-emerald-600",
  amber: "bg-amber-500 hover:bg-amber-600",
  purple: "bg-purple-500 hover:bg-purple-600",
};

const COLOR_MAP_BG: Record<string, string> = {
  blue: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/40",
  teal: "from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-100 dark:border-teal-900/40",
  emerald: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-100 dark:border-emerald-900/40",
  amber: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-100 dark:border-amber-900/40",
  purple: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900/40",
};

export default function DecisionModels() {
  const [activeTab, setActiveTab] = useState<ModelTab>("staffing");

  const staffingRef = useRef<ModelHandle>(null);
  const costRef = useRef<ModelHandle>(null);
  const breakevenRef = useRef<ModelHandle>(null);
  const growthRef = useRef<ModelHandle>(null);
  const profitRef = useRef<ModelHandle>(null);

  const refMap: Record<ModelTab, React.RefObject<ModelHandle | null>> = {
    staffing: staffingRef,
    cost: costRef,
    breakeven: breakevenRef,
    growth: growthRef,
    profit: profitRef,
  };

  const exportAllAsCSV = () => {
    const ref = refMap[activeTab];
    const data = ref.current?.getExportData();
    if (data) {
      downloadCSV(data.filename, data.headers, data.rows);
    }
  };

  const handleSaveScenario = async (name: string) => {
    const ref = refMap[activeTab];
    const params = ref.current?.getParams();
    if (!params) throw new Error("No model parameters available");

    const res = await fetch("/api/decision-scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        model_type: activeTab,
        parameters: params,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save scenario");
    }
  };

  const handleLoadScenario = (scenario: Scenario) => {
    const ref = refMap[activeTab];
    ref.current?.setParams(scenario.parameters as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Mathematical Decision Models</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Interactive calculators for staffing, cost optimisation, break-even analysis, growth forecasting & profit planning
          </p>
        </div>
        <div className="flex gap-2">
          <ScenarioManager modelType={activeTab} onSave={handleSaveScenario} onLoad={handleLoadScenario} />
          <button onClick={exportAllAsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition cursor-pointer">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <a href="https://en.wikipedia.org/wiki/Operations_research" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition">
            <BookOpen className="h-4 w-4" />
            OR Theory
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? `bg-gradient-to-r ${tab.color === "blue" ? "from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20" :
                     tab.color === "teal" ? "from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20" :
                     tab.color === "emerald" ? "from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20" :
                     tab.color === "amber" ? "from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20" :
                     "from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20"}`
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}>
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : ""}`} />
              <span>{tab.label}</span>
              <span className={`hidden md:inline text-[10px] opacity-70 ${isActive ? "text-white/70" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`}>
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model Reference */}
      <div className={`bg-gradient-to-r ${COLOR_MAP_BG[TABS.find((t) => t.id === activeTab)?.color || "blue"]} rounded-2xl p-4`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-black/30">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {activeTab === "staffing" && "Staffing/LP Model — Uses linear programming to find the optimal staff mix that minimizes salary costs while meeting regulatory ratios and capacity constraints."}
              {activeTab === "cost" && "Cost Optimisation — Analyzes fixed vs variable costs to optimize pricing, enrollment mix, and marketing spend for maximum profitability."}
              {activeTab === "breakeven" && "Break-even Analysis — Calculates the minimum enrollment needed to cover all costs and tests sensitivity to changes in fees, costs, and enrollment."}
              {activeTab === "growth" && "Growth Model — Projects enrollment over 5 years considering organic growth, churn, and marketing effectiveness to plan capacity expansion."}
              {activeTab === "profit" && "Profit Analysis — Multi-stream revenue and cost analysis with tax considerations and multi-year profit forecasting."}
            </p>
            <p className="text-[10px] text-zinc-400">
              Adjust the sliders and parameters below to run interactive scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* Model Content */}
      <div className="transition-all duration-300">
        {activeTab === "staffing" && <StaffingModel ref={staffingRef} />}
        {activeTab === "cost" && <CostOptimisationModel ref={costRef} />}
        {activeTab === "breakeven" && <BreakEvenModel ref={breakevenRef} />}
        {activeTab === "growth" && <GrowthModel ref={growthRef} />}
        {activeTab === "profit" && <ProfitAnalysisModel ref={profitRef} />}
      </div>
    </div>
  );
}
