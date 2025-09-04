"use client";

import { useState } from "react";

export default function NewAnnouncementForm() {
  const [error, setError] = useState<string | null>(null);

  async function createAnnouncement(formData: FormData) {
    setError(null);
    const res = await fetch("/api/announcements", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Failed to create announcement");
      return;
    }
    window.location.href = "/announcements";
  }

  return (
    <form action={createAnnouncement} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">标题</label>
        <input name="title" required className="mt-1 block w-full rounded border-gray-300" />
      </div>
      <div>
        <label className="block text-sm font-medium">内容</label>
        <textarea name="content" required rows={6} className="mt-1 block w-full rounded border-gray-300" />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="rounded bg-black px-4 py-2 text-white">发布</button>
    </form>
  );
}
