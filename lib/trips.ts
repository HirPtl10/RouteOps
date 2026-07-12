import { prisma } from "./prisma";
import { TripStatus } from "@prisma/client";

export async function listTripsForOrganization(organizationId: string) {
  return prisma.trip.findMany({
    where: {
      organizationId,
    },
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export type CreateTripInput = {
  organizationId: string;
  tripNumber: string;
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

  return prisma.trip.create({
    data: {
      organizationId: input.organizationId,
      tripNumber: input.tripNumber,
      vehicleId: input.vehicleId || null,
      driverId: input.driverId || null,
      cargoWeightKg: input.cargoWeightKg || null,
      notes: input.notes || null,
      status: TripStatus.DRAFT,
    },
  });
}

export async function getAvailableVehicles(organizationId: string) {
  return prisma.vehicle.findMany({
    where: {
      organizationId,
      status: "AVAILABLE",
    },
    orderBy: {
      code: "asc",
    },
  });
}

export async function getAvailableDrivers(organizationId: string) {
  return prisma.driver.findMany({
    where: {
      organizationId,
      status: "AVAILABLE",
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
    orderBy: {
      lastName: "asc",
    },
  });
}
