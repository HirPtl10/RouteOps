import Link from "next/link";
import { ArrowLeft, ClipboardList, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const records = [
  { title: "Oil change scheduled", vehicle: "TRK-014", status: "Open", note: "Routine service preview" },
  { title: "Brake inspection complete", vehicle: "TRK-021", status: "Closed", note: "Static data card" },
  { title: "Tire rotation pending", vehicle: "VAN-008", status: "Open", note: "Ready for real records later" },
];

export default function MaintenancePage() {
  return (
    <main style={{ display: "grid", gap: "1.5rem" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "space-between" }}>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <Badge variant="secondary" style={{ width: "fit-content" }}>
            Maintenance preview
          </Badge>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#020617" }}>
            Maintenance hub
          </h1>
          <p style={{ margin: 0, maxWidth: "38rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
            A neat page that now shares the same app shell, so vehicles, dashboard, and maintenance stay connected.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              minHeight: "2.75rem",
              padding: "0 1rem",
              borderRadius: "0.875rem",
              background: "rgba(255,255,255,0.9)",
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid #e2e8f0",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <Link
            href="/vehicles"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "2.75rem",
              padding: "0 1rem",
              borderRadius: "0.875rem",
              background: "#0f172a",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
            }}
          >
            View vehicles
          </Link>
        </div>
      </section>

      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <Card>
          <CardHeader>
            <CardDescription>Open items</CardDescription>
            <CardTitle style={{ fontSize: "2rem" }}>12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Closed this week</CardDescription>
            <CardTitle style={{ fontSize: "2rem" }}>8</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Upcoming checks</CardDescription>
            <CardTitle style={{ fontSize: "2rem" }}>5</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ClipboardList className="h-5 w-5 text-slate-600" />
            Recent records
          </CardTitle>
          <CardDescription>Static sample records to keep the page useful without backend dependencies.</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: "0.75rem" }}>
          {records.map((record) => (
            <div
              key={record.title}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1rem",
                borderRadius: "1rem",
                border: "1px solid #e2e8f0",
                background: "#fff",
              }}
            >
              <div style={{ display: "grid", gap: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Wrench className="h-4 w-4 text-slate-500" />
                  <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{record.title}</p>
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
                  {record.vehicle} · {record.note}
                </p>
              </div>
              <Badge variant={record.status === "Closed" ? "success" : "warning"} style={{ width: "fit-content" }}>
                {record.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
