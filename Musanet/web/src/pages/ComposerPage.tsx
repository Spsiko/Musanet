import React from "react";
import NoteTextInput from "../components/input/NoteTextInput";
import StaffView from "../components/notation/StaffView";
import TransportControls from "../components/playback/TransportControls";
import CompositionList from "../components/library/CompositionList";

function ComposerPage() {
  return (
    <div className="composer-page">
      <section className="composer-page__top">
        <div className="composer-page__input">
          <h2>Composer</h2>
          <NoteTextInput />
        </div>

        <div className="composer-page__staff">
          <h2>Score</h2>
          <StaffView />
        </div>
      </section>

      <section className="composer-page__bottom">
        <div className="composer-page__controls">
          <TransportControls />
        </div>

        <div className="composer-page__library">
          <CompositionList />
        </div>
      </section>
    </div>
  );
}

export default ComposerPage;
