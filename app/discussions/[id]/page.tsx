// app/discussions/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewPostForm from "./_new_post";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import PostActions from "./_post_action";
import _ThreadActionsClient from "./_ThreadActionsClient"; // keep your existing client file
import Markdown from "@/components/Markdown";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function ThreadPage(context: any) {
  const params = (await context).params
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const [thread, canModerate] = await Promise.all([
    prisma.discussionThread.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        createdBy: { select: { id: true, name: true, email: true } },
        posts: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorId: true,
            author: { select: { name: true, email: true } },
          },
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
          <div className="min-w-0">
            <Avatar email={thread.createdBy?.email} name={thread.createdBy?.name} size={36} />
            <div>
              <h1 className="text-2xl font-semibold">{thread.title}</h1>
              <p className="mt-2 text-sm text-gray-600">
                发布自 {thread.createdBy?.name ?? thread.createdBy?.email} •{" "}
                {thread.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          {(canModerate || thread.createdBy?.id === userId) && (
            <ThreadActions threadId={thread.id} initialTitle={thread.title} />
          )}
        </div>
      </div>

      <section className="space-y-4">
        {thread.posts.map((p) => (
          <article key={p.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-start gap-3">
                <Avatar email={p.author?.email} name={p.author?.name} size={28} />
                <div className="min-w-0">
                  <p className="mt-2 text-xs text-gray-500">
                    {p.author?.name ?? p.author?.email} • {p.createdAt.toLocaleString()}
                  </p>
                  <Markdown>{p.content ?? ""}</Markdown>
                </div>
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

// tiny server wrapper → keeps the actions client-only
function ThreadActions({ threadId, initialTitle }: { threadId: string; initialTitle: string }) {
  return <_ThreadActionsClient threadId={threadId} initialTitle={initialTitle} />;
}
