import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, style, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-sm";

    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      link: "text-sky-600 underline-offset-4 hover:underline p-0 h-auto font-normal",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-11 px-8 text-base",
      icon: "h-9 w-9",
    };

    const variantStyles = {
      primary: { backgroundColor: "#0f172a", color: "#ffffff", boxShadow: "0 1px 3px rgba(15,23,42,0.12)" },
      secondary: { backgroundColor: "#f1f5f9", color: "#0f172a" },
      outline: { backgroundColor: "#ffffff", color: "#0f172a", border: "1px solid #e2e8f0" },
      destructive: { backgroundColor: "#e11d48", color: "#ffffff", boxShadow: "0 1px 3px rgba(225,29,72,0.12)" },
      ghost: { backgroundColor: "transparent", color: "#334155" },
      link: { backgroundColor: "transparent", color: "#0284c7", textDecoration: "underline", padding: 0, height: "auto" },
    } as const;

    const sizeStyles = {
      sm: { minHeight: "2.25rem", padding: "0 0.75rem", fontSize: "0.75rem" },
      md: { minHeight: "2.5rem", padding: "0 1rem", fontSize: "0.875rem" },
      lg: { minHeight: "2.75rem", padding: "0 1.5rem", fontSize: "1rem" },
      icon: { width: "2.25rem", height: "2.25rem", padding: 0 },
    } as const;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          borderRadius: "0.875rem",
          fontWeight: 500,
          transition: "all 150ms ease",
          cursor: "pointer",
          ...(variantStyles[variant] as React.CSSProperties),
          ...(sizeStyles[size] as React.CSSProperties),
          ...style,
        }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
