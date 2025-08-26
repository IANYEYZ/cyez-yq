import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const schema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const parsed = schema.safeParse({ status: String(form.get("status") ?? "") });
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    await prisma.confession.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
