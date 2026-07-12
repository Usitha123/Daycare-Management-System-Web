"use client";

import { useState } from "react";
import { formatAmount } from "@/utils/currency";
import {
  RevenueExpensesChart, ProfitTrendChart, ExpensePieChart,
  ChartCard, MetricCard, BreakEvenCalculator,
} from "@/app/components/profit-analysis/FinancialChart";

/* ── Mock Financial Data ── */
const MONTHLY_DATA = [
  { month: "Jan", revenue: 28500, expenses: 32000 },
  { month: "Feb", revenue: 31000, expenses: 31500 },
  { month: "Mar", revenue: 32500, expenses: 31000 },
  { month: "Apr", revenue: 34000, expenses: 32500 },
  { month: "May", revenue: 35500, expenses: 33000 },
  { month: "Jun", revenue: 37000, expenses: 34000 },
  { month: "Jul", revenue: 38500, expenses: 35000 },
  { month: "Aug", revenue: 40000, expenses: 35500 },
  { month: "Sep", revenue: 42000, expenses: 36000 },
  { month: "Oct", revenue: 43500, expenses: 37000 },
  { month: "Nov", revenue: 45000, expenses: 37500 },
  { month: "Dec", revenue: 47000, expenses: 38000 },
];

const EXPENSE_BREAKDOWN = [
  { name: "Salaries", value: 18000 },
  { name: "Rent", value: 5500 },
  { name: "Utilities", value: 2500 },
  { name: "Supplies", value: 3000 },
  { name: "Marketing", value: 3500 },
  { name: "Food", value: 4000 },
  { name: "Other", value: 1500 },
];

const profitData = MONTHLY_DATA.map((d) => ({ month: d.month, profit: d.revenue - d.expenses }));
const totalRevenue = MONTHLY_DATA.reduce((s, d) => s + d.revenue, 0);
const totalExpenses = MONTHLY_DATA.reduce((s, d) => s + d.expenses, 0);
const totalProfit = totalRevenue - totalExpenses;
const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

export default function AdminProfitAnalysisPage() {
  const [view, setView] = useState<"overview" | "breakeven" | "roi">("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profit Analysis</h1>
          <p className="text-sm text-zinc-500 mt-1">Operational Research — Daycare Centre Financial Model</p>
        </div>
        <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {(["overview", "breakeven", "roi"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                view === v ? "bg-indigo-500 text-white" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}>
              {v === "overview" ? "Overview" : v === "breakeven" ? "Break-even" : "ROI Analysis"}
            </button>
          ))}
        </div>
      </div>

      {view === "overview" && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Annual Revenue" value={formatAmount(totalRevenue)} subtitle="Year 1 Projected" />
            <MetricCard title="Annual Expenses" value={formatAmount(totalExpenses)} subtitle="Year 1 Projected" />
            <MetricCard title="Net Profit" value={formatAmount(totalProfit)} subtitle="Year 1" trend={profitMargin + "% margin"} trendUp={parseFloat(profitMargin) > 0} />
            <MetricCard title="Monthly Avg Profit" value={formatAmount(totalProfit / 12)} subtitle="Per month average" />
          </div>

          {/* Revenue vs Expenses Chart */}
          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Monthly Revenue vs Expenses">
              <RevenueExpensesChart data={MONTHLY_DATA} />
            </ChartCard>

            <ChartCard title="Monthly Profit Trend">
              <ProfitTrendChart data={profitData} />
            </ChartCard>
          </div>

          {/* Expense Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Expense Breakdown">
              <ExpensePieChart data={EXPENSE_BREAKDOWN} />
            </ChartCard>

            <ChartCard title="Cost Structure Summary">
              <div className="space-y-3">
                {EXPENSE_BREAKDOWN.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 md:w-32 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(item.value / totalExpenses) * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 w-16 text-right">
                        {formatAmount(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">Total Expenses</span>
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">{formatAmount(totalExpenses)}</span>
                </div>
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {view === "breakeven" && (
        <ChartCard title="Break-even Analysis">
          <p className="text-sm text-zinc-500 mb-4">
            Break-even analysis shows how many children are needed to cover all costs.
            Fixed costs include rent, salaries, and overhead. Variable costs include supplies and food per child.
          </p>
          <BreakEvenCalculator fixedCosts={38000} variableCostPerChild={150} revenuePerChild={350} />
        </ChartCard>
      )}

      {view === "roi" && (
        <>
          <ChartCard title="ROI &amp; Payback Period">
            <p className="text-sm text-zinc-500 mb-4">
              Return on Investment analysis for the initial Rs. 40,00,000 investment.
            </p>
            <ROICalculatorInline />
          </ChartCard>
        </>
      )}
    </div>
  );
}

/* ── Inline ROI Calculator ── */
function ROICalculatorInline() {
  const investment = 50000; // Rs. 40,00,000 ≈ $50,000
  const annualProfit = totalProfit;

  const roi = ((annualProfit / investment) * 100).toFixed(1);
  const paybackYears = (investment / annualProfit).toFixed(1);

  const projections = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1;
    const cumulativeProfit = annualProfit * year;
    const netReturn = cumulativeProfit - investment;
    return { year, annualProfit: annualProfit, cumulativeProfit, netReturn, roi: ((cumulativeProfit / investment) * 100).toFixed(1) };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase">Annual ROI</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{roi}%</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-indigo-500 uppercase">Payback Period</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{paybackYears} years</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-amber-500 uppercase">Investment</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatAmount(investment)}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-purple-500 uppercase">Annual Profit</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{formatAmount(annualProfit)}</p>
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
