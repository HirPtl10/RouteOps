import * as React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        borderRadius: "1.25rem",
        border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        ...style,
      }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ display: "flex", flexDirection: "column", gap: "0.375rem", padding: "1.5rem", ...style }}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      style={{ fontSize: "1.125rem", lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.02em", color: "#0f172a", ...style }}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-slate-900",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, style, ...props }, ref) => (
    <p
      ref={ref}
      style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#64748b", ...style }}
      className={cn("text-sm text-slate-500", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div ref={ref} style={{ padding: "0 1.5rem 1.5rem", ...style }} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ display: "flex", alignItems: "center", padding: "0 1.5rem 1.5rem", ...style }}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
