import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Permission } from "@prisma/client";

export type Perm = Permission;

export async function getUserPermissions(userId: string): Promise<Set<Permission>> {
  const rolePerms = await prisma.rbacRolePermission.findMany({
    where: { role: { userRoles: { some: { userId } } } },
    select: { permission: true },
  });
  const directPerms = await prisma.userPermission.findMany({
    where: { userId },
    select: { permission: true },
  });

  const set = new Set<Permission>([
    ...rolePerms.map(rp => rp.permission),
    ...directPerms.map(up => up.permission),
  ]);

  if (set.has(Permission.SITE_ADMIN)) {
    // SITE_ADMIN implies all permissions
    for (const p of Object.values(Permission)) set.add(p as Permission);
  }
  return set;
}

export async function requirePermission(perm: Permission) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");
  const perms = await getUserPermissions(userId);
  if (!perms.has(perm)) throw new Error("Forbidden");
  return session;
}
