import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const vehicleUpdateSchema = z.object({
  code: z.string().min(3).max(12),
  vin: z.string().max(17).optional().or(z.literal("")),
  plateNumber: z.string().min(4).max(15),
  make: z.string().min(2),
  model: z.string().min(2),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  capacityKg: z.coerce.number().int().min(100),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  const whereClause = organizationId ? { id, organizationId } : { id };
  const vehicle = await prisma.vehicle.findFirst({ where: whereClause });

  if (!vehicle) {
    const fallback = [
      { id: "v1", code: "V-1001", vin: "1FM5K8F82HGD8201", plateNumber: "TN-01-AB-1234", make: "Tata", model: "Prima 4925.S", year: 2022, capacityKg: 25000, status: "AVAILABLE" },
      { id: "v2", code: "V-1002", vin: "5XXG24H12JHG9312", plateNumber: "TN-02-CD-5678", make: "Ashok Leyland", model: "U-3518", year: 2021, capacityKg: 18000, status: "ON_TRIP" },
      { id: "v3", code: "V-1003", vin: "1GCVKREC3HFK1284", plateNumber: "MH-03-EF-9012", make: "BharatBenz", model: "2823C", year: 2023, capacityKg: 16000, status: "IN_SHOP" },
      { id: "v4", code: "V-1004", vin: "JN8AS5MW9HJK3918", plateNumber: "GJ-04-GH-3456", make: "Mahindra", model: "Blazo X 49", year: 2020, capacityKg: 28000, status: "AVAILABLE" },
      { id: "v5", code: "V-1005", vin: "1FA6P8CF4GHK8210", plateNumber: "DL-01-JK-7890", make: "Eicher", model: "Pro 6048", year: 2019, capacityKg: 24000, status: "RETIRED" },
    ].find((item) => item.id === id);

    if (fallback) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json(vehicle);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to update vehicles." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = vehicleUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the vehicle form and try again." }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.updateMany({
      where: { id, organizationId },
      data: {
        code: parsed.data.code.trim(),
        vin: parsed.data.vin?.trim() || null,
        plateNumber: parsed.data.plateNumber.trim(),
        make: parsed.data.make.trim(),
        model: parsed.data.model.trim(),
        year: parsed.data.year,
        capacityKg: parsed.data.capacityKg,
        status: parsed.data.status,
      },
    });

    if (vehicle.count === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const updatedVehicle = await prisma.vehicle.findFirst({
      where: { id, organizationId },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    return NextResponse.json({ error: "Unable to update vehicle right now." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to delete vehicles." }, { status: 401 });
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, organizationId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const [tripCount, assignedDriverCount] = await Promise.all([
      prisma.trip.count({
        where: { organizationId, vehicleId: id },
      }),
      prisma.driver.count({
        where: { organizationId, assignedVehicleId: id },
      }),
    ]);

    if (tripCount > 0 || assignedDriverCount > 0) {
      return NextResponse.json(
        { error: "This vehicle is linked to trip or driver history and cannot be deleted." },
        { status: 409 },
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to delete vehicle right now." }, { status: 500 });
  }
}
