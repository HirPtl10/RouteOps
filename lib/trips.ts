import { DriverStatus, TripStatus } from "@prisma/client";
import { prisma } from "./prisma";

const activeTripStatuses = [TripStatus.DRAFT, TripStatus.DISPATCHED] as const;

async function ensureVehicleIsAssignable(organizationId: string, vehicleId: string | null | undefined, excludeTripId?: string) {
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

  const conflictingTrip = await prisma.trip.findFirst({
    where: {
      organizationId,
      vehicleId,
      id: excludeTripId ? { not: excludeTripId } : undefined,
      status: {
        in: [...activeTripStatuses],
      },
    },
  });

  if (conflictingTrip) {
    throw new Error("That vehicle is already assigned to another active trip.");
  }

  return vehicle;
}

async function ensureDriverIsAssignable(organizationId: string, driverId: string | null | undefined, excludeTripId?: string) {
  if (!driverId) return null;

  const driver = await prisma.driver.findFirst({
    where: {
      id: driverId,
      organizationId,
    },
  });

  if (!driver) {
    throw new Error("Selected driver was not found.");
  }

  if (driver.status !== DriverStatus.AVAILABLE) {
    throw new Error("Selected driver must be available before assignment.");
  }

  if (driver.licenseExpiresAt && driver.licenseExpiresAt <= new Date()) {
    throw new Error("Selected driver has an expired license.");
  }

  const conflictingTrip = await prisma.trip.findFirst({
    where: {
      organizationId,
      driverId,
      id: excludeTripId ? { not: excludeTripId } : undefined,
      status: {
        in: [...activeTripStatuses],
      },
    },
  });

  if (conflictingTrip) {
    throw new Error("That driver is already assigned to another active trip.");
  }

  return driver;
}

export async function listTripsForOrganization(organizationId: string) {
  return prisma.trip.findMany({
    where: {
      organizationId,
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
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          assignedVehicle: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        scheduledAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function getTripStats(organizationId: string) {
  const [scheduled, inProgress, completed, cancelled] = await Promise.all([
    prisma.trip.count({ where: { organizationId, status: TripStatus.DRAFT } }),
    prisma.trip.count({ where: { organizationId, status: TripStatus.DISPATCHED } }),
    prisma.trip.count({ where: { organizationId, status: TripStatus.COMPLETED } }),
    prisma.trip.count({ where: { organizationId, status: TripStatus.CANCELLED } }),
  ]);

  return {
    scheduled,
    inProgress,
    completed,
    cancelled,
  };
}

export async function getTripById(organizationId: string, tripId: string) {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      organizationId,
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
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          licenseNumber: true,
          status: true,
          assignedVehicle: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      },
    },
  });
}

export type CreateTripInput = {
  organizationId: string;
  tripNumber: string;
  origin: string;
  destination: string;
  scheduledAt: Date;
  vehicleId?: string | null;
  driverId?: string | null;
  cargoWeightKg?: number | null;
  notes?: string | null;
};

export async function createTrip(input: CreateTripInput) {
  const existing = await prisma.trip.findUnique({
    where: {
      organizationId_tripNumber: {
        organizationId: input.organizationId,
        tripNumber: input.tripNumber,
      },
    },
  });

  if (existing) {
    throw new Error(`Trip number "${input.tripNumber}" already exists.`);
  }

  await ensureVehicleIsAssignable(input.organizationId, input.vehicleId);
  await ensureDriverIsAssignable(input.organizationId, input.driverId);

  return prisma.trip.create({
    data: {
      organizationId: input.organizationId,
      tripNumber: input.tripNumber,
      origin: input.origin,
      destination: input.destination,
      scheduledAt: input.scheduledAt,
      vehicleId: input.vehicleId ?? null,
      driverId: input.driverId ?? null,
      cargoWeightKg: input.cargoWeightKg ?? null,
      notes: input.notes ?? null,
      status: TripStatus.DRAFT,
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
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      },
    },
  });
}

export type UpdateTripInput = {
  organizationId: string;
  tripId: string;
  tripNumber: string;
  origin: string;
  destination: string;
  scheduledAt: Date;
  vehicleId?: string | null;
  driverId?: string | null;
  cargoWeightKg?: number | null;
  notes?: string | null;
};

