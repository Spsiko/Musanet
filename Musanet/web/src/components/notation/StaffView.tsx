/* Component partially generated with AI assistance. */

import React, { useEffect, useRef } from "react";
import type { Composition, Note, NoteDuration } from "../../lib/notation/model";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";

interface StaffViewProps {
  composition: Composition | null;
}

// Map our duration letters to VexFlow duration strings
const VF_DURATION_MAP: Record<NoteDuration, string> = {
  w: "w",
  h: "h",
  q: "q",
  e: "8",
  s: "16",
};

function parsePitch(pitch: string): {
  key: string;
  accidental: string | null;
} {
  // Expect something like "C4", "D#5", "Bb3"
  const match = pitch.match(/^([A-Ga-g])(#{1}|b{1})?(\d)$/);
  if (!match) {
    // Fallback: middle C
    return { key: "c/4", accidental: null };
  }

  const [, letterRaw, accidental, octave] = match;
  const letter = letterRaw.toLowerCase();

  return {
    key: `${letter}${accidental ?? ""}/${octave}`,
    accidental: accidental ?? null,
  };
}

function noteToVexflow(note: Note) {
  const { key, accidental } = parsePitch(note.pitch);
  const vfDuration = VF_DURATION_MAP[note.duration] ?? "q";

  const vfNote = new StaveNote({
    keys: [key],
    duration: vfDuration,
  });

  if (accidental) {
    vfNote.addModifier(new Accidental(accidental), 0);
  }

  return vfNote;
}

function StaffView({ composition }: StaffViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous rendering
    container.innerHTML = "";

    if (!composition || composition.measures.length === 0) {
      const span = document.createElement("span");
      span.textContent = "Staff will render here.";
      container.appendChild(span);
      return;
    }

    const firstMeasure = composition.measures[0];
    const width = container.clientWidth || 700;
    const height = 220;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    // make strokes/fills visible on dark
    (context as any).setFillStyle("#f4f4f8");
    (context as any).setStrokeStyle("#f4f4f8");

    const stave = new Stave(10, 40, width - 20);
    stave.addClef("treble").addTimeSignature(firstMeasure.timeSignature);
    stave.setContext(context).draw();

    const vfNotes = firstMeasure.notes.map(noteToVexflow);

    // For now we hardcode 4/4 in the voice; fine for MVP
    const voice = new Voice({
        numBeats: 4,
        beatValue: 4,
    });

    // Allow incomplete measures; don't throw if total beats < 4
    voice.setStrict(false);

    voice.addTickables(vfNotes);

    new Formatter().joinVoices([voice]).format([voice], width - 40);
    voice.draw(context, stave);

    return () => {
      container.innerHTML = "";
    };
  }, [composition]);

  return (
    <div className="staff-view">
      <div ref={containerRef} className="staff-view__canvas-placeholder" />
    </div>
  );
}

export default StaffView;
