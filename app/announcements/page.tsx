// app/announcements/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import PinAnnouncementButton from "./PinAnnouncementButton";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const [anns, canManage] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: [
        { pinned: "desc" },
        { pinnedAt: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: { select: { name: true, email: true } },
        pinned: true,
        pinnedAt: true,
      },
      take: 100,
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
        {canManage && (
          <Link
            href="/announcements/new"
            className="rounded bg-black px-3 py-1.5 text-sm text-white"
          >
            New announcement
          </Link>
        )}
      </div>

      {anns.length === 0 ? (
        <p className="text-sm text-gray-600">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {anns.map((a) => {
            const canDelete = canManage || a.authorId === userId;
            return (
              <li
                key={a.id}
                className={`rounded border p-4 ${a.pinned ? "announcement-pinned" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium">{a.title}</h2>
                      {a.pinned && (
                        <span className="rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">
                          Pinned
                        </span>
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-wrap text-sm">{a.content}</p>

                    <p className="mt-2 text-xs text-gray-600">
                      by {a.author?.name ?? a.author?.email ?? "Unknown"} •{" "}
                      {a.createdAt.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {canManage && (
                      <PinAnnouncementButton id={a.id} pinned={a.pinned} />
                    )}
                    {canDelete && <DeleteAnnouncementButton id={a.id} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
