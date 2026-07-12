"use client";

import { useState } from "react";
import { ChartCard, MetricCard } from "./FinancialChart";
import { Building2, Home, Key } from "lucide-react";
import { formatAmount, CURRENCY } from "@/utils/currency";

type FacilityType = "home-based" | "rented" | "owned";

interface FacilityOption {
  type: FacilityType;
  label: string;
  icon: React.ReactNode;
  description: string;
  setupCost: number;
  monthlyRent: number;
  renovationCost: number;
  capacity: number;
  utilities: number;
  pros: string[];
  cons: string[];
}

const FACILITIES: FacilityOption[] = [
  {
    type: "home-based",
    label: "Home-Based Daycare",
    icon: <Home className="h-5 w-5" />,
    description: "Operate from your own home. Lower cost but limited capacity and regulatory requirements.",
    setupCost: 5000,
    monthlyRent: 0,
    renovationCost: 8000,
    capacity: 30,
    utilities: 800,
    pros: ["No monthly rent", "Lower setup costs", "Tax benefits for home office", "Flexible hours"],
    cons: ["Limited capacity (max 30 children)", "Home insurance required", "Space constraints", "May require zoning permits"],
  },
  {
    type: "rented",
    label: "Rented Commercial Space",
    icon: <Key className="h-5 w-5" />,
    description: "Lease a commercial space. Higher monthly costs but more capacity and professional image.",
    setupCost: 8000,
    monthlyRent: 5500,
    renovationCost: 15000,
    capacity: 80,
    utilities: 2500,
    pros: ["Higher capacity (up to 80 children)", "Professional image", "Better location options", "Lease flexibility"],
    cons: ["Monthly rent payment", "Renovation costs at move-in", "Lease commitment (3-5 years)", "Landlord dependencies"],
  },
  {
    type: "owned",
    label: "Owned Building",
    icon: <Building2 className="h-5 w-5" />,
    description: "Purchase a commercial property. Highest upfront cost but no rent and long-term asset building.",
    setupCost: 50000,
    monthlyRent: 0,
    renovationCost: 40000,
    capacity: 120,
    utilities: 3500,
    pros: ["No monthly rent", "Long-term asset", "Maximum capacity (120+ children)", "Full control over space"],
    cons: ["High upfront investment", "Property maintenance costs", "Location fixed long-term", "Property tax and insurance"],
  },
];

const TUITION_FEE = 350;
const VARIABLE_COST_PER_CHILD = 150;
const SALARIES = 25000;
const MARKETING = 3500;

