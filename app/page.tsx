import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = ["Static public homepage", "Shared visual language", "Responsive layout", "Hackathon-ready foundation"];

const features = [
  { icon: LayoutDashboard, title: "Clean foundation", description: "A calm landing page that shows the app is wired up correctly." },
  { icon: ShieldCheck, title: "Auth paused safely", description: "The app stays open while the database flow is built out." },
  { icon: BadgeCheck, title: "Consistent UI", description: "Homepage, dashboard, and maintenance now share the same visual language." },
];

function actionLink(href: string, variant: "primary" | "secondary", label: string, icon?: ReactNode) {
  const shared = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    minHeight: "2.75rem",
    padding: "0 1rem",
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
        background: variant === "primary" ? "#0f172a" : "rgba(255,255,255,0.9)",
        color: variant === "primary" ? "#fff" : "#0f172a",
        border: "1px solid #e2e8f0",
        boxShadow: variant === "primary" ? "0 1px 3px rgba(15,23,42,0.12)" : "none",
      }}
    >
      {label}
      {icon}
    </Link>
  );
}

export default function Home() {
  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", minHeight: "100vh", padding: "1.5rem 1rem" }}>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
          gap: "2.5rem",
          alignItems: "center",
          minHeight: "calc(100vh - 3rem)",
        }}
      >
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <Badge variant="outline" style={{ width: "fit-content" }}>
            TransitOps
          </Badge>

          <div style={{ display: "grid", gap: "1rem" }}>
            <h1 style={{ margin: 0, maxWidth: "32rem", fontSize: "clamp(2.5rem, 5vw, 4.25rem)", lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.04em", color: "#020617" }}>
              Fleet operations, presented as a clean static preview.
            </h1>
            <p style={{ margin: 0, maxWidth: "36rem", fontSize: "1.05rem", lineHeight: 1.7, color: "#475569" }}>
              The product is intentionally open and lightweight while we keep building the database and dynamic pieces in small, safe steps.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {actionLink("/dashboard", "primary", "View dashboard", <ArrowRight className="h-4 w-4" />)}
            {actionLink("/vehicles", "secondary", "Browse vehicles")}
            {actionLink("/maintenance", "secondary", "Open maintenance")}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {highlights.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader style={{ borderBottom: "1px solid #e2e8f0", background: "rgba(248,250,252,0.7)" }}>
            <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles className="h-5 w-5 text-sky-600" />
              Status check
            </CardTitle>
            <CardDescription>Everything below is static and ready for the next build step.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "1rem" }}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} style={{ display: "flex", gap: "0.75rem", padding: "1rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", flexShrink: 0, borderRadius: "0.875rem", background: "#0f172a", color: "#fff", display: "grid", placeItems: "center" }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div style={{ display: "grid", gap: "0.25rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>{feature.title}</h2>
                    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, color: "#475569" }}>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
