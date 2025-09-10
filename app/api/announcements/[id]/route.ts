// app/api/announcements/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";

export async function DELETE(_req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string } | Promise<{ id: string }>);
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const ann = await prisma.announcement.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!ann) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canManage = perms.has(Permission.MANAGE_ANNOUNCEMENTS);
  const isAuthor = ann.authorId === userId;

  if (!(canManage || isAuthor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
