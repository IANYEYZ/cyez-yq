"use client";

export default function PinAnnouncementButton({ id, pinned }: { id: string; pinned: boolean }) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!confirm(pinned ? "Unpin this announcement?" : "Pin this announcement to top?")) return;
    setBusy(true);
    const r = await fetch(`/api/announcements/${id}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error ?? "Failed to update pin");
      return;
    }
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
      title={pinned ? "取消置顶" : "置顶"}
    >
      {pinned ? "取消置顶" : "置顶"}
    </button>
  );
}

// remember to import useState
import { useState } from "react";
