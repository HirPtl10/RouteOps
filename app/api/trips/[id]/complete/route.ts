import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { completeTrip } from "@/lib/trips";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to complete trips." }, { status: 401 });
  }

  try {
    const trip = await completeTrip(organizationId, id);
    return NextResponse.json(trip);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete trip right now." },
      { status: 500 },
    );
  }
}
