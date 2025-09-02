"use client";

import { useState } from "react";

const ROLES = ["admin","moderator","editor","enroller"] as const;

export default function _RoleForm({ userId }: { userId: string }) {
  const [role, setRole] = useState<(typeof ROLES)[number]>("editor");
  const [busy, setBusy] = useState(false);

  async function act(action: "grant" | "revoke") {
    setBusy(true);
    const r = await fetch("/api/admin/rbac/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleName: role, action }),
    });
    setBusy(false);
    if (!r.ok) alert((await r.json().catch(()=>({}))).error ?? "Action failed");
  }

  return (
    <div className="flex items-center gap-2">
      <select className="rounded border px-2 py-1 text-xs" value={role} onChange={e=>setRole(e.target.value as any)}>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button onClick={()=>act("grant")} disabled={busy} className="rounded border px-2 py-1 text-xs">Grant role</button>
      <button onClick={()=>act("revoke")} disabled={busy} className="rounded border px-2 py-1 text-xs">Revoke role</button>
    </div>
  );
}
