import { DriverStatus } from "@prisma/client";
import { prisma } from "./prisma";

const activeTripStatuses = ["DRAFT", "DISPATCHED"] as const;

export async function listDriversForOrganization(organizationId: string) {
  return prisma.driver.findMany({
    where: {
      organizationId,
    },
    include: {
      assignedVehicle: {
        select: {
          id: true,
          code: true,
          make: true,
          model: true,
          status: true,
        },
      },
      _count: {
        select: {
          trips: true,
        },
      },
    },
    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });
}

export async function getDriverStats(organizationId: string) {
  const [total, available, onTrip, offDuty, suspended, assignedVehicleCount] = await Promise.all([
    prisma.driver.count({ where: { organizationId } }),
    prisma.driver.count({ where: { organizationId, status: DriverStatus.AVAILABLE } }),
    prisma.driver.count({ where: { organizationId, status: DriverStatus.ON_TRIP } }),
    prisma.driver.count({ where: { organizationId, status: DriverStatus.OFF_DUTY } }),
    prisma.driver.count({ where: { organizationId, status: DriverStatus.SUSPENDED } }),
    prisma.driver.count({ where: { organizationId, assignedVehicleId: { not: null } } }),
  ]);

  return {
    total,
    available,
    onTrip,
    offDuty,
    suspended,
    assignedVehicleCount,
  };
}

export async function getDriverById(organizationId: string, driverId: string) {
  return prisma.driver.findFirst({
    where: {
      id: driverId,
      organizationId,
    },
    include: {
      assignedVehicle: {
        select: {
          id: true,
          code: true,
          make: true,
          model: true,
          status: true,
        },
      },
      trips: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          vehicle: {
            select: {
              id: true,
              code: true,
              status: true,
            },
          },
        },
        take: 5,
      },
    },
  });
}

async function ensureVehicleIsAssignable(organizationId: string, vehicleId: string | null | undefined) {
  if (!vehicleId) return null;

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      organizationId,
    },
  });

  if (!vehicle) {
    throw new Error("Selected vehicle was not found.");
  }

  if (vehicle.status !== "AVAILABLE") {
    throw new Error("Selected vehicle must be available before assignment.");
  }

  return vehicle;
}

export type CreateDriverInput = {
  organizationId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiresAt?: Date | null;
  phone?: string | null;
  status?: DriverStatus;
  assignedVehicleId?: string | null;
};

export async function createDriverForOrganization(input: CreateDriverInput) {
  await ensureVehicleIsAssignable(input.organizationId, input.assignedVehicleId);

  return prisma.driver.create({
    data: {
      organizationId: input.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      licenseNumber: input.licenseNumber,
      licenseExpiresAt: input.licenseExpiresAt ?? null,
      phone: input.phone ?? null,
      status: input.status ?? DriverStatus.AVAILABLE,
      assignedVehicleId: input.assignedVehicleId ?? null,
    },
  });
}

export type UpdateDriverInput = {
  organizationId: string;
  driverId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiresAt?: Date | null;
  phone?: string | null;
  status: DriverStatus;
  assignedVehicleId?: string | null;
};

export async function updateDriverForOrganization(input: UpdateDriverInput) {
  const existing = await prisma.driver.findFirst({
    where: {
      id: input.driverId,
      organizationId: input.organizationId,
    },
    include: {
      trips: {
        where: {
          status: {
            in: [...activeTripStatuses],
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Driver not found.");
  }

  const assignedVehicleId = input.assignedVehicleId ?? null;
  if (assignedVehicleId !== existing.assignedVehicleId) {
    if (existing.trips.length > 0) {
      throw new Error("You cannot reassign a driver with active trips.");
    }

    await ensureVehicleIsAssignable(input.organizationId, assignedVehicleId);
  }

  if (existing.trips.length > 0 && input.status !== existing.status && input.status !== DriverStatus.ON_TRIP) {
    throw new Error("Driver status cannot be changed while active trips are assigned.");
  }

  return prisma.driver.update({
    where: {
      id: input.driverId,
    },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      licenseNumber: input.licenseNumber,
      licenseExpiresAt: input.licenseExpiresAt ?? null,
      phone: input.phone ?? null,
      status: input.status,
      assignedVehicleId,
    },
  });
}

export async function deleteDriverForOrganization(organizationId: string, driverId: string) {
  const existing = await prisma.driver.findFirst({
    where: {
      id: driverId,
      organizationId,
    },
    include: {
      _count: {
        select: {
          trips: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Driver not found.");
  }

  if (existing._count.trips > 0) {
    throw new Error("This driver has trip history and cannot be deleted.");
  }

  await prisma.driver.delete({
    where: {
      id: driverId,
    },
  });

  return { success: true };
}

export async function getAvailableDriversForOrganization(organizationId: string) {
  return prisma.driver.findMany({
    where: {
      organizationId,
      status: DriverStatus.AVAILABLE,
      OR: [
        {
          licenseExpiresAt: null,
        },
        {
          licenseExpiresAt: {
            gt: new Date(),
          },
        },
      ],
    },
    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      licenseNumber: true,
      assignedVehicleId: true,
    },
  });
}

export async function getAvailableVehiclesForAssignment(organizationId: string) {
  return prisma.vehicle.findMany({
    where: {
      organizationId,
      status: "AVAILABLE",
    },
    orderBy: {
      code: "asc",
    },
    select: {
      id: true,
      code: true,
      make: true,
      model: true,
      status: true,
      capacityKg: true,
    },
  });
}

export async function listDriverActivityForOrganization(organizationId: string) {
  return prisma.driver.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      updatedAt: true,
      assignedVehicle: {
        select: {
          code: true,
        },
      },
    },
  });
}

export async function findAssignableVehicle(organizationId: string, vehicleId: string | null | undefined) {
  return ensureVehicleIsAssignable(organizationId, vehicleId);
}
