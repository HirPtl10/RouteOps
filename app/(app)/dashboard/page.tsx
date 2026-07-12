import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Fuel, MapPin, Wrench, Users } from "lucide-react";

const linkButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "2.75rem",
  padding: "0 1rem",
  borderRadius: "0.875rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",
  border: "1px solid #e2e8f0",
} as const;

function getDisplayName(sessionName?: string | null, email?: string | null) {
  return sessionName ?? email ?? "Guest";
}

export default async function DashboardPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userName = getDisplayName(session?.user?.name, session?.user?.email);

  if (!organizationId) {
    return (
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <section style={{ display: "grid", gap: "0.75rem" }}>
          <Badge variant="secondary" style={{ width: "fit-content" }}>
            Dashboard preview
          </Badge>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#020617" }}>
            Welcome to TransitOps
          </h1>
          <p style={{ margin: 0, maxWidth: "42rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
            Sign in or create an organization to unlock live fleet counts, driver status, and maintenance tracking.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <Link href="/login" style={{ ...linkButtonStyle, background: "#0f172a", color: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,0.12)" }}>
              Log in
            </Link>
            <Link href="/signup" style={{ ...linkButtonStyle, background: "#fff", color: "#0f172a" }}>
              Sign up
            </Link>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>What you’ll see after signing in</CardTitle>
            <CardDescription>The dashboard becomes organization-aware once your session is attached.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.75rem", color: "#475569", lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>Vehicle totals and availability.</p>
            <p style={{ margin: 0 }}>Driver readiness and open maintenance.</p>
            <p style={{ margin: 0 }}>Recent trips and fleet activity from your organization.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [
    totalVehicles,
    availableVehicles,
    readyDrivers,
    activeTrips,
    openMaintenance,
    recentTrips,
    recentMaintenance,
    recentFuelLogs,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { organizationId } }),
    prisma.vehicle.count({ where: { organizationId, status: "AVAILABLE" } }),
    prisma.driver.count({ where: { organizationId, status: "AVAILABLE" } }),
    prisma.trip.count({ where: { organizationId, status: { in: ["DRAFT", "DISPATCHED"] } } }),
    prisma.maintenanceLog.count({ where: { organizationId, closedAt: null } }),
    prisma.trip.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 2,
      include: { vehicle: true, driver: true },
    }),
    prisma.maintenanceLog.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 2,
      include: { vehicle: true },
    }),
    prisma.fuelLog.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 1,
      include: { vehicle: true, trip: true },
    }),
  ]);

  const metrics = [
    { label: "Fleet vehicles", value: totalVehicles.toString(), icon: MapPin },
    { label: "Available vehicles", value: availableVehicles.toString(), icon: Activity },
    { label: "Drivers ready", value: readyDrivers.toString(), icon: Users },
    { label: "Open maintenance", value: openMaintenance.toString(), icon: Wrench },
  ];

  const activity = [
    recentTrips[0]
      ? {
          title: `Trip ${recentTrips[0].tripNumber}`,
          meta: `${recentTrips[0].status} · ${recentTrips[0].vehicle?.code ?? "No vehicle"}${recentTrips[0].driver ? ` · ${recentTrips[0].driver.firstName} ${recentTrips[0].driver.lastName}` : ""}`,
        }
      : {
          title: "No trips yet",
          meta: "Create the first trip to populate live activity.",
        },
    recentMaintenance[0]
      ? {
          title: `Maintenance ${recentMaintenance[0].vehicle.code}`,
          meta: `${recentMaintenance[0].closedAt ? "Closed" : "Open"} · ${recentMaintenance[0].description}`,
        }
      : {
          title: "No maintenance logs yet",
          meta: "Open maintenance records will appear here automatically.",
        },
    recentFuelLogs[0]
      ? {
          title: `Fuel log ${recentFuelLogs[0].vehicle.code}`,
          meta: `${recentFuelLogs[0].liters.toString()} L · ${recentFuelLogs[0].trip ? `Trip ${recentFuelLogs[0].trip.tripNumber}` : "No trip linked"}`,
        }
      : {
          title: "No fuel logs yet",
          meta: "Fuel usage will appear here once records are entered.",
        },
  ];

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
          <p style={{ margin: 0, maxWidth: "42rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
            Live organization data for {userName} is flowing into the dashboard. The panels below update from the database, not mock values.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <Badge variant="success" style={{ width: "fit-content" }}>
            Signed in
          </Badge>
          <Badge variant="outline" style={{ width: "fit-content" }}>
            Active trips {activeTrips}
          </Badge>
          <span style={{ fontSize: "0.9rem", color: "#475569" }}>
            {userName} · {session.user.role ?? "Member"}
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
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>These entries come straight from the organization’s latest records.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.75rem" }}>
            {activity.map((item) => (
              <div
                key={item.title}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.9rem 1rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff" }}
              >
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
            <CardTitle>Next actions</CardTitle>
            <CardDescription>Fast links to the areas that now share the same authenticated shell.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.75rem" }}>
            <Link href="/vehicles" style={{ ...linkButtonStyle, background: "#0f172a", color: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,0.12)" }}>
              Open vehicles
            </Link>
            <Link href="/maintenance" style={{ ...linkButtonStyle, background: "#fff", color: "#0f172a" }}>
              Open maintenance
            </Link>
            <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
              Vehicles, drivers, trips, maintenance, fuel, and expenses can all grow from this dashboard foundation.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
