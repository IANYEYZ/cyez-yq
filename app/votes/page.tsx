import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import VoteToggleButton from "./VoteToggleButton";
import DeletePollButton from "./DeletePollButton";
import PollResultsChart from "./PollResultsChart";

export const dynamic = "force-dynamic";

export default async function VotesPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const [polls, canManage] = await Promise.all([
    prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, question: true, createdAt: true, closesAt: true, createdById: true,
        multi: true, maxChoices: true,
        options: { select: { id: true, text: true, _count: { select: { votes: true } } } },
        votes: userId ? { where: { userId }, select: { optionId: true } } : false,
      },
      take: 50,
    }),
    (async () => {
      if (!userId) return false;
      const perms = await getUserPermissions(userId);
      return perms.has(Permission.MANAGE_POLLS);
    })(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">投票 / Votes</h1>
        <Link href="/votes/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">新建投票</Link>
      </div>

      {polls.length === 0 ? (
        <p className="text-sm text-gray-600">暂无投票。</p>
      ) : (
        <ul className="space-y-4">
          {polls.map(p => {
            const total = p.options.reduce((s, o) => s + o._count.votes, 0);
            const myVotes = Array.isArray(p.votes) ? new Set(p.votes.map(v => v.optionId)) : new Set<string>();
            const closed = !!p.closesAt && p.closesAt <= new Date();

            const labels = p.options.map(o => o.text);
            const counts = p.options.map(o => o._count.votes);

            return (
              <li key={p.id} className="rounded border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{p.question}</div>
                    <p className="mt-1 text-xs text-gray-600">
                      {p.createdAt.toLocaleString()}
                      {p.closesAt ? ` • 截止/Closes ${p.closesAt.toLocaleString()}` : ""}
                      {p.multi ? ` • 多选 up to ${p.maxChoices}` : " • 单选 / Single"}
                      {closed ? " • 已截止 / Closed" : ""}
                    </p>
                  </div>
                  {canManage && <DeletePollButton id={p.id} />}
                </div>

                {/* Results chart */}
                <div className="mt-3">
                  <PollResultsChart labels={labels} counts={counts} />
                </div>

                {/* Options + vote buttons */}
                {!closed && userId && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {p.options.map(o => (
                      <div key={o.id} className="rounded border p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{o.text}</span>
                          <span className="tabular-nums text-gray-600">{o._count.votes}</span>
                        </div>
                        <div className="mt-2">
                          <VoteToggleButton
                            pollId={p.id}
                            optionId={o.id}
                            chosen={myVotes.has(o.id)}
                            disabled={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
