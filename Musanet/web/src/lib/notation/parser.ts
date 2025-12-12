/* Parser logic partially generated with AI assistance. */

import type { Composition, Measure, Note, NoteDuration } from "./model";

export interface ParseOptions {
  title?: string;
  tempo?: number;
}

export interface ParseResult {
  composition: Composition | null;
  errors: string[];
}

/**
 * Supported durations:
 *   w = whole
 *   h = half
 *   q = quarter
 *   e = eighth
 *   s = sixteenth
 */
const VALID_DURATIONS: NoteDuration[] = ["w", "h", "q", "e", "s"];

/**
 * Mapping from durations to "quarter-note beat units".
 * Keep this consistent with the scheduler’s DURATION_BEATS.
 *
 * - q = 1
 * - h = 2
 * - w = 4
 * - e = 0.5
 * - s = 0.25
 */
const DURATION_BEATS: Record<NoteDuration, number> = {
  w: 4,
  h: 2,
  q: 1,
  e: 0.5,
  s: 0.25,
};

function isValidDuration(token: string): token is NoteDuration {
  return VALID_DURATIONS.includes(token as NoteDuration);
}

/**
 * Pitch format:
 *   Letter: A–G (case-insensitive)
 *   Optional accidental: # or b
 *   Octave: 0–9
 *
 * Examples: C4, D#5, Bb3
 */
