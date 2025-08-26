"use client";

import { useState } from "react";

export default function _LikeButton({
  confessionId,
  initialLiked,
  initialCount,
}: { confessionId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    // optimistic
    setLiked(v => !v);
    setCount(c => c + (liked ? -1 : 1));
    const res = await fetch(`/api/confessions/${confessionId}/like`, { method: "POST" });
    if (!res.ok) {
      // revert
      setLiked(initialLiked);
      setCount(initialCount);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded border px-2 py-1"
      title={liked ? "Unlike" : "Like"}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}
