"use client";

import { useState } from "react";

export default function NewPostForm({ threadId }: { threadId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/discussions/posts", {
      method: "POST",
      body: formData,
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Failed to post");
      return;
    }
    // refresh page to show the new post
    window.location.reload();
  }

  return (
    <form action={submit} className="space-y-3">
      <input type="hidden" name="threadId" value={threadId} />
      <div>
        <label className="block text-sm font-medium">回复</label>
        <textarea name="content" required rows={4} className="mt-1 block w-full rounded border-gray-300" />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "发布中..." : "发布回复"}
      </button>
    </form>
  );
}
