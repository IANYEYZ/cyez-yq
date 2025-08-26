import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(1).max(10_000),
});

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const userId = (session.user as any).id;

    const form = await req.formData();
    const data = schema.safeParse({
      title: String(form.get("title") ?? ""),
      content: String(form.get("content") ?? ""),
    });
    if (!data.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const thread = await prisma.discussionThread.create({
      data: {
        title: data.data.title,
        createdById: userId,
        posts: {
          create: {
            content: data.data.content,
            authorId: userId,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: thread.id });
  } catch (err: any) {
    const msg = err?.message ?? "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
