// app/api/votes/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";

export async function DELETE(_req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string });
  await requirePermission(Permission.MANAGE_POLLS);

  const poll = await prisma.poll.findUnique({ where: { id }, select: { id: true } });
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.poll.delete({ where: { id } }); // options & votes cascade
  return NextResponse.json({ ok: true });
}

// (optional niceties)
export async function GET() {
  return NextResponse.json({ ok: true, hint: "Use DELETE to remove a poll." });
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
