// Import the RNA codon -> amino-acid map from our DNA module.
import { CODON } from "./dna";

export type Question = {
  prompt: string;           // for example: "What AA does AUG code?"
  choices: string[];        // for example: ["M","L","I","V"] (shuffled)
  correct: string;          // for example: "M"
  meta: { codon: string };  // helpful for review/debug
};

const shuffle = <T,>(arr: T[]) => {
  // In-place Fisher–Yates shuffle (uniform over permutations) for 
  // shuffling (unbiased shuffle).
  for (let i = arr.length - 1; i > 0; i--) {
    // Pick a random index and swap with current.
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Return shuffled array.
  return arr;
};

// Precompute a list of all non-stop codons (exclude '*' answers).
// Reason: we don't want questions whose correct answer is a stop.
const CODONS_NO_STOP = Object.keys(CODON).filter(c => CODON[c] !== "*");

// Precompute the set of unique amino acids that are not stop ('*').
// Reason: for distractors we want distinct AAs different from the correct.
const AA_NO_STOP = Array.from(new Set(CODONS_NO_STOP.map(c => CODON[c])));

// Build n multiple-choice questions of the form "Codon -> AA".
export function makeCodonToAA(n = 10): Question[] {
    // Accumulate questions here.
    const qs: Question[] = [];

    for (let k = 0; k < n; k++) {
        // Pick a random codon from the allowed pool
        const codon = CODONS_NO_STOP[Math.floor(Math.random() * 
            CODONS_NO_STOP.length)];

        // Compute the correct answer via the genetic code.
        const ans = CODON[codon];

        // Build a pool of wrong answers by excluding the correct AA
        const pool = AA_NO_STOP.filter(a => a !== ans);

        // Shuffle that pool and take the first 3 as distractors 
        // (unique by construction)
        shuffle(pool);
        const wrongs = pool.slice(0, 3);

        //  Combine and shuffle options so the correct position varies uniformly
        const choices = shuffle([ans, ...wrongs]);

        // Push the final question object.
        qs.push({
            prompt: `What AA does ${codon} code?`,
            choices,
            correct: ans,
            meta: { codon },
        });
    }

  // Array of n questions.
  return qs;
}

// Reverse index: AA -> [codons...]
const AA2CODONS: Record<string, string[]> = (() => {

  const map: Record<string, string[]> = {};

  for (const codon of CODONS_NO_STOP) {
    // Single letter AA.
    const aa = CODON[codon];          
    
    // Accumulate codons per AA
    (map[aa] ??= []).push(codon);            
  }

  return map;
})();

// Unique list of non-stop amino acids (single letters)
const AAs = Object.keys(AA2CODONS);

// Build n multiple-choice questions of the form "AA -> Codon".
export function makeAAToCodon(n = 10): Question[] {
  const qs: Question[] = [];

  for (let k = 0; k < n; k++) {
    // Pick a random amino acid
    const aa = AAs[Math.floor(Math.random() * AAs.length)];

    // Choose one correct codon for that AA (if multiple exist, pick one randomly)
    const correctCodons = AA2CODONS[aa];
    const correct = correctCodons[Math.floor(Math.random() * correctCodons.length)];

    // Distractors: codons that map to other AAs (not this one)
    const pool = CODONS_NO_STOP.filter(c => CODON[c] !== aa);
    shuffle(pool);
    const wrongs = pool.slice(0, 3);

    // Final options, shuffled
    const choices = shuffle([correct, ...wrongs]);

    qs.push({
      prompt: `Which codon codes for ${aa}?`,
      choices,
      correct,
      meta: { codon: correct },
    });
  }

  return qs;
}