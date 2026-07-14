"use client";

import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, LineChart, SplitSquareVertical } from "lucide-react";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart as ReLineChart, Line, Cell,
} from "recharts";
import type { ModelHandle, ProfitParams } from "./types";

type RevenueStream = {
  name: string; icon: string; revenue: number; growth: number; color: string;
};

const DEFAULT_REVENUE_STREAMS: RevenueStream[] = [
  { name: "Tuition Fees", icon: "🎓", revenue: 28000, growth: 8, color: "#3d6ea5" },
  { name: "Activity Fees", icon: "🎨", revenue: 5000, growth: 5, color: "#2f8f83" },
  { name: "Meal Program", icon: "🍱", revenue: 3000, growth: 3, color: "#c98a1f" },
  { name: "After-School Care", icon: "🏫", revenue: 4000, growth: 10, color: "#8a4a86" },
  { name: "Special Programs", icon: "⭐", revenue: 2000, growth: 7, color: "#c0574f" },
  { name: "Grants & Subsidies", icon: "🏛️", revenue: 1500, growth: 2, color: "#3f7d5c" },
];

type CostCategory = {
  name: string; icon: string; cost: number; trend: "up" | "down" | "stable"; color: string;
};

const DEFAULT_COST_CATEGORIES: CostCategory[] = [
  { name: "Salaries & Wages", icon: "👥", cost: 18000, trend: "up", color: "#ef4444" },
  { name: "Rent & Utilities", icon: "🏢", cost: 8000, trend: "up", color: "#f59e0b" },
  { name: "Food & Supplies", icon: "🥘", cost: 5000, trend: "stable", color: "#8b5cf6" },
  { name: "Marketing", icon: "📢", cost: 3500, trend: "stable", color: "#ec4899" },
  { name: "Maintenance", icon: "🔧", cost: 2000, trend: "down", color: "#06b6d4" },
  { name: "Insurance & Admin", icon: "🛡️", cost: 1500, trend: "stable", color: "#f97316" },
];

