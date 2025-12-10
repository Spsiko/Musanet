/* Component partially generated with AI assistance. */

import React from "react";
import type { Composition } from "../../lib/notation/model";
import {
  playComposition,
  pausePlayback,
  stopPlayback,
} from "../../lib/audio/tonePlayer";

interface Props {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  composition: Composition | null;
  hasErrors: boolean;
  onActiveNoteChange?: (noteId: string | null) => void;
  onClearSelection?: () => void;
}

export default function TransportControls({
  tempo,
  onTempoChange,
  composition,
  hasErrors,
  onActiveNoteChange,
  onClearSelection,
}: Props) {
  const hasComposition = !!composition && composition.measures.length > 0;
  const canPlay = hasComposition && !hasErrors;

  const handlePlay = () => {
    if (!composition) return;
    if (onClearSelection) onClearSelection();
    if (onActiveNoteChange) onActiveNoteChange(null);
    void playComposition(composition, tempo, onActiveNoteChange);
  };

  const handlePause = () => {
    pausePlayback();
  };

  const handleStop = () => {
    stopPlayback(onActiveNoteChange);
    if (onClearSelection) onClearSelection();
  };
  
  return (
    <div className="transport-controls">
      <button
        className="transport-controls__button"
        type="button"
        onClick={handlePlay}
        disabled={!canPlay}
      >
        Play
      </button>
      <button
        className="transport-controls__button"
        type="button"
        onClick={handlePause}
        disabled={!hasComposition}
      >
        Pause
      </button>
      <button
        className="transport-controls__button"
        type="button"
        onClick={handleStop}
        disabled={!hasComposition}
      >
        Stop
      </button>
      <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem" }}>
        Tempo:{" "}
        <input
          type="number"
          min={40}
          max={220}
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value) || 0)}
          style={{ width: "4rem" }}
        />{" "}
        bpm
      </span>
    </div>
  );
}
