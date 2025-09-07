"use client";

import { useState } from "react";

export default function PostActions({
  postId,
  initialContent,
}: { postId: string; initialContent: string }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null);
    const r = await fetch(`/api/discussions/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j?.error ?? "Failed to save");
      return;
    }
    setEditing(false);
    // reload to reflect server render formatting
    window.location.reload();
  }

  async function del() {
    if (!confirm("Delete this post?")) return;
    const r = await fetch(`/api/discussions/posts/${postId}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error ?? "Failed to delete");
      return;
    }
    window.location.reload();
  }

  if (editing) {
    return (
      <div className="w-56 shrink-0">
        <textarea
          className="block w-full rounded border-gray-300 text-sm"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
        <div className="mt-2 flex gap-2">
          <button onClick={save} disabled={busy} className="rounded bg-black px-2 py-1 text-xs text-white disabled:opacity-50">
            {busy ? "保存中..." : "保存"}
          </button>
          <button onClick={() => { setEditing(false); setContent(initialContent); }} className="rounded border px-2 py-1 text-xs">
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 space-x-2">
      <button onClick={() => setEditing(true)} className="rounded border px-2 py-1 text-xs">Edit</button>
      <button onClick={del} className="rounded border px-2 py-1 text-xs">Delete</button>
    </div>
  );
}
