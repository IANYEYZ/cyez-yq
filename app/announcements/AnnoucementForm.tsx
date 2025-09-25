// app/announcements/AnnouncementForm.client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementForm({
  announcementId,
  initialTitle = "",
  initialContent = "",
}: {
  announcementId?: string | null;
  initialTitle?: string;
  initialContent?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    try {
      const payload = { title: title.trim(), content: content ?? "" };
      const url = announcementId ? `/api/announcements/${announcementId}` : "/api/announcements";
      const method = announcementId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try parse JSON safely
        const j = await res.json().catch(() => null);

        // Build a readable message from known shapes
        let details: string | null = null;

        // 1) zod flatten: { fieldErrors: Record<string, string[]>, formErrors: string[] }
        const fieldErrors = j?.issues?.fieldErrors ?? j?.issues?.fieldErrors; // defensive
        if (fieldErrors && typeof fieldErrors === "object") {
          const parts: string[] = [];
          for (const [k, v] of Object.entries(fieldErrors)) {
            if (Array.isArray(v)) {
              parts.push(`${k}: ${v.join(", ")}`);
            } else if (typeof v === "string") {
              parts.push(`${k}: ${v}`);
            } else {
              // nested or unexpected shape
              try {
                parts.push(`${k}: ${JSON.stringify(v)}`);
              } catch {
                parts.push(`${k}: (invalid error shape)`);
              }
            }
          }
          if (parts.length) details = parts.join("\n");
        }

        // 2) zod top-level error message
        if (!details && j?.error) details = String(j.error);

        // 3) fallback to status text
        if (!details) details = `${res.status} ${res.statusText}`;

        setErr(details);
        setBusy(false);
        return;
      }

      // success
      setBusy(false);
      router.push("/announcements");
    } catch (e: any) {
      setErr(String(e?.message ?? "Unknown error"));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded border-gray-300"
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="mt-1 block w-full rounded border-gray-300 font-mono"
          placeholder="Write announcement in Markdown — supports **GFM** and $LaTeX$."
        />
        <p className="mt-1 text-xs text-gray-500">Use Markdown. Links will open in a new tab.</p>
      </div>

      {err && <p className="text-sm text-red-600 whitespace-pre-line">{err}</p>}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
          {busy ? (announcementId ? "Saving..." : "Posting...") : (announcementId ? "Save" : "Post announcement")}
        </button>
        {announcementId && (
          <button
            type="button"
            onClick={() => (window.location.href = `/announcements`)}
            className="rounded border px-3 py-2 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
