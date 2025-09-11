import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission, Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(Role),              // "ADMIN" | "STUDENT" (your enum)
  syncRbac: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  await requirePermission(Permission.MANAGE_USERS);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { userId, role, syncRbac } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({ where: { id: userId }, data: { role } });

  if (syncRbac) {
    // Keep RBAC 'admin' role aligned with legacy ADMIN
    const adminRole = await prisma.rbacRole.findUnique({ where: { name: "admin" }, select: { id: true } });
    if (adminRole) {
      if (role === "ADMIN") {
        await prisma.userRbacRole.upsert({
          where: { userId_roleId: { userId, roleId: adminRole.id } },
          update: {},
          create: { userId, roleId: adminRole.id },
        });
      } else {
        await prisma.userRbacRole.deleteMany({ where: { userId, roleId: adminRole.id } });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
