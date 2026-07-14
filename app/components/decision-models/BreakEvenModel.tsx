"use client";

import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { Calculator, TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3, LineChart } from "lucide-react";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine,
  LineChart as ReLineChart, Line,
} from "recharts";
import type { ModelHandle, BreakEvenParams } from "./types";

const BreakEvenModel = forwardRef<ModelHandle, {}>((_props, ref) => {
  const [fixedCosts, setFixedCosts] = useState(38000);
  const [variableCostPerChild, setVariableCostPerChild] = useState(150);
  const [revenuePerChild, setRevenuePerChild] = useState(350);

  const result = useMemo(() => {
    const contributionMargin = revenuePerChild - variableCostPerChild;
    const contributionRatio = (contributionMargin / revenuePerChild) * 100;
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * revenuePerChild;

    // Safety margin at different enrollment levels
    const scenarios = [30, 50, 75, 100, 125, 150].map((children) => {
      const revenue = children * revenuePerChild;
      const variableCost = children * variableCostPerChild;
      const totalCost = fixedCosts + variableCost;
      const profit = revenue - totalCost;
      const margin = (profit / revenue) * 100;
      const safetyPct = children > 0 ? ((children - breakEvenUnits) / children) * 100 : 0;
      return { children, revenue, variableCost, totalCost, profit, margin, safetyPct };
    });

    // Sensitivity analysis
    const sensitivity = [
      { label: "10% Fee Increase", revenuePerChild: revenuePerChild * 1.1, be: Math.ceil(fixedCosts / (revenuePerChild * 1.1 - variableCostPerChild)), pctChange: null },
      { label: "10% Fee Decrease", revenuePerChild: revenuePerChild * 0.9, be: Math.ceil(fixedCosts / (revenuePerChild * 0.9 - variableCostPerChild)), pctChange: null },
      { label: "10% Cost Increase", variableCostPerChild: variableCostPerChild * 1.1, be: Math.ceil(fixedCosts / (revenuePerChild - variableCostPerChild * 1.1)), pctChange: null },
      { label: "10% Cost Decrease", variableCostPerChild: variableCostPerChild * 0.9, be: Math.ceil(fixedCosts / (revenuePerChild - variableCostPerChild * 0.9)), pctChange: null },
      { label: "20% Fixed Cost ↑", fixedCosts: fixedCosts * 1.2, be: Math.ceil(fixedCosts * 1.2 / (revenuePerChild - variableCostPerChild)), pctChange: null },
      { label: "20% Fixed Cost ↓", fixedCosts: fixedCosts * 0.8, be: Math.ceil(fixedCosts * 0.8 / (revenuePerChild - variableCostPerChild)), pctChange: null },
    ].map((s) => ({
      ...s,
      pctChange: s.be > 0 ? (((s.be - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1) : "N/A",
    }));

    return { contributionMargin, contributionRatio, breakEvenUnits, breakEvenRevenue, scenarios, sensitivity };
  }, [fixedCosts, variableCostPerChild, revenuePerChild]);

  useImperativeHandle(ref, () => ({
    getExportData: () => ({
      headers: ["Children", "Revenue (Rs.)", "Variable Cost (Rs.)", "Fixed Cost (Rs.)", "Total Cost (Rs.)", "Profit/Loss (Rs.)", "Margin (%)", "Safety (%)"],
      rows: result.scenarios.map((s) => [
        s.children, Math.round(s.revenue), Math.round(s.variableCost), fixedCosts, Math.round(s.totalCost), Math.round(s.profit), s.margin.toFixed(1), s.safetyPct.toFixed(0),
      ]),
      filename: `breakeven-${new Date().toISOString().split("T")[0]}`,
    }),
    getParams: (): BreakEvenParams => ({
      fixedCosts,
      variableCostPerChild,
      revenuePerChild,
    }),
    setParams: (params: any) => {
      const p = params as BreakEvenParams;
      setFixedCosts(p.fixedCosts);
      setVariableCostPerChild(p.variableCostPerChild);
      setRevenuePerChild(p.revenuePerChild);
    },
  }));

  return (
    <div className="space-y-6">
      {/* Variables */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
            <Calculator className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Break-even Variables</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">Fixed Monthly Costs (Rs.)</label>
            <input type="range" min={15000} max={80000} step={1000} value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
              className="w-full h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            <div className="flex justify-between text-[10px] text-emerald-500 mt-0.5">
              <span>Rs.15k</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Rs.{fixedCosts.toLocaleString()}</span>
              <span>Rs.80k</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">Variable Cost per Child (Rs.)</label>
            <input type="range" min={50} max={400} step={10} value={variableCostPerChild}
              onChange={(e) => setVariableCostPerChild(Number(e.target.value))}
              className="w-full h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            <div className="flex justify-between text-[10px] text-emerald-500 mt-0.5">
              <span>Rs.50</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Rs.{variableCostPerChild}</span>
              <span>Rs.400</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">Revenue per Child (Rs.)</label>
            <input type="range" min={200} max={800} step={25} value={revenuePerChild}
              onChange={(e) => setRevenuePerChild(Number(e.target.value))}
              className="w-full h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            <div className="flex justify-between text-[10px] text-emerald-500 mt-0.5">
              <span>Rs.200</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Rs.{revenuePerChild}</span>
              <span>Rs.800</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase mb-1">Break-even Point</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.breakEvenUnits}</p>
          <p className="text-xs text-zinc-400 mt-1">children enrolled</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase mb-1">Break-even Revenue</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Rs.{result.breakEvenRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">monthly</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase mb-1">Contribution Margin</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Rs.{result.contributionMargin}</p>
          <p className="text-xs text-zinc-400 mt-1">per child</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase mb-1">CM Ratio</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.contributionRatio.toFixed(1)}%</p>
          <p className="text-xs text-zinc-400 mt-1">of revenue</p>
        </div>
      </div>

      {/* Scenario Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Scenario Analysis at Different Enrollment Levels</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2.5 pr-3">Children</th>
                <th className="pb-2.5 pr-3">Revenue</th>
                <th className="pb-2.5 pr-3">Variable Cost</th>
                <th className="pb-2.5 pr-3">Fixed Cost</th>
                <th className="pb-2.5 pr-3">Total Cost</th>
                <th className="pb-2.5 pr-3">Profit/Loss</th>
                <th className="pb-2.5 pr-3">Margin</th>
                <th className="pb-2.5">Safety %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {result.scenarios.map((s) => (
                <tr key={s.children} className={`text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${s.children === result.breakEvenUnits ? "bg-amber-50 dark:bg-amber-950/20 font-semibold" : ""}`}>
                  <td className="py-2.5 pr-3 font-bold">{s.children}</td>
                  <td className="py-2.5 pr-3">Rs.{s.revenue.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">Rs.{s.variableCost.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">Rs.{fixedCosts.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">Rs.{s.totalCost.toLocaleString()}</td>
                  <td className={`py-2.5 pr-3 font-bold ${s.profit > 0 ? "text-emerald-600" : s.profit === 0 ? "text-amber-600" : "text-red-600"}`}>
                    {s.profit >= 0 ? "+" : ""}Rs.{s.profit.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3">{s.margin.toFixed(1)}%</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.safetyPct > 20 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
                      s.safetyPct > 0 ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" :
                      "bg-red-50 text-red-600 dark:bg-red-950/30"
                    }`}>
                      {s.safetyPct.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Profit/Loss Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Profit/Loss by Enrollment Level</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ReBarChart data={result.scenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="children" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
                formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCost" name="Total Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={2} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Profit Curve & Break-even</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ReLineChart data={result.scenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="children" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
                formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine x={result.breakEvenUnits} stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" label={{ value: "B/E", position: "top", fill: "#f59e0b", fontSize: 11 }} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 5 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Sensitivity Analysis — Impact on Break-even</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {result.sensitivity.map((s) => (
            <div key={s.label} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{s.label}</p>
                <p className="text-[10px] text-zinc-400">Break-even: {s.be} children</p>
              </div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                parseFloat(s.pctChange) < 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
                parseFloat(s.pctChange) > 0 ? "bg-red-50 text-red-600 dark:bg-red-950/30" :
                "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}>
                {parseFloat(s.pctChange) < 0 ? <TrendingDown className="h-3 w-3" /> :
                 parseFloat(s.pctChange) > 0 ? <TrendingUp className="h-3 w-3" /> :
                 <Minus className="h-3 w-3" />}
                {s.pctChange}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity Break-even Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Break-even Point Under Different Scenarios</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ReBarChart data={result.sensitivity} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" width={130} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
              formatter={(v: any) => [v, "Break-even (children)"]}
            />
            <Bar dataKey="be" name="Break-even" fill="#3d6ea5" radius={[0, 4, 4, 0]}>
              {result.sensitivity.map((entry, idx) => (
                <Cell key={idx} fill={parseFloat(entry.pctChange) < 0 ? "#10b981" : parseFloat(entry.pctChange) > 0 ? "#ef4444" : "#f59e0b"} />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default BreakEvenModel;
