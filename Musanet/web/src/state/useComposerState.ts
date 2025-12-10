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
  type StoredComposition,
} from "../lib/storage/compositionsStore";

export interface SavedSummary {
  id: string;
  title: string;
  updatedAt: string;
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
}

export function useComposerState(): UseComposerState {
  const [rawInput, setRawInput] = useState(
    "C4 q D4 q E4 h\nF4 q G4 q A4 h"
  );
  const [tempo, setTempo] = useState(120);
  const [title, setTitle] = useState("Untitled piece");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedSummary[]>([]);

  // load library once
  useEffect(() => {
    const items = listCompositions().map((item) => ({
      id: item.id,
      title: item.title,
      updatedAt: item.updatedAt,
    }));
    setSavedItems(items);
  }, []);

  const { composition, errors } = useMemo(() => {
    return parseTextToComposition(rawInput, {
      title,
      tempo,
    });
  }, [rawInput, tempo, title]);

  const updateComposition = (fn: (c: Composition) => Composition): void => {
    if (!composition) return;
    const updated = fn(composition);
    const text = compositionToText(updated);
    setRawInput(text);
  };
  
  const saveCurrent = () => {
    if (!rawInput.trim()) return;

    const updatedList = saveCompositionToLibrary({
      id: currentId ?? undefined,
      title,
      rawInput,
      tempo,
    });

    setSavedItems(
      updatedList.map((item: StoredComposition) => ({
        id: item.id,
        title: item.title,
        updatedAt: item.updatedAt,
      }))
    );

    if (!currentId && updatedList.length > 0) {
      const newest = updatedList[0];
      setCurrentId(newest.id);
    }
  };

  const loadFromLibrary = (id: string) => {
    const rec = loadCompositionFromLibrary(id);
    if (!rec) return;

    setCurrentId(rec.id);
    setTitle(rec.title);
    setTempo(rec.tempo);
    setRawInput(rec.rawInput);
  };

  const deleteFromLibrary = (id: string) => {
    const updated = deleteCompositionFromLibrary(id);
    setSavedItems(
      updated.map((item: StoredComposition) => ({
        id: item.id,
        title: item.title,
        updatedAt: item.updatedAt,
      }))
    );

    if (currentId === id) {
      setCurrentId(null);
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
  };
}
