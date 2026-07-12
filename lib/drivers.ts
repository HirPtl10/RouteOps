import { prisma } from "./prisma";

export async function listDriversForOrganization(organizationId: string) {
  return prisma.driver.findMany({
    where: {
      organizationId,
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
      licenseExpiresAt: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type CreateDriverInput = {
  organizationId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiresAt?: Date | null;
  phone?: string | null;
};

export async function createDriverForOrganization(input: CreateDriverInput) {
  return prisma.driver.create({
    data: {
      organizationId: input.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      licenseNumber: input.licenseNumber,
      licenseExpiresAt: input.licenseExpiresAt ?? null,
      phone: input.phone ?? null,
    },
  });
}
