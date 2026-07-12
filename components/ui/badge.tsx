import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2";

  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    destructive: "bg-rose-50 text-rose-700 border border-rose-200/80",
    outline: "text-slate-950 border border-slate-200",
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        borderRadius: "9999px",
        padding: "0.25rem 0.75rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        border: variant === "outline" ? "1px solid #e2e8f0" : undefined,
        ...style,
      }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}
