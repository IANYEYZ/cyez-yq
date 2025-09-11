"use client";

import { useState } from "react";

type LegacyRole = "ADMIN" | "STUDENT";

export default function UserLegacyRoleCell({
  userId,
  current,
}: { userId: string; current: LegacyRole }) {
  const [role, setRole] = useState<LegacyRole>(current);
  const [sync, setSync] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null);
    const r = await fetch("/api/admin/legacy-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role, syncRbac: sync }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j?.error ?? "Update failed");
      return;
    }
    // refresh to show new effective perms/roles
    location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded border px-2 py-1 text-xs"
        value={role}
        onChange={(e) => setRole(e.target.value as LegacyRole)}
      >
        <option value="STUDENT">STUDENT</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <label className="inline-flex items-center gap-1 text-xs text-gray-600">
        <input type="checkbox" checked={sync} onChange={(e) => setSync(e.target.checked)} />
        sync RBAC
      </label>

      <button
        onClick={save}
        disabled={busy}
        className="rounded border px-2 py-1 text-xs disabled:opacity-50"
      >
        Save
      </button>

      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
