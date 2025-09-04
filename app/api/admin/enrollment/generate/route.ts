import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const entry = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().max(100).optional().default(""),
});
const bodySchema = z.object({
  rows: z.array(entry).min(1).max(1000),
  daysValid: z.number().int().min(1).max(180).default(14),
});

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export async function POST(req: Request) {
  // Guard: only users with MANAGE_ENROLLMENT
  await requirePermission(Permission.MANAGE_ENROLLMENT);

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { rows, daysValid } = parsed.data;

  const expires = addDays(new Date(), daysValid);
  const out: Array<{ email: string; name: string; code: string; expires: string }> = [];

  for (const { email, name } of rows) {
    // Create user if missing, ensure STUDENT role
    await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined, role: "STUDENT" },
      create: { email, name: name || email.split("@")[0], role: "STUDENT" },
    });

    // Invalidate previous tokens
    await prisma.enrollmentToken.deleteMany({ where: { email } });

    // Make pretty code: e.g., "A1B2-C3D4"
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 hex chars
    const pretty = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    const tokenHash = await bcrypt.hash(pretty, 10);

    await prisma.enrollmentToken.create({
      data: { email, tokenHash, expires },
    });

    out.push({ email, name: name || "", code: pretty, expires: expires.toISOString() });
  }

  return NextResponse.json({ results: out });
}
