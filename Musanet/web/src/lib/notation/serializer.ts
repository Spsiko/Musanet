/* Serialization logic partially generated with AI assistance. */

import type { Composition } from "./model";

export function compositionToText(comp: Composition): string {
  return comp.measures
    .map((measure) =>
      measure.notes
        .map((n) => `${n.pitch} ${n.duration}`)
        .join(" ")
    )
    .join("\n");
}
