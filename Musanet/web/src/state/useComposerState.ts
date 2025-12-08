/* State hook partially generated with AI assistance. */

import { useState, useMemo } from "react";
import type { Composition } from "../lib/notation/model";
import { parseTextToComposition } from "../lib/notation/parser";

export function useComposerState() {
  const [rawInput, setRawInput] = useState(
    "C4 q D4 q E4 h\nF4 q G4 q A4 h"
  );
  const [tempo, setTempo] = useState(120);

  const { composition, errors } = useMemo(() => {
    return parseTextToComposition(rawInput, {
      title: "Scratch",
      tempo,
    });
  }, [rawInput, tempo]);

  return {
    rawInput,
    setRawInput,
    tempo,
    setTempo,
    composition: composition as Composition | null,
    errors,
  };
}
