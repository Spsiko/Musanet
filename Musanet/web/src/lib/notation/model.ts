/* Types partially generated with AI assistance. */

export type NoteDuration = "w" | "h" | "q" | "e" | "s";

export interface Note {
  id: string;
  pitch: string;          // still keep a pitch; parser/serializer already handle R
  duration: NoteDuration;
  isRest?: boolean;       // <- already effectively used elsewhere
}

export interface Measure {
  id: string;
  timeSignature: string;
  notes: Note[];
}

export interface Composition {
  id: string;
  title: string;
  tempo: number;
  measures: Measure[];
}
