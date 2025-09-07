// app/api/confessions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";

// DELETE /api/confessions/:id
export async function DELETE(_req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string } | Promise<{ id: string }>);
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const confession = await prisma.confession.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!confession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canModerate = perms.has(Permission.MODERATE_CONFESSIONS);
  const isAuthor = confession.authorId === userId;

  if (!(canModerate || isAuthor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.confession.delete({ where: { id } }); // likes/reports cascade

  return NextResponse.json({ ok: true });
}
