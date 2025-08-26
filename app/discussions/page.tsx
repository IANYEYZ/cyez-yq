import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DiscussionsPage() {
  await auth(); // already gated by middleware; ensures SSR auth context if needed

  const threads = await prisma.discussionThread.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Discussions</h1>
        <Link href="/discussions/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">New thread</Link>
      </div>

      {threads.length === 0 ? (
        <p className="text-sm text-gray-600">No threads yet. Be the first to start one!</p>
      ) : (
        <ul className="divide-y rounded border">
          {threads.map((t) => (
            <li key={t.id} className="p-4 hover:bg-gray-50">
              <Link href={`/discussions/${t.id}`} className="block">
                <h2 className="font-medium">{t.title}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t._count.posts} {t._count.posts === 1 ? "post" : "posts"} • by {t.createdBy?.name ?? t.createdBy?.email}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
