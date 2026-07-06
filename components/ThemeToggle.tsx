"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark/light mode"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="
        fixed bottom-6 right-6 z-50
        h-12 w-12 flex items-center justify-center
        rounded-full shadow-lg
        bg-white dark:bg-zinc-800
        border border-zinc-200 dark:border-zinc-700
        text-zinc-700 dark:text-zinc-300
        hover:scale-110 hover:shadow-xl
        active:scale-95
        transition-all duration-200 cursor-pointer
      "
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-500" />
      )}
    </button>
  );
}
