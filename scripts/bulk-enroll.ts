// scripts/bulk-enroll.ts
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Usage: npx tsx scripts/bulk-enroll.ts roster.csv [daysValid=14]
const [, , file, daysStr] = process.argv;
if (!file) {
  console.error("Usage: npx tsx scripts/bulk-enroll.ts roster.csv [daysValid=14]");
  process.exit(1);
}
const daysValid = Number(daysStr ?? 14);

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

const prisma = new PrismaClient();

(async () => {
  const raw = fs.readFileSync(file, "utf8");
  const rows: Array<{ email: string; name?: string }> = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const out: Array<{ email: string; name: string; code: string; expires: string }> = [];

  for (const row of rows) {
    const email = (row.email || "").trim().toLowerCase();
    const name = (row.name || "").trim();
    if (!email) continue;

    // Create user if missing (no password yet)
    await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined, role: "STUDENT" },
      create: { email, name: name || email.split("@")[0], role: "STUDENT" },
    });

    // Invalidate old tokens for this email
    await prisma.enrollmentToken.deleteMany({
      where: { email },
    });

    // Create a short human-friendly code, e.g. ABCD-1F3K
    const code = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 hex chars
    const pretty = `${code.slice(0, 4)}-${code.slice(4)}`;

    const tokenHash = await bcrypt.hash(pretty, 10);
    await prisma.enrollmentToken.create({
      data: {
        email,
        tokenHash,
        expires: addDays(new Date(), daysValid),
      },
    });

    out.push({ email, name: name || "", code: pretty, expires: addDays(new Date(), daysValid).toISOString() });
  }

  const outPath = path.resolve(process.cwd(), "enrollment_codes.csv");
  const header = "email,name,code,expires\n";
  fs.writeFileSync(
    outPath,
    header + out.map(r => `${r.email},${JSON.stringify(r.name)},${r.code},${r.expires}`).join("\n"),
    "utf8"
  );
  console.log(`✅ Created ${out.length} enrollment code(s) → ${outPath}`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
