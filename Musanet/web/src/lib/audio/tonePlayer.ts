/* Playback logic partially generated with AI assistance. */

import * as Tone from "tone";
import type { Composition, NoteDuration } from "../notation/model";

const DURATION_BEATS: Record<NoteDuration, number> = {
  w: 4,
  h: 2,
  q: 1,
  e: 0.5,
  s: 0.25,
};

interface Event {
  timeSeconds: number;
  durationSeconds: number;
  pitch: string;
  noteId: string;
}

function buildSchedule(comp: Composition, tempo: number): Event[] {
  const secPerBeat = 60 / tempo;
  const schedule: Event[] = [];

  let beatPos = 0;

  for (const measure of comp.measures) {
    for (const note of measure.notes) {
      const beats = DURATION_BEATS[note.duration] ?? 1;
      schedule.push({
        timeSeconds: beatPos * secPerBeat,
        durationSeconds: beats * secPerBeat,
        pitch: note.pitch,
        noteId: note.id,
      });
      beatPos += beats;
    }
  }

  return schedule;
}

let synth: Tone.Synth | null = null;

async function ensureSynth() {
  await Tone.start();
  if (!synth) synth = new Tone.Synth().toDestination();
}

export async function playComposition(
  comp: Composition,
  tempo: number,
  onNoteChange?: (noteId: string | null) => void
) {
  if (!comp || comp.measures.length === 0) return;

  await ensureSynth();

  const transport = Tone.getTransport();

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

export function pausePlayback() {
  const transport = Tone.getTransport();
  transport.pause();
}

export function stopPlayback(onNoteChange?: (noteId: string | null) => void) {
  const transport = Tone.getTransport();
  transport.stop();
  transport.position = 0;
  if (onNoteChange) onNoteChange(null);
}
