"use client";

import { useState } from "react";

export default function _AddTransactionFormClient() {
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const r = await fetch("/api/fund/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, memo }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      setErr(j?.error ?? "Failed to add transaction");
      return;
    }
    setAmount("");
    setMemo("");
    // refresh to show updated list + chart
    window.location.reload();
  }

  return (
    <div className="rounded border p-4">
      <h2 className="mb-2 font-medium">Add Transaction</h2>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Amount</label>
          <input
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
            placeholder="e.g. 12.34 or -5"
            className="mt-1 block w-full rounded border-gray-300"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Use negative for expenses (e.g. -25.00)</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Memo (optional)</label>
          <input
            value={memo}
            onChange={(e)=>setMemo(e.target.value)}
            placeholder="Snacks for study group"
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
        {err && <p className="md:col-span-3 text-sm text-red-600">{err}</p>}
        <div className="md:col-span-3">
          <button disabled={busy} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            {busy ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