export default function FacilityCostModel() {
  const [selected, setSelected] = useState<FacilityType>("rented");
  const [childrenCount, setChildrenCount] = useState(80);

  const facility = FACILITIES.find((f) => f.type === selected)!;
  const totalSetup = facility.setupCost + facility.renovationCost;
  const monthlyFixed = facility.monthlyRent + facility.utilities + SALARIES + MARKETING;
  const monthlyRevenue = childrenCount * TUITION_FEE;
  const monthlyVariable = childrenCount * VARIABLE_COST_PER_CHILD;
  const monthlyProfit = monthlyRevenue - monthlyFixed - monthlyVariable;
  const annualProfit = monthlyProfit * 12;
  const roi = totalSetup > 0 ? ((annualProfit / totalSetup) * 100).toFixed(1) : "0";

  /* Comparison data for the three facility types at the same enrollment */
  const comparisons = FACILITIES.map((f) => {
    const cap = Math.min(childrenCount, f.capacity);
    const rev = cap * TUITION_FEE;
    const varCost = cap * VARIABLE_COST_PER_CHILD;
    const fixed = f.monthlyRent + f.utilities + SALARIES + MARKETING;
    const profit = rev - varCost - fixed;
    const setup = f.setupCost + f.renovationCost;
    return { ...f, revenue: rev, variableCost: varCost, fixedCosts: fixed, profit, setup, cap };
  });

  return (
    <div className="space-y-6">
      <ChartCard title="Facility Type Comparison">
        <p className="text-sm text-zinc-500 mb-4">
          Compare three daycare facility options: Home-based, Rented Commercial Space, or Owned Building.
          Select a facility type and adjust enrollment to see cost and profit projections.
        </p>

        {/* Facility Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {FACILITIES.map((f) => {
            const isSelected = selected === f.type;
            return (
              <button key={f.type} onClick={() => { setSelected(f.type); setChildrenCount(Math.min(childrenCount, f.capacity)); }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}>
                <div className={`p-2.5 rounded-xl inline-flex mb-2 ${
                  isSelected ? "bg-indigo-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  {f.icon}
                </div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{f.label}</p>
                <p className="text-xs text-zinc-500 mt-1">Capacity: up to {f.capacity} children</p>
                <p className="text-xs text-zinc-500">Setup: {formatAmount(f.setupCost + f.renovationCost)}</p>
              </button>
            );
          })}
        </div>

        {/* Enrollment Slider */}
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <label className="block text-xs font-semibold text-zinc-500 mb-2">
            Expected Enrollment (max {facility.capacity})
          </label>
          <input type="range" min={20} max={facility.capacity} value={childrenCount}
            onChange={(e) => setChildrenCount(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            <span>20 children</span>
            <span className="font-bold text-indigo-600">{childrenCount} children</span>
            <span>{facility.capacity} max</span>
          </div>
        </div>
      </ChartCard>

      {/* Selected Facility Financials */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Setup Cost" value={formatAmount(totalSetup)} subtitle={`${facility.label}`} />
        <MetricCard title="Monthly Fixed" value={formatAmount(monthlyFixed)} subtitle="Rent + Utilities + Staff + Marketing" />
        <MetricCard title="Monthly Profit" value={formatAmount(monthlyProfit)} subtitle={`${childrenCount} children enrolled`} trend={monthlyProfit > 0 ? "Profitable" : "Loss"} trendUp={monthlyProfit > 0} />
        <MetricCard title="Setup ROI" value={`${roi}%`} subtitle="Annual return on setup cost" />
      </div>

      {/* Monthly Breakdown */}
      <ChartCard title={`Monthly Financial Breakdown — ${facility.label}`}>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Tuition Revenue ({childrenCount} × {formatAmount(TUITION_FEE, { minimumFractionDigits: 0, maximumFractionDigits: 0 })})</span>
            <span className="text-sm font-bold text-emerald-600">{formatAmount(monthlyRevenue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Variable Costs ({childrenCount} × {formatAmount(VARIABLE_COST_PER_CHILD, { minimumFractionDigits: 0, maximumFractionDigits: 0 })})</span>
            <span className="text-sm font-bold text-red-500">-{formatAmount(monthlyVariable)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Rent</span>
            <span className="text-sm font-bold text-red-500">-{formatAmount(facility.monthlyRent)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Utilities</span>
            <span className="text-sm font-bold text-red-500">-{formatAmount(facility.utilities)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Salaries</span>
            <span className="text-sm font-bold text-red-500">-{formatAmount(SALARIES)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Marketing</span>
            <span className="text-sm font-bold text-red-500">-{formatAmount(MARKETING)}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-base">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Net Monthly Profit</span>
            <span className={`text-lg font-bold ${monthlyProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatAmount(monthlyProfit)}
            </span>
          </div>
        </div>
      </ChartCard>

      {/* Comparison Table */}
      <ChartCard title="Facility Comparison at Current Enrollment">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2 pr-3">Facility Type</th>
                <th className="pb-2 pr-3">Setup Cost</th>
                <th className="pb-2 pr-3">Monthly Fixed</th>
                <th className="pb-2 pr-3">Monthly Revenue</th>
                <th className="pb-2 pr-3">Monthly Profit</th>
                <th className="pb-2">Annual ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {comparisons.map((c) => (
                <tr key={c.type} className={`text-xs ${c.type === selected ? "bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : ""}`}>
                  <td className="py-2.5 pr-3">{c.label}</td>
                  <td className="py-2.5 pr-3">{formatAmount(c.setup)}</td>
                  <td className="py-2.5 pr-3">{formatAmount(c.fixedCosts)}</td>
                  <td className="py-2.5 pr-3">{formatAmount(c.revenue)}</td>
                  <td className={`py-2.5 pr-3 font-semibold ${c.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatAmount(c.profit)}
                  </td>
                  <td className="py-2.5">{c.setup > 0 ? ((c.profit * 12 / c.setup) * 100).toFixed(1) : "N/A"}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Pros & Cons */}
      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title={`✅ Pros — ${facility.label}`}>
          <ul className="space-y-2">
            {facility.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {pro}
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title={`❌ Cons — ${facility.label}`}>
          <ul className="space-y-2">
            {facility.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="text-red-500 mt-0.5">✗</span>
                {con}
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
}
