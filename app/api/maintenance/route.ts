import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { 
  listMaintenanceLogs, 
  createMaintenanceLog, 
  getMaintenanceStats 
} from "@/lib/maintenance";

const logSchema = z.object({
  vehicleId: z.string(),
  description: z.string().min(3),
  cost: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to see maintenance logs." }, { status: 401 });
  }

  try {
    const logs = await listMaintenanceLogs(organizationId);
    const stats = await getMaintenanceStats(organizationId);
    return NextResponse.json({ source: "database", logs, stats });
  } catch (error) {
    return NextResponse.json({ error: "Unable to retrieve maintenance logs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to log maintenance." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = logSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the maintenance form and try again." }, { status: 400 });
    }

    const log = await createMaintenanceLog({
      organizationId,
      vehicleId: parsed.data.vehicleId,
      description: parsed.data.description,
      cost: parsed.data.cost,
      notes: parsed.data.notes,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to save maintenance log." }, { status: 500 });
  }
}
