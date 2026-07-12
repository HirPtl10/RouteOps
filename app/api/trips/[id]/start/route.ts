import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { startTrip } from "@/lib/trips";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to start trips." }, { status: 401 });
  }

  try {
    const trip = await startTrip(organizationId, id);
    return NextResponse.json(trip);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start trip right now." },
      { status: 500 },
    );
  }
}
