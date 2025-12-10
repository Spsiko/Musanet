/* Playback logic partially generated with AI assistance. */

import * as Tone from "tone";
import type { Composition } from "../notation/model";
import { buildSchedule } from "./scheduler";

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
