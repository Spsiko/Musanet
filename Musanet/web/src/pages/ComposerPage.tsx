/* Insert AI message here later*/

import React from "react";
import NoteTextInput from "../components/input/NoteTextInput";
import StaffView from "../components/notation/StaffView";
import TransportControls from "../components/playback/TransportControls";
import CompositionList from "../components/library/CompositionList";
import { useComposerState } from "../state/useComposerState";

function ComposerPage() {
  const { rawInput, setRawInput, tempo, setTempo, composition, errors } =
    useComposerState();
    

  return (
    <div className="composer-page">
      <section className="composer-page__top">
        <div className="composer-page__input">
          <h2>Composer</h2>
          <NoteTextInput
            value={rawInput}
            onChange={setRawInput}
            errors={errors}
          />
        </div>

        <div className="composer-page__staff">
          <h2>Score</h2>
          <StaffView composition={composition} />
        </div>
      </section>

      <section className="composer-page__bottom">
        <div className="composer-page__controls">
          <TransportControls
            tempo={tempo}
            onTempoChange={setTempo}
            composition={composition}
          />
        </div>

        <div className="composer-page__library">
          <CompositionList />
        </div>
      </section>
    </div>
  );
}

export default ComposerPage;
