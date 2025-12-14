/* Component partially generated with AI assistance. */

import React, { useState } from "react";
import NoteTextInput from "../components/input/NoteTextInput";
import StaffView from "../components/notation/StaffView";
import TransportControls from "../components/playback/TransportControls";
import CompositionList from "../components/library/CompositionList";
import { useComposerState } from "../state/useComposerState";
import type { Composition, NoteDuration } from "../lib/notation/model";
import {
  deleteNoteById,
  appendNoteToLastMeasure,
  updateNotePitchById,
  updateNoteDurationById,
} from "../lib/notation/edit";

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
    exportLibrary,
    importLibrary,
    currentId,
    isDirty,
  } = useComposerState();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState<NoteDuration>("q");
  const [isRestMode, setIsRestMode] = useState(false);

  // const hasComposition = !!composition && composition.measures.length > 0;
  const hasErrors = errors.length > 0;

  // Saving should work even when there are errors (draft saving).
  const canSave = rawInput.trim().length > 0;

  const durationOptions: { label: string; value: NoteDuration }[] = [
    { label: "w", value: "w" },
    { label: "h", value: "h" },
    { label: "q", value: "q" },
    { label: "e", value: "e" },
    { label: "s", value: "s" },
  ];

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleClearSelection = () => {
    setSelectedNoteId(null);
  };

  const handleBackgroundClick = (pitch: string) => {
    // If there is no composition yet, create the first note/rest via text.
    if (!composition) {
      if (isRestMode) {
        setRawInput(`R ${currentDuration}`);
      } else {
        setRawInput(`${pitch} ${currentDuration}`);
      }
      return;
    }

    updateComposition((comp: Composition): Composition => {
      const id = `ui-${Math.random().toString(36).slice(2)}`;

      const newNote = isRestMode
        ? {
            id,
            pitch: "C4",
            duration: currentDuration,
            isRest: true as const,
          }
        : {
            id,
            pitch,
            duration: currentDuration,
          };

      return appendNoteToLastMeasure(comp, newNote);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedNoteId) return;

    // Delete selected note
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      if (!composition) return;

      updateComposition((comp: Composition): Composition => {
        return deleteNoteById(comp, selectedNoteId);
      });

      setSelectedNoteId(null);
      return;
    }

    // Change pitch with ArrowUp / ArrowDown
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (!composition) return;

      const steps = e.key === "ArrowUp" ? 1 : -1;

      updateComposition((comp: Composition): Composition => {
        return updateNotePitchById(comp, selectedNoteId, steps);
      });
      return;
    }

    // Change duration with number keys 1–5
    const durationMap: Record<string, NoteDuration> = {
      "1": "w",
      "2": "h",
      "3": "q",
      "4": "e",
      "5": "s",
    };

    if (e.key in durationMap) {
      e.preventDefault();
      if (!composition) return;

      const newDuration = durationMap[e.key];

      updateComposition((comp: Composition): Composition => {
        return updateNoteDurationById(comp, selectedNoteId, newDuration);
      });
      setCurrentDuration(newDuration);
    }
  };

  return (
    <div className="composer-page" tabIndex={0} onKeyDown={handleKeyDown}>
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

          <NoteTextInput value={rawInput} onChange={setRawInput} errors={errors} />

          <div className="note-text-input__hint">
            Format: one measure per line, pairs of{" "}
            <code>&lt;pitch|R&gt; &lt;duration&gt;</code>. Example:
            <br />
            <code>C4 q D4 q E4 h</code>
            <br />
            With time signature:
            <br />
            <code>3/4 | C4 q D4 q E4 q</code>
            <br />
            With rests:
            <br />
            <code>4/4 | C4 q R q D4 q R q</code>
          </div>
        </div>

        <div className="composer-page__library">
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <button
              type="button"
              onClick={() => {
                const json = exportLibrary();
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `musanet-library-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export library
            </button>

            <label style={{ display: "inline-block" }}>
              <input
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const res = importLibrary(text);
                  if (!res.ok) {
                    alert(res.error);
                  } else {
                    alert(`Imported: ${res.imported}, overwritten: ${res.overwritten}, total: ${res.total}`);
                  }
                  e.target.value = "";
                }}
              />
              <span style={{ cursor: "pointer", textDecoration: "underline" }}>
                Import library
              </span>
            </label>
          </div>
          <CompositionList
            items={savedItems}
            onSaveCurrent={saveCurrent}
            onLoad={loadFromLibrary}
            onDelete={deleteFromLibrary}
            canSave={canSave}
            currentId={currentId}
            isDirty={isDirty}
          />
        </div>
      </section>

      {/* Middle: full-width score */}
      <section className="composer-page__score">
        <h2>Score</h2>
        <div className="composer-page__score-inner">
          <div className="duration-toolbar">
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={
                  "duration-toolbar__button" +
                  (currentDuration === opt.value && !isRestMode
                    ? " duration-toolbar__button--active"
                    : "")
                }
                onClick={() => {
                  setIsRestMode(false);

                  if (selectedNoteId && composition) {
                    updateComposition((comp: Composition): Composition => {
                      return updateNoteDurationById(comp, selectedNoteId, opt.value);
                    });
                  }
                  setCurrentDuration(opt.value);
                }}
              >
                {opt.label}
              </button>
            ))}

            <button
              type="button"
              className={
                "duration-toolbar__button" +
                (isRestMode ? " duration-toolbar__button--active" : "")
              }
              onClick={() => setIsRestMode((prev) => !prev)}
            >
              R
            </button>
          </div>

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
            hasErrors={hasErrors}
            onActiveNoteChange={setActiveNoteId}
            onClearSelection={handleClearSelection}
          />
        </div>
      </section>

      {/* Tiny “yes you have errors” indicator without blocking your life */}
      {hasErrors && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.8 }}>
          Parser notes: {errors.length} issue(s). Saving is allowed; playback rules can be relaxed next.
        </div>
      )}
    </div>
  );
}

export default ComposerPage;