const ProfitAnalysisModel = forwardRef<ModelHandle, {}>((_props, ref) => {
  const [streams, setStreams] = useState(DEFAULT_REVENUE_STREAMS);
  const [costs, setCosts] = useState(DEFAULT_COST_CATEGORIES);
  const [taxRate, setTaxRate] = useState(12);
  const [projectionYears, setProjectionYears] = useState(3);

  const updateStream = (index: number, field: "revenue" | "growth", value: number) => {
    const updated = [...streams];
    updated[index] = { ...updated[index], [field]: value };
    setStreams(updated);
  };

  const updateCost = (index: number, value: number) => {
    const updated = [...costs];
    updated[index] = { ...updated[index], cost: value };
    setCosts(updated);
  };

  const results = useMemo(() => {
    const totalRevenue = streams.reduce((s, st) => s + st.revenue, 0);
    const totalCosts = costs.reduce((s, c) => s + c.cost, 0);
    const grossProfit = totalRevenue - totalCosts;
    const grossMargin = (grossProfit / totalRevenue) * 100;
    const taxAmount = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0;
    const netProfit = grossProfit - taxAmount;
    const netMargin = (netProfit / totalRevenue) * 100;
    const annualNetProfit = netProfit * 12;

    // Revenue share
    const revenueShare = streams.map((st) => ({
      ...st,
      pct: (st.revenue / totalRevenue) * 100,
    }));

    // Cost share
    const costShare = costs.map((c) => ({
      ...c,
      pct: (c.cost / totalCosts) * 100,
    }));

    // Multi-year projections
    const projections = Array.from({ length: projectionYears }, (_, i) => {
      const year = i + 1;
      const streamRevenue = streams.reduce((s, st) => s + st.revenue * Math.pow(1 + st.growth / 100, year), 0);
      const yearCosts = costs.reduce((s, c) => s + c.cost * (c.trend === "up" ? 1.05 : c.trend === "down" ? 0.97 : 1), 0) * year;
      const yearGross = streamRevenue - yearCosts;
      const yearTax = yearGross > 0 ? yearGross * (taxRate / 100) : 0;
      const yearNet = yearGross - yearTax;
      return { year, revenue: Math.round(streamRevenue), costs: Math.round(yearCosts), profit: Math.round(yearNet), margin: (yearNet / streamRevenue) * 100 };
    });

    return { totalRevenue, totalCosts, grossProfit, grossMargin, taxAmount, netProfit, netMargin, annualNetProfit, revenueShare, costShare, projections };
  }, [streams, costs, taxRate, projectionYears]);

  const setAllParams = (params: ProfitParams) => {
    setStreams(params.streams);
    setCosts(params.costs);
    setTaxRate(params.taxRate);
    setProjectionYears(params.projectionYears);
  };

  useImperativeHandle(ref, () => ({
    getParams: (): ProfitParams => ({
      streams,
      costs,
      taxRate,
      projectionYears,
    }),
    setParams: (params: any) => setAllParams(params as ProfitParams),
    getExportData: () => {
      const revenueRows = results.revenueShare.map((st: any) => [st.name, st.revenue, st.growth, st.pct.toFixed(1)]);
      const costRows = results.costShare.map((c: any) => [c.name, c.cost, c.trend, c.pct.toFixed(1)]);
      const projectionRows = results.projections.map((p: any) => [p.year, p.revenue, p.costs, p.profit, p.margin.toFixed(1)]);
      return {
        headers: ["Section", "Item", "Value 1", "Value 2", "Value 3"],
        rows: [
          ["=== REVENUE STREAMS ===", "", "", "", ""],
          ["Revenue Stream", "Monthly Revenue (Rs.)", "Growth (%)", "Share (%)", ""],
          ...revenueRows.map((r: (string | number)[]) => [r[0], r[1], r[2], r[3], ""]),
          ["", "", "", "", ""],
          ["=== COST CATEGORIES ===", "", "", "", ""],
          ["Cost Category", "Monthly Cost (Rs.)", "Trend", "Share (%)", ""],
          ...costRows.map((r: (string | number)[]) => [r[0], r[1], r[2], r[3], ""]),
          ["", "", "", "", ""],
          ["=== MULTI-YEAR PROJECTIONS ===", "", "", "", ""],
          ["Year", "Revenue (Rs.)", "Costs (Rs.)", "Net Profit (Rs.)", "Margin (%)"],
          ...projectionRows.map((r: (string | number)[]) => [r[0], r[1], r[2], r[3], r[4]]),
        ],
        filename: `profit-analysis-${new Date().toISOString().split("T")[0]}`,
      };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Streams */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-purple-500 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300">Revenue Streams (monthly)</h3>
          </div>
          <div className="space-y-3">
            {results.revenueShare.map((st, i) => (
              <div key={st.name} className="flex items-center gap-3 p-2.5 bg-white/70 dark:bg-black/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-lg">{st.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{st.name}</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={st.revenue}
                        onChange={(e) => updateStream(i, "revenue", Math.max(0, Number(e.target.value)))}
                        className="w-20 text-right text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200" />
                      <input type="number" value={st.growth}
                        onChange={(e) => updateStream(i, "growth", Number(e.target.value))}
                        className="w-14 text-right text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1 text-purple-600" />
                      <span className="text-[10px] text-zinc-400">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${st.pct}%`, backgroundColor: st.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 w-10 text-right">Rs.{st.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Categories */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-100 dark:border-red-900/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-red-500 text-white">
              <TrendingDown className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Cost Categories (monthly)</h3>
          </div>
          <div className="space-y-3">
            {results.costShare.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 p-2.5 bg-white/70 dark:bg-black/20 rounded-xl border border-red-100 dark:border-red-900/40">
                <span className="text-lg">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{c.name}</span>
                      {c.trend === "up" ? <TrendingUp className="h-3 w-3 text-red-400" /> :
                       c.trend === "down" ? <TrendingDown className="h-3 w-3 text-emerald-400" /> : null}
                    </div>
                    <input type="number" value={c.cost}
                      onChange={(e) => updateCost(i, Math.max(0, Number(e.target.value)))}
                      className="w-20 text-right text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 w-10 text-right">Rs.{c.cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax & Projection Years */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-500">Tax Rate:</span>
          <input type="range" min={0} max={30} step={1} value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600" />
          <span className="text-sm font-bold text-purple-600">{taxRate}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-500">Projection:</span>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
            {[1, 2, 3, 5].map((y) => (
              <button key={y} onClick={() => setProjectionYears(y)}
                className={`px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${projectionYears === y ? "bg-purple-500 text-white" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
                {y}Y
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">Rs.{results.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">monthly</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Total Costs</p>
          <p className="text-2xl font-bold text-red-600">Rs.{results.totalCosts.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">monthly</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${results.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {results.netProfit >= 0 ? "+" : ""}Rs.{results.netProfit.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400">{results.netMargin.toFixed(1)}% margin</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Annual Net</p>
          <p className="text-2xl font-bold text-purple-600">Rs.{(results.annualNetProfit / 100000).toFixed(1)}L</p>
          <p className="text-xs text-zinc-400">projected yearly</p>
        </div>
      </div>

      {/* Multi-Year Projection Line Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Multi-Year Revenue, Costs &amp; Profit Projection</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ReLineChart data={results.projections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
              formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} />
            <Line type="monotone" dataKey="costs" name="Costs" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", r: 5 }} />
            <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 5 }} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      {/* Projection Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Multi-Year Profit Projection</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2.5 pr-3">Year</th>
                <th className="pb-2.5 pr-3">Revenue</th>
                <th className="pb-2.5 pr-3">Costs</th>
                <th className="pb-2.5 pr-3">Net Profit</th>
                <th className="pb-2.5">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.projections.map((p) => (
                <tr key={p.year} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="py-2.5 pr-3 font-bold">Year {p.year}</td>
                  <td className="py-2.5 pr-3">Rs.{p.revenue.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">Rs.{p.costs.toLocaleString()}</td>
                  <td className={`py-2.5 pr-3 font-bold ${p.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {p.profit >= 0 ? "+" : ""}Rs.{p.profit.toLocaleString()}
                  </td>
                  <td className="py-2.5">{p.margin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue vs Cost Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Revenue Distribution</h3>
          <div className="space-y-3">
            {results.revenueShare.map((st) => (
              <div key={st.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400"><span className="mr-1">{st.icon}</span>{st.name}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Rs.{st.revenue.toLocaleString()} ({st.pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${st.pct}%`, backgroundColor: st.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Cost Distribution</h3>
          <div className="space-y-3">
            {results.costShare.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400"><span className="mr-1">{c.icon}</span>{c.name}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Rs.{c.cost.toLocaleString()} ({c.pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue vs Cost Summary Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Revenue vs Cost Summary (Monthly)</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ReBarChart
            data={[
              { name: "Revenue", value: results.totalRevenue, fill: "#10b981" },
              { name: "Costs", value: results.totalCosts, fill: "#ef4444" },
              { name: "Gross Profit", value: results.grossProfit, fill: results.grossProfit >= 0 ? "#6366f1" : "#f59e0b" },
              { name: "Net Profit", value: results.netProfit, fill: results.netProfit >= 0 ? "#8b5cf6" : "#f97316" },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
              formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]}
            />
            <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
              {[
                { name: "Revenue", value: results.totalRevenue, fill: "#10b981" },
                { name: "Costs", value: results.totalCosts, fill: "#ef4444" },
                { name: "Gross Profit", value: results.grossProfit, fill: results.grossProfit >= 0 ? "#6366f1" : "#f59e0b" },
                { name: "Net Profit", value: results.netProfit, fill: results.netProfit >= 0 ? "#8b5cf6" : "#f97316" },
              ].map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default ProfitAnalysisModel;
