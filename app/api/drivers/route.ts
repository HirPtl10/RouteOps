import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createDriverForOrganization,
  getAvailableVehiclesForAssignment,
  getDriverStats,
  listDriversForOrganization,
} from "@/lib/drivers";

const driverSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseExpiresAt: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).optional(),
  assignedVehicleId: z.string().optional().nullable(),
});

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value.");
  }
  return parsed;
}

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to view drivers." }, { status: 401 });
  }

  try {
    const [drivers, stats, availableVehicles] = await Promise.all([
      listDriversForOrganization(organizationId),
      getDriverStats(organizationId),
      getAvailableVehiclesForAssignment(organizationId),
    ]);

    return NextResponse.json({ source: "database", drivers, stats, availableVehicles });
  } catch (error) {
    return NextResponse.json({ error: "Unable to retrieve drivers." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to add drivers." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = driverSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the driver form and try again." }, { status: 400 });
    }

    const driver = await createDriverForOrganization({
      organizationId,
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      licenseNumber: parsed.data.licenseNumber.trim(),
      licenseExpiresAt: parseOptionalDate(parsed.data.licenseExpiresAt),
      phone: parsed.data.phone?.trim() || null,
      status: parsed.data.status,
      assignedVehicleId: parsed.data.assignedVehicleId?.trim() || null,
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save driver right now.";
    return NextResponse.json(
      { error: message },
      { status: message === "Invalid date value." ? 400 : 500 },
    );
  }
}
