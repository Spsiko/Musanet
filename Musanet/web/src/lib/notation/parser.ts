/* Logic partially generated with AI assistance. */

import type { Composition, Measure, Note } from "./model";

let idCounter = 0;
function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Extremely dumb first pass:
 * - Splits by lines
 * - Treats each line as a measure
 * - Assumes tokens come in pairs: PITCH DURATION
 *
 * We'll replace this with a real parser later.
 */
export function parseTextToComposition(
  raw: string,
  opts?: { title?: string; tempo?: number }
): { composition: Composition | null; errors: string[] } {
  const errors: string[] = [];
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      composition: {
        id: makeId("comp"),
        title: opts?.title ?? "Untitled",
        tempo: opts?.tempo ?? 120,
        measures: [],
      },
      errors,
    };
  }

  const lines = trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const measures: Measure[] = [];

  for (const line of lines) {
    const tokens = line.split(/\s+/);
    if (tokens.length % 2 !== 0) {
      errors.push(`Line "${line}" has an odd number of tokens.`);
      continue;
    }

    const notes: Note[] = [];
    for (let i = 0; i < tokens.length; i += 2) {
      const pitch = tokens[i];
      const duration = tokens[i + 1] as Note["duration"];

      notes.push({
        id: makeId("note"),
        pitch,
        duration,
      });
    }

    measures.push({
      id: makeId("meas"),
      notes,
      timeSignature: "4/4",
    });
  }

  const composition: Composition = {
    id: makeId("comp"),
    title: opts?.title ?? "Untitled",
    tempo: opts?.tempo ?? 120,
    measures,
  };

  return { composition, errors };
}
