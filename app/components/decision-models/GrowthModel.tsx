"use client";

import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, Users, Target, BarChart3, Rocket } from "lucide-react";
import type { ModelHandle, GrowthParams } from "./types";
import {
  LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const GrowthModel = forwardRef<ModelHandle, {}>((_props, ref) => {
  const [currentEnrollment, setCurrentEnrollment] = useState(60);
  const [maxCapacity, setMaxCapacity] = useState(120);
  const [avgTuition, setAvgTuition] = useState(350);
  const [growthRate, setGrowthRate] = useState(8);
  const [monthlyCAC, setMonthlyCAC] = useState(3500);
  const [churnRate, setChurnRate] = useState(3);

  const results = useMemo(() => {
    const projections: {
      year: number; enrolled: number; revenue: number; cacCost: number;
      churned: number; netNew: number; cumulativeRevenue: number; occupancyRate: number;
    }[] = [];
    let cumulative = 0;

    for (let year = 1; year <= 5; year++) {
      const enrolled = Math.min(maxCapacity, Math.round(currentEnrollment * Math.pow(1 + growthRate / 100, year)));
      const churned = Math.round(enrolled * (churnRate / 100));
      const netNew = enrolled - (year === 1 ? currentEnrollment : projections[year - 2].enrolled) + churned;
      const revenue = enrolled * avgTuition * 12;
      const cacCost = (netNew > 0 ? netNew : 0) * (monthlyCAC * 12 / Math.max(1, enrolled)) * enrolled;
      cumulative += revenue;
      const occupancyRate = (enrolled / maxCapacity) * 100;
      projections.push({ year, enrolled, revenue, cacCost, churned, netNew, cumulativeRevenue: cumulative, occupancyRate });
    }

    const totalRevenue5yr = projections.reduce((s, p) => s + p.revenue, 0);
    const avgOccupancy = projections.reduce((s, p) => s + p.occupancyRate, 0) / 5;
    const revenuePerChild = totalRevenue5yr / projections[4].enrolled;
    const growthAcceleration = ((projections[4].enrolled - currentEnrollment) / currentEnrollment) * 100;

    // Year-over-year comparisons
    const yoyGrowth = projections.slice(1).map((p, i) => ({
      year: p.year,
      growth: ((p.enrolled - projections[i].enrolled) / projections[i].enrolled) * 100,
    }));

    return { projections, totalRevenue5yr, avgOccupancy, revenuePerChild: Math.round(revenuePerChild), growthAcceleration, yoyGrowth };
  }, [currentEnrollment, maxCapacity, avgTuition, growthRate, monthlyCAC, churnRate]);

  useImperativeHandle(ref, () => ({
    getExportData: () => ({
      headers: ["Year", "Enrolled", "Net New", "Churned", "Occupancy (%)", "Annual Revenue (Rs.)", "YoY Growth (%)", "Cumulative Revenue (Rs.)"],
      rows: results.projections.map((p, i) => [
        p.year, p.enrolled, Math.max(0, p.netNew), p.churned, p.occupancyRate.toFixed(0), Math.round(p.revenue),
        i > 0 ? results.yoyGrowth[i - 1].growth.toFixed(1) : "—", Math.round(p.cumulativeRevenue),
      ]),
      filename: `growth-model-${new Date().toISOString().split("T")[0]}`,
    }),
    getParams: (): GrowthParams => ({
      currentEnrollment,
      maxCapacity,
      avgTuition,
      growthRate,
      monthlyCAC,
      churnRate,
    }),
    setParams: (params: any) => {
      const p = params as GrowthParams;
      setCurrentEnrollment(p.currentEnrollment);
      setMaxCapacity(p.maxCapacity);
      setAvgTuition(p.avgTuition);
      setGrowthRate(p.growthRate);
      setMonthlyCAC(p.monthlyCAC);
      setChurnRate(p.churnRate);
    },
  }));

  const yearsReachMax = results.projections.findIndex((p) => p.enrolled >= maxCapacity) + 1;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Growth Model Parameters</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Current Enrollment</label>
            <input type="range" min={20} max={120} value={currentEnrollment} onChange={(e) => setCurrentEnrollment(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{currentEnrollment}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Max Capacity</label>
            <input type="range" min={60} max={200} step={10} value={maxCapacity} onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{maxCapacity}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Growth Rate/year</label>
            <input type="range" min={2} max={30} step={1} value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{growthRate}%</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Churn Rate/year</label>
            <input type="range" min={1} max={15} step={1} value={churnRate} onChange={(e) => setChurnRate(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{churnRate}%</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Avg Tuition (Rs.)</label>
            <input type="range" min={200} max={600} step={25} value={avgTuition} onChange={(e) => setAvgTuition(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Rs.{avgTuition}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Marketing CAC (Rs./mo)</label>
            <input type="range" min={1000} max={10000} step={250} value={monthlyCAC} onChange={(e) => setMonthlyCAC(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Rs.{monthlyCAC.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">5-Yr Growth</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{results.growthAcceleration.toFixed(0)}%</p>
          <p className="text-xs text-zinc-400">{results.projections[4].enrolled} children projected</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Year 5 Enrollment</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{results.projections[4].enrolled}</p>
          <p className="text-xs text-zinc-400">{results.avgOccupancy.toFixed(0)}% avg occupancy</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">5-Yr Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">Rs.{(results.totalRevenue5yr / 100000).toFixed(1)}L</p>
          <p className="text-xs text-zinc-400">Rs.{results.revenuePerChild.toLocaleString()}/child/yr</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Capacity Reached</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {yearsReachMax > 0 && yearsReachMax <= 5 ? `Year ${yearsReachMax}` : "Not in 5yr"}
          </p>
          <p className="text-xs text-zinc-400">{yearsReachMax > 0 ? `at ${growthRate}% growth` : "Increase growth rate"}</p>
        </div>
      </div>

      {/* 5-Year Projection */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">5-Year Growth Projection</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2.5 pr-3">Year</th>
                <th className="pb-2.5 pr-3">Enrolled</th>
                <th className="pb-2.5 pr-3">Net New</th>
                <th className="pb-2.5 pr-3">Churned</th>
                <th className="pb-2.5 pr-3">Occupancy</th>
                <th className="pb-2.5 pr-3">Annual Revenue</th>
                <th className="pb-2.5 pr-3">YoY Growth</th>
                <th className="pb-2.5">Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.projections.map((p, i) => (
                <tr key={p.year} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="py-2.5 pr-3 font-bold">Year {p.year}</td>
                  <td className="py-2.5 pr-3">{p.enrolled}</td>
                  <td className="py-2.5 pr-3 text-emerald-600">+{Math.max(0, p.netNew)}</td>
                  <td className="py-2.5 pr-3 text-red-500">-{p.churned}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p.occupancyRate}%` }} />
                      </div>
                      <span>{p.occupancyRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-semibold">Rs.{(p.revenue / 100000).toFixed(1)}L</td>
                  <td className="py-2.5 pr-3">
                    {i > 0 ? (
                      <span className={`font-semibold ${results.yoyGrowth[i - 1].growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {results.yoyGrowth[i - 1].growth >= 0 ? "+" : ""}{results.yoyGrowth[i - 1].growth.toFixed(1)}%
                      </span>
                    ) : <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="py-2.5">Rs.{(p.cumulativeRevenue / 100000).toFixed(1)}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Year Enrollment Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">5-Year Enrollment Projection</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Yr ${v}`} />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
                formatter={(v: any) => [v, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="enrolled" name="Enrolled Children" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 6 }} />
              <Line type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Annual Revenue by Year</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ReBarChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Yr ${v}`} />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 100000).toFixed(1)}L`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
                formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Annual Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cumulativeRevenue" name="Cumulative Revenue" fill="#3d6ea5" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupancy Gauge */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Occupancy Rate Forecast</h3>
        <div className="space-y-4">
          {results.projections.map((p) => (
            <div key={p.year} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-500 w-14">Year {p.year}</span>
              <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${p.occupancyRate}%`,
                    backgroundColor: p.occupancyRate > 90 ? "#10b981" : p.occupancyRate > 70 ? "#f59e0b" : "#3b82f6",
                  }}
                >
                  <span className="text-[10px] font-bold text-white drop-shadow-sm">
                    {p.occupancyRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 w-16 text-right">{p.enrolled} children</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default GrowthModel;
