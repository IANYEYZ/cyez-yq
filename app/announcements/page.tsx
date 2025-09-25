// app/announcements/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import PinAnnouncementButton from "./PinAnnouncementButton";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";
import Markdown from "@/components/Markdown";

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
        <h1 className="text-2xl font-semibold">公告栏</h1>
        {canManage && (
          <Link
            href="/announcements/new"
            className="rounded bg-black px-3 py-1.5 text-sm text-white"
          >
            新建公告
          </Link>
        )}
      </div>

      {anns.length === 0 ? (
        <p className="text-sm text-gray-600">还没有公告</p>
      ) : (
        <ul className="space-y-4">
          {anns.map((a) => {
            const canDelete = canManage || a.authorId === userId;
            const canEdit = canManage || a.authorId === userId; // same rule
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
                          已置顶
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <Markdown>{a.content ?? ""}</Markdown>
                    </div>

                    <p className="mt-2 text-xs text-gray-600">
                      发布自 {a.author?.name ?? a.author?.email ?? "位置"} •{" "}
                      {a.createdAt.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Pin is manager-only */}
                    {canManage && <PinAnnouncementButton id={a.id} pinned={a.pinned} />}

                    {/* Edit visible to author or manager */}
                    {canEdit && (
                      <Link
                        href={`/announcements/${a.id}/edit`}
                        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        编辑
                      </Link>
                    )}

                    {/* Delete visible to author or manager */}
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

/*
Optional CSS (globals.css):
.announcement-pinned {
  background: linear-gradient(90deg,#fffbeb,#ffffff);
  border-color: rgba(245,208,87,0.3);
}
*/
