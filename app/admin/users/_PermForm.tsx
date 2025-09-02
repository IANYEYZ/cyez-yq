"use client";

import { useState } from "react";

const PERMS = [
  "MANAGE_ANNOUNCEMENTS","MODERATE_CONFESSIONS","MANAGE_DISCUSSIONS",
  "MANAGE_ENROLLMENT","MANAGE_USERS","VIEW_REPORTS","SITE_ADMIN",
] as const;

export default function _PermForm({ userId }: { userId: string }) {
  const [perm, setPerm] = useState<(typeof PERMS)[number]>("MANAGE_ANNOUNCEMENTS");
  const [busy, setBusy] = useState(false);

  async function act(action: "grant" | "revoke") {
    setBusy(true);
    const r = await fetch("/api/admin/rbac/perm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permission: perm, action }),
    });
    setBusy(false);
    if (!r.ok) alert((await r.json().catch(()=>({}))).error ?? "Action failed");
  }

  return (
    <div className="flex items-center gap-2">
      <select className="rounded border px-2 py-1 text-xs" value={perm} onChange={e=>setPerm(e.target.value as any)}>
        {PERMS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <button onClick={()=>act("grant")} disabled={busy} className="rounded border px-2 py-1 text-xs">Grant perm</button>
      <button onClick={()=>act("revoke")} disabled={busy} className="rounded border px-2 py-1 text-xs">Revoke perm</button>
    </div>
  );
}
