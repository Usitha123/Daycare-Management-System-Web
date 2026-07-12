"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { ChartCard } from "../FinancialChart";

/* ── Generic CSV Export ── */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── Export Button ── */
export function ExportButton({
  filename, headers, rows, label = "Export CSV",
}: {
  filename: string; headers: string[]; rows: (string | number)[][]; label?: string;
}) {
  return (
    <button
      onClick={() => downloadCSV(filename, headers, rows)}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-xs font-semibold transition cursor-pointer"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ── Profit Analysis Export ── */
export const PROFIT_HEADERS = ["Month", "Revenue ($)", "Expenses ($)", "Profit ($)", "Margin (%)"];
export const MONTHLY_DATA_ROWS = [
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

export function getProfitRows() {
  return MONTHLY_DATA_ROWS.map((d) => [
    d.month,
    d.revenue,
    d.expenses,
    d.revenue - d.expenses,
    (((d.revenue - d.expenses) / d.revenue) * 100).toFixed(1),
  ]);
}

export const EXPENSE_HEADERS = ["Category", "Amount ($)", "Percentage (%)"];
export const EXPENSE_DATA = [
  { name: "Salaries", value: 18000 },
  { name: "Rent", value: 5500 },
  { name: "Utilities", value: 2500 },
  { name: "Supplies", value: 3000 },
  { name: "Marketing", value: 3500 },
  { name: "Food", value: 4000 },
  { name: "Other", value: 1500 },
];

export function getExpenseRows() {
  const total = EXPENSE_DATA.reduce((s, e) => s + e.value, 0);
  return EXPENSE_DATA.map((e) => [e.name, e.value, ((e.value / total) * 100).toFixed(1)]);
}

export const BREAK_EVEN_HEADERS = ["Children", "Revenue ($)", "Variable Cost ($)", "Total Cost ($)", "Profit ($)", "Status"];

export function getBreakEvenRows(fixedCosts = 38000, varCost = 150, revenuePerChild = 350) {
  return [50, 75, 100, 125, 150].map((children) => {
    const revenue = children * revenuePerChild;
    const variableCost = children * varCost;
    const totalCost = fixedCosts + variableCost;
    const profit = revenue - totalCost;
    return [children, revenue, variableCost, totalCost, profit, profit > 0 ? "Profit" : profit === 0 ? "Break-even" : "Loss"];
  });
}

export const STAFF_HEADERS = ["Role", "Count", "Salary/Head ($)", "Total ($)"];

export function getStaffRows(children = 100, ratio = 8) {
  const requiredStaff = Math.ceil(children / ratio);
  const roles = [
    { role: "Lead Teachers", count: Math.ceil(requiredStaff * 0.3), salary: 45000 },
    { role: "Assistant Teachers", count: Math.ceil(requiredStaff * 0.3), salary: 30000 },
    { role: "Caregivers", count: Math.ceil(requiredStaff * 0.25), salary: 25000 },
    { role: "Helpers", count: Math.ceil(requiredStaff * 0.1), salary: 18000 },
    { role: "Manager", count: 1, salary: 55000 },
    { role: "Admin Staff", count: Math.ceil(requiredStaff * 0.05), salary: 35000 },
  ];
  return roles.map((r) => [r.role, r.count, r.salary, r.count * r.salary]);
}

export const ACTIVITY_HEADERS = ["Month", "Activity", "Type", "Revenue ($)", "Cost ($)", "Profit ($)"];
export const ACTIVITY_ROWS_DATA = [
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

export function getActivityRows() {
  return ACTIVITY_ROWS_DATA.map((a) => [a.month, a.activity, a.type, a.revenue, a.cost, a.revenue - a.cost]);
}

/* ── Export All Button ── */
export function ExportAllButton() {
  const handleExportAll = () => {
    // Monthly P&L
    downloadCSV("monthly-profit-loss", PROFIT_HEADERS, getProfitRows());
    setTimeout(() => {
      // Expenses
      downloadCSV("expense-breakdown", EXPENSE_HEADERS, getExpenseRows());
    }, 300);
    setTimeout(() => {
      // Break-even
      downloadCSV("breakeven-analysis", BREAK_EVEN_HEADERS, getBreakEvenRows());
    }, 600);
    setTimeout(() => {
      // Staff
      downloadCSV("staff-optimization", STAFF_HEADERS, getStaffRows());
    }, 900);
    setTimeout(() => {
      // Activities
      downloadCSV("annual-activities", ACTIVITY_HEADERS, getActivityRows());
    }, 1200);
  };

  return (
    <button
      onClick={handleExportAll}
      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-semibold transition cursor-pointer shadow-sm"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Export All Data to Excel
    </button>
  );
}

/* ── Export Section UI ── */
export function ExportSection() {
  return (
    <ChartCard title="📥 Data Export for OR Project">
      <p className="text-sm text-zinc-500 mb-4">
        Download all financial data as CSV files for analysis in Excel or Python.
        Each dataset can be imported into Excel for further modeling and charting.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <ExportButton filename="monthly-profit-loss" headers={PROFIT_HEADERS} rows={getProfitRows()} label="P&L Data" />
        <ExportButton filename="expense-breakdown" headers={EXPENSE_HEADERS} rows={getExpenseRows()} label="Expenses" />
        <ExportButton filename="breakeven-analysis" headers={BREAK_EVEN_HEADERS} rows={getBreakEvenRows()} label="Break-even" />
        <ExportButton filename="staff-optimization" headers={STAFF_HEADERS} rows={getStaffRows()} label="Staff" />
        <ExportButton filename="annual-activities" headers={ACTIVITY_HEADERS} rows={getActivityRows()} label="Activities" />
      </div>
    </ChartCard>
  );
}
