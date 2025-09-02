import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import FundChart from "./_FundChart";
import _AddTransactionFormClient from "./_AddTransactionFormClient";

export const dynamic = "force-dynamic";

function formatMoney(cents: number) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toFixed(2)}`;
}

export default async function FundPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const [txs, canManage] = await Promise.all([
    prisma.classFundTransaction.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, amountCents: true, memo: true, createdAt: true },
    }),
    (async () => {
      if (!userId) return false;
      const perms = await getUserPermissions(userId);
      return perms.has(Permission.MANAGE_FINANCES);
    })(),
  ]);

  const balance = txs.reduce((sum, t) => sum + t.amountCents, 0);

  // Build cumulative series
  const labels: string[] = [];
  const data: number[] = [];
  let running = 0;
  for (const t of txs) {
    running += t.amountCents;
    labels.push(new Intl.DateTimeFormat("en-CA",{dateStyle:"medium"}).format(t.createdAt));
    data.push(running / 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Class Fund</h1>
        <Link href="/dashboard" className="text-sm underline">Back to Dashboard</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-medium">Current Balance</h2>
          <div className="text-3xl font-bold">{formatMoney(balance)}</div>
          <p className={`mt-1 text-sm ${balance < 0 ? "text-red-600" : "text-gray-600"}`}>
            {balance < 0 ? "⚠️ Negative balance" : "Up-to-date total"}
          </p>
        </div>

        <div className="md:col-span-2 rounded border p-4">
          <h2 className="mb-2 font-medium">Balance Over Time</h2>
          {labels.length === 0 ? (
            <p className="text-sm text-gray-600">No transactions yet.</p>
          ) : (
            <FundChart labels={labels} data={data} />
          )}
        </div>
      </div>

      {canManage && <AddTransactionForm />}

      <div className="rounded border">
        <div className="border-b p-3 font-medium">Recent Transactions</div>
        {txs.length === 0 ? (
          <p className="p-3 text-sm text-gray-600">No transactions yet.</p>
        ) : (
          <ul className="divide-y">
            {[...txs].reverse().slice(0, 20).map(t => (
              <li key={t.id} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium">{formatMoney(t.amountCents)}</div>
                  {t.memo && <div className="text-sm text-gray-600 truncate">{t.memo}</div>}
                </div>
                <div className="shrink-0 text-xs text-gray-600">
                  {new Intl.DateTimeFormat("en-US",{ dateStyle:"medium", timeStyle:"short" }).format(t.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Server → Client boundary (keeps chart client-side)
function AddTransactionForm() {
  return <_AddTransactionFormClient />
}
