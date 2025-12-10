/* Schedule builder partially generated with AI assistance. But like barely this time, unless I change this later*/

import type { Composition, NoteDuration } from "../notation/model";

/**
 * Mapping from symbolic durations to beats.
 * Extend here later if you add dotted durations, etc.
 */
export const DURATION_BEATS: Record<NoteDuration, number> = {
  w: 4,
  h: 2,
  q: 1,
  e: 0.5,
  s: 0.25,
};

export interface PlaybackEvent {
  timeSeconds: number;
  durationSeconds: number;
  pitch: string;
  noteId: string;
}

/**
 * Build a flat, time-ordered schedule of playback events
 * from a Composition and a tempo in BPM.
 *
 * Pure function: perfect for unit tests.
 */
export function buildSchedule(
  comp: Composition,
  tempo: number
): PlaybackEvent[] {
  if (!comp || comp.measures.length === 0) return [];

  const secPerBeat = 60 / tempo;
  const events: PlaybackEvent[] = [];
  let beatPos = 0;

  for (const measure of comp.measures) {
    for (const note of measure.notes) {
      const beats = DURATION_BEATS[note.duration] ?? 1;
      const timeSeconds = beatPos * secPerBeat;
      const durationSeconds = beats * secPerBeat;

      events.push({
        timeSeconds,
        durationSeconds,
        pitch: note.pitch,
        noteId: note.id,
      });

      beatPos += beats;
    }
  }

  return events;
}