export async function updateTripForOrganization(input: UpdateTripInput) {
  const existing = await prisma.trip.findFirst({
    where: {
      id: input.tripId,
      organizationId: input.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Trip not found.");
  }

  if (existing.status !== TripStatus.DRAFT) {
    throw new Error("Only scheduled trips can be edited.");
  }

  if (input.tripNumber !== existing.tripNumber) {
    const duplicate = await prisma.trip.findUnique({
      where: {
        organizationId_tripNumber: {
          organizationId: input.organizationId,
          tripNumber: input.tripNumber,
        },
      },
    });

    if (duplicate) {
      throw new Error(`Trip number "${input.tripNumber}" already exists.`);
    }
  }

  await ensureVehicleIsAssignable(input.organizationId, input.vehicleId, input.tripId);
  await ensureDriverIsAssignable(input.organizationId, input.driverId, input.tripId);

  return prisma.trip.update({
    where: {
      id: input.tripId,
    },
    data: {
      tripNumber: input.tripNumber,
      origin: input.origin,
      destination: input.destination,
      scheduledAt: input.scheduledAt,
      vehicleId: input.vehicleId ?? null,
      driverId: input.driverId ?? null,
      cargoWeightKg: input.cargoWeightKg ?? null,
      notes: input.notes ?? null,
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });
}

export async function startTrip(organizationId: string, tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findFirst({
      where: {
        id: tripId,
        organizationId,
      },
    });

    if (!trip) {
      throw new Error("Trip not found.");
    }

    if (trip.status !== TripStatus.DRAFT) {
      throw new Error("Only scheduled trips can be started.");
    }

    if (!trip.vehicleId || !trip.driverId) {
      throw new Error("Assign both a vehicle and a driver before starting the trip.");
    }

    const vehicle = await tx.vehicle.findFirst({
      where: {
        id: trip.vehicleId,
        organizationId,
      },
    });

    if (!vehicle) {
      throw new Error("Assigned vehicle was not found.");
    }

    if (vehicle.status !== "AVAILABLE") {
      throw new Error("Assigned vehicle is not available.");
    }

    const vehicleConflict = await tx.trip.findFirst({
      where: {
        organizationId,
        vehicleId: trip.vehicleId,
        id: { not: trip.id },
        status: {
          in: [...activeTripStatuses],
        },
      },
    });

    if (vehicleConflict) {
      throw new Error("Assigned vehicle already has an active trip.");
    }

    const driver = await tx.driver.findFirst({
      where: {
        id: trip.driverId,
        organizationId,
      },
    });

    if (!driver) {
      throw new Error("Assigned driver was not found.");
    }

    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error("Assigned driver is not available.");
    }

    if (driver.licenseExpiresAt && driver.licenseExpiresAt <= new Date()) {
      throw new Error("Assigned driver's license is expired.");
    }

    const driverConflict = await tx.trip.findFirst({
      where: {
        organizationId,
        driverId: trip.driverId,
        id: { not: trip.id },
        status: {
          in: [...activeTripStatuses],
        },
      },
    });

    if (driverConflict) {
      throw new Error("Assigned driver already has an active trip.");
    }

    await tx.vehicle.update({
      where: {
        id: trip.vehicleId,
      },
      data: {
        status: "ON_TRIP",
      },
    });

    await tx.driver.update({
      where: {
        id: trip.driverId,
      },
      data: {
        status: DriverStatus.ON_TRIP,
      },
    });

    return tx.trip.update({
      where: {
        id: tripId,
      },
      data: {
        status: TripStatus.DISPATCHED,
        startedAt: new Date(),
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
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });
  });
}

export async function completeTrip(organizationId: string, tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findFirst({
      where: {
        id: tripId,
        organizationId,
      },
    });

    if (!trip) {
      throw new Error("Trip not found.");
    }

    if (trip.status !== TripStatus.DISPATCHED) {
      throw new Error("Only in-progress trips can be completed.");
    }

    if (!trip.vehicleId || !trip.driverId) {
      throw new Error("This trip is missing its assigned vehicle or driver.");
    }

    await tx.vehicle.update({
      where: {
        id: trip.vehicleId,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    await tx.driver.update({
      where: {
        id: trip.driverId,
      },
      data: {
        status: DriverStatus.AVAILABLE,
      },
    });

    return tx.trip.update({
      where: {
        id: tripId,
      },
      data: {
        status: TripStatus.COMPLETED,
        completedAt: new Date(),
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
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });
  });
}

export async function cancelTrip(organizationId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      organizationId,
    },
  });

  if (!trip) {
    throw new Error("Trip not found.");
  }

  if (trip.status !== TripStatus.DRAFT) {
    throw new Error("Only scheduled trips can be cancelled.");
  }

  return prisma.trip.update({
    where: {
      id: tripId,
    },
    data: {
      status: TripStatus.CANCELLED,
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });
}

export async function deleteTripForOrganization(organizationId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      organizationId,
    },
  });

  if (!trip) {
    throw new Error("Trip not found.");
  }

  if (trip.status !== TripStatus.DRAFT && trip.status !== TripStatus.CANCELLED) {
    throw new Error("Only scheduled or cancelled trips can be deleted.");
  }

  await prisma.trip.delete({
    where: {
      id: tripId,
    },
  });

  return { success: true };
}

export async function getAvailableVehiclesForOrganization(organizationId: string) {
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

export async function getAvailableDriversForTrip(organizationId: string) {
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

export async function listTripActivityForOrganization(organizationId: string) {
  return prisma.trip.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 4,
    select: {
      id: true,
      tripNumber: true,
      origin: true,
      destination: true,
      status: true,
      scheduledAt: true,
      startedAt: true,
      completedAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          code: true,
        },
      },
      driver: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}
