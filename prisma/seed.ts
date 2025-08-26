import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@cyez-yq.edu";
  const studentEmail = "student1@cyez-yq.edu";

  const adminPwd = await bcrypt.hash("AdminPass123!", 10);
  const studentPwd = await bcrypt.hash("StudentPass123!", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, name: "CYEZ-YQ Admin", role: "ADMIN", passwordHash: adminPwd },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: studentEmail },
    create: { email: studentEmail, name: "Student One", role: "STUDENT", passwordHash: studentPwd },
    update: {},
  });
}

main().finally(() => prisma.$disconnect());
