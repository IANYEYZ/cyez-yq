// lib/luck.ts
// Deterministic "today's luck" per user based on (userId + YYYY-MM-DD in America/Los_Angeles)

type Tier = "Awful" | "Bad" | "Meh" | "Good" | "Great";

export type LuckResult = {
  day: string;              // e.g., 2025-08-18 (LA)
  score: number;            // 0..100
  tier: Tier;
  emoji: string;
  luckyNumber: number;      // 1..99
  luckyColor: string;
  blurb: string;
  seed: string;             // debug
};

const COLORS = [
  "Red","Orange","Amber","Yellow","Lime","Green","Teal","Cyan",
  "Sky","Blue","Indigo","Violet","Fuchsia","Pink","Rose","Brown","Slate","Black","White","Gold","Silver"
];

const BLURBS: Record<Tier, string[]> = {
  Awful: ["Today is for damage control. Keep plans simple.", "Low energy day — double-check everything."],
  Bad:   ["Set small goals; avoid big commitments.", "Not ideal for risks; routine wins."],
  Meh:   ["Steady as she goes. Tidy up loose ends.", "Neutral vibes — focus and you’ll cruise."],
  Good:  ["Momentum is on your side. Try that thing.", "Great for collaboration and sharing."],
  Great: ["Green lights everywhere — take the shot.", "Peak luck window — aim high."]
};

function dateKeyLA(d = new Date()): string {
  // 2025-08-18 in America/Los_Angeles
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d);
}

// simple string hash -> 32-bit
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0; // unsigned
  };
}

// deterministic PRNG from seed
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function luckFor(userId: string, d = new Date()): LuckResult {
  const day = dateKeyLA(d);
  const seedStr = `${userId}:${day}`;
  const seed = xmur3(seedStr)();
  const rng = mulberry32(seed);

  const score = Math.floor(rng() * 101); // 0..100
  const tier: Tier =
    score >= 85 ? "Great" :
    score >= 65 ? "Good"  :
    score >= 45 ? "Meh"   :
    score >= 25 ? "Bad"   : "Awful";

  const emoji =
    tier === "Great" ? "🍀" :
    tier === "Good"  ? "🌤️" :
    tier === "Meh"   ? "😐" :
    tier === "Bad"   ? "🌧️" : "⛈️";

  const luckyNumber = 1 + Math.floor(rng() * 99);
  const luckyColor = pick(rng, COLORS);
  const blurb = pick(rng, BLURBS[tier]);

  return { day, score, tier, emoji, luckyNumber, luckyColor, blurb, seed: seedStr };
}
