/* Component partially generated with AI assistance. */

import React from "react";
import type { SavedSummary } from "../../state/useComposerState";

interface Props {
  items: SavedSummary[];
  onSaveCurrent: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
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
}: Props) {
  return (
    <div className="composition-list">
      <div className="composition-list__header">
        <h3>Saved compositions</h3>
        <button
          type="button"
          className="composition-list__save-button"
          onClick={onSaveCurrent}
        >
          Save current
        </button>
      </div>

      {items.length === 0 ? (
        <p className="composition-list__empty">
          No saved pieces yet. Use "Save current" to store this sketch.
        </p>
      ) : (
        <ul className="composition-list__items">
          {items.map((item) => (
            <li key={item.id} className="composition-list__item">
              <div className="composition-list__meta">
                <div className="composition-list__title">{item.title}</div>
                <div className="composition-list__date">
                  {formatDate(item.updatedAt)}
                </div>
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
          ))}
        </ul>
      )}
    </div>
  );
}
