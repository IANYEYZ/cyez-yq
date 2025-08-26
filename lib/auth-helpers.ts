import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if ((session.user as any).role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
