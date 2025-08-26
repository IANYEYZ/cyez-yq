import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";

const schema = z.object({
  body: z.string().trim().min(10).max(4000),
});

function laDayRange(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = fmt.format(now).split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 8)); // 00:00 LA ~= 08:00 UTC (handles DST via formatter day value)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const userId = (session.user as any).id;

    const form = await req.formData();
    const parsed = schema.safeParse({ body: String(form.get("body") ?? "") });
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    // rate limit: 3 per LA day
    const { start, end } = laDayRange();
    const countToday = await prisma.confession.count({
      where: { authorId: userId, createdAt: { gte: start, lt: end } },
    });
    if (countToday >= 3) return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });

    await prisma.confession.create({
      data: {
        body: parsed.data.body,
        authorId: userId,
        status: "PENDING", // require admin approval
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
