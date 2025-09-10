// app/api/fund/transactions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";

export async function DELETE(_req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string } | Promise<{ id: string }>);
  await requirePermission(Permission.MANAGE_FINANCES);

  const tx = await prisma.classFundTransaction.findUnique({ where: { id }, select: { id: true } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.classFundTransaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
