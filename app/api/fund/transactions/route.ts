import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const postSchema = z.object({
  // amount in decimal string or number, e.g., "12.34" or -5
  amount: z.union([z.number(), z.string()]),
  memo: z.string().trim().max(200).optional().or(z.literal("")),
});

function toCents(v: string | number): number {
  if (typeof v === "number") return Math.round(v * 100);
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  return Math.round(n * 100);
}

export async function GET() {
  await requireUser();
  const txs = await prisma.classFundTransaction.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, amountCents: true, memo: true, createdAt: true, createdById: true },
  });
  return NextResponse.json({ transactions: txs });
}

export async function POST(req: Request) {
  const session = await requirePermission(Permission.MANAGE_FINANCES);
  const userId = (session!.user as any).id as string;

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  let amountCents: number;
  try {
    amountCents = toCents(parsed.data.amount);
  } catch {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (amountCents === 0) return NextResponse.json({ error: "Amount cannot be zero" }, { status: 400 });

  const tx = await prisma.classFundTransaction.create({
    data: {
      amountCents,
      memo: parsed.data.memo || null,
      createdById: userId,
    },
  });

  return NextResponse.json({ ok: true, id: tx.id });
}
