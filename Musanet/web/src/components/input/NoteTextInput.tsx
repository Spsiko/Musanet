import React from "react";

function NoteTextInput() {
  return (
    <div className="note-text-input">
      <label className="note-text-input__label">
        Note input (e.g. <code>C4 q D4 q E4 h</code>):
      </label>
      <textarea
        className="note-text-input__textarea"
        rows={8}
        placeholder={`C4 q D4 q E4 h\n| F4 q G4 q A4 h`}
      />
      <p className="note-text-input__hint">
        Use bar separators like <code>|</code>.
      </p>
    </div>
  );
}

export default NoteTextInput;
