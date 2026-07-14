"use client";

import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import type { ModelHandle, StaffingParams } from "./types";
import { Users, Clock, DollarSign, BadgePercent, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface StaffRole {
  role: string;
  icon: string;
  minRequired: number;
  maxAvailable: number;
  salary: number;
  hoursPerWeek: number;
  efficiency: number; // 0-1 scale
  color: string;
}

const STAFF_ROLES: StaffRole[] = [
  { role: "Lead Teachers", icon: "👩‍🏫", minRequired: 2, maxAvailable: 8, salary: 45000, hoursPerWeek: 40, efficiency: 0.95, color: "#3d6ea5" },
  { role: "Assistant Teachers", icon: "👨‍🏫", minRequired: 2, maxAvailable: 10, salary: 30000, hoursPerWeek: 35, efficiency: 0.85, color: "#4a8bc2" },
  { role: "Caregivers", icon: "🤱", minRequired: 3, maxAvailable: 12, salary: 25000, hoursPerWeek: 40, efficiency: 0.90, color: "#2f8f83" },
  { role: "Helpers", icon: "🧹", minRequired: 1, maxAvailable: 6, salary: 18000, hoursPerWeek: 30, efficiency: 0.70, color: "#c98a1f" },
  { role: "Special Needs Aid", icon: "💙", minRequired: 0, maxAvailable: 4, salary: 35000, hoursPerWeek: 35, efficiency: 0.92, color: "#8a4a86" },
];

const StaffingModel = forwardRef<ModelHandle, {}>((_props, ref) => {
  const [childrenCount, setChildrenCount] = useState(80);
  const [minRatio, setMinRatio] = useState(6);
  const [operatingHours, setOperatingHours] = useState(10);
  const [budgetLimit, setBudgetLimit] = useState(500000);

  const optimizationResult = useMemo(() => {
    // Linear Programming-inspired optimization
    const requiredStaff = Math.max(2, Math.ceil(childrenCount / minRatio));

    // Allocate staff optimally using a greedy approach (simplified LP)
    const allocation = STAFF_ROLES.map((role) => {
      const idealCount = Math.round(requiredStaff * (role.minRequired / STAFF_ROLES[0].minRequired));
      const count = Math.min(role.maxAvailable, Math.max(role.minRequired, idealCount));
      const totalSalary = count * role.salary;
      const totalHours = count * role.hoursPerWeek;
      const effectiveCapacity = Math.round(count * role.efficiency * (40 / role.hoursPerWeek) * minRatio);
      return { ...role, count, totalSalary, totalHours, effectiveCapacity };
    });

    const totalStaff = allocation.reduce((sum, r) => sum + r.count, 0);
    const totalSalaryCost = allocation.reduce((sum, r) => sum + r.totalSalary, 0);
    const totalEffectiveCapacity = allocation.reduce((sum, r) => sum + r.effectiveCapacity, 0);
    const isBudgetFeasible = totalSalaryCost <= budgetLimit;
    const isRatioCompliant = totalEffectiveCapacity >= childrenCount;
    const utilizationRate = ((childrenCount / totalEffectiveCapacity) * 100);
    const costPerChild = totalSalaryCost / childrenCount;

    return {
      allocation,
      totalStaff,
      totalSalaryCost,
      totalEffectiveCapacity,
      isBudgetFeasible,
      isRatioCompliant,
      utilizationRate: Math.min(100, Math.round(utilizationRate)),
      costPerChild: Math.round(costPerChild),
      surplusCapacity: Math.max(0, totalEffectiveCapacity - childrenCount),
    };
  }, [childrenCount, minRatio, operatingHours, budgetLimit]);

  useImperativeHandle(ref, () => ({
    getExportData: () => ({
      headers: ["Role", "Count", "Min Required", "Max Available", "Salary/Head (Rs.)", "Hours/Week", "Eff. Capacity", "Total Salary (Rs.)"],
      rows: [
        ...optimizationResult.allocation.map((r) => [
          r.role, r.count, r.minRequired, r.maxAvailable, r.salary, r.hoursPerWeek, r.effectiveCapacity, r.totalSalary,
        ]),
        ["TOTAL", optimizationResult.totalStaff, "", "", "", "", optimizationResult.totalEffectiveCapacity, optimizationResult.totalSalaryCost],
      ],
      filename: `staffing-model-${new Date().toISOString().split("T")[0]}`,
    }),
    getParams: (): StaffingParams => ({
      childrenCount,
      minRatio,
      operatingHours,
      budgetLimit,
    }),
    setParams: (params: any) => {
      const p = params as StaffingParams;
      setChildrenCount(p.childrenCount);
      setMinRatio(p.minRatio);
      setOperatingHours(p.operatingHours);
      setBudgetLimit(p.budgetLimit);
    },
  }));

  return (
    <div className="space-y-6">
      {/* Variables & Constants */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-500 text-white">
            <Users className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">Decision Variables</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Number of Children</label>
            <input type="range" min={10} max={200} value={childrenCount}
              onChange={(e) => setChildrenCount(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 dark:bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] text-blue-500 mt-0.5">
              <span>10</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{childrenCount}</span>
              <span>200</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Min Staff:Child Ratio</label>
            <input type="range" min={3} max={15} step={1} value={minRatio}
              onChange={(e) => setMinRatio(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 dark:bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] text-blue-500 mt-0.5">
              <span>1:3</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">1:{minRatio}</span>
              <span>1:15</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Operating Hours/Day</label>
            <input type="range" min={6} max={14} step={1} value={operatingHours}
              onChange={(e) => setOperatingHours(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 dark:bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] text-blue-500 mt-0.5">
              <span>6h</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{operatingHours}h</span>
              <span>14h</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Monthly Budget (Rs.)</label>
            <input type="range" min={100000} max={1000000} step={10000} value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 dark:bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] text-blue-500 mt-0.5">
              <span>Rs.1L</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">Rs.{(budgetLimit / 100000).toFixed(1)}L</span>
              <span>Rs.10L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Solution Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Total Staff</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{optimizationResult.totalStaff}</p>
          <p className="text-xs text-zinc-400">optimal allocation</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Monthly Cost</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">Rs.{optimizationResult.totalSalaryCost.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">Rs.{optimizationResult.costPerChild.toLocaleString()}/child</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BadgePercent className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Utilization</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{optimizationResult.utilizationRate}%</p>
          <p className="text-xs text-zinc-400">{optimizationResult.surplusCapacity} surplus slots</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Constraints</span>
          </div>
          <div className="flex gap-2 mt-1">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${optimizationResult.isBudgetFeasible ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-red-50 text-red-600 dark:bg-red-950/30"}`}>
              {optimizationResult.isBudgetFeasible ? "✓ Budget OK" : "✗ Budget"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${optimizationResult.isRatioCompliant ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-red-50 text-red-600 dark:bg-red-950/30"}`}>
              {optimizationResult.isRatioCompliant ? "✓ Ratio OK" : "✗ Ratio"}
            </span>
          </div>
        </div>
      </div>

      {/* Staff Allocation Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Optimal Staff Allocation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2.5 pr-3">Role</th>
                <th className="pb-2.5 pr-3">Count</th>
                <th className="pb-2.5 pr-3">Min</th>
                <th className="pb-2.5 pr-3">Max</th>
                <th className="pb-2.5 pr-3">Salary/Head</th>
                <th className="pb-2.5 pr-3">Hours/Week</th>
                <th className="pb-2.5 pr-3">Eff. Capacity</th>
                <th className="pb-2.5">Total Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {optimizationResult.allocation.map((r) => (
                <tr key={r.role} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="py-2.5 pr-3"><span className="mr-1.5">{r.icon}</span>{r.role}</td>
                  <td className="py-2.5 pr-3 font-bold">{r.count}</td>
                  <td className="py-2.5 pr-3 text-zinc-400">{r.minRequired}</td>
                  <td className="py-2.5 pr-3 text-zinc-400">{r.maxAvailable}</td>
                  <td className="py-2.5 pr-3">Rs.{r.salary.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">{r.hoursPerWeek}h</td>
                  <td className="py-2.5 pr-3">{r.effectiveCapacity} children</td>
                  <td className="py-2.5 font-semibold">Rs.{r.totalSalary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-xs font-bold border-t-2 border-zinc-300 dark:border-zinc-600">
                <td className="py-3 pr-3">Total</td>
                <td className="py-3 pr-3">{optimizationResult.totalStaff}</td>
                <td className="py-3 pr-3" colSpan={4}></td>
                <td className="py-3 pr-3">{optimizationResult.totalEffectiveCapacity} capacity</td>
                <td className="py-3 pr-3 text-blue-600">Rs.{optimizationResult.totalSalaryCost.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Staff Allocation Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Staff Count by Role</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={optimizationResult.allocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis type="category" dataKey="role" tick={{ fontSize: 10 }} stroke="#9ca3af" width={110} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
                formatter={(v: any) => [v, "Staff Count"]}
              />
              <Bar dataKey="count" name="Staff Count" fill="#3d6ea5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Salary Cost by Role (Rs.)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={optimizationResult.allocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="role" tick={{ fontSize: 10 }} stroke="#9ca3af" width={110} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
                formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, "Total Salary"]}
              />
              <Bar dataKey="totalSalary" name="Total Salary" fill="#2f8f83" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Objective Function */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-blue-500 text-white">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">Objective Function</h3>
        </div>
        <div className="font-mono text-xs md:text-sm text-blue-700 dark:text-blue-300 bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/40">
          <p className="mb-2"><strong>Minimize:</strong> Z = Σ (staff_count<sub>i</sub> × salary<sub>i</sub>)</p>
          <p className="mb-2"><strong>Subject to:</strong></p>
          <ul className="space-y-1 pl-4">
            <li>• Σ (staff_count<sub>i</sub>) ≥ ⌈children / ratio⌉ → {optimizationResult.totalStaff} ≥ {Math.ceil(childrenCount / minRatio)} ✓</li>
            <li>• minRequired<sub>i</sub> ≤ staff_count<sub>i</sub> ≤ maxAvailable<sub>i</sub> (for each role)</li>
            <li>• Σ salary ≤ budget → Rs.{optimizationResult.totalSalaryCost.toLocaleString()} ≤ Rs.{budgetLimit.toLocaleString()} {optimizationResult.isBudgetFeasible ? "✓" : "✗"}</li>
            <li>• Effective capacity ≥ children → {optimizationResult.totalEffectiveCapacity} ≥ {childrenCount} {optimizationResult.isRatioCompliant ? "✓" : "✗"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default StaffingModel;
