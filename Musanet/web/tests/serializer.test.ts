import { compositionToText } from "../src/lib/notation/serializer";
import { parseTextToComposition } from "../src/lib/notation/parser";

describe("compositionToText", () => {
  test("round-trip parse -> serialize -> parse works", () => {
    const input = "C4 q D4 q\nA3 h";
    const { composition } = parseTextToComposition(input);

    expect(composition).not.toBeNull();

    const text = compositionToText(composition!);
    const { composition: roundTrip } = parseTextToComposition(text);

    expect(roundTrip).not.toBeNull();
    expect(roundTrip!.measures.length).toBe(2);
    expect(roundTrip!.measures[0].notes.length).toBe(2);
  });
});
