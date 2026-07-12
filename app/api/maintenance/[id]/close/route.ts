import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { closeMaintenanceLog } from "@/lib/maintenance";

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
    const log = await closeMaintenanceLog(id, organizationId);
    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to close maintenance log." }, { status: 500 });
  }
}
