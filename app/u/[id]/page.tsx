import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// extend sanitize schema to allow KaTeX / MathML output
const mathTags = [
  "math","mrow","mi","mo","mn","msup","msub","msubsup","mfrac","msqrt","mroot",
  "mtable","mtr","mtd","ms","mtext","semantics","annotation"
];
const schema = (() => {
  // clone default schema safely
  const base: any = typeof structuredClone === "function"
    ? structuredClone(defaultSchema)
    : JSON.parse(JSON.stringify(defaultSchema));

  base.tagNames = Array.from(new Set([...(base.tagNames ?? []), ...mathTags]));

  // allow className/aria-hidden used by KaTeX spans
  base.attributes = {
    ...(base.attributes ?? {}),
    "*": Array.from(new Set([...(base.attributes?.["*"] ?? []), "className", "aria-hidden"]))
  };
  return base;
})();

export default async function UserPublicPage(context: any) {
  const params = (await context).params;
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
        {meId === user.id && (
          <p className="mt-2 text-sm">
            <Link href="/settings/profile" className="underline">Edit your profile</Link>
          </p>
        )}
      </header>

      <section>
        {user.bio?.trim() ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              rehypeKatex,                    // render TeX → HTML/MathML
              [rehypeSanitize, schema],       // keep it safe, but allow KaTeX bits
            ]}
            components={{
              h1: (props) => <h1 className="mt-6 mb-3 text-3xl font-bold" {...props} />,
              h2: (props) => <h2 className="mt-5 mb-2 text-2xl font-bold" {...props} />,
              h3: (props) => <h3 className="mt-4 mb-2 text-xl font-semibold" {...props} />,
              p:  (props) => <p className="my-3 leading-7" {...props} />,
              ul: (props) => <ul className="my-3 list-disc pl-6" {...props} />,
              ol: (props) => <ol className="my-3 list-decimal pl-6" {...props} />,
              a:  (props) => <a className="text-blue-600 underline" {...props} />,
              code: (props) => <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />,
              pre:  (props) => <pre className="my-4 overflow-x-auto rounded bg-gray-900 p-4 text-gray-100" {...props} />,
              blockquote: (props) => <blockquote className="border-l-4 pl-4 italic text-gray-600" {...props} />,
            }}
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
