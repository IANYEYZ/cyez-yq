import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { luckFor } from "@/lib/luck";

export async function GET() {
  try {
    const session = await requireUser();
    const userId = (session.user as any).id;
    const luck = luckFor(userId);

    // Optional flavor text from Advice Slip (non-blocking)
    let advice: string | null = null;
    try {
      const r = await fetch("https://api.adviceslip.com/advice", {
        // avoid Next cache; it rotates anyway
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (r.ok) {
        const j = await r.json();
        advice = j?.slip?.advice ?? null;
      }
    } catch {
      advice = null;
    }

    return NextResponse.json({ ...luck, advice });
  } catch (e: any) {
    const msg = e?.message ?? "Unauthorized";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
