"use client";

import { useState } from "react";

export default function NewConfessionForm() {
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null);
    const res = await fetch("/api/confessions", { method: "POST", body: formData });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Failed to submit");
      return;
    }
    window.location.href = "/confessions";
  }

  return (
    <form action={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Confession</label>
        <textarea
          name="body"
          required
          rows={8}
          className="mt-1 block w-full rounded border-gray-300"
          placeholder="Say your piece..."
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="rounded bg-black px-4 py-2 text-white">Submit for review</button>
    </form>
  );
}
