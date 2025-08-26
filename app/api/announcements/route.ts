import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const userId = (session.user as any).id; // ← now set by callbacks
    if (!userId) {
      return NextResponse.json({ error: "No user id in session" }, { status: 401 });
    }

    const form = await req.formData();
    const title = String(form.get("title") ?? "");
    const content = String(form.get("content") ?? "");
    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.announcement.create({
      data: { title, content, authorId: userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "Error";
    const status = msg === "Forbidden" ? 403 : msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
