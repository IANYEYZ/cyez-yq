import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const editSchema = z.object({ title: z.string().trim().min(3).max(200) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const thread = await prisma.discussionThread.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canModerate = perms.has(Permission.MANAGE_DISCUSSIONS);
  if (!(canModerate || thread.createdById === userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid title" }, { status: 400 });

  await prisma.discussionThread.update({
    where: { id: params.id },
    data: { title: parsed.data.title },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const thread = await prisma.discussionThread.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canModerate = perms.has(Permission.MANAGE_DISCUSSIONS);
  if (!(canModerate || thread.createdById === userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cascade delete posts (DB will handle ON DELETE if set; otherwise deleteMany first)
  await prisma.post.deleteMany({ where: { threadId: params.id } });
  await prisma.discussionThread.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
