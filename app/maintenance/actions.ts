"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { MOCK_VEHICLES, MOCK_MAINTENANCE_LOGS } from "../../lib/db-seed-helper";

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle selection is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  openedAt: z.string().min(1, "Opened date is required"),
  cost: z.number().nullable().optional(),
  notes: z.string().optional(),
});

export async function createMaintenanceLog(prevState: any, formData: FormData) {
  const rawVehicleId = formData.get("vehicleId") as string;
  const rawDescription = formData.get("description") as string;
  const rawOpenedAt = formData.get("openedAt") as string;
  const rawCost = formData.get("cost") as string;
  const rawNotes = formData.get("notes") as string;

  const validated = schema.safeParse({
    vehicleId: rawVehicleId,
    description: rawDescription,
    openedAt: rawOpenedAt,
    cost: rawCost === "" ? null : Number(rawCost),
    notes: rawNotes,
  });

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  let success = false;

  // Verify DB configuration
  if (!process.env.DATABASE_URL) {
    console.warn("No DATABASE_URL set. Simulating maintenance log creation in-memory.");
    
    const mockVehicle = MOCK_VEHICLES.find((v) => v.id === data.vehicleId);
    if (mockVehicle) {
      // 1. Set mock vehicle status to IN_SHOP
      mockVehicle.status = "IN_SHOP";

      // 2. Add log entry
      MOCK_MAINTENANCE_LOGS.unshift({
        id: `mock-m-${Date.now()}`,
        vehicleId: data.vehicleId,
        openedAt: new Date(data.openedAt),
        closedAt: null,
        description: data.description,
        cost: data.cost,
        notes: data.notes || null,
        vehicle: mockVehicle,
      });
      success = true;
    } else {
      return {
        success: false,
        error: "Selected vehicle not found in mock cache.",
      };
    }
  } else {
    try {
      const session = await auth();
      let organizationId: string | null = null;

      if (session?.user?.email) {
        const userObj = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { organizationId: true },
        });
        if (userObj) organizationId = userObj.organizationId;
      }

      if (!organizationId) {
        const firstOrg = await prisma.organization.findFirst({
          select: { id: true },
        });
        if (firstOrg) organizationId = firstOrg.id;
      }

      if (!organizationId) {
        return {
          success: false,
          error: "Organization not found.",
        };
      }

      // Run Transaction: Create log + set vehicle status to IN_SHOP
      await prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.findFirst({
          where: { id: data.vehicleId, organizationId },
        });

        if (!vehicle) {
          throw new Error("Vehicle not found in organization.");
        }

        // Create log
        await tx.maintenanceLog.create({
          data: {
            organizationId,
            vehicleId: data.vehicleId,
            description: data.description,
            openedAt: new Date(data.openedAt),
            closedAt: null,
            cost: data.cost,
            notes: data.notes || null,
          },
        });

        // Set vehicle IN_SHOP
        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { status: "IN_SHOP" },
        });
      });

      success = true;
    } catch (error: any) {
      console.error("Failed to create maintenance log:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred during creation.",
      };
    }
  }

  if (success) {
    revalidatePath("/maintenance");
    redirect("/maintenance");
  }
}
