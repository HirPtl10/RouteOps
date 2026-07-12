import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  deleteDriverForOrganization,
  getDriverById,
  updateDriverForOrganization,
} from "@/lib/drivers";

const driverUpdateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseExpiresAt: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]),
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to view drivers." }, { status: 401 });
  }

  const driver = await getDriverById(organizationId, id);

  if (!driver) {
    return NextResponse.json({ error: "Driver not found." }, { status: 404 });
  }

  return NextResponse.json(driver);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to update drivers." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = driverUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the driver form and try again." }, { status: 400 });
    }

    const driver = await updateDriverForOrganization({
      organizationId,
      driverId: id,
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      licenseNumber: parsed.data.licenseNumber.trim(),
      licenseExpiresAt: parseOptionalDate(parsed.data.licenseExpiresAt),
      phone: parsed.data.phone?.trim() || null,
      status: parsed.data.status,
      assignedVehicleId: parsed.data.assignedVehicleId?.trim() || null,
    });

    return NextResponse.json(driver);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update driver right now.";
    return NextResponse.json(
      { error: message },
      { status: message === "Invalid date value." ? 400 : 500 },
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
    return NextResponse.json({ error: "Please sign in to delete drivers." }, { status: 401 });
  }

  try {
    const result = await deleteDriverForOrganization(organizationId, id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete driver right now." },
      { status: 500 },
    );
  }
}
