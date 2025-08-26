import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireUser();
    const userId = (session.user as any).id;
    const confessionId = params.id;

    const existing = await prisma.confessionLike.findUnique({
      where: { confessionId_userId: { confessionId, userId } },
    });

    if (existing) {
      await prisma.confessionLike.delete({ where: { confessionId_userId: { confessionId, userId } } });
    } else {
      // only like approved confessions
      const ok = await prisma.confession.findFirst({ where: { id: confessionId, status: "APPROVED" }, select: { id: true } });
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

      await prisma.confessionLike.create({ data: { confessionId, userId } });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
