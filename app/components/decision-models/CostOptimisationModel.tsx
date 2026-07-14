"use client";

import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import type { ModelHandle, CostOptimisationParams } from "./types";
import { DollarSign, TrendingDown, TrendingUp, PiggyBank, Target, BarChart3, LineChart, PieChart } from "lucide-react";
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart as RePieChart, Pie, Cell,
} from "recharts";

const CostOptimisationModel = forwardRef<ModelHandle, {}>((_props, ref) => {
  const [childrenCount, setChildrenCount] = useState(80);
  const [tuitionFee, setTuitionFee] = useState(350);
  const [fixedCosts, setFixedCosts] = useState(38000);
  const [variableCostPerChild, setVariableCostPerChild] = useState(150);
  const [marketingPct, setMarketingPct] = useState(8);
  const [enrollmentGrowth, setEnrollmentGrowth] = useState(5);

  const results = useMemo(() => {
    const monthlyRevenue = childrenCount * tuitionFee;
    const monthlyVariable = childrenCount * variableCostPerChild;
    const marketingCost = monthlyRevenue * (marketingPct / 100);
    const totalMonthlyCosts = fixedCosts + monthlyVariable + marketingCost;
    const monthlyProfit = monthlyRevenue - totalMonthlyCosts;
    const profitMargin = ((monthlyProfit / monthlyRevenue) * 100);
    const annualProfit = monthlyProfit * 12;

    // Enrollment projections with growth
    const projections = Array.from({ length: 12 }, (_, i) => {
      const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i];
      const enrolled = Math.round(childrenCount * Math.pow(1 + enrollmentGrowth / 100, i / 12));
      const rev = enrolled * tuitionFee;
      const varCost = enrolled * variableCostPerChild;
      const mktCost = rev * (marketingPct / 100);
      const totalCost = fixedCosts + varCost + mktCost;
      const profit = rev - totalCost;
      return { month, enrolled, revenue: rev, costs: totalCost, profit, margin: (profit / rev) * 100 };
    });

    // Cost breakdown percentages
    const totalCosts = fixedCosts + monthlyVariable + marketingCost;
    const breakdown = [
      { name: "Fixed Costs", value: fixedCosts, pct: (fixedCosts / totalCosts) * 100, color: "#3d6ea5" },
      { name: "Variable Costs", value: monthlyVariable, pct: (monthlyVariable / totalCosts) * 100, color: "#2f8f83" },
      { name: "Marketing", value: marketingCost, pct: (marketingCost / totalCosts) * 100, color: "#c98a1f" },
    ];

    const breakEven = Math.ceil(fixedCosts / (tuitionFee - variableCostPerChild - (tuitionFee * marketingPct / 100)));
    const isProfitable = monthlyProfit > 0;

    return {
      monthlyRevenue, monthlyVariable, marketingCost, totalMonthlyCosts, monthlyProfit, profitMargin, annualProfit,
      projections, breakdown, breakEven, isProfitable,
    };
  }, [childrenCount, tuitionFee, fixedCosts, variableCostPerChild, marketingPct, enrollmentGrowth]);

  const totalCosts = fixedCosts + results.monthlyVariable + results.marketingCost;

  useImperativeHandle(ref, () => ({
    getExportData: () => ({
      headers: ["Month", "Children", "Revenue (Rs.)", "Costs (Rs.)", "Profit (Rs.)", "Margin (%)"],
      rows: [
        ...results.projections.map((p) => [
          p.month, p.enrolled, Math.round(p.revenue), Math.round(p.costs), Math.round(p.profit), p.margin.toFixed(1),
        ]),
        ["ANNUAL TOTAL", "", Math.round(results.projections.reduce((s, p) => s + p.revenue, 0)), Math.round(results.projections.reduce((s, p) => s + p.costs, 0)), Math.round(results.projections.reduce((s, p) => s + p.profit, 0)), ((results.projections.reduce((s, p) => s + p.profit, 0) / results.projections.reduce((s, p) => s + p.revenue, 0)) * 100).toFixed(1)],
      ],
      filename: `cost-optimisation-${new Date().toISOString().split("T")[0]}`,
    }),
    getParams: (): CostOptimisationParams => ({
      childrenCount,
      tuitionFee,
      fixedCosts,
      variableCostPerChild,
      marketingPct,
      enrollmentGrowth,
    }),
    setParams: (params: any) => {
      const p = params as CostOptimisationParams;
      setChildrenCount(p.childrenCount);
      setTuitionFee(p.tuitionFee);
      setFixedCosts(p.fixedCosts);
      setVariableCostPerChild(p.variableCostPerChild);
      setMarketingPct(p.marketingPct);
      setEnrollmentGrowth(p.enrollmentGrowth);
    },
  }));

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-100 dark:border-teal-900/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-teal-500 text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300">Cost Optimisation Parameters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Enrolled Children</label>
            <input type="range" min={20} max={200} value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 dark:bg-teal-900/50 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between text-[10px] text-teal-500 mt-0.5">
              <span>20</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">{childrenCount}</span>
              <span>200</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Tuition Fee/Child (Rs.)</label>
            <input type="range" min={150} max={800} step={25} value={tuitionFee} onChange={(e) => setTuitionFee(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 dark:bg-teal-900/50 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between text-[10px] text-teal-500 mt-0.5">
              <span>Rs.150</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">Rs.{tuitionFee}</span>
              <span>Rs.800</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Fixed Monthly Costs (Rs.)</label>
            <input type="range" min={15000} max={80000} step={1000} value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 dark:bg-teal-900/50 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between text-[10px] text-teal-500 mt-0.5">
              <span>Rs.15k</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">Rs.{fixedCosts.toLocaleString()}</span>
              <span>Rs.80k</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Variable Cost/Child (Rs.)</label>
            <input type="range" min={50} max={400} step={10} value={variableCostPerChild} onChange={(e) => setVariableCostPerChild(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 dark:bg-teal-900/50 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between text-[10px] text-teal-500 mt-0.5">
              <span>Rs.50</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">Rs.{variableCostPerChild}</span>
              <span>Rs.400</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Marketing (% of Revenue)</label>
            <input type="range" min={2} max={20} step={1} value={marketingPct} onChange={(e) => setMarketingPct(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 dark:bg-teal-900/50 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between text-[10px] text-teal-500 mt-0.5">
              <span>2%</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">{marketingPct}%</span>
              <span>20%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Enrollment Growth (%/yr)</label>
            <input type="range" min={0} max={25} step={1} value={enrollmentGrowth} onChange={(e) => setEnrollmentGrowth(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 dark:bg-teal-900/50 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between text-[10px] text-teal-500 mt-0.5">
              <span>0%</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">{enrollmentGrowth}%</span>
              <span>25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">Rs.{results.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">{childrenCount} children × Rs.{tuitionFee}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Total Monthly Costs</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">Rs.{results.totalMonthlyCosts.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">Rs.{Math.round(results.totalMonthlyCosts / childrenCount).toLocaleString()}/child</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Monthly Profit</span>
          </div>
          <p className={`text-2xl font-bold ${results.isProfitable ? "text-emerald-600" : "text-red-600"}`}>
            {results.isProfitable ? "+" : ""}Rs.{results.monthlyProfit.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400">{results.profitMargin.toFixed(1)}% margin</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Break-even</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{results.breakEven} children</p>
          <p className="text-xs text-zinc-400">{childrenCount >= results.breakEven ? "✓ Target met" : "✗ Below target"}</p>
        </div>
      </div>

      {/* Cost Breakdown Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Cost Structure Breakdown</h3>
        <div className="flex h-7 rounded-lg overflow-hidden mb-3 border border-zinc-200 dark:border-zinc-700">
          {results.breakdown.map((item) => (
            <div key={item.name} style={{ width: `${item.pct}%`, backgroundColor: item.color }} className="flex items-center justify-center text-[10px] font-bold text-white truncate px-1">
              {item.pct > 8 ? `${item.name}` : ""}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {results.breakdown.map((item) => (
            <div key={item.name} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.name}</span>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Rs.{item.value.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-400">{item.pct.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 12-Month Line Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">12-Month Revenue, Costs & Profit Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ReLineChart data={results.projections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
              formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
            <Line type="monotone" dataKey="costs" name="Costs" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", r: 4 }} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 4 }} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Breakdown Pie Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Cost Structure Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie data={results.breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {results.breakdown.map((item, i) => (
                  <Cell key={i} fill={item.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="space-y-4 flex flex-col justify-center">
            {results.breakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Rs.{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-500 w-10 text-right">{item.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12-Month Projection Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">12-Month Growth Projection ({enrollmentGrowth}% annual growth)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2.5 pr-3">Month</th>
                <th className="pb-2.5 pr-3">Children</th>
                <th className="pb-2.5 pr-3">Revenue</th>
                <th className="pb-2.5 pr-3">Costs</th>
                <th className="pb-2.5 pr-3">Profit</th>
                <th className="pb-2.5">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.projections.map((p) => (
                <tr key={p.month} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="py-2.5 pr-3 font-semibold">{p.month}</td>
                  <td className="py-2.5 pr-3">{p.enrolled}</td>
                  <td className="py-2.5 pr-3">Rs.{Math.round(p.revenue).toLocaleString()}</td>
                  <td className="py-2.5 pr-3">Rs.{Math.round(p.costs).toLocaleString()}</td>
                  <td className={`py-2.5 pr-3 font-semibold ${p.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {p.profit >= 0 ? "+" : ""}Rs.{Math.round(p.profit).toLocaleString()}
                  </td>
                  <td className="py-2.5">{p.margin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-xs font-bold border-t-2 border-zinc-300 dark:border-zinc-600">
                <td className="py-3 pr-3">Annual Total</td>
                <td className="py-3 pr-3"></td>
                <td className="py-3 pr-3 text-emerald-600">Rs.{Math.round(results.projections.reduce((s, p) => s + p.revenue, 0)).toLocaleString()}</td>
                <td className="py-3 pr-3 text-red-600">Rs.{Math.round(results.projections.reduce((s, p) => s + p.costs, 0)).toLocaleString()}</td>
                <td className="py-3 pr-3 text-emerald-600">Rs.{Math.round(results.projections.reduce((s, p) => s + p.profit, 0)).toLocaleString()}</td>
                <td className="py-3">{((results.projections.reduce((s, p) => s + p.profit, 0) / results.projections.reduce((s, p) => s + p.revenue, 0)) * 100).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
});

export default CostOptimisationModel;
