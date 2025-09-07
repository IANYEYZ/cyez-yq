"use client";

import { useState } from "react";

export default function _ThreadActionsClient({
  threadId,
  initialTitle,
}: { threadId: string; initialTitle: string }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const r = await fetch(`/api/discussions/threads/${threadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setBusy(false);
    if (!r.ok) {
      alert("Failed to save");
      return;
    }
    setEditing(false);
    window.location.reload();
  }

  async function delThread() {
    if (!confirm("Delete entire thread? This cannot be undone.")) return;
    const r = await fetch(`/api/discussions/threads/${threadId}`, { method: "DELETE" });
    if (!r.ok) {
      alert("Failed to delete thread");
      return;
    }
    window.location.href = "/discussions";
  }

  if (editing) {
    return (
      <div className="flex gap-2">
        <input className="rounded border px-2 py-1 text-sm" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <button onClick={save} disabled={busy} className="rounded bg-black px-2 py-1 text-xs text-white disabled:opacity-50">
          {busy ? "保存中..." : "保存"}
        </button>
        <button onClick={() => { setTitle(initialTitle); setEditing(false); }} className="rounded border px-2 py-1 text-xs">
          取消
        </button>
        <button onClick={delThread} className="rounded border px-2 py-1 text-xs">删除</button>
      </div>
    );
  }

  return (
    <div className="space-x-2">
      <button onClick={() => setEditing(true)} className="rounded border px-2 py-1 text-xs">编辑</button>
      <button onClick={delThread} className="rounded border px-2 py-1 text-xs">删除</button>
    </div>
  );
}
