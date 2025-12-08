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
}

export default function TransportControls({
  tempo,
  onTempoChange,
  composition,
}: Props) {
  const handlePlay = () => {
    if (!composition) return;
    void playComposition(composition, tempo);
  };

  return (
    <div className="transport-controls">
      <button
        className="transport-controls__button"
        onClick={handlePlay}
        disabled={!composition}
      >
        Play
      </button>

      <button className="transport-controls__button" onClick={pausePlayback}>
        Pause
      </button>

      <button className="transport-controls__button" onClick={stopPlayback}>
        Stop
      </button>

      <span style={{ marginLeft: "1rem", fontSize: "0.85rem" }}>
        Tempo:
        <input
          type="number"
          min={40}
          max={220}
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          style={{ width: "4rem", marginLeft: "0.3rem" }}
        />
        bpm
      </span>
    </div>
  );
}
