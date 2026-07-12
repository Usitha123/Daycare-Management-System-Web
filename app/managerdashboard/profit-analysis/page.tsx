"use client";

import { useState } from "react";
import { ChartCard, MetricCard, RevenueExpensesChart, ProfitTrendChart,
  ExpensePieChart, StaffOptimization,
} from "@/app/components/profit-analysis/FinancialChart";
import FacilityCostModel from "@/app/components/profit-analysis/FacilityCostModel";
import { ExportSection, ExportAllButton } from "@/app/components/profit-analysis/export/DataExport";
import { TrendingUp, Users, Megaphone, CalendarDays, DollarSign, Building2, FileSpreadsheet } from "lucide-react";
import { formatAmount } from "@/utils/currency";

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

const totalRevenue = MONTHLY_DATA.reduce((s, d) => s + d.revenue, 0);
const totalExpenses = MONTHLY_DATA.reduce((s, d) => s + d.expenses, 0);
const totalProfit = totalRevenue - totalExpenses;

const ANNUAL_ACTIVITIES = [
  { month: "January", activity: "New Year Celebration", type: "Event", revenue: 1500, cost: 500 },
  { month: "February", activity: "Art & Craft Workshop", type: "Workshop", revenue: 2000, cost: 800 },
  { month: "March", activity: "Swimming Gala", type: "Swimming", revenue: 3000, cost: 1200 },
  { month: "April", activity: "Easter Egg Hunt", type: "Event", revenue: 1500, cost: 600 },
  { month: "May", activity: "Music & Dance Festival", type: "Concert", revenue: 4000, cost: 1800 },
  { month: "June", activity: "Science Fair", type: "Workshop", revenue: 2000, cost: 900 },
  { month: "July", activity: "Swimming Classes", type: "Swimming", revenue: 3500, cost: 1500 },
  { month: "August", activity: "Independence Day Parade", type: "Event", revenue: 1800, cost: 700 },
  { month: "September", activity: "Storytelling Workshop", type: "Workshop", revenue: 1500, cost: 600 },
  { month: "October", activity: "Halloween Costume Party", type: "Event", revenue: 2000, cost: 800 },
  { month: "November", activity: "Annual Concert", type: "Concert", revenue: 5000, cost: 2200 },
  { month: "December", activity: "Christmas & Year-End Party", type: "Event", revenue: 3000, cost: 1500 },
];

const totalActivityRevenue = ANNUAL_ACTIVITIES.reduce((s, a) => s + a.revenue, 0);
const totalActivityCost = ANNUAL_ACTIVITIES.reduce((s, a) => s + a.cost, 0);
const totalActivityProfit = totalActivityRevenue - totalActivityCost;

type Tab = "staff" | "pricing" | "marketing" | "calendar" | "facility" | "export";

