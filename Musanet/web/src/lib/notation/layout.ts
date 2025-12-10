/* Layout helpers partially generated with AI assistance. */

export interface StaffLayoutConfig {
  /** Minimum SVG height for the staff area in pixels. */
  minHeight: number;
  /** Horizontal margin on each side in pixels. */
  marginX: number;
  /** Top offset for the staff in pixels. */
  marginTop: number;
  /** Minimum width for a single measure in pixels. */
  minMeasureWidth: number;
  /** Fallback width if container width is 0 or undefined. */
  fallbackWidth: number;
}

export const STAFF_LAYOUT: StaffLayoutConfig = {
  minHeight: 260,
  marginX: 10,
  marginTop: 40,
  minMeasureWidth: 80,
  fallbackWidth: 700,
};

/**
 * Compute concrete pixel dimensions for the staff based on the container width
 * and number of measures.
 */
export function computeStaffDimensions(
  containerWidth: number | undefined,
  measureCount: number
) {
  const width =
    typeof containerWidth === "number" && containerWidth > 0
      ? containerWidth
      : STAFF_LAYOUT.fallbackWidth;

  const height = STAFF_LAYOUT.minHeight;
  const leftMargin = STAFF_LAYOUT.marginX;
  const topY = STAFF_LAYOUT.marginTop;

  const availableWidth = width - STAFF_LAYOUT.marginX * 2;
  const safeMeasureCount = Math.max(1, measureCount);

  const measureWidth = Math.max(
    STAFF_LAYOUT.minMeasureWidth,
    availableWidth / safeMeasureCount
  );

  return {
    width,
    height,
    leftMargin,
    topY,
    measureWidth,
  };
}
