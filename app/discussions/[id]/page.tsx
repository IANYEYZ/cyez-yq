import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewPostForm from "./_new_post";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: { id: string } }) {
  await auth();

  const thread = await prisma.discussionThread.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true, email: true } },
      posts: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, email: true } } },
      },
    },
  });

  if (!thread) return notFound();

  return (
    <div className="space-y-6">
      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Started by {thread.createdBy?.name ?? thread.createdBy?.email} • {thread.createdAt.toLocaleString()}
        </p>
      </div>

      <section className="space-y-4">
        {thread.posts.map((p) => (
          <article key={p.id} className="rounded border p-4">
            <p className="whitespace-pre-wrap">{p.content}</p>
            <p className="mt-3 text-xs text-gray-500">
              by {p.author?.name ?? p.author?.email} • {p.createdAt.toLocaleString()}
            </p>
          </article>
        ))}
      </section>

      <div className="mt-6">
        <NewPostForm threadId={thread.id} />
      </div>
    </div>
  );
}
