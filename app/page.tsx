import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Activity, Users, Truck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function actionLink(href: string, variant: "primary" | "secondary", label: string, icon?: ReactNode) {
  const shared = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    minHeight: "2.75rem",
    padding: "0 1.25rem",
    borderRadius: "0.875rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
  } as const;

  return (
    <Link
      href={href}
      style={{
        ...shared,
        background: variant === "primary" ? "#0f172a" : "rgba(255,255,255,0.92)",
        color: variant === "primary" ? "#fff" : "#0f172a",
        border: "1px solid #e2e8f0",
        boxShadow: variant === "primary" ? "0 4px 6px -1px rgba(15,23,42,0.1), 0 2px 4px -2px rgba(15,23,42,0.1)" : "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
      className={`hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out hover:shadow-lg ${variant === "primary" ? "hover:bg-slate-800 hover:shadow-slate-900/10" : "hover:bg-slate-50 hover:border-slate-300"}`}
    >
      {label}
      {icon}
    </Link>
  );
}

export default function Home() {
  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem 1.5rem" }}>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "2rem",
          maxWidth: "48rem",
          margin: "auto",
        }}
      >
        <Badge variant="secondary" style={{ padding: "0.375rem 1rem", fontSize: "0.8rem", borderRadius: "9999px" }}>
          TransitOps Platform
        </Badge>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.04em", color: "#0f172a" }}>
            Next-generation fleet intelligence & operations
          </h1>
          <p style={{ margin: "0 auto", maxWidth: "38rem", fontSize: "1.1rem", lineHeight: 1.7, color: "#475569" }}>
            Manage vehicles, drivers, dispatches, and maintenance logs in a unified, high-performance workspace designed for enterprise logistics.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
          {actionLink("/dashboard", "primary", "Open Dashboard", <ArrowRight className="h-4 w-4" />)}
          {actionLink("/vehicles", "secondary", "Vehicles Fleet")}
          {actionLink("/drivers", "secondary", "Drivers list")}
          {actionLink("/trips", "secondary", "Trips Dispatch")}
          {actionLink("/maintenance", "secondary", "Maintenance Hub")}
          {actionLink("/alerts", "secondary", "System Alerts")}
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", width: "100%", marginTop: "3rem" }}>
          <div style={{ padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid #e2e8f0", background: "rgba(255,255,255,0.7)", textAlign: "left" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "grid", placeItems: "center", marginBottom: "1rem" }}>
              <Activity className="h-5 w-5" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.375rem" }}>Live Dispatching</h3>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>Plan, assign, and track driver routes and cargo load statuses in real time.</p>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid #e2e8f0", background: "rgba(255,255,255,0.7)", textAlign: "left" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "grid", placeItems: "center", marginBottom: "1rem" }}>
              <Truck className="h-5 w-5" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.375rem" }}>Maintenance Hub</h3>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>Enforce status constraints, track vehicle shop visits, and manage repairs.</p>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid #e2e8f0", background: "rgba(255,255,255,0.7)", textAlign: "left" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", display: "grid", placeItems: "center", marginBottom: "1rem" }}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.375rem" }}>Smart Alerting</h3>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>Instantly flag expired CDLs, unscheduled breakdowns, and priority exceptions.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
