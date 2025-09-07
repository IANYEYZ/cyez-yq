import { requireAdmin } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ModerateConfessions() {
  await requirePermission("MODERATE_CONFESSIONS")
  const pending = await prisma.confession.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, createdAt: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Moderation Queue</h1>
      {pending.length === 0 ? (
        <p className="text-sm text-gray-600">Nothing pending.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map(c => (
            <li key={c.id} className="rounded border p-4">
              <p className="whitespace-pre-wrap">{c.body}</p>
              <p className="mt-2 text-xs text-gray-500">{c.createdAt.toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <form action={`/api/confessions/${c.id}/status`} method="post">
                  <input type="hidden" name="status" value="APPROVED" />
                  <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white">Approve</button>
                </form>
                <form action={`/api/confessions/${c.id}/status`} method="post">
                  <input type="hidden" name="status" value="REJECTED" />
                  <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">Reject</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
