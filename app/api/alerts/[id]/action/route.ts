import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { closeMaintenanceLog } from "@/lib/maintenance";
import { DriverStatus, VehicleStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    if (action === "resolve") {
      if (id.startsWith("alert-maintenance-")) {
        const logId = id.replace("alert-maintenance-", "");
        await closeMaintenanceLog(logId, organizationId);
      } else if (id.startsWith("alert-breakdown-")) {
        const vehicleId = id.replace("alert-breakdown-", "");
        await prisma.vehicle.update({
          where: { id: vehicleId, organizationId },
          data: { status: VehicleStatus.AVAILABLE },
        });
      } else if (id.startsWith("alert-suspended-")) {
        const driverId = id.replace("alert-suspended-", "");
        await prisma.driver.update({
          where: { id: driverId, organizationId },
          data: { status: DriverStatus.AVAILABLE },
        });
      } else if (id.startsWith("alert-license-expired-") || id.startsWith("alert-license-soon-")) {
        const driverId = id.replace("alert-license-expired-", "").replace("alert-license-soon-", "");
        // Set license to expire in 1 year
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        await prisma.driver.update({
          where: { id: driverId, organizationId },
          data: { licenseExpiresAt: nextYear },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process alert action." }, { status: 500 });
  }
}
