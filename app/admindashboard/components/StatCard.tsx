import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "positive",
  icon
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          {title}
        </p>
        
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">
          {value}
        </h3>

        {change && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={`
                text-xs font-semibold px-2 py-0.5 rounded-full
                ${
                  changeType === "positive"
                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : changeType === "negative"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                    : "bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                }
              `}
            >
              {change}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">
              vs last month
            </span>
          </div>
        )}
      </div>

      {icon && (
        <div className="p-3 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl">
          {icon}
        </div>
      )}
    </div>
  );
}