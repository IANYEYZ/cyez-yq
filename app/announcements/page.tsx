// app/announcements/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const [anns, canManage] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: { select: { name: true, email: true } },
      },
      take: 50,
    }),
    (async () => {
      if (!userId) return false;
      const perms = await getUserPermissions(userId);
      return perms.has(Permission.MANAGE_ANNOUNCEMENTS);
    })(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Announcements</h1>
        {canManage && <Link href="/announcements/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">
          New announcement
        </Link>}
      </div>

      {anns.length === 0 ? (
        <p className="text-sm text-gray-600">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {anns.map((a) => {
            const canDelete = canManage || a.authorId === userId;
            return (
              <li key={a.id} className="rounded border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-medium">{a.title}</h2>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{a.content}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      by {a.author?.name ?? a.author?.email ?? "Unknown"} •{" "}
                      {a.createdAt.toLocaleString()}
                    </p>
                  </div>
                  {canDelete && <DeleteAnnouncementButton id={a.id} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
