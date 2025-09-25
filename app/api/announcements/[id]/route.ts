// app/api/announcements/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const editSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().optional().nullable(),
});

export async function GET(_req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string });
  const ann = await prisma.announcement.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      authorId: true,
      pinned: true,
      pinnedAt: true,
      createdAt: true,
    },
  });
  if (!ann) return new NextResponse(null, { status: 404 });
  return NextResponse.json(ann);
}

export async function PATCH(req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string });
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  // validate input
  const json = await req.json().catch(() => null);
  const parsed = editSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  // find announcement
  const ann = await prisma.announcement.findUnique({ where: { id }, select: { id: true, authorId: true } });
  if (!ann) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // permission: author or MANAGE_ANNOUNCEMENTS
  const perms = await getUserPermissions(userId);
  const isAuthor = ann.authorId === userId;
  const canManage = perms.has(Permission.MANAGE_ANNOUNCEMENTS);
  if (!(isAuthor || canManage)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // update
  const { title, content } = parsed.data;
  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      title,
      content: content ?? "",
    },
  });

  return NextResponse.json({ ok: true, announcement: updated });
}

export async function DELETE(_req: Request, context: any) {
  const { id } = await Promise.resolve(context.params as { id: string });
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const ann = await prisma.announcement.findUnique({ where: { id }, select: { id: true, authorId: true } });
  if (!ann) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perms = await getUserPermissions(userId);
  const canManage = perms.has(Permission.MANAGE_ANNOUNCEMENTS);
  const isAuthor = ann.authorId === userId;
  if (!(isAuthor || canManage)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
