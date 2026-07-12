import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { deleteTripForOrganization, getTripById, updateTripForOrganization } from "@/lib/trips";

const tripUpdateSchema = z.object({
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to view trips." }, { status: 401 });
  }

  const trip = await getTripById(organizationId, id);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to update trips." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = tripUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the trip form and try again." }, { status: 400 });
    }

    const trip = await updateTripForOrganization({
      organizationId,
      tripId: id,
      tripNumber: parsed.data.tripNumber.trim(),
      origin: parsed.data.origin.trim(),
      destination: parsed.data.destination.trim(),
      scheduledAt: parseRequiredDate(parsed.data.scheduledAt),
      vehicleId: parsed.data.vehicleId?.trim() || null,
      driverId: parsed.data.driverId?.trim() || null,
      cargoWeightKg: parsed.data.cargoWeightKg ?? null,
      notes: parsed.data.notes?.trim() || null,
    });

    return NextResponse.json(trip);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update trip right now.";
    return NextResponse.json(
      { error: message },
      { status: message === "Invalid scheduled date." ? 400 : 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to delete trips." }, { status: 401 });
  }

  try {
    const result = await deleteTripForOrganization(organizationId, id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete trip right now." },
      { status: 500 },
    );
  }
}
