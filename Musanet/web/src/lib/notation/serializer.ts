/* Serialization logic partially generated with AI assistance. */

import type { Composition } from "./model";

/**
 * Serialize a Composition back to the text format consumed by the parser:
 *   - One measure per line
 *   - Each line: "<pitch> <duration>" pairs
 */
export function compositionToText(comp: Composition): string {
  return comp.measures
    .map((measure) =>
      measure.notes
        .map((n) => `${n.pitch} ${n.duration}`)
        .join(" ")
    )
    .join("\n");
}
