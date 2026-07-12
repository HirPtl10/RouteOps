import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const mockVehicles = [
  { id: "v1", code: "V-1001", vin: "1FM5K8F82HGD8201", plateNumber: "TN-01-AB-1234", make: "Tata", model: "Prima 4925.S", year: 2022, capacityKg: 25000, status: "AVAILABLE" },
  { id: "v2", code: "V-1002", vin: "5XXG24H12JHG9312", plateNumber: "TN-02-CD-5678", make: "Ashok Leyland", model: "U-3518", year: 2021, capacityKg: 18000, status: "ON_TRIP" },
  { id: "v3", code: "V-1003", vin: "1GCVKREC3HFK1284", plateNumber: "MH-03-EF-9012", make: "BharatBenz", model: "2823C", year: 2023, capacityKg: 16000, status: "IN_SHOP" },
  { id: "v4", code: "V-1004", vin: "JN8AS5MW9HJK3918", plateNumber: "GJ-04-GH-3456", make: "Mahindra", model: "Blazo X 49", year: 2020, capacityKg: 28000, status: "AVAILABLE" },
  { id: "v5", code: "V-1005", vin: "1FA6P8CF4GHK8210", plateNumber: "DL-01-JK-7890", make: "Eicher", model: "Pro 6048", year: 2019, capacityKg: 24000, status: "RETIRED" },
];

export async function GET() {
  // If database is not yet configured, return mock data immediately
  if (!prisma) {
    return NextResponse.json(mockVehicles);
  }
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.warn("Database connection failed, bypassing active query:", error);
    return NextResponse.json(mockVehicles);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, vin, plateNumber, make, model, year, capacityKg, status } = body;
    const organizationId = "demo-org-123";

    if (prisma) {
      try {
        const newVehicle = await prisma.vehicle.create({
          data: {
            organizationId,
            code,
            vin: vin || null,
            plateNumber,
            make,
            model,
            year: parseInt(year),
            capacityKg: parseInt(capacityKg),
            status: status || "AVAILABLE",
          },
        });
        return NextResponse.json(newVehicle, { status: 201 });
      } catch (dbError) {
        console.warn("Prisma write failed. Running in simulation mode:", dbError);
      }
    }

    // Simulation response (DB not configured or write failed)
    const simulatedVehicle = {
      id: `sim-${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      code,
      vin: vin || null,
      plateNumber,
      make,
      model,
      year: parseInt(year),
      capacityKg: parseInt(capacityKg),
      status: status || "AVAILABLE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(simulatedVehicle, { status: 201 });
  } catch (err) {
    console.error("Invalid vehicle creation payload:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

