import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const editSchema = z.object({
  content: z.string().trim().min(1).max(10_000),
});

// PATCH /api/discussions/posts/:id  -> edit content
export async function PATCH(req: Request, context: any) {
  const params = (await context).params
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canModerate = perms.has(Permission.MANAGE_DISCUSSIONS);

  if (!(canModerate || post.authorId === userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid content" }, { status: 400 });

  await prisma.post.update({
    where: { id: params.id },
    data: { content: parsed.data.content },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/discussions/posts/:id
export async function DELETE(_req: Request, context: any) {
  const params = (await context).params
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true, threadId: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canModerate = perms.has(Permission.MANAGE_DISCUSSIONS);

  if (!(canModerate || post.authorId === userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
