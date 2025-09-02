import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import _RoleForm from "./_RoleForm";
import _PermForm from "./_PermForm";

export const dynamic = "force-dynamic";

const RBAC_ROLES = ["admin","moderator","editor","enroller"] as const;
const PERMS = Object.values(Permission);

export default async function AdminUsersPage() {
  await requirePermission(Permission.MANAGE_USERS);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Users</h1>
      <p className="text-sm text-gray-600">
        Grant or revoke RBAC roles and direct permissions. (This is a minimal UI; it doesn’t list current RBAC state yet.)
      </p>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b text-left text-sm">
            <th className="py-2 pr-2">User</th>
            <th className="py-2 pr-2">Email</th>
            <th className="py-2 pr-2">Joined</th>
            <th className="py-2 pr-2">Legacy Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b align-top text-sm">
              <td className="py-2 pr-2">{u.name ?? "—"}</td>
              <td className="py-2 pr-2">{u.email}</td>
              <td className="py-2 pr-2">{new Intl.DateTimeFormat("en-US",{dateStyle:"medium"}).format(u.createdAt)}</td>
              <td className="py-2 pr-2">{u.role}</td>
              <td className="py-2">
                <div className="space-y-2">
                  <RoleForm userId={u.id} />
                  <PermForm userId={u.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Server → Client wrappers
function RoleForm({ userId }: { userId: string }) {
  return <_RoleForm userId={userId} />
}
function PermForm({ userId }: { userId: string }) {
  return <_PermForm userId={userId} />
}
