import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await auth(); // enforce session via middleware, but ensures SSR access to user if needed
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">公告</h1>
        <Link href="/announcements/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">
          新建
        </Link>
      </div>

      <ul className="space-y-4">
        {announcements.map(a => (
          <li key={a.id} className="rounded border p-4">
            <h2 className="text-lg font-medium">{a.title}</h2>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
            <p className="mt-3 text-xs text-gray-500">
              由 {a.author?.name ?? a.author?.email} · {a.createdAt.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
