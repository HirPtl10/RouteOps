import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getDashboardData } from "@/lib/dashboard";
import {
  Activity,
  Fuel,
  MapPin,
  Wrench,
  Users,
  Truck,
  Plus,
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  AVAILABLE:  { bg: "#22c55e", label: "Available" },
  ON_TRIP:    { bg: "#3b82f6", label: "On Trip" },
  IN_SHOP:    { bg: "#f59e0b", label: "In Shop" },
  RETIRED:    { bg: "#94a3b8", label: "Retired" },
};

const TRIP_STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  DISPATCHED: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? session?.user?.email ?? "Guest";
  const organizationId = session?.user?.organizationId;

  // Fetch live data if user has an organization, otherwise show zeros
  const data = organizationId ? await getDashboardData(organizationId) : null;

  const metrics = [
    {
      label: "Active vehicles",
      value: data?.activeVehicles ?? 0,
      icon: MapPin,
      accent: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    },
    {
      label: "Drivers ready",
      value: data?.driversReady ?? 0,
      icon: Users,
      accent: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    },
    {
      label: "Trips planned",
      value: data?.tripsPlanned ?? 0,
      icon: Activity,
      accent: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
    {
      label: "Open maintenance",
      value: data?.openMaintenance ?? 0,
      icon: Wrench,
      accent: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      label: "Fuel logs (month)",
      value: data?.fuelLogsThisMonth ?? 0,
      icon: Fuel,
      accent: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    },
    {
      label: "Expenses (month)",
      value: data?.totalExpensesThisMonth ?? 0,
      icon: DollarSign,
      accent: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      prefix: "₹",
    },
  ];

  const totalVehicles = (data?.vehicleStatusBreakdown ?? []).reduce((sum, s) => sum + s.count, 0);
  const hasData = data !== null;

  return (
    <div className="dashboard-grid">
      {/* ── Header ── */}
      <section
        className="animate-fade-in-up"
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <Badge variant={session ? "success" : "outline"}>
              {session ? "Live" : "Guest session"}
            </Badge>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {userName}
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#020617",
            }}
          >
            Operations overview
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: "38rem",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            {hasData
              ? "Real-time metrics from your fleet, drivers, trips, and maintenance."
              : "Sign in and join an organization to see live fleet data."}
          </p>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section className="metrics-grid">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.label}
              className={`card-hover animate-fade-in-up animate-delay-${i + 1}`}
            >
              <CardHeader
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "0.5rem",
                }}
              >
                <CardDescription>{metric.label}</CardDescription>
                <div
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "0.75rem",
                    background: metric.accent,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: "1rem", height: "1rem", color: "#fff" }} />
                </div>
              </CardHeader>
              <CardContent style={{ paddingTop: 0 }}>
                <div
                  style={{
                    fontSize: "2rem",
                    lineHeight: 1,
                    fontWeight: 700,
                    color: "#020617",
                  }}
                >
                  <AnimatedCounter
                    value={metric.value}
                    prefix={metric.prefix}
                    duration={1400}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ── Vehicle Status Breakdown ── */}
      {totalVehicles > 0 && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Truck style={{ width: "1.125rem", height: "1.125rem", color: "#64748b" }} />
                  Fleet status
                </CardTitle>
                <CardDescription>Vehicle distribution across statuses</CardDescription>
              </div>
              <Link
                href="/vehicles"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#3b82f6",
                }}
              >
                View all <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
              </Link>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "1rem" }}>
            {/* Bar */}
            <div className="status-bar-track">
              {data!.vehicleStatusBreakdown.map((s) => {
                const pct = (s.count / totalVehicles) * 100;
                const color = STATUS_COLORS[s.status]?.bg ?? "#94a3b8";
                return (
                  <div
                    key={s.status}
                    className="status-bar-segment"
                    style={{ width: `${pct}%`, background: color }}
                    title={`${STATUS_COLORS[s.status]?.label ?? s.status}: ${s.count}`}
                  />
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {data!.vehicleStatusBreakdown.map((s) => {
                const info = STATUS_COLORS[s.status];
                return (
                  <div key={s.status} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: "0.625rem",
                        height: "0.625rem",
                        borderRadius: "50%",
                        background: info?.bg ?? "#94a3b8",
                      }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                      {info?.label ?? s.status}{" "}
                      <strong style={{ color: "#0f172a" }}>{s.count}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Two-column: Recent Trips + Recent Maintenance ── */}
      <section className="content-grid">
        {/* Recent Trips */}
        <Card className="animate-fade-in-up animate-delay-4">
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TrendingUp style={{ width: "1.125rem", height: "1.125rem", color: "#64748b" }} />
                  Recent trips
                </CardTitle>
                <CardDescription>Latest trip activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.625rem" }}>
            {(data?.recentTrips ?? []).length === 0 ? (
              <div
                style={{
                  padding: "2rem 1rem",
                  textAlign: "center",
                  borderRadius: "1rem",
                  border: "1px dashed #e2e8f0",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                }}
              >
                <Activity style={{ width: "1.5rem", height: "1.5rem", margin: "0 auto 0.5rem", opacity: 0.5 }} />
                No trips yet. Create your first trip to see data here.
              </div>
            ) : (
              data!.recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.875rem",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    gap: "0.75rem",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>
                      {trip.tripNumber}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {trip.vehicle?.code ?? "No vehicle"} ·{" "}
                      {trip.driver
                        ? `${trip.driver.firstName} ${trip.driver.lastName}`
                        : "Unassigned"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <Badge variant={TRIP_STATUS_VARIANT[trip.status] ?? "secondary"}>
                      {trip.status}
                    </Badge>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {formatRelativeTime(trip.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Maintenance */}
        <Card className="animate-fade-in-up animate-delay-5">
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Wrench style={{ width: "1.125rem", height: "1.125rem", color: "#64748b" }} />
                  Maintenance log
                </CardTitle>
                <CardDescription>Recent maintenance activity</CardDescription>
              </div>
              <Link
                href="/maintenance"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#3b82f6",
                }}
              >
                View all <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
              </Link>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "0.625rem" }}>
            {(data?.recentMaintenance ?? []).length === 0 ? (
              <div
                style={{
                  padding: "2rem 1rem",
                  textAlign: "center",
                  borderRadius: "1rem",
                  border: "1px dashed #e2e8f0",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                }}
              >
                <Wrench style={{ width: "1.5rem", height: "1.5rem", margin: "0 auto 0.5rem", opacity: 0.5 }} />
                No maintenance records yet.
              </div>
            ) : (
              data!.recentMaintenance.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.875rem",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>
                      {log.description}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                      {log.vehicle.code} · {formatRelativeTime(log.openedAt)}
                    </p>
                  </div>
                  <Badge variant={log.closedAt ? "success" : "warning"} style={{ flexShrink: 0 }}>
                    {log.closedAt ? "Closed" : "Open"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Quick Actions ── */}
      <Card className="animate-fade-in-up animate-delay-6">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Jump to common tasks</CardDescription>
        </CardHeader>
        <CardContent
          style={{
            display: "grid",
            gap: "0.625rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          <Link href="/vehicles/new" className="quick-action-link">
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Plus style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />
            </div>
            Add vehicle
          </Link>
          <Link href="/vehicles" className="quick-action-link">
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Truck style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />
            </div>
            View fleet
          </Link>
          <Link href="/maintenance" className="quick-action-link">
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Wrench style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />
            </div>
            Maintenance hub
          </Link>
          <Link href="/dashboard" className="quick-action-link">
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />
            </div>
            Refresh data
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
