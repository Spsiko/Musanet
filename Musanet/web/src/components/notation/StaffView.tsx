/* Component partially generated with AI assistance. */

import React, { useEffect, useRef } from "react";
import type {
  Composition,
  Note,
  NoteDuration,
  Measure,
} from "../../lib/notation/model";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";
import { computeStaffDimensions } from "../../lib/notation/layout";
import { stepPitchByDegree, clampPitch } from "../../lib/notation/pitch";

interface StaffViewProps {
  composition: Composition | null;
  activeNoteId?: string | null;
  selectedNoteId?: string | null;
  onNoteClick?: (noteId: string) => void;
  onBackgroundClick?: (pitch: string) => void;
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
  const vfDurationBase = VF_DURATION_MAP[note.duration] ?? "q";

  // RESTS
  if (note.isRest) {
    // Use a dummy key; VexFlow only cares about duration + "r"
    return new StaveNote({
      keys: ["b/4"],
      duration: vfDurationBase + "r",
    });
  }

  // NORMAL PITCHED NOTES
  const { key, accidental } = parsePitch(note.pitch);
  const vfNote = new StaveNote({
    keys: [key],
    duration: vfDurationBase,
  });

  if (accidental) {
    vfNote.addModifier(new Accidental(accidental), 0);
  }

  return vfNote;
}

/** Render an empty staff so the user can see/click even with no notes. */
function renderEmptyStaff(container: HTMLDivElement) {
  const dummyMeasure: Measure = {
    id: "empty-1",
    timeSignature: "4/4",
    notes: [],
  };

  const { width, height, leftMargin, topY, measureWidths } =
    computeStaffDimensions(container.clientWidth, [dummyMeasure]);

  const measureWidth = measureWidths[0] ?? 200;

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

  const { width, height, leftMargin, topY, measureWidths } =
    computeStaffDimensions(container.clientWidth, measures);

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  const staves: Stave[] = [];
  const voices: Voice[] = [];
  const flatNotes: Note[] = [];

  // Build staves, voices, and flattened note list
  measures.forEach((measure, index) => {
    const x =
      leftMargin +
      measureWidths.slice(0, index).reduce((sum, w) => sum + w, 0);

    const measureWidth = measureWidths[index];

    const stave = new Stave(x, topY, measureWidth);
    if (index === 0) {
      stave.addClef("treble");
      stave.addTimeSignature(measure.timeSignature);
    } else {
      const prevTS = measures[index - 1].timeSignature;
      if (measure.timeSignature !== prevTS) {
        stave.addTimeSignature(measure.timeSignature);
      }
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
    const measureWidth = measureWidths[index];
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

    if (onBackgroundClick && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const centerY = rect.height / 2;
      const pixelsPerStep = 8;

      const delta = centerY - clickY;
      const steps = Math.round(delta / pixelsPerStep);

      const rawPitch = stepPitchByDegree("C4", steps);
      const pitch = clampPitch(rawPitch);
      onBackgroundClick(pitch);
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
