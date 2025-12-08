/* Types partially generated with AI assistance. */

export type NoteDuration = "w" | "h" | "q" | "e" | "s";

export interface Note {
  id: string;
  pitch: string;          // e.g. "C4", "D#5"
  duration: NoteDuration; // q = quarter, etc.
  // later: startBeat, tie, etc.
}

export interface Measure {
  id: string;
  notes: Note[];
  timeSignature: string;  // "4/4" for now
}

export interface Composition {
  id: string;
  title: string;
  tempo: number;          // bpm
  measures: Measure[];
}
