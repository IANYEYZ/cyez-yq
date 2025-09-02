import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function UserPublicPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const meId = (session?.user as any)?.id;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true, bio: true, createdAt: true, id: true },
  });
  if (!user) return notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="border-b pb-3">
        <h1 className="text-2xl font-semibold">{user.name ?? "Student"}</h1>
        <p className="text-sm text-gray-500">
          Joined {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)}
        </p>
        {meId === user.id ? (
          <p className="mt-2 text-sm">
            <Link href="/settings/profile" className="underline">Edit your profile</Link>
          </p>
        ) : null}
      </header>

      <section className="prose prose-sm sm:prose-base max-w-none">
        {user.bio?.trim() ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {user.bio}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-600">No description yet.</p>
        )}
      </section>
    </div>
  );
}