const PITCH_REGEX = /^([A-Ga-g])(#{1}|b{1})?(\d)$/;

/**
 * Optional leading time-signature prefix:
 *   "X/Y | rest of line"
 *
 * Examples:
 *   "4/4 | C4 q D4 q E4 h"
 *   "3/8|C4 e D4 e E4 e"
 */
const TS_PREFIX = /^(\d+)\/(\d+)\s*\|\s*(.*)$/;

function isValidPitch(token: string): boolean {
  return PITCH_REGEX.test(token);
}

let noteCounter = 0;
function nextNoteId(): string {
  noteCounter += 1;
  return `note-${noteCounter}`;
}

/**
 * Convert a sequence of notes (including rests) into
 * total duration in "quarter-note beat units".
 */
function computeTotalBeats(notes: Note[]): number {
  return notes.reduce((sum, n) => {
    const beats = DURATION_BEATS[n.duration as NoteDuration] ?? 0;
    return sum + beats;
  }, 0);
}

/**
 * Given a time signature "num/den", compute the measure capacity
 * in quarter-note units and return num/den for messaging.
 *
 * For example:
 *   4/4 -> capacity = 4 (4 quarter notes)
 *   3/4 -> capacity = 3
 *   3/8 -> capacity = 1.5 (3 eighths = 1.5 quarters)
 *   4/1 -> capacity = 16 (4 whole notes = 16 quarters)
 */
function getMeasureCapacity(timeSignature: string) {
  const match = timeSignature.match(/^(\d+)\/(\d+)$/);
  if (!match) return null;

  const [, numStr, denStr] = match;
  const num = Number(numStr);
  const den = Number(denStr);

  if (!Number.isFinite(num) || !Number.isFinite(den) || num <= 0 || den <= 0) {
    return null;
  }

  const capacityQuarterBeats = num * (4 / den);
  return { num, den, capacityQuarterBeats };
}

/**
 * Format the number of beats in "denominator units" for error messages.
 *
 * Internally everything is quarter-unit based, but humans think in:
 *   - "4 beats" in 4/4
 *   - "3 beats" in 3/8 (eighth-note beats)
 *   - "4 beats" in 4/1 (whole-note beats)
 */
function formatBeatsForDenominator(
  totalQuarterBeats: number,
  den: number
): string {
  const raw = totalQuarterBeats * (den / 4);
  const rounded = Math.round(raw * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function parseLineToMeasure(
  line: string,
  lineIndex: number,
  errors: string[]
): Measure | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  // Default time signature
  let timeSignature = "4/4";
  let notesPart = trimmed;

  // Optional "X/Y |" prefix
  const tsMatch = trimmed.match(TS_PREFIX);
  if (tsMatch) {
    const [, numStr, denStr, rest] = tsMatch;
    const num = Number(numStr);
    const den = Number(denStr);

    if (
      Number.isFinite(num) &&
      Number.isFinite(den) &&
      num > 0 &&
      den > 0
    ) {
      timeSignature = `${num}/${den}`;
      notesPart = rest.trim();
    } else {
      errors.push(
        `Line ${lineIndex + 1}: invalid time signature "${numStr}/${denStr}".`
      );
      // Still try to parse notes in the rest of the line
      notesPart = rest.trim();
    }
  }

  if (!notesPart) {
    // Line had only a time signature and no notes
    return null;
  }

  const tokens = notesPart.split(/\s+/).filter(Boolean);
  if (tokens.length % 2 !== 0) {
    errors.push(
      `Line ${lineIndex + 1}: expected pairs of "<pitch|R> <duration>", but got an odd number of tokens (${tokens.length}).`
    );
    // We'll still try to parse what we can
  }

  const notes: Note[] = [];
  let totalQuarterBeats = 0;

  for (let i = 0; i < tokens.length; i += 2) {
    const pitchToken = tokens[i];
    const durToken = tokens[i + 1];

    if (!pitchToken || !durToken) {
      // Handles odd token count case
      break;
    }

    if (!isValidDuration(durToken)) {
      errors.push(
        `Line ${lineIndex + 1}: invalid duration "${durToken}". Use one of: ${VALID_DURATIONS.join(
          ", "
        )}.`
      );
      continue;
    }

    const duration = durToken as NoteDuration;
    const beats = DURATION_BEATS[duration] ?? 0;

    // Rest syntax: "R <duration>"
    if (pitchToken.toUpperCase() === "R") {
      const restNote: Note = {
        id: nextNoteId(),
        // Pitch is effectively ignored for rests by rendering / playback,
        // but we keep a placeholder for typing.
        pitch: "C4",
        duration,
        isRest: true,
      };
      notes.push(restNote);
      totalQuarterBeats += beats;
      continue;
    }

    // Normal pitched note
    if (!isValidPitch(pitchToken)) {
      errors.push(
        `Line ${lineIndex + 1}: invalid pitch "${pitchToken}". Expected like C4, D#5, Bb3, or use "R" for a rest.`
      );
      continue;
    }

    const note: Note = {
      id: nextNoteId(),
      pitch: pitchToken,
      duration,
    };

    notes.push(note);
    totalQuarterBeats += beats;
  }

  if (notes.length === 0) {
    // nothing valid on this line
    return null;
  }

  const measure: Measure = {
    id: `measure-${lineIndex + 1}`,
    timeSignature,
    notes,
  };

  // --- Time-signature vs duration validation ---
  const cap = getMeasureCapacity(timeSignature);
  if (cap) {
    const { num, den, capacityQuarterBeats } = cap;
    const epsilon = 1e-6;

    if (totalQuarterBeats > capacityQuarterBeats + epsilon) {
      const expectedBeats = num; // in "denominator" units
      const usedBeats = formatBeatsForDenominator(totalQuarterBeats, den);
      errors.push(
        `Line ${lineIndex + 1}: overfull measure. Time signature ${timeSignature} expects ${expectedBeats} beats, but found ${usedBeats}.`
      );
    } else if (totalQuarterBeats < capacityQuarterBeats - epsilon) {
      const expectedBeats = num;
      const usedBeats = formatBeatsForDenominator(totalQuarterBeats, den);
      errors.push(
        `Line ${lineIndex + 1}: underfull measure. Time signature ${timeSignature} expects ${expectedBeats} beats, but found ${usedBeats}.`
      );
    }
  }

  return measure;
}

/**
 * Parse a freeform text block into a Composition.
 *
 * Syntax (current MVP):
 *   - One measure per line.
 *   - Optional leading time signature: "X/Y | ...".
 *   - Each line contains pairs of "<pitch|R> <duration>".
 *   - Pitch: C4, D#5, Bb3, etc.
 *   - Rest: R (case-insensitive).
 *   - Duration: w, h, q, e, s.
 */
export function parseTextToComposition(
  input: string,
  options: ParseOptions = {}
): ParseResult {
  const raw = input ?? "";
  const lines = raw.split(/\r?\n/);

  const errors: string[] = [];
  const measures: Measure[] = [];

  noteCounter = 0;

  lines.forEach((line, index) => {
    const measure = parseLineToMeasure(line, index, errors);
    if (measure) {
      measures.push(measure);
    }
  });

  if (measures.length === 0) {
    if (!raw.trim()) {
      // no input at all: this is fine; just no composition
      return { composition: null, errors };
    }

    // there was text, but all of it was invalid
    if (errors.length === 0) {
      errors.push("No valid notes found in input.");
    }
    return { composition: null, errors };
  }

  const composition: Composition = {
    id: "composition-1",
    title: options.title ?? "Untitled piece",
    tempo: options.tempo ?? 120,
    measures,
  };

  return { composition, errors };
}
