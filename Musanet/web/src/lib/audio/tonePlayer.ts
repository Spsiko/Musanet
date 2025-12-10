/* Playback logic partially generated with AI assistance. */

import * as Tone from "tone";
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

let synth: Tone.Synth | null = null;

async function ensureSynth() {
  await Tone.start();
  if (!synth) {
    synth = new Tone.Synth().toDestination();
  }
}

function getTransport() {
  return Tone.getTransport();
}

/**
 * High-level playback API used by the UI.
 *
 * - Prepares Tone.Transport
 * - Uses `buildSchedule` to derive events
 * - Calls `onNoteChange` as each note starts and when playback ends
 */
export async function playComposition(
  comp: Composition,
  tempo: number,
  onNoteChange?: (noteId: string | null) => void
): Promise<void> {
  if (!comp || comp.measures.length === 0) return;

  await ensureSynth();

  const transport = getTransport();

  // Reset transport and clear previous events
  transport.stop();
  transport.cancel();
  transport.position = 0;
  transport.bpm.value = tempo;

  const events = buildSchedule(comp, tempo);
  if (events.length === 0) return;

  for (const ev of events) {
    transport.schedule((time) => {
      if (onNoteChange) onNoteChange(ev.noteId);
      synth!.triggerAttackRelease(ev.pitch, ev.durationSeconds, time);
    }, ev.timeSeconds);
  }

  // Clear highlight at the end
  const last = events[events.length - 1];
  transport.scheduleOnce(() => {
    if (onNoteChange) onNoteChange(null);
  }, last.timeSeconds + last.durationSeconds);

  transport.start();
}

export function pausePlayback(): void {
  const transport = getTransport();
  transport.pause();
}

export function stopPlayback(
  onNoteChange?: (noteId: string | null) => void
): void {
  const transport = getTransport();
  transport.stop();
  transport.position = 0;

  if (onNoteChange) {
    onNoteChange(null);
  }
}
