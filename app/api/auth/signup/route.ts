import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const signupSchema = z.object({
  organizationName: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the signup form and try again." }, { status: 400 });
    }

    const { organizationName, name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (transaction) => {
      const organization = await transaction.organization.create({
        data: {
          name: organizationName.trim(),
        },
      });

      return transaction.user.create({
        data: {
          organizationId: organization.id,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "FLEET_MANAGER",
        },
        select: {
          id: true,
          email: true,
          name: true,
          organizationId: true,
          role: true,
        },
      });
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That account or organization already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to create account right now." }, { status: 500 });
  }
}
