import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  roleName: z.string().min(1),
  action: z.enum(["grant","revoke"]),
});

export async function POST(req: Request) {
  await requirePermission(Permission.MANAGE_USERS);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { userId, roleName, action } = parsed.data;

  const role = await prisma.rbacRole.findUnique({ where: { name: roleName } });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  if (action === "grant") {
    await prisma.userRbacRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  } else {
    await prisma.userRbacRole.deleteMany({ where: { userId, roleId: role.id } });
  }

  return NextResponse.json({ ok: true });
}
