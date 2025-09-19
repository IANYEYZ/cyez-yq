// app/api/announcements/[id]/pin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const bodySchema = z.object({ pinned: z.boolean() });

export async function POST(req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string });
  await requirePermission(Permission.MANAGE_ANNOUNCEMENTS);

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { pinned } = parsed.data;

  const ann = await prisma.announcement.findUnique({ where: { id }, select: { id: true } });
  if (!ann) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.announcement.update({
    where: { id },
    data: {
      pinned,
      pinnedAt: pinned ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
