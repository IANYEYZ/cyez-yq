import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import FundChart from "./_FundChart";
import _AddTransactionFormClient from "./_AddTransactionFormClient";
import DeleteTransactionButton from "./DeleteTransactionButton";

export const dynamic = "force-dynamic";

function formatMoney(cents: bigint) {
  const sign = (cents < BigInt(0)) ? "-" : "";
  const abs = (cents < BigInt(0)) ? -cents : cents;
  return `${sign}$${Number((abs / BigInt(100))).toFixed(2)}`;
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

  const balance = txs.reduce((sum, t) => sum + t.amountCents, BigInt(0));

  // Build cumulative series
  const labels: string[] = [];
  const data: bigint[] = [];
  let running = BigInt(0);
  for (const t of txs) {
    running += t.amountCents;
    labels.push(new Intl.DateTimeFormat("en-CA",{dateStyle:"medium"}).format(t.createdAt));
    data.push(running / BigInt(100));
  }
  const dataInt = data.map(item => Number(item))
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">班费</h1>
        <Link href="/dashboard" className="text-sm underline">返回仪表盘</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-medium">当前余额</h2>
          <div className="text-3xl font-bold">{formatMoney(balance)}</div>
          <p className={`mt-1 text-sm ${balance < 0 ? "text-red-600" : "text-gray-600"}`}>
            {balance < 0 ? "⚠️ 余额为负" : "已更新总额"}
          </p>
        </div>

        <div className="md:col-span-2 rounded border p-4">
          <h2 className="mb-2 font-medium">余额变化</h2>
          {labels.length === 0 ? (
            <p className="text-sm text-gray-600">暂无收支记录。</p>
          ) : (
            <FundChart labels={labels} data={dataInt} />
          )}
        </div>
      </div>

      {canManage && <AddTransactionForm />}

      <div className="rounded border">
        <div className="border-b p-3 font-medium">最近收支</div>
        {txs.length === 0 ? (
          <p className="p-3 text-sm text-gray-600">暂无收支记录。</p>
        ) : (
          <ul className="divide-y">
            {[...txs].reverse().slice(0, 20).map(t => (
              <li key={t.id} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium">{formatMoney(t.amountCents)}</div>
                  {t.memo && <div className="text-sm text-gray-600 truncate">{t.memo}</div>}
                </div>
                <div className="shrink-0 text-xs text-gray-600">
                  {new Intl.DateTimeFormat("zh-CN",{ dateStyle:"medium", timeStyle:"short" }).format(t.createdAt)}
                </div>
                {canManage && <DeleteTransactionButton id={t.id} />}
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
