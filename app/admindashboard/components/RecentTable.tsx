import React from "react";

export default function RecentTable() {
  const users = [
    {
      name: "Kasun Perera",
      email: "kasun@mealmate.com",
      role: "Student",
      status: "Active",
      date: "Jul 05, 2026",
    },
    {
      name: "Amal Silva",
      email: "amal.owner@mealmate.com",
      role: "Owner",
      status: "Pending",
      date: "Jul 04, 2026",
    },
    {
      name: "Nimal Fernando",
      email: "nimal.cash@mealmate.com",
      role: "Cashier",
      status: "Active",
      date: "Jul 02, 2026",
    },
    {
      name: "Priyantha Kumara",
      email: "priyantha@mealmate.com",
      role: "Student",
      status: "Suspended",
      date: "Jun 28, 2026",
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg text-slate-800 dark:text-zinc-100">
          Recent Users
        </h2>
        <span className="text-xs font-semibold text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full cursor-pointer hover:opacity-90">
          View All
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              <th className="pb-3 px-3">Name</th>
              <th className="pb-3 px-3">Role</th>
              <th className="pb-3 px-3">Join Date</th>
              <th className="pb-3 px-3">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm text-slate-700 dark:text-zinc-300">
            {users.map((user, i) => (
              <tr
                key={i}
                className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="py-3 px-3">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-green-600 dark:group-hover:text-emerald-400 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      {user.email}
                    </p>
                  </div>
                </td>
                
                <td className="py-3 px-3">
                  <span className="text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                    {user.role}
                  </span>
                </td>
                
                <td className="py-3 px-3 text-slate-500 dark:text-zinc-400">
                  {user.date}
                </td>
                
                <td className="py-3 px-3">
                  <span
                    className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        user.status === "Active"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : user.status === "Pending"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }
                    `}
                  >
                    {user.status}
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