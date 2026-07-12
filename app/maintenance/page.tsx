import React from "react";
import Link from "next/link";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { ensureSeedData, MOCK_VEHICLES, MOCK_MAINTENANCE_LOGS } from "../../lib/db-seed-helper";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const formatCurrency = (amount: any) => {
  if (amount === null || amount === undefined) return "—";
  const num = typeof amount === "object" ? Number(amount.toString()) : Number(amount);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; status?: string }>;
}) {
  // Await Next.js 15 searchParams promise
  const params = await searchParams;
  const filterVehicleId = params.vehicleId || "";
  const filterStatus = params.status || "";

  // Trigger db verification and seeding if necessary
  let isDbReady = await ensureSeedData();

  let logs: any[] = [];
  let vehiclesList: any[] = [];
  let organizationName = "TransitOps Logistics (Mock)";

  if (isDbReady) {
    try {
      // Get session
      const session = await auth();
      let organizationId: string | null = null;
      
      if (session?.user?.email) {
        const userObj = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { organizationId: true, organization: { select: { name: true } } },
        });
        if (userObj) {
          organizationId = userObj.organizationId;
          organizationName = userObj.organization.name;
        }
      }
      
      // Fallback if user is not in session or database has no matches
      if (!organizationId) {
        const firstOrg = await prisma.organization.findFirst({
          select: { id: true, name: true },
        });
        if (firstOrg) {
          organizationId = firstOrg.id;
          organizationName = firstOrg.name;
        }
      }

      if (organizationId) {
        // Fetch vehicles list for filter select element
        vehiclesList = await prisma.vehicle.findMany({
          where: { organizationId },
          orderBy: { code: "asc" },
        });

        // Query maintenance logs
        const whereClause: any = {
          organizationId,
        };

        if (filterVehicleId) {
          whereClause.vehicleId = filterVehicleId;
        }

        if (filterStatus === "active") {
          whereClause.closedAt = null;
        } else if (filterStatus === "completed") {
          whereClause.closedAt = { not: null };
        }

        logs = await prisma.maintenanceLog.findMany({
          where: whereClause,
          include: {
            vehicle: true,
          },
          orderBy: { openedAt: "desc" },
        });
      }
    } catch (e) {
      console.error("Database query failed. Using mock fallback.", e);
      isDbReady = false;
    }
  }

  // Fallback to mock data if database is not reachable
  if (!isDbReady) {
    vehiclesList = MOCK_VEHICLES;
    logs = MOCK_MAINTENANCE_LOGS.filter((log) => {
      const matchVehicle = !filterVehicleId || log.vehicleId === filterVehicleId;
      let matchStatus = true;
      if (filterStatus === "active") {
        matchStatus = log.closedAt === null;
      } else if (filterStatus === "completed") {
        matchStatus = log.closedAt !== null;
      }
      return matchVehicle && matchStatus;
    });
  }

  // Calculate statistics (global KPIs for this organization, unfiltered by filters)
  const allOrgLogs = isDbReady && logs.length > 0
    ? await prisma.maintenanceLog.findMany({
        where: {
          organizationId: logs[0].organizationId,
        },
      })
    : MOCK_MAINTENANCE_LOGS;

  const totalLogsCount = allOrgLogs.length;
  const activeInShopCount = allOrgLogs.filter((l) => l.closedAt === null).length;
  const totalCostAmount = allOrgLogs.reduce((acc, log) => {
    if (log.cost) {
      const val = typeof log.cost === "object" ? Number(log.cost.toString()) : Number(log.cost);
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0);

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top bar accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900" />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg hover:bg-slate-800 transition-colors">
              T
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-slate-950">Maintenance Hub</h1>
                <Badge variant="outline" className="text-[10px] font-normal px-2 py-0.5">
                  {organizationName}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">Fleet Operations Management</p>
            </div>
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
            >
              Back to Showroom
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 mt-10 grid gap-8">
        {/* KPI Panel */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Maintenance Logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-950">{totalLogsCount}</div>
              <p className="text-xs text-slate-500 mt-1">Recorded service histories</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active in Shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{activeInShopCount}</div>
              <p className="text-xs text-slate-500 mt-1">Vehicles currently IN_SHOP</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Expenditure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-950">{formatCurrency(totalCostAmount)}</div>
              <p className="text-xs text-slate-500 mt-1">Total resolved maintenance costs</p>
            </CardContent>
          </Card>
        </section>

        {/* Page title and filter controls */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Maintenance Records</h2>
            <Link
              href="/maintenance/new"
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 shadow-sm transition-colors"
            >
              + Log Maintenance
            </Link>
          </div>

          {/* Filters Form */}
          <form method="GET" action="/maintenance" className="flex flex-wrap gap-4 items-end bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <label htmlFor="vehicleId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filter by Vehicle
              </label>
              <div className="relative">
                <select
                  id="vehicleId"
                  name="vehicleId"
                  defaultValue={filterVehicleId}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer"
                >
                  <option value="">All Vehicles</option>
                  {vehiclesList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} — {v.make} {v.model} ({v.plateNumber})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label htmlFor="status" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  defaultValue={filterStatus}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active (In Shop)</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="h-10 px-5 flex-1 sm:flex-initial rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
              {(filterVehicleId || filterStatus) && (
                <Link
                  href="/maintenance"
                  className="h-10 px-4 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Listing Grid / Table */}
        <section>
          {logs.length === 0 ? (
            <Card className="py-16 text-center">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <CardTitle className="text-base text-slate-850">No logs found</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  We couldn't find any maintenance records matching the selected filters. Reset your filters or log a new record.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Issue Description</th>
                    <th className="px-6 py-4">Service Dates</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const isClosed = log.closedAt !== null;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{log.vehicle.code}</div>
                          <div className="text-xs text-slate-500">
                            {log.vehicle.make} {log.vehicle.model} ({log.vehicle.plateNumber})
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium line-clamp-2 max-w-md">{log.description}</div>
                          {log.notes && (
                            <div className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                              Note: {log.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Open:</span>
                            {formatDate(log.openedAt)}
                          </div>
                          {isClosed && (
                            <div className="mt-0.5">
                              <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Close:</span>
                              {formatDate(log.closedAt!)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isClosed ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <Badge variant="warning">In Shop</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900">
                          {formatCurrency(log.cost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
