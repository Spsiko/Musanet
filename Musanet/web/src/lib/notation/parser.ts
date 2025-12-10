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

function isValidPitch(token: string): boolean {
  return PITCH_REGEX.test(token);
}

let noteCounter = 0;
function nextNoteId(): string {
  noteCounter += 1;
  return `note-${noteCounter}`;
}

function parseLineToMeasure(line: string, lineIndex: number, errors: string[]): Measure | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const tokens = trimmed.split(/\s+/);
  if (tokens.length % 2 !== 0) {
    errors.push(
      `Line ${lineIndex + 1}: expected pairs of "<pitch> <duration>", but got an odd number of tokens (${tokens.length}).`
    );
    return null;
  }

  const notes: Note[] = [];

  for (let i = 0; i < tokens.length; i += 2) {
    const pitchToken = tokens[i];
    const durToken = tokens[i + 1];

    if (!isValidPitch(pitchToken)) {
      errors.push(
        `Line ${lineIndex + 1}: invalid pitch "${pitchToken}". Expected like C4, D#5, Bb3.`
      );
      continue;
    }

    if (!isValidDuration(durToken)) {
      errors.push(
        `Line ${lineIndex + 1}: invalid duration "${durToken}". Use one of: ${VALID_DURATIONS.join(
          ", "
        )}.`
      );
      continue;
    }

    notes.push({
      id: nextNoteId(),
      pitch: pitchToken,
      duration: durToken as NoteDuration,
    });
  }

  if (notes.length === 0) {
    // nothing valid on this line
    return null;
  }

  // For now, we assume everything is in 4/4.
  // If you add explicit time signatures later, this is where you parse them.
  const measure: Measure = {
    id: `measure-${lineIndex + 1}`,
    timeSignature: "4/4",
    notes,
  };

  return measure;
}

/**
 * Parse a freeform text block into a Composition.
 *
 * Syntax (current MVP):
 *   - One measure per line.
 *   - Each line contains pairs of "<pitch> <duration>".
 *   - Pitch: C4, D#5, Bb3, etc.
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
