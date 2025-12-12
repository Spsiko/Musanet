// Schedule builder partially generated with AI assistance.
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
  pitch: string | null;
  noteId: string | null;
  isRest?: boolean;
}

/**
 * Build a flat, time-ordered schedule of playback events
 * from a Composition and a tempo in BPM.
 *
 * Rests are included as events (for highlighting) but have
 * pitch = null and isRest = true, so Tone produces no sound.
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

      if (note.isRest) {
        // Silent event, still present in timeline for highlighting
        events.push({
          timeSeconds,
          durationSeconds,
          pitch: null,
          noteId: note.id,
          isRest: true,
        });
      } else {
        // Normal pitched note
        events.push({
          timeSeconds,
          durationSeconds,
          pitch: note.pitch,
          noteId: note.id,
          isRest: false,
        });
      }

      beatPos += beats;
    }
  }

  return events;
}
