/* Component partially generated with AI assistance. */

//import React from "react";
import type { SavedSummary } from "../../state/useComposerState";

interface Props {
  items: SavedSummary[];
  onSaveCurrent: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  canSave: boolean;
  currentId: string | null;
  isDirty: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function CompositionList({
  items,
  onSaveCurrent,
  onLoad,
  onDelete,
  canSave,
  currentId,
  isDirty,
}: Props) {
  return (
    <div className="composition-list">
      <div className="composition-list__header">
        <h3>
          Saved compositions{" "}
          {currentId && (
            <span className="composition-list__current-label">
              (current: {isDirty ? "modified" : "clean"})
            </span>
          )}
        </h3>
        <button
          type="button"
          className="composition-list__save-button"
          onClick={onSaveCurrent}
          disabled={!canSave}
          title={canSave ? "Save the current editor state to the library" : "Nothing to save yet"}
        >
          Save current
        </button>
      </div>

      {items.length === 0 ? (
        <p className="composition-list__empty">
          No saved pieces yet. Use &quot;Save current&quot; to store this sketch.
        </p>
      ) : (
        <ul className="composition-list__items">
          {items.map((item) => {
            const isCurrent = item.id === currentId;
            const hasErrors = (item.errorCount ?? 0) > 0;

            return (
              <li
                key={item.id}
                className={
                  "composition-list__item" +
                  (isCurrent ? " composition-list__item--current" : "")
                }
              >
                <div className="composition-list__meta">
                  <div className="composition-list__title">
                    {item.title || "(Untitled)"}
                    {isCurrent && isDirty && (
                      <span className="composition-list__dirty-indicator"> *</span>
                    )}
                    {hasErrors && (
                      <span
                        className="composition-list__dirty-indicator"
                        title={`${item.errorCount} parser issue(s) at last save`}
                      >
                        {" "}
                        !
                      </span>
                    )}
                  </div>
                  <div className="composition-list__date">{formatDate(item.updatedAt)}</div>
                </div>

                <div className="composition-list__actions">
                  <button
                    type="button"
                    onClick={() => onLoad(item.id)}
                    className="composition-list__button"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="composition-list__button composition-list__button--danger"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
