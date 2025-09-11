"use client";

import { useMemo, useState } from "react";

type Section =
  | "roles"
  | "directPerms"
  | "effective";

export default function UserRbacCells(props: {
  userId: string;
  section: Section;
  roles?: { id?: string; name: string }[];
  directPerms?: string[];
  effectivePerms?: string[];
  allRoles?: string[];
  allPerms?: string[];
}) {
  const { userId, section } = props;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPerm, setSelectedPerm] = useState<string>("");

  const roles = props.roles ?? [];
  const directPerms = props.directPerms ?? [];
  const effectivePerms = props.effectivePerms ?? [];
  const allRoles = props.allRoles ?? [];
  const allPerms = props.allPerms ?? [];

  // For add dropdowns, hide already-owned items
  const grantableRoles = useMemo(
    () => allRoles.filter(r => !roles.some(rr => rr.name === r)),
    [allRoles, roles]
  );
  const grantablePerms = useMemo(
    () => allPerms.filter(p => !directPerms.includes(p)),
    [allPerms, directPerms]
  );

  async function revokeRole(name: string) {
    setBusy(true); setErr(null);
    const r = await fetch("/api/admin/rbac/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleName: name, action: "revoke" }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      setErr(j?.error ?? "Failed to revoke role");
    } else {
      location.reload();
    }
  }

  async function grantRole() {
    if (!selectedRole) return;
    setBusy(true); setErr(null);
    const r = await fetch("/api/admin/rbac/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleName: selectedRole, action: "grant" }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      setErr(j?.error ?? "Failed to grant role");
    } else {
      location.reload();
    }
  }

  async function revokePerm(p: string) {
    setBusy(true); setErr(null);
    const r = await fetch("/api/admin/rbac/perm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permission: p, action: "revoke" }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      setErr(j?.error ?? "Failed to revoke permission");
    } else {
      location.reload();
    }
  }

  async function grantPerm() {
    if (!selectedPerm) return;
    setBusy(true); setErr(null);
    const r = await fetch("/api/admin/rbac/perm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permission: selectedPerm, action: "grant" }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      setErr(j?.error ?? "Failed to grant permission");
    } else {
      location.reload();
    }
  }

  // Render per section
  if (section === "roles") {
    return (
      <div className="space-y-2">
        <ChipRow
          chips={roles.map(r => ({ key: r.name, label: r.name }))}
          onX={revokeRole}
        />
        <AddRow
          kind="role"
          options={grantableRoles}
          value={selectedRole}
          setValue={setSelectedRole}
          onAdd={grantRole}
          busy={busy}
          err={err}
        />
      </div>
    );
  }

  if (section === "directPerms") {
    return (
      <div className="space-y-2">
        <ChipRow
          chips={directPerms.map(p => ({ key: p, label: p }))}
          onX={revokePerm}
        />
        <AddRow
          kind="permission"
          options={grantablePerms}
          value={selectedPerm}
          setValue={setSelectedPerm}
          onAdd={grantPerm}
          busy={busy}
          err={err}
        />
      </div>
    );
  }

  // effective (read-only)
  return (
    <div className="space-y-1">
      <ChipRow chips={effectivePerms.map(p => ({ key: p, label: p }))} />
    </div>
  );
}

function ChipRow({
  chips,
  onX,
}: {
  chips: { key: string; label: string }[];
  onX?: (key: string) => void;
}) {
  if (chips.length === 0) return <span className="text-xs text-gray-500">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {chips.map(c => (
        <span key={c.key} className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs">
          {c.label}
          {onX && (
            <button
              onClick={() => onX(c.key)}
              className="rounded px-1 text-gray-500 hover:bg-gray-100"
              title="Revoke"
              aria-label={`Revoke ${c.label}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

function AddRow({
  kind, options, value, setValue, onAdd, busy, err,
}: {
  kind: "role" | "permission";
  options: string[];
  value: string;
  setValue: (v: string) => void;
  onAdd: () => void;
  busy: boolean;
  err: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded border px-2 py-1 text-xs"
        value={value}
        onChange={e => setValue(e.target.value)}
      >
        <option value="">{options.length ? `Add ${kind}…` : `No ${kind}s`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <button
        onClick={onAdd}
        disabled={busy || !value}
        className="rounded border px-2 py-1 text-xs disabled:opacity-50"
      >
        Grant
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
