"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    if (newTheme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Listen to system preference changes if in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  if (!mounted) {
    return (
      <div style={{ width: "96px", height: "34px" }} className="bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
    );
  }

  return (
    <div className="bg-slate-100/80 dark:bg-slate-900/60 p-0.5 rounded-xl flex items-center border border-slate-200/40 dark:border-slate-800/40">
      {[
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Laptop, label: "System" },
      ].map((mode) => {
        const Icon = mode.icon;
        const isActive = theme === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => applyTheme(mode.value as Theme)}
            className={cn(
              "p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center",
              isActive 
                ? "bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            title={mode.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
