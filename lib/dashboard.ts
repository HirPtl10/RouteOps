import { prisma } from "./prisma";

export type DashboardData = {
  activeVehicles: number;
  driversReady: number;
  tripsPlanned: number;
  openMaintenance: number;
  fuelLogsThisMonth: number;
  totalExpensesThisMonth: number;
  vehicleStatusBreakdown: { status: string; count: number }[];
  recentTrips: {
    id: string;
    tripNumber: string;
    status: string;
    createdAt: Date;
    vehicle: { code: string } | null;
    driver: { firstName: string; lastName: string } | null;
  }[];
  recentMaintenance: {
    id: string;
    description: string;
    openedAt: Date;
    closedAt: Date | null;
    vehicle: { code: string };
  }[];
};

export async function getDashboardData(
  organizationId: string
): Promise<DashboardData> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    activeVehicles,
    driversReady,
    tripsPlanned,
    openMaintenance,
    fuelLogsThisMonth,
    expensesAgg,
    vehiclesByStatus,
    recentTrips,
    recentMaintenance,
  ] = await Promise.all([
    // Active vehicles (AVAILABLE or ON_TRIP)
    prisma.vehicle.count({
      where: {
        organizationId,
        status: { in: ["AVAILABLE", "ON_TRIP"] },
      },
    }),

    // Drivers ready (AVAILABLE)
    prisma.driver.count({
      where: {
        organizationId,
        status: "AVAILABLE",
      },
    }),

    // Trips planned (DRAFT or DISPATCHED)
    prisma.trip.count({
      where: {
        organizationId,
        status: { in: ["DRAFT", "DISPATCHED"] },
      },
    }),

    // Open maintenance (not closed)
    prisma.maintenanceLog.count({
      where: {
        organizationId,
        closedAt: null,
      },
    }),

    // Fuel logs this month
    prisma.fuelLog.count({
      where: {
        organizationId,
        fueledAt: { gte: monthStart },
      },
    }),

    // Total expenses this month
    prisma.expense.aggregate({
      where: {
        organizationId,
        incurredAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),

    // Vehicle status breakdown
    prisma.vehicle.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { status: true },
    }),

    // Recent 5 trips
    prisma.trip.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        tripNumber: true,
        status: true,
        createdAt: true,
        vehicle: { select: { code: true } },
        driver: { select: { firstName: true, lastName: true } },
      },
    }),

    // Recent 5 maintenance logs
    prisma.maintenanceLog.findMany({
      where: { organizationId },
      orderBy: { openedAt: "desc" },
      take: 5,
      select: {
        id: true,
        description: true,
        openedAt: true,
        closedAt: true,
        vehicle: { select: { code: true } },
      },
    }),
  ]);

  return {
    activeVehicles,
    driversReady,
    tripsPlanned,
    openMaintenance,
    fuelLogsThisMonth,
    totalExpensesThisMonth: Number(expensesAgg._sum.amount ?? 0),
    vehicleStatusBreakdown: vehiclesByStatus.map((g) => ({
      status: g.status,
      count: g._count.status,
    })),
    recentTrips,
    recentMaintenance,
  };
}
