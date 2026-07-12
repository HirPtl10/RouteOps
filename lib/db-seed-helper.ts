import { prisma } from "./prisma";

export interface MockVehicle {
  id: string;
  code: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
}

export interface MockMaintenanceLog {
  id: string;
  vehicleId: string;
  openedAt: Date;
  closedAt: Date | null;
  description: string;
  cost: number | null;
  notes: string | null;
  vehicle: MockVehicle;
}

// In-memory mock fallbacks if the database is not configured/connected
export const MOCK_VEHICLES: MockVehicle[] = [
  {
    id: "mock-v1",
    code: "V-1001",
    plateNumber: "TX-9988",
    make: "Freightliner",
    model: "Cascadia",
    year: 2022,
    status: "AVAILABLE",
  },
  {
    id: "mock-v2",
    code: "V-1002",
    plateNumber: "CA-1122",
    make: "Volvo",
    model: "VNL 860",
    year: 2021,
    status: "IN_SHOP",
  },
  {
    id: "mock-v3",
    code: "V-1003",
    plateNumber: "NV-7744",
    make: "Peterbilt",
    model: "579",
    year: 2023,
    status: "ON_TRIP",
  },
];

export const MOCK_MAINTENANCE_LOGS: MockMaintenanceLog[] = [
  {
    id: "mock-m1",
    vehicleId: "mock-v2",
    openedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    closedAt: null,
    description: "Transmission fluid leak repair and gear inspection",
    cost: null,
    notes: "Waiting for replacement seal part from vendor.",
    vehicle: MOCK_VEHICLES[1],
  },
  {
    id: "mock-m2",
    vehicleId: "mock-v1",
    openedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    closedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    description: "Standard 50,000-mile engine service and oil change",
    cost: 350.00,
    notes: "All filters replaced. Brakes are at 70% life.",
    vehicle: MOCK_VEHICLES[0],
  },
  {
    id: "mock-m3",
    vehicleId: "mock-v3",
    openedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    closedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    description: "Replaced faulty alternator and battery terminals",
    cost: 580.00,
    notes: "Electrical charging system tested and passed.",
    vehicle: MOCK_VEHICLES[2],
  },
];

/**
 * Checks if the database is configured and reachable.
 * If reachable but empty, it seeds the initial organization, vehicles, and logs.
 * Returns true if DB is connected and ready, false if we should fall back to mock data.
 */
export async function ensureSeedData(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Falling back to mock data.");
    return false;
  }

  try {
    // Check if we can connect and if an organization exists
    const orgCount = await prisma.organization.count();
    
    if (orgCount > 0) {
      return true; // Already seeded
    }

    console.log("Database empty. Auto-seeding initial Logistics organization...");
    
    // Seed using a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: "TransitOps Logistics",
        },
      });

      // 2. Create Vehicles
      const v1 = await tx.vehicle.create({
        data: {
          organizationId: org.id,
          code: "V-1001",
          plateNumber: "TX-9988",
          make: "Freightliner",
          model: "Cascadia",
          year: 2022,
          status: "AVAILABLE",
        },
      });

      const v2 = await tx.vehicle.create({
        data: {
          organizationId: org.id,
          code: "V-1002",
          plateNumber: "CA-1122",
          make: "Volvo",
          model: "VNL 860",
          year: 2021,
          status: "IN_SHOP",
        },
      });

      const v3 = await tx.vehicle.create({
        data: {
          organizationId: org.id,
          code: "V-1003",
          plateNumber: "NV-7744",
          make: "Peterbilt",
          model: "579",
          year: 2023,
          status: "ON_TRIP",
        },
      });

      // 3. Create Maintenance Logs
      await tx.maintenanceLog.create({
        data: {
          organizationId: org.id,
          vehicleId: v2.id,
          openedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          closedAt: null,
          description: "Transmission fluid leak repair and gear inspection",
          cost: null,
          notes: "Waiting for replacement seal part from vendor.",
        },
      });

      await tx.maintenanceLog.create({
        data: {
          organizationId: org.id,
          vehicleId: v1.id,
          openedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          closedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          description: "Standard 50,000-mile engine service and oil change",
          cost: 350.00,
          notes: "All filters replaced. Brakes are at 70% life.",
        },
      });

      await tx.maintenanceLog.create({
        data: {
          organizationId: org.id,
          vehicleId: v3.id,
          openedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          closedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          description: "Replaced faulty alternator and battery terminals",
          cost: 580.00,
          notes: "Electrical charging system tested and passed.",
        },
      });
    });

    console.log("Seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Failed to connect or seed database. Falling back to mock data:", error);
    return false;
  }
}
