"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { formatAmount, formatNumber, CURRENCY } from "@/utils/currency";

const COLORS = {
  revenue: "#10b981",
  expenses: "#ef4444",
  profit: "#6366f1",
  marketing: "#f59e0b",
  salaries: "#8b5cf6",
  rent: "#ec4899",
  utilities: "#06b6d4",
  supplies: "#f97316",
  other: "#6b7280",
};

const PIE_COLORS = ["#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#6b7280"];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm ${className}`}>
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* ── Revenue vs Expenses Bar Chart ── */
export function RevenueExpensesChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${CURRENCY.symbol}${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
          formatter={(v: any) => [formatAmount(Number(v)), undefined]}
        />
        <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Profit Trend Line Chart ── */
export function ProfitTrendChart({ data }: { data: { month: string; profit: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${CURRENCY.symbol}${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
          formatter={(v: any) => [formatAmount(Number(v)), "Profit"]}
        />
        <Line type="monotone" dataKey="profit" stroke={COLORS.profit} strokeWidth={3} dot={{ fill: COLORS.profit, r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Expense Breakdown Pie Chart ── */
export function ExpensePieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: any) => [formatAmount(Number(v)), undefined]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ── Metric Card ── */
export function MetricCard({
  title, value, subtitle, trend, trendUp = true,
}: {
  title: string; value: string; subtitle?: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
      {trend && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 px-2 py-0.5 rounded-full ${
          trendUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
        }`}>
          {trend}
        </span>
      )}
    </div>
  );
}

/* ── Break-even Table ── */
export function BreakEvenCalculator({
  fixedCosts, variableCostPerChild, revenuePerChild,
}: {
  fixedCosts: number; variableCostPerChild: number; revenuePerChild: number;
}) {
  const breakEven = Math.ceil(fixedCosts / (revenuePerChild - variableCostPerChild));
  const contributionMargin = revenuePerChild - variableCostPerChild;
  const contributionPercent = ((contributionMargin / revenuePerChild) * 100).toFixed(1);

  const scenarios = [50, 75, 100, 125, 150].map((children) => ({
    children,
    revenue: children * revenuePerChild,
    variableCost: children * variableCostPerChild,
    totalCost: fixedCosts + children * variableCostPerChild,
    profit: children * revenuePerChild - (fixedCosts + children * variableCostPerChild),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-indigo-500 uppercase">Break-even</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{breakEven} children</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase">Contribution Margin</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(contributionMargin)}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-purple-500 uppercase">CM Ratio</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{contributionPercent}%</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-amber-500 uppercase">Fixed Costs</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatAmount(fixedCosts)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="pb-2 pr-3">Children</th>
              <th className="pb-2 pr-3">Revenue</th>
              <th className="pb-2 pr-3">Variable Cost</th>
              <th className="pb-2 pr-3">Total Cost</th>
              <th className="pb-2 pr-3">Profit/Loss</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {scenarios.map((s) => (
              <tr key={s.children} className="text-xs">
                <td className="py-2.5 pr-3 font-semibold">{s.children}</td>
                <td className="py-2.5 pr-3">{formatAmount(s.revenue)}</td>
                <td className="py-2.5 pr-3">{formatAmount(s.variableCost)}</td>
                <td className="py-2.5 pr-3">{formatAmount(s.totalCost)}</td>
                <td className={`py-2.5 pr-3 font-semibold ${s.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatAmount(s.profit)}
                </td>
                <td className="py-2.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.profit > 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
                    s.profit === 0 ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" :
                    "bg-red-50 text-red-600 dark:bg-red-950/30"
                  }`}>
                    {s.profit > 0 ? "Profit" : s.profit === 0 ? "Break-even" : "Loss"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── ROI Calculator ── */
export function ROICalculator({
  initialInvestment, annualProfit, years = 5,
}: {
  initialInvestment: number; annualProfit: number; years?: number;
}) {
  const roi = ((annualProfit / initialInvestment) * 100).toFixed(1);
  const paybackYears = (initialInvestment / annualProfit).toFixed(1);

  const projections = Array.from({ length: years }, (_, i) => {
    const year = i + 1;
    const cumulativeProfit = annualProfit * year;
    const netReturn = cumulativeProfit - initialInvestment;
    return { year, annualProfit, cumulativeProfit, netReturn, roi: ((cumulativeProfit / initialInvestment) * 100).toFixed(1) };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase">ROI</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{roi}%</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-indigo-500 uppercase">Payback Period</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{paybackYears} years</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-amber-500 uppercase">Investment</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatAmount(initialInvestment)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="pb-2 pr-3">Year</th>
              <th className="pb-2 pr-3">Annual Profit</th>
              <th className="pb-2 pr-3">Cumulative Profit</th>
              <th className="pb-2 pr-3">Net Return</th>
              <th className="pb-2">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {projections.map((p) => (
              <tr key={p.year} className="text-xs">
                <td className="py-2.5 pr-3 font-semibold">Year {p.year}</td>
                <td className="py-2.5 pr-3">{formatAmount(p.annualProfit)}</td>
                <td className="py-2.5 pr-3">{formatAmount(p.cumulativeProfit)}</td>
                <td className={`py-2.5 pr-3 font-semibold ${p.netReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {p.netReturn >= 0 ? "+" : ""}{formatAmount(p.netReturn)}
                </td>
                <td className="py-2.5">{p.roi}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Staff Optimization Model ── */
export function StaffOptimization({
  children, ratio,
}: {
  children: number; ratio: number;
}) {
  const requiredStaff = Math.ceil(children / ratio);
  const roles = [
    { role: "Lead Teachers", count: Math.ceil(requiredStaff * 0.3), salary: 45000, emoji: "👩‍🏫" },
    { role: "Assistant Teachers", count: Math.ceil(requiredStaff * 0.3), salary: 30000, emoji: "👩‍🏫" },
    { role: "Caregivers", count: Math.ceil(requiredStaff * 0.25), salary: 25000, emoji: "🤱" },
    { role: "Helpers", count: Math.ceil(requiredStaff * 0.1), salary: 18000, emoji: "🧹" },
    { role: "Manager", count: 1, salary: 55000, emoji: "👔" },
    { role: "Admin Staff", count: Math.ceil(requiredStaff * 0.05), salary: 35000, emoji: "📋" },
  ];

  const totalSalary = roles.reduce((sum, r) => sum + r.count * r.salary, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-indigo-500 uppercase">Children</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{children}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-purple-500 uppercase">Staff Needed</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{requiredStaff + 2}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase">Ratio</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">1:{ratio}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-amber-500 uppercase">Monthly Salary</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatAmount(totalSalary)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="pb-2 pr-3">Role</th>
              <th className="pb-2 pr-3">Count</th>
              <th className="pb-2 pr-3">Salary/Head</th>
              <th className="pb-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {roles.map((r) => (
              <tr key={r.role} className="text-xs">
                <td className="py-2 pr-3"><span className="mr-1.5">{r.emoji}</span>{r.role}</td>
                <td className="py-2 pr-3">{r.count}</td>
                <td className="py-2 pr-3">{formatAmount(r.salary)}</td>
                <td className="py-2 pr-3 font-semibold">{formatAmount(r.count * r.salary)}</td>
              </tr>
            ))}
            <tr className="text-xs font-bold border-t-2 border-zinc-300 dark:border-zinc-600">
              <td className="py-2.5 pr-3">Total</td>
              <td className="py-2.5 pr-3">{roles.reduce((s, r) => s + r.count, 0)}</td>
              <td className="py-2.5 pr-3"></td>
              <td className="py-2.5 pr-3">{formatAmount(totalSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
