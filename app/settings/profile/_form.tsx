"use client";

import { useEffect, useState } from "react";

export default function ProfileForm({ defaultEmail, defaultRole }: { defaultEmail: string; defaultRole: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [name, setName] = useState("");
  const [joined, setJoined] = useState<string>("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/profile", { cache: "no-store" });
      const j = await r.json();
      setName(j?.name ?? "");
      setBio(j?.bio ?? ""); // ← load bio
      setJoined(j?.createdAt ? new Intl.DateTimeFormat("en-US",{ dateStyle:"medium"}).format(new Date(j.createdAt)) : "");
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/profile", { cache: "no-store" });
      const j = await r.json();
      setName(j?.name ?? "");
      setJoined(j?.createdAt ? new Intl.DateTimeFormat("en-US",{ dateStyle:"medium"}).format(new Date(j.createdAt)) : "");
      setLoading(false);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setOk(false);
    const r = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }), // ← send bio
    });
    setSaving(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j?.error ?? "Save failed");
      return;
    }
    setOk(true);
  }

  if (loading) return <div className="h-40 animate-pulse rounded border" />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email (read-only)</label>
        <input value={defaultEmail} readOnly className="mt-1 block w-full rounded border-gray-300 bg-gray-100" />
      </div>

      <div>
        <label className="block text-sm font-medium">Role</label>
        <input value={defaultRole} readOnly className="mt-1 block w-full rounded border-gray-300 bg-gray-100" />
      </div>

      <div>
        <label className="block text-sm font-medium">Joined</label>
        <input value={joined} readOnly className="mt-1 block w-full rounded border-gray-300 bg-gray-100" />
      </div>

      <div>
        <label className="block text-sm font-medium">Display name</label>
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          required
          className="mt-1 block w-full rounded border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Bio (Markdown supported)</label>
        <textarea
          value={bio}
          onChange={e=>setBio(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded border-gray-300"
          placeholder="Write a short description. You can use **bold**, _italics_, lists, and `code`."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">Saved!</p>}

      <button disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
