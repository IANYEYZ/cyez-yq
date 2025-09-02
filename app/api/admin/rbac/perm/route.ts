import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  permission: z.nativeEnum(Permission),
  action: z.enum(["grant","revoke"]),
});

export async function POST(req: Request) {
  await requirePermission(Permission.MANAGE_USERS);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { userId, permission, action } = parsed.data;

  if (action === "grant") {
    await prisma.userPermission.upsert({
      where: { userId_permission: { userId, permission } },
      update: {},
      create: { userId, permission },
    });
  } else {
    await prisma.userPermission.deleteMany({ where: { userId, permission } });
  }

  return NextResponse.json({ ok: true });
}
