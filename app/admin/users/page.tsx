import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import UserRbacCells from "./UserRbacCells";
import UserLegacyRoleCell from "./UserLegacyRoleCell";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requirePermission(Permission.MANAGE_USERS);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    take: 500,
  });
  const userIds = users.map(u => u.id);

  // Fetch RBAC data in bulk (no back-rel fields needed on User)
  const [allRoles, userRoles, userPerms] = await Promise.all([
    prisma.rbacRole.findMany({
      include: { rolePermissions: { select: { permission: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.userRbacRole.findMany({
      where: { userId: { in: userIds } },
      include: { role: { select: { id: true, name: true } } },
    }),
    prisma.userPermission.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, permission: true },
    }),
  ]);

  // Build maps
  const rolePermsByName = new Map<string, Set<Permission>>();
  for (const r of allRoles) {
    rolePermsByName.set(
      r.name,
      new Set(r.rolePermissions.map(rp => rp.permission))
    );
  }
  const rolesByUser = new Map<string, { id: string; name: string }[]>();
  for (const ur of userRoles) {
    const arr = rolesByUser.get(ur.userId) ?? [];
    arr.push(ur.role);
    rolesByUser.set(ur.userId, arr);
  }
  const directPermsByUser = new Map<string, Set<Permission>>();
  for (const up of userPerms) {
    const set = directPermsByUser.get(up.userId) ?? new Set<Permission>();
    set.add(up.permission);
    directPermsByUser.set(up.userId, set);
  }

  // Compute effective permissions per user
  const allPermsList = Object.values(Permission);
  const effectiveByUser = new Map<string, Set<Permission>>();
  for (const u of users) {
    const eff = new Set<Permission>();
    // role-derived
    for (const r of rolesByUser.get(u.id) ?? []) {
      const set = rolePermsByName.get(r.name);
      if (set) set.forEach(p => eff.add(p));
    }
    // direct
    for (const p of directPermsByUser.get(u.id) ?? new Set<Permission>()) {
      eff.add(p);
    }
    // legacy ADMIN shim (optional): treat as SITE_ADMIN
    if (u.role === "ADMIN") eff.add(Permission.SITE_ADMIN);
    // SITE_ADMIN ⇒ all
    if (eff.has(Permission.SITE_ADMIN)) {
      for (const p of allPermsList) eff.add(p);
    }
    effectiveByUser.set(u.id, eff);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Users</h1>
      <p className="text-sm text-gray-600">
        View and manage RBAC. Roles bundle permissions; users may also have direct permissions.
      </p>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b text-left text-sm">
            <th className="py-2 pr-2 w-48">User</th>
            <th className="py-2 pr-2 w-56">Email</th>
            <th className="py-2 pr-2 w-32">Legacy</th>
            <th className="py-2 pr-2">Roles</th>
            <th className="py-2 pr-2">Direct Perms</th>
            <th className="py-2 pr-2">Effective Perms</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const roles = rolesByUser.get(u.id) ?? [];
            const direct = Array.from(directPermsByUser.get(u.id) ?? new Set<Permission>());
            const effective = Array.from(effectiveByUser.get(u.id) ?? new Set<Permission>()).sort();
            return (
              <tr key={u.id} className="border-b align-top text-sm">
                <td className="py-2 pr-2 truncate">{u.name ?? "—"}</td>
                <td className="py-2 pr-2 truncate">{u.email}</td>
                <td className="py-2 pr-2">
                  <UserLegacyRoleCell userId={u.id} current={u.role as any} />
                </td>
                <td className="py-2 pr-2">
                  <UserRbacCells
                    userId={u.id}
                    section="roles"
                    roles={roles}
                    allRoles={allRoles.map(r => r.name)}
                  />
                </td>
                <td className="py-2 pr-2">
                  <UserRbacCells
                    userId={u.id}
                    section="directPerms"
                    directPerms={direct}
                    allPerms={allPermsList}
                  />
                </td>
                <td className="py-2 pr-2">
                  <UserRbacCells
                    userId={u.id}
                    section="effective"
                    effectivePerms={effective}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
