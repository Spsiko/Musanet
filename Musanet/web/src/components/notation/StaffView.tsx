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
  activeNoteId?: string | null;
  selectedNoteId?: string | null;
  onNoteClick?: (noteId: string) => void;
  onBackgroundClick?: () => void;
}

const VF_DURATION_MAP: Record<NoteDuration, string> = {
  w: "w",
  h: "h",
  q: "q",
  e: "8",
  s: "16",
};

function parsePitch(pitch: string): { key: string; accidental: string | null } {
  // Expect things like C4, D#5, Bb3
  const match = pitch.match(/^([A-Ga-g])(#{1}|b{1})?(\d)$/);
  if (!match) {
    // fallback to middle C so we don't crash on bad input
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
    // Your corrected argument order
    vfNote.addModifier(new Accidental(accidental), 0);
  }

  return vfNote;
}

function StaffView({
  composition,
  activeNoteId,
  selectedNoteId,
  onNoteClick,
  onBackgroundClick,
}: StaffViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset container
    container.innerHTML = "";

    // Empty state
    if (!composition || composition.measures.length === 0) {
      const span = document.createElement("span");
      span.textContent = "Staff will render here.";
      container.appendChild(span);
      return;
    }

    const measures = composition.measures;
    const width = container.clientWidth || 700;
    const height = 260;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const leftMargin = 10;
    const rightMargin = 10;
    const topY = 40;
    const availableWidth = width - leftMargin - rightMargin;
    const measureWidth = Math.max(80, availableWidth / measures.length);

    const staves: Stave[] = [];
    const voices: Voice[] = [];
    const flatNotes: Note[] = [];

    // Build staves, voices, and a flat list of notes
    measures.forEach((measure, index) => {
      const x = leftMargin + index * measureWidth;

      const stave = new Stave(x, topY, measureWidth);
      if (index === 0) {
        stave.addClef("treble").addTimeSignature(measure.timeSignature);
      }
      stave.setContext(context).draw();
      staves.push(stave);

      const vfNotes = measure.notes.map((note) => {
        flatNotes.push(note);
        return noteToVexflow(note);
      });

      const voice = new Voice({
        numBeats: 4,
        beatValue: 4,
      });
      voice.setStrict(false);
      voice.addTickables(vfNotes);
      voices.push(voice);
    });

    // Layout and draw each measure
    staves.forEach((stave, index) => {
      const voice = voices[index];
      const formatter = new Formatter();
      formatter.joinVoices([voice]).format([voice], measureWidth - 20);
      voice.draw(context, stave);
    });

    // Tag each note <g> with its note id and highlight state
    const noteGroups = container.querySelectorAll<SVGGElement>("g.vf-stavenote");

    noteGroups.forEach((el, idx) => {
      const note = flatNotes[idx];
      if (!note) return;

      el.setAttribute("data-note-id", note.id);
      el.removeAttribute("data-active-note");
      el.removeAttribute("data-selected-note");

      if (activeNoteId && note.id === activeNoteId) {
        el.setAttribute("data-active-note", "true");
      }
      if (selectedNoteId && note.id === selectedNoteId) {
        el.setAttribute("data-selected-note", "true");
      }
    });

    // Click handling: note selection vs background click
    const svg = container.querySelector("svg");
    if (svg) {
      const handleClick = (evt: MouseEvent) => {
        const target = evt.target as Element | null;
        if (!target) return;

        // If click hit a note group or child, select that note
        const noteGroup = target.closest("g.vf-stavenote") as SVGGElement | null;
        if (noteGroup) {
          const noteId = noteGroup.getAttribute("data-note-id");
          if (noteId && onNoteClick) {
            onNoteClick(noteId);
          }
          return;
        }

        // Otherwise treat as "background click"
        if (onBackgroundClick) {
          onBackgroundClick();
        }
      };

      svg.addEventListener("click", handleClick);

      return () => {
        svg.removeEventListener("click", handleClick);
        container.innerHTML = "";
      };
    }

    return () => {
      container.innerHTML = "";
    };
  }, [
    composition,
    activeNoteId,
    selectedNoteId,
    onNoteClick,
    onBackgroundClick,
  ]);

  return (
    <div className="staff-view">
      <div ref={containerRef} className="staff-view__canvas-placeholder" />
    </div>
  );
}

export default StaffView;
