import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import _LikeButton from "./_LikeButton";

export const dynamic = "force-dynamic";

export default async function ConfessionsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string;

  const confessions = await prisma.confession.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { userId: true } }, // to know if I liked
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">表白墙</h1>
        <Link href="/confessions/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">发布表白</Link>
      </div>

      {confessions.length === 0 ? (
        <p className="text-sm text-gray-600">暂无表白。</p>
      ) : (
        <ul className="space-y-4">
          {confessions.map(c => (
            <li key={c.id} className="rounded border p-4">
              <p className="whitespace-pre-wrap">{c.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{c.createdAt.toLocaleString()}</span>
                <LikeButton
                  confessionId={c.id}
                  initialLiked={c.likes.length > 0}
                  initialCount={c._count.likes}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LikeButton(props: { confessionId: string; initialLiked: boolean; initialCount: number }) {
  return <_LikeButton {...props} />
}
