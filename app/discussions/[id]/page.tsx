import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewPostForm from "./_new_post";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import PostActions from "./_post_action";
import _ThreadActionsClient from "./_ThreadActionsClient";

export const dynamic = "force-dynamic";

export default async function ThreadPage(context: any) {
  const params = (await context).params
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const [thread, canModerate] = await Promise.all([
    prisma.discussionThread.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true, email: true, id: true } },
        posts: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, email: true } } },
        },
      },
    }),
    (async () => {
      if (!userId) return false;
      const perms = await getUserPermissions(userId);
      return perms.has(Permission.MANAGE_DISCUSSIONS);
    })(),
  ]);

  if (!thread) return notFound();

  return (
    <div className="space-y-6">
      <div className="rounded border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{thread.title}</h1>
            <p className="mt-2 text-sm text-gray-600">
              发布自 {thread.createdBy?.name ?? thread.createdBy?.email} • {thread.createdAt.toLocaleString()}
            </p>
          </div>
          {/* Optional: thread title edit/delete for owner/mods */}
          {(canModerate || thread.createdBy?.id === userId) && (
            <ThreadActions threadId={thread.id} initialTitle={thread.title} />
          )}
        </div>
      </div>

      <section className="space-y-4">
        {thread.posts.map((p) => (
          <article key={p.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="whitespace-pre-wrap break-words">{p.content}</p>
                <p className="mt-3 text-xs text-gray-500">
                  by {p.author?.name ?? p.author?.email} • {p.createdAt.toLocaleString()}
                </p>
              </div>
              {(canModerate || p.authorId === userId) && (
                <PostActions postId={p.id} initialContent={p.content} />
              )}
            </div>
          </article>
        ))}
      </section>

      <div className="mt-6">
        <NewPostForm threadId={thread.id} />
      </div>
    </div>
  );
}

// lightweight server wrapper to keep ThreadActions client-only
function ThreadActions({ threadId, initialTitle }: { threadId: string; initialTitle: string }) {
  return <_ThreadActionsClient threadId={threadId} initialTitle={initialTitle} />
}
