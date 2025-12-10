import { parseTextToComposition } from "../src/lib/notation/parser";

describe("parseTextToComposition", () => {
  test("parses valid text into a composition", () => {
    const input = "C4 q D4 q\nE4 h";
    const { composition, errors } = parseTextToComposition(input);

    expect(errors.length).toBe(0);
    expect(composition).not.toBeNull();

    expect(composition!.measures.length).toBe(2);
    expect(composition!.measures[0].notes.length).toBe(2);
    expect(composition!.measures[1].notes.length).toBe(1);
  });

  test("reports errors for invalid tokens", () => {
    const input = "C4 q Z9 q";
    const { composition, errors } = parseTextToComposition(input);

    expect(errors.length).toBeGreaterThan(0);
    expect(composition).not.toBeNull(); // measure still has 1 good note
  });

  test("returns null composition when nothing valid", () => {
    const input = "ZZZ 99";
    const { composition, errors } = parseTextToComposition(input);

    expect(composition).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
  });
});
