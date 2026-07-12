import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockExpenses = [
  { id: "e1", type: "FUEL", description: "Fuel Refill for TRP-1001", amount: 90.0, liters: 15.2, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), vehicleCode: "V-1001" },
  { id: "e2", type: "MAINTENANCE", description: "Engine Service & Filter replacement", amount: 350.0, date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), vehicleCode: "V-1001" },
  { id: "e3", type: "TOLL", description: "Highway Toll Charges", amount: 45.0, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), vehicleCode: "V-1003" },
];

const expenseSchema = z.object({
  type: z.enum(["FUEL", "TOLL", "MAINTENANCE", "OTHER"]),
  vehicleId: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  liters: z.coerce.number().min(0).optional(), // only for FUEL
  description: z.string().min(3),
  date: z.string().transform((val) => new Date(val)),
});

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ source: "mock", expenses: mockExpenses });
  }

  try {
    const [fuelLogs, expenses] = await Promise.all([
      prisma.fuelLog.findMany({
        where: { organizationId },
        include: { vehicle: true },
        orderBy: { fueledAt: "desc" },
      }),
      prisma.expense.findMany({
        where: { organizationId },
        include: { vehicle: true },
        orderBy: { incurredAt: "desc" },
      }),
    ]);

    // Format and merge them
    const formattedFuel = fuelLogs.map((log) => ({
      id: log.id,
      type: "FUEL",
      description: log.notes || `Fuel refill (${log.liters} L)`,
      amount: Number(log.totalCost),
      liters: Number(log.liters),
      date: log.fueledAt.toISOString(),
      vehicleCode: log.vehicle?.code || "—",
    }));

    const formattedExpenses = expenses.map((exp) => ({
      id: exp.id,
      type: exp.description.toLowerCase().includes("toll") ? "TOLL" : exp.description.toLowerCase().includes("maintenance") ? "MAINTENANCE" : "OTHER",
      description: exp.description,
      amount: Number(exp.amount),
      date: exp.incurredAt.toISOString(),
      vehicleCode: exp.vehicle?.code || "—",
    }));

    const merged = [...formattedFuel, ...formattedExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ source: "database", expenses: merged });
  } catch (error) {
    return NextResponse.json({ source: "mock", expenses: mockExpenses });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "Please sign in to log expenses." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = expenseSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the expense details and try again." }, { status: 400 });
    }

    const { type, vehicleId, amount, liters, description, date } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      if (type === "FUEL") {
        const litersVal = liters || 0;
        const fuelLog = await tx.fuelLog.create({
          data: {
            organizationId,
            vehicleId,
            liters: litersVal,
            totalCost: amount,
            fueledAt: date,
            notes: description.trim(),
          },
        });

        return tx.expense.create({
          data: {
            organizationId,
            vehicleId,
            fuelLogId: fuelLog.id,
            description: `Fuel refill (${litersVal} L) - ${description.trim()}`,
            amount,
            incurredAt: date,
          },
        });
      } else {
        return tx.expense.create({
          data: {
            organizationId,
            vehicleId,
            description: description.trim(),
            amount,
            incurredAt: date,
          },
        });
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to log expense right now." }, { status: 500 });
  }
}
