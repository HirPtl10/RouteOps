import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Fuel, MapPin, Wrench, Users } from "lucide-react";

const metrics = [
  { label: "Active vehicles", value: "24", icon: MapPin },
  { label: "Drivers ready", value: "18", icon: Users },
  { label: "Trips planned", value: "12", icon: Activity },
  { label: "Open maintenance", value: "3", icon: Wrench },
];

const activity = [
  { title: "Fleet overview refreshed", meta: "Static preview · today" },
  { title: "Maintenance status aligned", meta: "UI consistency pass" },
  { title: "Fuel tracking placeholder", meta: "Ready for dynamic work" },
];

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? session?.user?.email ?? "Guest";
  const organization = session?.user?.organizationId ?? "No organization";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "space-between" }}>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <Badge variant="secondary" style={{ width: "fit-content" }}>
            Dashboard preview
          </Badge>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#020617" }}>
            Operations overview
          </h1>
          <p style={{ margin: 0, maxWidth: "38rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
            A static dashboard shell that matches the homepage and gives us a clean place to add dynamic data later.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <Badge variant={session ? "success" : "outline"} style={{ width: "fit-content" }}>
            {session ? "Signed in" : "Guest session"}
          </Badge>
          <span style={{ fontSize: "0.9rem", color: "#475569" }}>
            {userName} · {organization}
          </span>
          <Link href="/vehicles" style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
            Go to vehicles →
          </Link>
        </div>
      </section>

      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <CardDescription>{metric.label}</CardDescription>
                <Icon className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent style={{ paddingTop: 0 }}>
                <div style={{ fontSize: "2rem", lineHeight: 1, fontWeight: 700, color: "#020617" }}>{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)" }}>
        <Card>
          <CardHeader>
            <CardTitle>Today’s status</CardTitle>
            <CardDescription>Simple static cards keep the dashboard readable and on-brand.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.75rem" }}>
            {activity.map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>{item.meta}</p>
                </div>
                <Fuel className="h-5 w-5 text-slate-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What’s next</CardTitle>
            <CardDescription>We can wire each section up one by one without changing the shell.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.75rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
            <p style={{ margin: 0 }}>Vehicles, drivers, trips, maintenance, fuel, and expenses can each become live modules later.</p>
            <p style={{ margin: 0 }}>For now the dashboard stays static so the UI is stable while the backend catches up.</p>
            <p style={{ margin: 0 }}>The layout, homepage, and maintenance screen now share the same visual system.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
