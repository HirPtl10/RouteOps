import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.warn("Database connection failed, bypassing active query:", error);
    return NextResponse.json({ error: "Database offline" }, { status: 503 });
  }
}
