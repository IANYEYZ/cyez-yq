// app/api/announcements/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(Permission.MANAGE_ANNOUNCEMENTS);
    const userId = (session!.user as any).id;

    const form = await req.formData();
    const title = String(form.get("title") ?? "");
    const content = String(form.get("content") ?? "");
    if (!title || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await prisma.announcement.create({ data: { title, content, authorId: userId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? "Error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
