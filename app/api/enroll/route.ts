import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.email(),
  code: z.string().min(3).max(64),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, code, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "No such student" }, { status: 404 });

    const token = await prisma.enrollmentToken.findFirst({
      where: { email, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!token) return NextResponse.json({ error: "No active code for this email" }, { status: 400 });

    if (token.expires < new Date()) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    const ok = await bcrypt.compare(code, token.tokenHash);
    if (!ok) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    // Set password and mark token used
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { passwordHash },
      }),
      prisma.enrollmentToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
