import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createTrip,
  getAvailableDriversForTrip,
  getAvailableVehiclesForOrganization,
  getTripStats,
  listTripsForOrganization,
} from "@/lib/trips";

const tripSchema = z.object({
  tripNumber: z.string().min(2),
  origin: z.string().min(2),
  destination: z.string().min(2),
  scheduledAt: z.string().min(1),
  vehicleId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  cargoWeightKg: z.number().int().min(1).optional().nullable(),
  notes: z.string().optional().nullable(),
});

function parseRequiredDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid scheduled date.");
  }
  return parsed;
}

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to view trips." }, { status: 401 });
  }

  try {
    const [trips, stats, availableVehicles, availableDrivers] = await Promise.all([
      listTripsForOrganization(organizationId),
      getTripStats(organizationId),
      getAvailableVehiclesForOrganization(organizationId),
      getAvailableDriversForTrip(organizationId),
    ]);

    return NextResponse.json({ source: "database", trips, stats, availableVehicles, availableDrivers });
  } catch (error) {
    return NextResponse.json({ error: "Unable to retrieve trips." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to create trips." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = tripSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the trip form and try again." }, { status: 400 });
    }

    const trip = await createTrip({
      organizationId,
      tripNumber: parsed.data.tripNumber.trim(),
      origin: parsed.data.origin.trim(),
      destination: parsed.data.destination.trim(),
      scheduledAt: parseRequiredDate(parsed.data.scheduledAt),
      vehicleId: parsed.data.vehicleId?.trim() || null,
      driverId: parsed.data.driverId?.trim() || null,
      cargoWeightKg: parsed.data.cargoWeightKg ?? null,
      notes: parsed.data.notes?.trim() || null,
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save trip right now.";
    return NextResponse.json(
      { error: message },
      { status: message === "Invalid scheduled date." ? 400 : 500 },
    );
  }
}
