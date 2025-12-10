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
import { computeStaffDimensions } from "../../lib/notation/layout";

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
  const match = pitch.match(/^([A-Ga-g])(#{1}|b{1})?(\d)$/);
  if (!match) {
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

/** Render an empty staff so the user can see/click even with no notes. */
function renderEmptyStaff(container: HTMLDivElement) {
  const { width, height, leftMargin, topY, measureWidth } =
    computeStaffDimensions(container.clientWidth, 1);

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  const stave = new Stave(leftMargin, topY, measureWidth);
  stave.addClef("treble").addTimeSignature("4/4");
  stave.setContext(context).draw();
}

/**
 * Render the composition into the given container using VexFlow,
 * and apply active/selected highlighting.
 */
function renderCompositionToContainer(
  container: HTMLDivElement,
  composition: Composition,
  activeNoteId?: string | null,
  selectedNoteId?: string | null
) {
  const measures = composition.measures;
  if (measures.length === 0) {
    renderEmptyStaff(container);
    return;
  }

  const { width, height, leftMargin, topY, measureWidth } =
    computeStaffDimensions(container.clientWidth, measures.length);

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  const staves: Stave[] = [];
  const voices: Voice[] = [];
  const flatNotes: Note[] = [];

  // Build staves, voices, and flattened note list
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

  // Layout & draw voices onto staves
  staves.forEach((stave, index) => {
    const voice = voices[index];
    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], measureWidth - 20);
    voice.draw(context, stave);
  });

  // Tag each note with IDs & highlight attributes
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

    // Clear anything old
    container.innerHTML = "";

    if (!composition || composition.measures.length === 0) {
      renderEmptyStaff(container);
    } else {
      renderCompositionToContainer(
        container,
        composition,
        activeNoteId,
        selectedNoteId
      );
    }

    return () => {
      container.innerHTML = "";
    };
  }, [composition, activeNoteId, selectedNoteId]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element | null;
    if (!target) return;

    const noteGroup = target.closest("g.vf-stavenote") as SVGGElement | null;

    if (noteGroup) {
      const noteId = noteGroup.getAttribute("data-note-id");
      if (noteId && onNoteClick) {
        onNoteClick(noteId);
      }
      return;
    }

    if (onBackgroundClick) {
      onBackgroundClick();
    }
  };

  return (
    <div className="staff-view">
      <div
        ref={containerRef}
        className="staff-view__canvas-placeholder"
        onClick={handleClick}
      />
    </div>
  );
}

export default StaffView;
