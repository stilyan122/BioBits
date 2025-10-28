// Clean a raw string into a canonical DNA sequence.
// - Uppercase everything
// - Keep only A/C/G/T (drop spaces, digits, N, etc.)
// Complexity: O(n) time, O(1) extra space (excluding output).
export const clean = (s: string) => s.toUpperCase().replace(/[^ACGT]/g, '');

// Mapping for base complements in DNA. A <-> T and C <-> G.
const comp: Record<string,string> = { A:'T', C:'G', G:'C', T:'A' };

// Compute the reverse complement of a DNA string.   <-- fixed typo
export const reverseComplement = (dna: string) => {
  // Sanitize sequence.
  const x = clean(dna);

  // We'll build the output incrementally.
  let out = '';

  // Start at last index, for each base get complement and append.
  // Complexity: O(n), output length equals input length.
  for (let i = x.length - 1; i >= 0; i--) 
    out += comp[x[i]];

  // Finally built reverse-complement string.
  return out;
};

// Transcription: DNA -> RNA by replacing T with U.
// Note: we clean first to remove non-ACGT; then T→U. Complexity: O(n).
export const transcribe = (dna: string) => clean(dna).replaceAll('T','U');

// Genetic code: RNA codon (triplet of A/C/G/U) -> amino acid (single letter).
// '*' denotes stop codons. This is the "Standard" code.
export const CODON: Record<string,string> = {
  UUU:'F',UUC:'F',UUA:'L',UUG:'L',CUU:'L',CUC:'L',CUA:'L',CUG:'L',
  AUU:'I',AUC:'I',AUA:'I',AUG:'M',GUU:'V',GUC:'V',GUA:'V',GUG:'V',
  UCU:'S',UCC:'S',UCA:'S',UCG:'S',CCU:'P',CCC:'P',CCA:'P',CCG:'P',
  ACU:'T',ACC:'T',ACA:'T',ACG:'T',GCU:'A',GCC:'A',GCA:'A',GCG:'A',
  UAU:'Y',UAC:'Y',UAA:'*',UAG:'*',CAU:'H',CAC:'H',CAA:'Q',CAG:'Q',
  AAU:'N',AAC:'N',AAA:'K',AAG:'K',GAU:'D',GAC:'D',GAA:'E',GAG:'E',
  UGU:'C',UGC:'C',UGA:'*',UGG:'W',CGU:'R',CGC:'R',CGA:'R',CGG:'R',
  AGU:'S',AGC:'S',AGA:'R',AGG:'R',GGU:'G',GGC:'G',GGA:'G',GGG:'G',
};

// Translate an RNA string into an amino-acid sequence.
// Behavior notes:
// - We strip non A/C/G/U just in case input is messy.
// - We read in steps of 3; unknown codons become '?'.
// - We DO NOT stop at '*' automatically; UI can slice at first '*' if desired.
// Complexity: O(n) time (n = r.length), step = 3.
export const translate = (rna: string) => {
  // Ensure only A/C/G/U.
  const r = rna.replace(/[^ACGU]/g,'');

  // Build peptide as a string.
  let aa = '';

  // Loop over complete triplets, map each triplet to amino acid.
  for (let i = 0; i + 2 < r.length; i += 3) 
    aa += CODON[r.slice(i,i+3)] ?? '?';

  // Return the amino-acid sequence.
  return aa;
};

// GC content as a percentage of G and C bases in the DNA string.
// Definition: GC% = 100 * (#G + #C) / N, where N = length(cleaned DNA).
export const gcContent = (dna: string) => {
  // Keep only A/C/G/T.
  const x = clean(dna);

  // Total valid bases.
  const n = x.length; 

  // Avoid division by 0.
  if (!n) 
    return 0;

  // Count for G and C.
  let g = 0;

  // Linear scan.
  for (const c of x) 
    if (c === 'G' || c === 'C') 
      g++;

  // Multiply first, then divide, then round to 2 dps.
  return Math.round((10000 * g) / n) / 100; 
};