/* Editing helpers partially generated with AI assistance. */

import type { Composition, Note } from "./model";

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
