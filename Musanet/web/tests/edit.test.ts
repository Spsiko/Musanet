/** Edit Test partially generated with AI assistance. */

import {
  appendNoteToLastMeasure,
  deleteNoteById,
} from "../src/lib/notation/edit";
import type { Composition } from "../src/lib/notation/model";

function makeTestComposition(): Composition {
  return {
    id: "c1",
    title: "Test",
    tempo: 120,
    measures: [
      {
        id: "m1",
        timeSignature: "4/4",
        notes: [
          { id: "n1", pitch: "C4", duration: "q" },
          { id: "n2", pitch: "D4", duration: "q" },
        ],
      },
    ],
  };
}

describe("edit helpers", () => {
  test("appendNoteToLastMeasure appends to existing measure", () => {
    const comp = makeTestComposition();

    const newComp = appendNoteToLastMeasure(comp, {
      id: "n3",
      pitch: "E4",
      duration: "q",
    });

    expect(newComp.measures.length).toBe(1);
    expect(newComp.measures[0].notes.map((n) => n.id)).toEqual([
      "n1",
      "n2",
      "n3",
    ]);
  });

  test("deleteNoteById removes a note and drops empty measures", () => {
    const comp: Composition = {
      id: "c1",
      title: "Test",
      tempo: 120,
      measures: [
        {
          id: "m1",
          timeSignature: "4/4",
          notes: [{ id: "n1", pitch: "C4", duration: "q" }],
        },
      ],
    };

    const newComp = deleteNoteById(comp, "n1");

    expect(newComp.measures.length).toBe(0);
  });

  test("deleteNoteById only removes matching notes", () => {
    const comp = makeTestComposition();

    const newComp = deleteNoteById(comp, "n1");

    expect(newComp.measures[0].notes.map((n) => n.id)).toEqual(["n2"]);
  });
});
