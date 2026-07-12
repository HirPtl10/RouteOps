import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// ─── Types ───

export type MaintenanceLogWithVehicle = {
  id: string;
  organizationId: string;
  vehicleId: string;
  description: string;
  cost: Prisma.Decimal | null;
  notes: string | null;
  openedAt: Date;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  vehicle: {
    id: string;
    code: string;
    make: string | null;
    model: string | null;
    status: string;
  };
};

// ─── Queries ───

export async function listMaintenanceLogs(organizationId: string) {
  return prisma.maintenanceLog.findMany({
    where: { organizationId },
    orderBy: { openedAt: "desc" },
    include: {
      vehicle: {
        select: {
          id: true,
          code: true,
          make: true,
          model: true,
          status: true,
        },
      },
    },
  });
}

export async function getMaintenanceStats(organizationId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [openCount, closedThisWeek, totalCost] = await Promise.all([
    prisma.maintenanceLog.count({
      where: { organizationId, closedAt: null },
    }),
    prisma.maintenanceLog.count({
      where: {
        organizationId,
        closedAt: { gte: weekAgo },
      },
    }),
    prisma.maintenanceLog.aggregate({
      where: { organizationId },
      _sum: { cost: true },
    }),
  ]);

  return {
    openCount,
    closedThisWeek,
    totalCost: Number(totalCost._sum.cost ?? 0),
  };
}

// ─── Mutations ───

export type CreateMaintenanceInput = {
  organizationId: string;
  vehicleId: string;
  description: string;
  cost?: number | null;
  notes?: string | null;
};

/**
 * Opens a maintenance log and transitions the vehicle to IN_SHOP.
 * Per PROJECT_CONTEXT.md: "Maintenance sets vehicle IN_SHOP"
 */
export async function createMaintenanceLog(input: CreateMaintenanceInput) {
  // Set vehicle IN_SHOP
  await prisma.vehicle.update({
    where: { id: input.vehicleId },
    data: { status: "IN_SHOP" },
  });

  return prisma.maintenanceLog.create({
    data: {
      organizationId: input.organizationId,
      vehicleId: input.vehicleId,
      description: input.description,
      cost: input.cost != null ? new Prisma.Decimal(input.cost) : null,
      notes: input.notes ?? null,
    },
    include: {
      vehicle: {
        select: {
          id: true,
          code: true,
          make: true,
          model: true,
          status: true,
        },
      },
    },
  });
}

/**
 * Closes a maintenance log and restores the vehicle to AVAILABLE.
 * Per PROJECT_CONTEXT.md: "Closing maintenance restores AVAILABLE"
 */
export async function closeMaintenanceLog(
  logId: string,
  organizationId: string
) {
  const log = await prisma.maintenanceLog.findFirst({
    where: { id: logId, organizationId },
  });

  if (!log) {
    throw new Error("Maintenance log not found.");
  }

  if (log.closedAt) {
    throw new Error("This maintenance log is already closed.");
  }

  // Restore vehicle to AVAILABLE
  await prisma.vehicle.update({
    where: { id: log.vehicleId },
    data: { status: "AVAILABLE" },
  });

  return prisma.maintenanceLog.update({
    where: { id: logId },
    data: { closedAt: new Date() },
    include: {
      vehicle: {
        select: {
          id: true,
          code: true,
          make: true,
          model: true,
          status: true,
        },
      },
    },
  });
}
