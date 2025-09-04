// app/dashboard/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { luckFor } from "@/lib/luck";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // always render fresh (announcements can change)

export default async function Dashboard() {
  const session = await auth();
  const userId = (session?.user as any)?.id!;
  const luck = luckFor(userId);

  const [announcements, assignments] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: { select: { name: true, email: true } } },
    }),
    prisma.assignment.findMany({
      where: { dueAt: { gte: new Date() } },
      orderBy: { dueAt: "asc" },
      take: 5,
      select: { id: true, title: true, dueAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">仪表盘</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <LuckCard luck={luck} />

        <div className="rounded border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium">公告</h2>
            <Link href="/announcements" className="text-sm underline">查看全部</Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-600">暂无公告。</p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id}>
                  <div className="font-medium leading-snug">{a.title}</div>
                  <div className="text-xs text-gray-600">
                    由 {a.author?.name ?? a.author?.email ?? "未知"} · {formatDate(a.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium">作业</h2>
            <Link href="/assignments" className="text-sm underline">查看全部</Link>
          </div>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-600">暂无即将到期的作业。</p>
          ) : (
            <ul className="space-y-3">
              {assignments.map((as) => (
                <li key={as.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{as.title}</div>
                  </div>
                  <div className="shrink-0 text-xs text-gray-600">
                    {formatDate(as.dueAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">已登录：{session?.user?.email}</p>
    </div>
  );
}

function LuckCard({ luck }: { luck: ReturnType<typeof luckFor> }) {
  return (
    <div className="rounded border p-4">
      <h2 className="mb-2 font-medium">今日运势 {luck.emoji}</h2>
      <div className="text-3xl font-bold">{luck.score}</div>
      <p className="text-sm text-gray-600">
        {luck.tier} · {luck.day}
      </p>
      <p className="mt-3 text-sm">
        幸运数字：<span className="font-medium">{luck.luckyNumber}</span>
      </p>
      <p className="text-sm">
        幸运颜色：<span className="font-medium">{luck.luckyColor}</span>
      </p>
      <p className="mt-3 text-sm text-gray-700">{luck.blurb}</p>
      <p className="mt-3 text-xs text-gray-500">种子：{luck.seed}</p>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
