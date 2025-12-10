/* Component partially generated with AI assistance. */

import React, { useState } from "react";
import NoteTextInput from "../components/input/NoteTextInput";
import StaffView from "../components/notation/StaffView";
import TransportControls from "../components/playback/TransportControls";
import CompositionList from "../components/library/CompositionList";
import { useComposerState } from "../state/useComposerState";
import type { Composition } from "../lib/notation/model";

function ComposerPage() {
  const {
    rawInput,
    setRawInput,
    tempo,
    setTempo,
    title,
    setTitle,
    composition,
    errors,
    savedItems,
    saveCurrent,
    loadFromLibrary,
    deleteFromLibrary,
    updateComposition,
  } = useComposerState();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleClearSelection = () => {
    setSelectedNoteId(null);
  };

  const handleBackgroundClick = () => {
    if (!composition) return;
    updateComposition((comp: Composition): Composition => {
      if (comp.measures.length === 0) return comp;

      const lastIndex = comp.measures.length - 1;
      const last = comp.measures[lastIndex];

      const newNote = {
        id: `ui-${Math.random().toString(36).slice(2)}`,
        pitch: "C4",
        duration: "q" as const,
      };

      const newMeasures = comp.measures.slice();
      newMeasures[lastIndex] = {
        ...last,
        notes: [...last.notes, newNote],
      };

      return { ...comp, measures: newMeasures };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedNoteId) return;

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      if (!composition) return;

      updateComposition((comp: Composition): Composition => {
        const newMeasures = comp.measures
          .map((m) => ({
            ...m,
            notes: m.notes.filter((n) => n.id !== selectedNoteId),
          }))
          .filter((m) => m.notes.length > 0);

        return { ...comp, measures: newMeasures };
      });

      setSelectedNoteId(null);
    }
  };

  return (
    <div
      className="composer-page"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Top: input + saved compositions */}
      <section className="composer-page__top">
        <div className="composer-page__input">
          <div className="composer-page__input-header">
            <h2>Composer</h2>
            <input
              className="composer-page__title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled piece"
            />
          </div>
          <NoteTextInput
            value={rawInput}
            onChange={setRawInput}
            errors={errors}
          />
        </div>

        <div className="composer-page__library">
          <CompositionList
            items={savedItems}
            onSaveCurrent={saveCurrent}
            onLoad={loadFromLibrary}
            onDelete={deleteFromLibrary}
          />
        </div>
      </section>

      {/* Middle: full-width score */}
      <section className="composer-page__score">
        <h2>Score</h2>
        <div className="composer-page__score-inner">
          <StaffView
            composition={composition}
            activeNoteId={activeNoteId}
            selectedNoteId={selectedNoteId}
            onNoteClick={handleSelectNote}
            onBackgroundClick={handleBackgroundClick}
          />
        </div>
      </section>

      {/* Bottom: transport */}
      <section className="composer-page__bottom">
        <div className="composer-page__controls">
          <TransportControls
            tempo={tempo}
            onTempoChange={setTempo}
            composition={composition}
            onActiveNoteChange={setActiveNoteId}
            onClearSelection={handleClearSelection}
          />
        </div>
      </section>
    </div>
  );
}

export default ComposerPage;
