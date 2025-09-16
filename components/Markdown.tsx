// components/Markdown.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// --- allow KaTeX/MATHML + needed attrs/styles ---
const mathTags = [
  "math","mrow","mi","mo","mn","msup","msub","msubsup","mfrac","msqrt","mroot",
  "mtable","mtr","mtd","ms","mtext","semantics","annotation",
];

const schema = (() => {
  const base: any =
    typeof structuredClone === "function"
      ? structuredClone(defaultSchema)
      : JSON.parse(JSON.stringify(defaultSchema));

  base.tagNames = Array.from(new Set([...(base.tagNames ?? []), ...mathTags]));

  base.attributes = {
    ...(base.attributes ?? {}),
    img: Array.from(new Set([...(base.attributes?.img ?? []), "src", "alt", "title"])),
    a: Array.from(new Set([...(base.attributes?.a ?? []), "href", "title", "target", "rel"])),
    span: Array.from(new Set([...(base.attributes?.span ?? []), "className", "style", "aria-hidden"])),
    div: Array.from(new Set([...(base.attributes?.div ?? []), "className", "style"])),
    "*": Array.from(new Set([...(base.attributes?.["*"] ?? []), "className", "aria-hidden"])),
  };

  return base;
})();

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      // NOTE: math first, then gfm
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[
        rehypeKatex,
        [rehypeSanitize, schema],
      ]}
      components={{
        h1: (p) => <h1 className="mt-6 mb-3 text-3xl font-bold" {...p} />,
        h2: (p) => <h2 className="mt-5 mb-2 text-2xl font-bold" {...p} />,
        h3: (p) => <h3 className="mt-4 mb-2 text-xl font-semibold" {...p} />,
        p:  (p) => <p className="my-3 leading-7" {...p} />,
        ul: (p) => <ul className="my-3 list-disc pl-6" {...p} />,
        ol: (p) => <ol className="my-3 list-decimal pl-6" {...p} />,
        a:  (p) => <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...p} />,
        code: (p) => <code className="rounded bg-gray-100 px-1 py-0.5" {...p} />,
        pre:  (p) => <pre className="my-4 overflow-x-auto rounded bg-gray-900 p-4 text-gray-100" {...p} />,
        blockquote: (p) => <blockquote className="border-l-4 pl-4 italic text-gray-600" {...p} />,
        table: (p) => <table className="my-3 w-full border-collapse" {...p} />,
        th: (p) => <th className="border px-2 py-1 text-left" {...p} />,
        td: (p) => <td className="border px-2 py-1 align-top" {...p} />,
        input: (p) => <input className="mr-2 align-middle" disabled {...p} />, // task-list checkboxes (read-only)
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
