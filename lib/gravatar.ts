// lib/gravatar.ts
import { createHash } from "crypto";

/**
 * Build a Gravatar URL from an email. Email is never exposed — only the MD5 hash.
 * @param email user's email (can be null/undefined)
 * @param size  pixel size (1–2048). Gravatar serves square images.
 * @param def   default style: "mp" | "identicon" | "monsterid" | "wavatar" | "retro" | "blank" | "404" | custom URL
 */
export function gravatarUrl(
  email: string | null | undefined,
  size = 64,
  def: string = "identicon"
) {
  const e = (email ?? "").trim().toLowerCase();
  const hash = createHash("md5").update(e).digest("hex");
  const s = Math.max(1, Math.min(size, 2048));
  const d = encodeURIComponent(def);
  return `https://www.gravatar.com/avatar/${hash}?s=${s}&d=${d}&r=g`;
}
