/* State hook partially generated with AI assistance. */

import { useState, useMemo, useEffect } from "react";
import { parseTextToComposition } from "../lib/notation/parser";
import type { Composition } from "../lib/notation/model";
import { compositionToText } from "../lib/notation/serializer";
import {
  listCompositions,
  saveCompositionToLibrary,
  loadCompositionFromLibrary,
  deleteCompositionFromLibrary,
  type StoredCompositionV2,
  exportLibraryToJSON,
  importLibraryFromJSON,
} from "../lib/storage/compositionsStore";

export interface SavedSummary {
  id: string;
  title: string;
  updatedAt: string;
  errorCount: number;
}

export interface UseComposerState {
  rawInput: string;
  setRawInput: React.Dispatch<React.SetStateAction<string>>;
  tempo: number;
  setTempo: React.Dispatch<React.SetStateAction<number>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  composition: Composition | null;
  errors: string[];
  savedItems: SavedSummary[];
  saveCurrent: () => void;
  loadFromLibrary: (id: string) => void;
  deleteFromLibrary: (id: string) => void;
  updateComposition: (fn: (c: Composition) => Composition) => void;
  exportLibrary: () => string;
  importLibrary: (jsonText: string) => { ok: true; imported: number; overwritten: number; total: number } | { ok: false; error: string };
  currentId: string | null;
  isDirty: boolean;
}

interface SavedSnapshot {
  id: string | null;
  rawInput: string;
  tempo: number;
  title: string;
}

function toSummary(item: StoredCompositionV2): SavedSummary {
  return {
    id: item.id,
    title: item.title,
    updatedAt: item.updatedAt,
    errorCount: item.lastErrorCount ?? 0,
  };
}

export function useComposerState(): UseComposerState {
  const [rawInput, setRawInput] = useState(
    "C4 q D4 q E4 h\nF4 q G4 q A4 h"
  );
  const [tempo, setTempo] = useState(120);
  const [title, setTitle] = useState("Untitled piece");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedSummary[]>([]);

  // Last "saved" state (or loaded-from-library state)
  const [lastSnapshot, setLastSnapshot] = useState<SavedSnapshot>({
    id: null,
    rawInput,
    tempo,
    title,
  });

  // load library once
  useEffect(() => {
    const items = listCompositions().map(toSummary);
    setSavedItems(items);
  }, []);

  const { composition, errors } = useMemo(() => {
    return parseTextToComposition(rawInput, {
      title,
      tempo,
    });
  }, [rawInput, tempo, title]);

  // Derived dirty flag: any difference from lastSnapshot
  const isDirty = useMemo(
    () =>
      rawInput !== lastSnapshot.rawInput ||
      tempo !== lastSnapshot.tempo ||
      title !== lastSnapshot.title ||
      currentId !== lastSnapshot.id,
    [rawInput, tempo, title, currentId, lastSnapshot]
  );

  const exportLibrary = () => {
    return exportLibraryToJSON();
  };

  const importLibrary = (jsonText: string) => {
    const result = importLibraryFromJSON(jsonText);
    if (result.ok) {
      // refresh list after import
      const items = listCompositions().map(toSummary);
      setSavedItems(items);
    }
    return result;
  };


  const updateComposition = (fn: (c: Composition) => Composition): void => {
    if (!composition) return;
    const updated = fn(composition);
    const text = compositionToText(updated);
    setRawInput(text);
  };

  const saveCurrent = () => {
    // Allow saving drafts even with parser errors.
    if (!rawInput.trim()) return;

    const updatedList = saveCompositionToLibrary({
      id: currentId ?? undefined,
      title,
      rawInput,
      tempo,
      errors,
    });

    setSavedItems(updatedList.map(toSummary));

    // Determine the effective ID after save
    let effectiveId: string | null = currentId;

    if (!effectiveId && updatedList.length > 0) {
      const newest = updatedList[0];
      effectiveId = newest.id;
      setCurrentId(newest.id);
    }

    // Snapshot the just-saved state so dirty flag resets
    setLastSnapshot({
      id: effectiveId,
      rawInput,
      tempo,
      title,
    });
  };

  const loadFromLibrary = (id: string) => {
    const rec = loadCompositionFromLibrary(id);
    if (!rec) return;

    setCurrentId(rec.id);
    setTitle(rec.title);
    setTempo(rec.tempo);
    setRawInput(rec.rawInput);

    // Loaded state is "clean"
    setLastSnapshot({
      id: rec.id,
      rawInput: rec.rawInput,
      tempo: rec.tempo,
      title: rec.title,
    });
  };

  const deleteFromLibrary = (id: string) => {
    const updated = deleteCompositionFromLibrary(id);
    setSavedItems(updated.map(toSummary));

    if (currentId === id) {
      setCurrentId(null);
      // No saved backing store for current editor now; mark as unsaved.
      setLastSnapshot({
        id: null,
        rawInput,
        tempo,
        title,
      });
    }
  };

  return {
    rawInput,
    setRawInput,
    tempo,
    setTempo,
    title,
    setTitle,
    composition: (composition as Composition | null) ?? null,
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
  };
}
