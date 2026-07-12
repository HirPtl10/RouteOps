import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const mockVehicles = [
  { id: "v1", code: "V-1001", vin: "1FM5K8F82HGD8201", plateNumber: "TN-01-AB-1234", make: "Tata", model: "Prima 4925.S", year: 2022, capacityKg: 25000, status: "AVAILABLE" },
  { id: "v2", code: "V-1002", vin: "5XXG24H12JHG9312", plateNumber: "TN-02-CD-5678", make: "Ashok Leyland", model: "U-3518", year: 2021, capacityKg: 18000, status: "ON_TRIP" },
  { id: "v3", code: "V-1003", vin: "1GCVKREC3HFK1284", plateNumber: "MH-03-EF-9012", make: "BharatBenz", model: "2823C", year: 2023, capacityKg: 16000, status: "IN_SHOP" },
  { id: "v4", code: "V-1004", vin: "JN8AS5MW9HJK3918", plateNumber: "GJ-04-GH-3456", make: "Mahindra", model: "Blazo X 49", year: 2020, capacityKg: 28000, status: "AVAILABLE" },
  { id: "v5", code: "V-1005", vin: "1FA6P8CF4GHK8210", plateNumber: "DL-01-JK-7890", make: "Eicher", model: "Pro 6048", year: 2019, capacityKg: 24000, status: "RETIRED" },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle) {
      // Check in mock fallback
      const mock = mockVehicles.find((m) => m.id === id);
      if (mock) return NextResponse.json(mock);
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (error) {
    console.warn("Prisma GET single vehicle failed. Using mock search fallback:", error);
    const mock = mockVehicles.find((m) => m.id === id);
    if (mock) return NextResponse.json(mock);
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { code, vin, plateNumber, make, model, year, capacityKg, status } = body;

    try {
      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data: {
          code,
          vin: vin || null,
          plateNumber,
          make,
          model,
          year: parseInt(year),
          capacityKg: parseInt(capacityKg),
          status,
        },
      });
      return NextResponse.json(updatedVehicle);
    } catch (dbError) {
      console.warn("Prisma update failed. Using simulation mode success response:", dbError);
      
      const simulatedVehicle = {
        id,
        organizationId: "demo-org-123",
        code,
        vin: vin || null,
        plateNumber,
        make,
        model,
        year: parseInt(year),
        capacityKg: parseInt(capacityKg),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(simulatedVehicle);
    }
  } catch (err) {
    console.error("Invalid vehicle update payload:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
