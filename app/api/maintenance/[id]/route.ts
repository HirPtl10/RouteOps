import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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
    // Find the log first to know which vehicle it is associated with and if it was open
    const log = await prisma.maintenanceLog.findFirst({
      where: { id, organizationId },
    });

    if (!log) {
      return NextResponse.json({ error: "Maintenance log not found." }, { status: 404 });
    }

    // Delete the log
    await prisma.maintenanceLog.delete({
      where: { id },
    });

    // If the log was open (closedAt is null), transition the vehicle back to AVAILABLE
    if (!log.closedAt) {
      await prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to delete maintenance log." }, { status: 500 });
  }
}
