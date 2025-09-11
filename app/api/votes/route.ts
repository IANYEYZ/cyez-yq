import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";

const closesAtSchema = z.preprocess(
  (v) => (v == null || v === "" ? undefined : v),
  z.coerce.date().optional()
);

const coerceBool = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return v === "true" || v === "on" || v === "1";
  return false;
}, z.boolean());

const optionsSchema = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    // support newline OR comma separated
    return v
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return v;
}, z.array(z.string().trim().min(1).max(100)).min(2).max(12));

const bodySchema = z
  .object({
    question: z.string().trim().min(3).max(200),
    options: optionsSchema,
    closesAt: closesAtSchema,              // Date | undefined
    multi: coerceBool.optional().default(false),
    maxChoices: z.coerce.number().int().min(1).max(12).optional().default(1),
  })
  .superRefine((val, ctx) => {
    const maxChoices = val.multi ? val.maxChoices : 1;
    if (maxChoices > val.options.length) {
      ctx.addIssue({
        code: "custom",
        message: "maxChoices cannot exceed the number of options",
        path: ["maxChoices"],
      });
    }
  });

export async function POST(req: Request) {
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  // Accept both JSON and FormData
  const ctype = req.headers.get("content-type") ?? "";
  let payload: any = null;

  if (ctype.includes("application/json")) {
    payload = await req.json().catch(() => null);
  } else if (ctype.includes("multipart/form-data") || ctype.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData();
    payload = {
      question: fd.get("question"),
      options: fd.get("options"),        // text area: newline/comma separated
      closesAt: fd.get("closesAt"),      // datetime-local string or ""
      multi: fd.get("multi"),            // "on"/"true"/"1"
      maxChoices: fd.get("maxChoices"),
    };
  } else {
    // best-effort JSON fallback
    payload = await req.json().catch(() => null);
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { question, options, closesAt, multi, maxChoices } = parsed.data;
  const capped = multi ? Math.max(1, Math.min(maxChoices, options.length)) : 1;

  await prisma.poll.create({
    data: {
      question,
      createdById: userId,
      closesAt: closesAt ?? null,
      multi,
      maxChoices: capped,
      options: { create: options.map((text: string) => ({ text })) },
    },
  });

  return NextResponse.json({ ok: true });
}
