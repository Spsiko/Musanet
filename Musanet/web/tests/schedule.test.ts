import { buildSchedule } from "../src/lib/audio/scheduler";
import type { Composition } from "../src/lib/notation/model";

describe("buildSchedule", () => {
  test("computes correct note start times at 120 BPM", () => {
    const comp: Composition = {
      id: "test",
      title: "Test",
      tempo: 120,
      measures: [
        {
          id: "m1",
          timeSignature: "4/4",
          notes: [
            { id: "n1", pitch: "C4", duration: "q" },
            { id: "n2", pitch: "D4", duration: "q" },
            { id: "n3", pitch: "E4", duration: "h" },
          ],
        },
      ],
    };

    const events = buildSchedule(comp, 120);

    // 120 BPM -> 0.5 seconds per beat
    expect(events[0].timeSeconds).toBeCloseTo(0);
    expect(events[1].timeSeconds).toBeCloseTo(0.5);
    expect(events[2].timeSeconds).toBeCloseTo(1.0);

    expect(events[0].durationSeconds).toBeCloseTo(0.5);
    expect(events[2].durationSeconds).toBeCloseTo(1.0);
  });
});
