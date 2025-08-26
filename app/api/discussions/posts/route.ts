import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";

const schema = z.object({
  threadId: z.string().min(1),
  content: z.string().trim().min(1).max(10_000),
});

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const userId = (session.user as any).id;

    const form = await req.formData();
    const data = schema.safeParse({
      threadId: String(form.get("threadId") ?? ""),
      content: String(form.get("content") ?? ""),
    });
    if (!data.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Ensure thread exists (avoid FK error surfacing as 500)
    const exists = await prisma.discussionThread.findUnique({
      where: { id: data.data.threadId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    await prisma.post.create({
      data: {
        threadId: data.data.threadId,
        content: data.data.content,
        authorId: userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
