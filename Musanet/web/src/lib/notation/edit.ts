/* Editing helpers partially generated with AI assistance. */

import type { Composition, Note, NoteDuration } from "./model";
import { stepPitchByDegreeClamped } from "./pitch";

export function deleteNoteById(comp: Composition, id: string): Composition {
  const measures = comp.measures
    .map((m) => ({
      ...m,
      notes: m.notes.filter((n) => n.id !== id),
    }))
    .filter((m) => m.notes.length > 0);

  return { ...comp, measures };
}

export function appendNoteToLastMeasure(
  comp: Composition,
  note: Note
): Composition {
  if (comp.measures.length === 0) return comp;

  const lastIndex = comp.measures.length - 1;
  const last = comp.measures[lastIndex];

  const newMeasures = comp.measures.slice();
  newMeasures[lastIndex] = {
    ...last,
    notes: [...last.notes, note],
  };

  return { ...comp, measures: newMeasures };
}

/**
 * Update a single note's pitch by diatonic steps (e.g., ArrowUp/Down).
 */
export function updateNotePitchById(
  comp: Composition,
  id: string,
  steps: number
): Composition {
  if (steps === 0) return comp;

  const measures = comp.measures.map((m) => ({
    ...m,
    notes: m.notes.map((n) =>
      n.id === id
        ? {
            ...n,
            pitch: stepPitchByDegreeClamped(n.pitch, steps),
          }
        : n
    ),
  }));

  return { ...comp, measures };
}

/**
 * Update a single note's duration to a new value.
 */
export function updateNoteDurationById(
  comp: Composition,
  id: string,
  duration: NoteDuration
): Composition {
  const measures = comp.measures.map((m) => ({
    ...m,
    notes: m.notes.map((n) =>
      n.id === id
        ? {
            ...n,
            duration,
          }
        : n
    ),
  }));

  return { ...comp, measures };
}
