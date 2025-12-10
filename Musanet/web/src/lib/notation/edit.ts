/* Editing helpers partially generated with AI assistance. */

import type { Composition, Note, NoteDuration } from "./model";
import { stepPitchByDegree, clampPitch } from "./pitch";

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
  composition: Composition,
  noteId: string,
  steps: number
): Composition {
  return {
    ...composition,
    measures: composition.measures.map((measure) => ({
      ...measure,
      notes: measure.notes.map((note: Note) => {
        if (note.id !== noteId) return note;

        // Rests do not change pitch with arrow keys
        if (note.isRest) return note;

        const nextPitch = clampPitch(stepPitchByDegree(note.pitch, steps));
        return {
          ...note,
          pitch: nextPitch,
        };
      }),
    })),
  };
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
