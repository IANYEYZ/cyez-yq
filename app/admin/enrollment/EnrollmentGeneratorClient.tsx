"use client";

import { useMemo, useState } from "react";

type Row = { email: string; name: string };
type Result = { email: string; name: string; code: string; expires: string };

function parseCsvText(txt: string): Row[] {
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  // detect & drop header
  const start = /^email(\s*[,|\t]\s*name)?$/i.test(lines[0]) ? 1 : 0;
  const rows: Row[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.includes("\t") ? line.split("\t") : line.split(",");
    const email = (parts[0] || "").trim();
    const name = (parts[1] || "").trim();
    if (!email) continue;
    rows.push({ email, name });
  }
  return rows;
}

export default function EnrollmentGeneratorClient() {
  const [text, setText] = useState<string>("email,name\nstudent1@cyez-yq.edu,Student One");
  const [days, setDays] = useState<number>(14);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const preview = useMemo(() => parseCsvText(text), [text]);

  async function generate() {
    setBusy(true); setError(null); setResults(null);
    const rows = parseCsvText(text);
    if (rows.length === 0) {
      setBusy(false);
      setError("No valid rows found.");
      return;
    }
    const r = await fetch("/api/admin/enrollment/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, daysValid: days }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j?.error ?? "Failed to generate codes");
      return;
    }
    const j = await r.json();
    setResults(j.results as Result[]);
  }

  function downloadCsv() {
    if (!results?.length) return;
    const header = "email,name,code,expires\n";
    const body = results
      .map(r => `${r.email},${JSON.stringify(r.name)},${r.code},${r.expires}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enrollment_codes_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Roster (CSV or TSV)</label>
          <textarea
            className="mt-1 block h-44 w-full rounded border-gray-300 font-mono text-sm"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: <code>email,name</code> — one student per line. Header row optional.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium">Days valid</label>
          <input
            type="number"
            min={1}
            max={180}
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="mt-1 block w-32 rounded border-gray-300"
          />
          <button
            onClick={generate}
            disabled={busy}
            className="mt-3 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Generating..." : "Generate codes"}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Preview of parsed inputs */}
      {preview.length > 0 && !results && (
        <div className="rounded border">
          <div className="border-b p-2 text-sm font-medium">Preview ({preview.length})</div>
          <ul className="max-h-48 divide-y overflow-auto text-sm">
            {preview.slice(0, 10).map((r, i) => (
              <li key={i} className="flex justify-between gap-2 p-2">
                <span className="truncate">{r.email}</span>
                <span className="truncate text-gray-600">{r.name}</span>
              </li>
            ))}
          </ul>
          {preview.length > 10 && <div className="p-2 text-xs text-gray-500">…and {preview.length - 10} more</div>}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="rounded border">
          <div className="flex items-center justify-between border-b p-2">
            <div className="text-sm font-medium">Generated ({results.length})</div>
            <button onClick={downloadCsv} className="rounded border px-2 py-1 text-xs">Download CSV</button>
          </div>
          <ul className="max-h-96 divide-y overflow-auto text-sm">
            {results.map((r) => (
              <li key={r.email} className="grid grid-cols-4 gap-2 p-2">
                <span className="truncate">{r.email}</span>
                <span className="truncate">{r.name}</span>
                <span className="font-mono">{r.code}</span>
                <span className="truncate text-gray-600">
                  {new Intl.DateTimeFormat("en-US",{dateStyle:"medium"}).format(new Date(r.expires))}
                </span>
              </li>
            ))}
          </ul>
          <div className="p-2 text-xs text-gray-500">
            Codes are hashed server-side; only this page shows plaintext. Distribute privately.
          </div>
        </div>
      )}
    </div>
  );
}