export default function ManagerProfitAnalysisPage() {
  const [tab, setTab] = useState<Tab>("staff");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Operations & Profit Analysis</h1>
          <p className="text-sm text-zinc-500 mt-1">Staff optimization, pricing strategy, marketing & annual activities</p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Annual Revenue" value={formatAmount(totalRevenue)} subtitle="All sources" />
        <MetricCard title="Annual Expenses" value={formatAmount(totalExpenses)} subtitle="All costs" />
        <MetricCard title="Net Profit" value={formatAmount(totalProfit)} subtitle="Year 1" />
        <MetricCard title="Activity Revenue" value={formatAmount(totalActivityRevenue)} subtitle={`${ANNUAL_ACTIVITIES.length} events/year`} />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {([{ id: "staff", label: "Staff Optimization", icon: Users },
          { id: "pricing", label: "Pricing Strategy", icon: DollarSign },
          { id: "marketing", label: "Marketing Budget", icon: Megaphone },
          { id: "calendar", label: "Annual Calendar", icon: CalendarDays },
          { id: "facility", label: "Facility Costs", icon: Building2 },
          { id: "export", label: "Export Data", icon: FileSpreadsheet },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                tab === t.id
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              }`}>
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "staff" && <StaffOptimizationTab />}
      {tab === "pricing" && <PricingTab />}
      {tab === "marketing" && <MarketingTab />}
      {tab === "calendar" && <CalendarTab />}
      {tab === "facility" && <FacilityTab />}
      {tab === "export" && <ExportTab />}
    </div>
  );
}

/* ── Staff Optimization Tab ── */
function StaffOptimizationTab() {
  const [childrenCount, setChildrenCount] = useState(100);
  const [staffRatio, setStaffRatio] = useState(8);

  return (
    <div className="space-y-6">
      <ChartCard title="Staff Allocation Optimization">
        <p className="text-sm text-zinc-500 mb-4">
          Optimal staff allocation based on child-to-staff ratios. Adjust the sliders to see how staffing needs change.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Number of Children</label>
            <input type="range" min={20} max={200} value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{childrenCount}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Children per Staff Ratio</label>
            <input type="range" min={4} max={15} value={staffRatio} onChange={(e) => setStaffRatio(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">1:{staffRatio}</span>
          </div>
        </div>

        <StaffOptimization children={childrenCount} ratio={staffRatio} />
      </ChartCard>

      <ChartCard title="Monthly Profit Overview">
        <RevenueExpensesChart data={MONTHLY_DATA} />
      </ChartCard>
    </div>
  );
}

/* ── Pricing Strategy Tab ── */
function PricingTab() {
  const [tuitionFee, setTuitionFee] = useState(350);
  const [enrolledChildren, setEnrolledChildren] = useState(100);

  const monthlyRevenue = tuitionFee * enrolledChildren;
  const monthlyExpenses = 38000;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const annualProjection = monthlyProfit * 12;

  const scenarios = [
    { fee: 250, revenue: 250 * enrolledChildren, profit: 250 * enrolledChildren - monthlyExpenses },
    { fee: 300, revenue: 300 * enrolledChildren, profit: 300 * enrolledChildren - monthlyExpenses },
    { fee: tuitionFee, revenue: tuitionFee * enrolledChildren, profit: tuitionFee * enrolledChildren - monthlyExpenses },
    { fee: 400, revenue: 400 * enrolledChildren, profit: 400 * enrolledChildren - monthlyExpenses },
    { fee: 450, revenue: 450 * enrolledChildren, profit: 450 * enrolledChildren - monthlyExpenses },
    { fee: 500, revenue: 500 * enrolledChildren, profit: 500 * enrolledChildren - monthlyExpenses },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ChartCard title="Fee Optimization Model">
        <p className="text-sm text-zinc-500 mb-4">
          Adjust tuition fee and enrollment to see the impact on profitability.
        </p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Monthly Tuition Fee (Rs.)</label>
            <input type="range" min={200} max={600} step={25} value={tuitionFee} onChange={(e) => setTuitionFee(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{formatAmount(tuitionFee)}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Enrolled Children</label>
            <input type="range" min={30} max={200} value={enrolledChildren} onChange={(e) => setEnrolledChildren(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{enrolledChildren}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
            <p className="text-[10px] font-semibold text-teal-500">Monthly Revenue</p>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-300">{formatAmount(monthlyRevenue)}</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <p className="text-[10px] font-semibold text-red-500">Monthly Cost</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatAmount(monthlyExpenses)}</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <p className="text-[10px] font-semibold text-emerald-500">Monthly Profit</p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(monthlyProfit)}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 text-center">
          Annual Projection: <span className="font-bold text-teal-600">{formatAmount(annualProjection)}</span>
        </p>
      </ChartCard>

      <ChartCard title="Fee Scenario Comparison">
        <p className="text-sm text-zinc-500 mb-4">Compare profitability across different fee levels:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="pb-2 pr-3">Fee/Child</th>
                <th className="pb-2 pr-3">Revenue</th>
                <th className="pb-2 pr-3">Costs</th>
                <th className="pb-2">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {scenarios.map((s) => (
                <tr key={s.fee} className={`text-xs ${s.fee === tuitionFee ? "bg-teal-50 dark:bg-teal-950/20" : ""}`}>
                  <td className="py-2 pr-3 font-semibold">{formatAmount(s.fee)}</td>
                  <td className="py-2 pr-3">{formatAmount(s.revenue)}</td>
                  <td className="py-2 pr-3">{formatAmount(monthlyExpenses)}</td>
                  <td className={`py-2 pr-3 font-semibold ${s.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatAmount(s.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

/* ── Marketing Budget Tab ── */
function MarketingTab() {
  const [budget, setBudget] = useState(3500);

  const channels = [
    { name: "Social Media Ads", percent: 35, cost: budget * 0.35, reach: "10,000+ parents" },
    { name: "Local Events & Sponsorships", percent: 20, cost: budget * 0.2, reach: "5,000+ local families" },
    { name: "Flyers & Brochures", percent: 15, cost: budget * 0.15, reach: "3,000+ households" },
    { name: "Google Ads (Search)", percent: 15, cost: budget * 0.15, reach: "8,000+ searches" },
    { name: "Referral Program", percent: 10, cost: budget * 0.1, reach: "Referral from existing" },
    { name: "Website & SEO", percent: 5, cost: budget * 0.05, reach: "Organic traffic" },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ChartCard title="Marketing Budget Allocation">
        <p className="text-sm text-zinc-500 mb-4">
          Allocate marketing budget across channels to maximize reach for the new daycare centre.
        </p>

        <div className="mb-6">            <label className="block text-xs font-semibold text-zinc-500 mb-2">Monthly Marketing Budget (Rs.)</label>
          <input type="range" min={1000} max={10000} step={250} value={budget} onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatAmount(budget)}/month</span>
        </div>

        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600 dark:text-zinc-400">{ch.name}</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatAmount(ch.cost)}</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${ch.percent}%` }} />
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Estimated reach: {ch.reach}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Marketing ROI Estimate">
        <p className="text-sm text-zinc-500 mb-4">
          Estimated return on marketing investment based on typical daycare conversion rates.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-amber-500">Monthly Budget</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{formatAmount(budget)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-emerald-500">Annual Budget</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(budget * 12)}</p>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-500 mb-2">Estimated Outcomes:</p>
            <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
              <li>• Expected new enrollments per month: {Math.round(budget * 0.004)}</li>
              <li>• Annual new enrollments from marketing: {Math.round(budget * 0.004 * 12)}</li>
              <li>• Cost per acquisition: {formatAmount(Math.round(budget / Math.max(budget * 0.004, 1)), { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</li>
              <li>• Marketing as % of revenue: {((budget / (MONTHLY_DATA[MONTHLY_DATA.length - 1].revenue)) * 100).toFixed(1)}%</li>
            </ul>
          </div>

          <p className="text-xs text-zinc-400 italic">
            Recommendation: Allocate 5-10% of projected revenue to marketing in the first year,
            then reduce to 3-5% as brand awareness grows.
          </p>
        </div>
      </ChartCard>
    </div>
  );
}

/* ── Facility Cost Model Tab ── */
function FacilityTab() {
  return <FacilityCostModel />;
}

/* ── Export Tab ── */
function ExportTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Data Export</h2>
        <ExportAllButton />
      </div>
      <ExportSection />
    </div>
  );
}


function CalendarTab() {
  const totalActivityProfit = ANNUAL_ACTIVITIES.reduce((s, a) => s + (a.revenue - a.cost), 0);

  const typeColors: Record<string, string> = {
    Event: "bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
    Workshop: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    Swimming: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400",
    Concert: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Activities" value={`${ANNUAL_ACTIVITIES.length}`} subtitle="Events per year" />
        <MetricCard title="Activity Revenue" value={formatAmount(totalActivityRevenue)} subtitle="Annual" />
        <MetricCard title="Activity Costs" value={formatAmount(totalActivityCost)} subtitle="Annual" />
        <MetricCard title="Activity Profit" value={formatAmount(totalActivityProfit)} subtitle="Annual" trend="Value added" trendUp={totalActivityProfit > 0} />
      </div>

      <ChartCard title="Annual Activity Calendar">
        <p className="text-sm text-zinc-500 mb-4">
          Annual calendar of activities including Play Groups, Swimming, Concerts, Workshops, and special events.
          Each activity generates additional revenue through participation fees.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ANNUAL_ACTIVITIES.map((a) => (
            <div key={a.month} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">{a.month}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[a.type] || "bg-zinc-100 text-zinc-600"}`}>
                  {a.type}
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">{a.activity}</p>
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Revenue: {formatAmount(a.revenue)}</span>
                <span className={a.revenue - a.cost > 0 ? "text-emerald-500" : "text-red-500"}>
                  Profit: {formatAmount(a.revenue - a.cost)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
