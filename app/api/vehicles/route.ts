import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockVehicles = [
  { id: "v1", code: "V-1001", vin: "1FM5K8F82HGD8201", plateNumber: "TN-01-AB-1234", make: "Tata", model: "Prima 4925.S", year: 2022, capacityKg: 25000, status: "AVAILABLE" },
  { id: "v2", code: "V-1002", vin: "5XXG24H12JHG9312", plateNumber: "TN-02-CD-5678", make: "Ashok Leyland", model: "U-3518", year: 2021, capacityKg: 18000, status: "ON_TRIP" },
  { id: "v3", code: "V-1003", vin: "1GCVKREC3HFK1284", plateNumber: "MH-03-EF-9012", make: "BharatBenz", model: "2823C", year: 2023, capacityKg: 16000, status: "IN_SHOP" },
  { id: "v4", code: "V-1004", vin: "JN8AS5MW9HJK3918", plateNumber: "GJ-04-GH-3456", make: "Mahindra", model: "Blazo X 49", year: 2020, capacityKg: 28000, status: "AVAILABLE" },
  { id: "v5", code: "V-1005", vin: "1FA6P8CF4GHK8210", plateNumber: "DL-01-JK-7890", make: "Eicher", model: "Pro 6048", year: 2019, capacityKg: 24000, status: "RETIRED" },
];

const vehicleSchema = z.object({
  code: z.string().min(3).max(12),
  vin: z.string().max(17).optional().or(z.literal("")),
  plateNumber: z.string().min(4).max(15),
  make: z.string().min(2),
  model: z.string().min(2),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  capacityKg: z.coerce.number().int().min(100),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).default("AVAILABLE"),
});

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ source: "mock", vehicles: mockVehicles });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ source: "database", vehicles });
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to add vehicles." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = vehicleSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the vehicle form and try again." }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        organizationId,
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

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to save vehicle right now." }, { status: 500 });
  }
}
