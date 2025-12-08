/* This code was partially generated with AI assistance. */

import React from "react";

interface NoteTextInputProps {
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
}

function NoteTextInput({ value, onChange, errors = [] }: NoteTextInputProps) {
  return (
    <div className="note-text-input">
      <label className="note-text-input__label">
        Note input (e.g. <code>C4 q D4 q E4 h</code>):
      </label>
      <textarea
        className="note-text-input__textarea"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`C4 q D4 q E4 h\nF4 q G4 q A4 h`}
      />
      <p className="note-text-input__hint">
        Use space-separated pairs like <code>C4 q</code>. One measure per line
        for now.
      </p>
      {errors.length > 0 && (
        <ul className="note-text-input__errors">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NoteTextInput;
