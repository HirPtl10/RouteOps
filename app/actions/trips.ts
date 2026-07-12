"use server";

import { createTrip } from "../../lib/trips";
import { assertUserRole } from "../../lib/rbac";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createTripAction(formData: {
  tripNumber: string;
  origin: string;
  destination: string;
  scheduledAt: string;
  vehicleId?: string | null;
  driverId?: string | null;
  cargoWeightKg?: number | null;
  notes?: string | null;
}) {
  try {
    // Assert authorization: only FLEET_MANAGER and DISPATCHER roles can create trips
    const session = await assertUserRole([Role.FLEET_MANAGER, Role.DISPATCHER]);
    const organizationId = session.user.organizationId;

    if (!organizationId) {
      return {
        success: false,
        error: "Organization association missing from session.",
      };
    }

    await createTrip({
      organizationId,
      tripNumber: formData.tripNumber,
      origin: formData.origin,
      destination: formData.destination,
      scheduledAt: new Date(formData.scheduledAt),
      vehicleId: formData.vehicleId,
      driverId: formData.driverId,
      cargoWeightKg: formData.cargoWeightKg,
      notes: formData.notes,
    });

    revalidatePath("/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create trip:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}
