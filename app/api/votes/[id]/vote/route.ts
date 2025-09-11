import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";

const bodySchema = z.object({ optionId: z.string().cuid() });

export async function POST(req: Request, context: any) {
  const { id: pollId } = await Promise.resolve(context.params as { id: string });
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const optionId = parsed.data.optionId;

  // Option must belong to this poll
  const option = await prisma.pollOption.findUnique({ where: { id: optionId }, select: { pollId: true } });
  if (!option || option.pollId !== pollId) {
    return NextResponse.json({ error: "Option mismatch" }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: { closesAt: true, multi: true, maxChoices: true },
  });
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (poll.closesAt && poll.closesAt <= new Date()) {
    return NextResponse.json({ error: "Poll closed" }, { status: 400 });
  }

  if (!poll.multi) {
    // Single-select: atomically replace any other choice with this one
    await prisma.$transaction([
      prisma.pollVote.deleteMany({ where: { pollId, userId, NOT: { optionId } } }),
      prisma.pollVote.upsert({
        where: { pollId_userId_optionId: { pollId, userId, optionId } }, // ← use triple key
        update: {},                                                      // nothing to update
        create: { pollId, userId, optionId },
      }),
    ]);
  } else {
    // Multi-select: toggle with maxChoices enforcement
    const existing = await prisma.pollVote.findUnique({
      where: { pollId_userId_optionId: { pollId, userId, optionId } },   // ← triple key
    });
    if (existing) {
      await prisma.pollVote.delete({ where: { id: existing.id } });
    } else {
      const count = await prisma.pollVote.count({ where: { pollId, userId } });
      if (count >= Math.max(1, poll.maxChoices)) {
        return NextResponse.json(
          { error: `最多可选 ${poll.maxChoices} 项 / You can select up to ${poll.maxChoices}` },
          { status: 400 }
        );
      }
      await prisma.pollVote.create({ data: { pollId, userId, optionId } });
    }
  }

  return NextResponse.json({ ok: true });
}
