// prisma/seed.ts
import { PrismaClient, Permission } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureRbacRole(name: string, description: string, perms: Permission[]) {
  // Create or update role
  const role = await prisma.rbacRole.upsert({
    where: { name },
    update: { description },
    create: { name, description },
  });

  // Reset permissions for this role to the exact provided set
  await prisma.rbacRolePermission.deleteMany({ where: { roleId: role.id } });
  if (perms.length) {
    await prisma.rbacRolePermission.createMany({
      data: perms.map((p) => ({ roleId: role.id, permission: p })),
    });
  }

  return role;
}

async function main() {
  // ----- Users (your original part) -----
  const adminEmail = "admin@cyez-yq.edu";
  const studentEmail = "student1@cyez-yq.edu";

  const adminPwd = await bcrypt.hash("AdminPass123!", 10);
  const studentPwd = await bcrypt.hash("StudentPass123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, name: "CYEZ-YQ Admin", role: "ADMIN", passwordHash: adminPwd },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: studentEmail },
    create: { email: studentEmail, name: "Student One", role: "STUDENT", passwordHash: studentPwd },
    update: {},
  });

  // ----- RBAC Roles & Permissions -----
  // Create roles
  const adminRole = await ensureRbacRole(
    "admin",
    "Full access",
    Object.values(Permission) as Permission[]
  );

  await ensureRbacRole("moderator", "Moderate confessions & discussions", [
    Permission.MODERATE_CONFESSIONS,
    Permission.MANAGE_DISCUSSIONS,
    Permission.VIEW_REPORTS,
  ]);

  await ensureRbacRole("editor", "Create & edit announcements", [
    Permission.MANAGE_ANNOUNCEMENTS,
  ]);

  await ensureRbacRole("enroller", "Manage enrollment", [
    Permission.MANAGE_ENROLLMENT,
  ]);

  // Attach your ADMIN (legacy enum) user to RBAC admin role
  await prisma.userRbacRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log("✅ Seed complete: users + RBAC roles/permissions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
