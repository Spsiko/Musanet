// Layout helpers partially generated with AI assistance.

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
  // bump this so dense measures have room
  minMeasureWidth: 500,
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
  const {
    minHeight,
    marginX,
    marginTop,
    minMeasureWidth,
    fallbackWidth,
  } = STAFF_LAYOUT;

  const safeContainerWidth =
    typeof containerWidth === "number" && containerWidth > 0
      ? containerWidth
      : fallbackWidth;

  const safeMeasureCount = Math.max(1, measureCount);

  // Give each measure more horizontal room so notes don’t overlap.
  const baseMeasureWidth = Math.max(minMeasureWidth, 180);

  const contentWidth = marginX * 2 + baseMeasureWidth * safeMeasureCount;

  // SVG can be wider than the container; scrollbar handles that.
  const width = Math.max(safeContainerWidth, contentWidth);
  const height = minHeight;

  return {
    width,
    height,
    topY: marginTop,
    leftMargin: marginX,
    rightMargin: marginX,
    measureWidth: baseMeasureWidth,
  };
}
