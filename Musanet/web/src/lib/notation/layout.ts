/* Layout helpers partially generated with AI assistance. */

import type { Measure, NoteDuration } from "./model";

/**
 * Basic beat mapping used for layout.
 * This is intentionally duplicated from playback so layout
 * doesn't depend on the playback module.
 */
const DURATION_BEATS: Record<NoteDuration, number> = {
  w: 4,
  h: 2,
  q: 1,
  e: 0.5,
  s: 0.25,
};

export interface StaffDimensions {
  width: number;
  height: number;
  leftMargin: number;
  topY: number;
  measureWidths: number[];
}

// Tunable layout constants
const STAFF_HEIGHT = 260;
const STAFF_TOP_Y = 80;
const LEFT_MARGIN = 10;
const RIGHT_MARGIN = 10;
const MIN_MEASURE_WIDTH = 140; // never let a measure be thinner than this
const PX_PER_COMPLEXITY = 32;  // how aggressively complexity translates to width

/**
 * Rough "complexity" score for a measure:
 * - More beats => more width
 * - More notes => more width (even if beats are the same)
 */
function measureComplexity(measure: Measure): number {
  const beats = measure.notes.reduce((sum, note) => {
    const b = DURATION_BEATS[note.duration] ?? 1;
    return sum + b;
  }, 0);

  const noteCount = measure.notes.length;

  // Avoid zero, even for empty measures
  const base = beats || 1;

  // Add a small bump from note count so dense measures get more room
  const complexity = base + noteCount * 0.3;

  return Math.max(complexity, 1);
}

/**
 * Compute overall staff dimensions and per-measure widths.
 *
 * - Each measure gets a base width from its complexity.
 * - All measures are then scaled to fit at least the container width.
 * - This allows horizontal scroll when things get dense, instead of squashing.
 */
export function computeStaffDimensions(
  containerWidth: number,
  measures: Measure[]
): StaffDimensions {
  const safeContainerWidth = Math.max(containerWidth || 0, 300);
  const measureCount = Math.max(measures.length, 1);

  // Compute complexity & base width for each measure
  const complexities = measures.map(measureComplexity);

  // If somehow we got no measures, fake one
  if (complexities.length === 0) {
    complexities.push(1);
  }

  const baseWidths = complexities.map((c) =>
    Math.max(MIN_MEASURE_WIDTH, c * PX_PER_COMPLEXITY)
  );

  const totalBaseWidth = baseWidths.reduce((sum, w) => sum + w, 0);

  // Content width is the sum of base measure widths
  const contentWidth = totalBaseWidth;

  // Final SVG width: at least the container, plus margins
  const availableContentWidth = Math.max(
    contentWidth,
    safeContainerWidth - LEFT_MARGIN - RIGHT_MARGIN
  );

  const scaleFactor =
    totalBaseWidth > 0 ? availableContentWidth / totalBaseWidth : 1;

  const measureWidths = baseWidths.map((w) => w * scaleFactor);

  const finalWidth =
    measureWidths.reduce((sum, w) => sum + w, 0) + LEFT_MARGIN + RIGHT_MARGIN;

  return {
    width: finalWidth,
    height: STAFF_HEIGHT,
    leftMargin: LEFT_MARGIN,
    topY: STAFF_TOP_Y,
    measureWidths,
  };
}
