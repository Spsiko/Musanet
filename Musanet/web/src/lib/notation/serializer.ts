/* Serialization logic partially generated with AI assistance. */
import type { Composition } from "./model";

export function compositionToText(composition: Composition): string {
  return composition.measures
    .map((measure) => {
      const { timeSignature, notes } = measure;

      const tsPrefix =
        timeSignature && timeSignature !== "4/4"
          ? `${timeSignature} | `
          : "";

      const notesPart = notes
        .map((note) => {
          if (note.isRest) {
            return `R ${note.duration}`;
          }
          return `${note.pitch} ${note.duration}`;
        })
        .join(" ");

      return tsPrefix + notesPart;
    })
    .join("\n");
}
