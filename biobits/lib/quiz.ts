// lib/quiz.ts
// Quiz generators with optional deterministic seeding

import { CODON } from "./dna";

// ---------- Types ----------
export type Question = {
  prompt: string;          // e.g., "What AA does AUG code?" or "Which codon codes for M?"
  choices: string[];       // shuffled options
  correct: string;         // correct answer (single-letter AA or codon)
  meta: Record<string, any>;
};

export type QuizMode = "codon2aa" | "aa2codon";

// ---------- Simple seeded RNG (Mulberry32) ----------
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ----------- Utilities -----------
function shuffle<T>(arr: T[], rng: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Non-stop codons and AA sets
const CODONS_NO_STOP = Object.keys(CODON).filter((c) => CODON[c] !== "*");
const AA_NO_STOP = Array.from(new Set(CODONS_NO_STOP.map((c) => CODON[c]))).sort();

// Map AA -> list of codons (non-stop)
const AA_TO_CODONS: Record<string, string[]> = AA_NO_STOP.reduce((acc, aa) => {
  acc[aa] = CODONS_NO_STOP.filter((c) => CODON[c] === aa);
  return acc;
}, {} as Record<string, string[]>);

// ----------- Generators -----------
export function makeCodonToAA(n: number, seed?: number): Question[] {
  const rng = seed == null ? Math.random : mulberry32(seed);
  const qs: Question[] = [];
  for (let k = 0; k < n; k++) {
    const codon = CODONS_NO_STOP[Math.floor(rng() * CODONS_NO_STOP.length)];
    const ans = CODON[codon]; // single-letter AA

    const pool = AA_NO_STOP.filter((a) => a !== ans);
    shuffle(pool, rng);
    const wrongs = pool.slice(0, 3);

    qs.push({
      prompt: `What AA does ${codon} code?`,
      choices: shuffle([ans, ...wrongs], rng),
      correct: ans,
      meta: { codon, type: "codon2aa" },
    });
  }
  return qs;
}

export function makeAAToCodon(n: number, seed?: number): Question[] {
  const rng = seed == null ? Math.random : mulberry32(seed);
  const qs: Question[] = [];
  for (let k = 0; k < n; k++) {
    const aa = AA_NO_STOP[Math.floor(rng() * AA_NO_STOP.length)];
    const correctCodons = AA_TO_CODONS[aa];
    const correct = correctCodons[Math.floor(rng() * correctCodons.length)];

    // Build distractor codons from other amino acids
    const otherCodons = CODONS_NO_STOP.filter((c) => CODON[c] !== aa);
    shuffle(otherCodons, rng);
    const wrongs = otherCodons.slice(0, 3);

    qs.push({
      prompt: `Which codon codes for ${aa}?`,
      choices: shuffle([correct, ...wrongs], rng),
      correct,
      meta: { aa, type: "aa2codon" },
    });
  }
  return qs;
}

// Master builder
export function makeQuestions(mode: QuizMode, n: number, seed?: number): Question[] {
  return mode === "codon2aa" ? makeCodonToAA(n, seed) : makeAAToCodon(n, seed);
}
