"use client";

import { useState } from "react";

export default function NewPollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("Yes\nNo");
  const [closesAt, setClosesAt] = useState<string>("");
  const [multi, setMulti] = useState(false);
  const [maxChoices, setMaxChoices] = useState(2);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();           // ← important
    setBusy(true); setErr(null);

    const opts = options.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const closesISO = closesAt ? new Date(closesAt).toISOString() : undefined;

    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        options: opts,
        closesAt: closesISO,
        multi,
        maxChoices: multi ? maxChoices : 1,
      }),
    });

    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const details = j?.issues?.fieldErrors
        ? Object.entries(j.issues.fieldErrors)
            .map(([k, v]: any) => `${k}: ${v?.join(", ")}`)
            .join("\n")
        : j?.error;
      setErr(details || "创建失败");
      return;
    }
    window.location.href = "/votes";
  }

  return (
    <form onSubmit={submit} className="space-y-4"> {/* ← no action attr */}
      <div>
        <label className="block text-sm font-medium">问题 / Question</label>
        <input value={question} onChange={e=>setQuestion(e.target.value)} required className="mt-1 block w-full rounded border-gray-300" />
      </div>

      <div>
        <label className="block text-sm font-medium">选项（一行一个）/ Options (one per line)</label>
        <textarea rows={5} value={options} onChange={e=>setOptions(e.target.value)} className="mt-1 block w-full rounded border-gray-300" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">截止（可选）/ Closes at (optional)</label>
          <input type="datetime-local" value={closesAt} onChange={e=>setClosesAt(e.target.value)} className="mt-1 block w-full rounded border-gray-300" />
        </div>
        <div className="flex items-end gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={multi} onChange={e=>setMulti(e.target.checked)} />
            <span className="text-sm">允许多选 / Multi-select</span>
          </label>
          {multi && (
            <input
              type="number"
              min={1}
              max={12}
              value={maxChoices}
              onChange={e=>setMaxChoices(Number(e.target.value))}
              className="w-24 rounded border-gray-300 text-sm"
              title="最多可选 Max choices"
            />
          )}
        </div>
      </div>

      {err && <p className="text-sm text-red-600 whitespace-pre-line">{err}</p>}
      <button type="submit" disabled={busy} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {busy ? "创建中…" : "创建 Create"}
      </button>
    </form>
  );
}
