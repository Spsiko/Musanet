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
const TS_PREFIX = /^(\d+)\/(\d+)\s*\|\s*(.*)$/;

function isValidPitch(token: string): boolean {
  return PITCH_REGEX.test(token);
}

let noteCounter = 0;
function nextNoteId(): string {
  noteCounter += 1;
  return `note-${noteCounter}`;
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

    if (!Number.isNaN(num) && !Number.isNaN(den) && num > 0 && den > 0) {
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

  const tokens = notesPart.split(/\s+/);
  if (tokens.length % 2 !== 0) {
    errors.push(
      `Line ${lineIndex + 1}: expected pairs of "<pitch> <duration>", but got an odd number of tokens (${tokens.length}).`
    );
    // We'll still try to parse what we can
  }

  const notes: Note[] = [];

  for (let i = 0; i < tokens.length; i += 2) {
    const pitchToken = tokens[i];
    const durToken = tokens[i + 1];

    if (!pitchToken || !durToken) {
      // Handles odd token count case
      break;
    }

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

  const measure: Measure = {
    id: `measure-${lineIndex + 1}`,
    timeSignature,
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
