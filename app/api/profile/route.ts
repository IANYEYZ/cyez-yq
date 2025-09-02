import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  bio: z.string().trim().max(2000).optional().or(z.literal("")), // ← add bio
});

export async function GET() {
  const session = await requireUser();
  const id = (session.user as any).id as string;
  const me = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true, role: true, createdAt: true, bio: true }, // ← add bio
  });
  return NextResponse.json(me);
}

export async function PUT(req: Request) {
  try {
    const session = await requireUser();
    const id = (session.user as any).id as string;

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { name, bio } = parsed.data;

    const updated = await prisma.user.update({
      where: { id },
      data: { name, bio: bio || null }, // ← persist markdown
      select: { name: true, bio: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
