/* Pitch helpers partially generated with AI assistance. */

/**
 * Internal representation of a pitch like "C#4" or "Bb3".
 */
export interface ParsedPitch {
  letter: string;        // C, D, E, F, G, A, B (uppercase)
  accidental: string | null; // "#", "b", or null
  octave: number;        // integer
}

const LETTERS: string[] = ["C", "D", "E", "F", "G", "A", "B"];

const PITCH_REGEX = /^([A-Ga-g])(#{1}|b{1})?(\d)$/;

export function parsePitchToken(pitch: string): ParsedPitch | null {
  const match = pitch.match(PITCH_REGEX);
  if (!match) return null;

  const [, letterRaw, accidental, octaveStr] = match;
  const letter = letterRaw.toUpperCase();
  const octave = Number(octaveStr);

  if (!LETTERS.includes(letter) || Number.isNaN(octave)) {
    return null;
  }

  return {
    letter,
    accidental: accidental ?? null,
    octave,
  };
}

/**
 * Step a pitch up or down by diatonic degree (C->D->E->...->B->C),
 * preserving accidental as-is for now.
 *
 * This is simple and predictable for keyboard nudging.
 */
export function stepPitchByDegree(pitch: string, steps: number): string {
  const parsed = parsePitchToken(pitch);
  if (!parsed || steps === 0) return pitch;

  let { letter, accidental, octave } = parsed;

  let idx = LETTERS.indexOf(letter);
  if (idx === -1) return pitch;

  let newIdx = idx + steps;
  let newOctave = octave;

  while (newIdx >= LETTERS.length) {
    newIdx -= LETTERS.length;
    newOctave += 1;
  }

  while (newIdx < 0) {
    newIdx += LETTERS.length;
    newOctave -= 1;
  }

  const newLetter = LETTERS[newIdx];

  return `${newLetter}${accidental ?? ""}${newOctave}`;
}

const MIN_PITCH = "C3";
const MAX_PITCH = "C6";

function pitchDegree(pitch: string): number | null {
  const parsed = parsePitchToken(pitch);
  if (!parsed) return null;
  const idx = LETTERS.indexOf(parsed.letter);
  if (idx === -1) return null;
  // Diatonic degree count from C0
  return parsed.octave * LETTERS.length + idx;
}

/**
 * Clamp a pitch string between MIN_PITCH and MAX_PITCH
 * in terms of diatonic degree (ignores accidental for range).
 */
export function clampPitch(pitch: string): string {
  const deg = pitchDegree(pitch);
  const minDeg = pitchDegree(MIN_PITCH);
  const maxDeg = pitchDegree(MAX_PITCH);

  if (deg == null || minDeg == null || maxDeg == null) {
    return pitch;
  }

  if (deg < minDeg) {
    return MIN_PITCH;
  }
  if (deg > maxDeg) {
    return MAX_PITCH;
  }
  return pitch;
}

/**
 * Like stepPitchByDegree, but clamps result within a safe range.
 */
export function stepPitchByDegreeClamped(
  pitch: string,
  steps: number
): string {
  const stepped = stepPitchByDegree(pitch, steps);
  return clampPitch(stepped);
}
