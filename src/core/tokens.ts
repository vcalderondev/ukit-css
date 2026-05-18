// =============================================================================
// TOKENS
// -----------------------------------------------------------------------------
// All numeric scales, named maps and keyword lists that drive class generation.
// This is the TypeScript replacement for the legacy `_variables.sass`.
// =============================================================================

/** Default breakpoint values (max-width based). */
export const DEFAULT_BREAKPOINTS = {
  mobile: 576,
  tablet: 992,
  desktop: 1200,
} as const

// -----------------------------------------------------------------------------
// Spacing scales (margin / padding / gap)
// -----------------------------------------------------------------------------

export const REM_VALUES = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5] as const
export const PX_VALUES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 30,
  32, 35, 40, 45, 48, 50, 60, 64, 80, 100,
] as const
export const EM_VALUES = [1, 1.5, 2] as const
export const VIEWPORT_SPACING = [5, 10, 15, 20, 25, 30, 40, 50] as const

// -----------------------------------------------------------------------------
// Display & layout primitives
// -----------------------------------------------------------------------------

export const DISPLAYS = [
  "none",
  "inline-block",
  "inline",
  "block",
  "grid",
  "inline-grid",
  "flex",
  "inline-flex",
] as const

export const POSITIONS = ["relative", "absolute", "fixed", "sticky"] as const

// -----------------------------------------------------------------------------
// Sizing
// -----------------------------------------------------------------------------

/** Percentage-based widths/heights. */
export const SIZE_PERCENTS = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100] as const

/** Viewport-relative width/height scale (vw / vh). */
export const VIEWPORT_SIZES = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100] as const

/** Common large fixed pixel sizes for w/h/min-w/min-h/max-w. */
export const COMMON_FIXED_SIZES = [
  80, 100, 120, 140, 160, 180, 200, 240, 280, 300, 320, 360, 400, 420, 450, 480, 500, 550, 600, 700,
  750, 800, 920, 1000, 1200,
] as const

// -----------------------------------------------------------------------------
// Visual / interaction tokens
// -----------------------------------------------------------------------------

export const OPACITIES = [
  0, 2, 4, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 85, 90, 100,
] as const

export const OVERFLOWS = ["auto", "hidden", "scroll", "visible"] as const

export const CURSORS = [
  "pointer",
  "default",
  "move",
  "not-allowed",
  "help",
  "wait",
  "text",
  "grab",
  "grabbing",
  "zoom-in",
  "zoom-out",
] as const

export const OBJECT_FITS = ["cover", "contain", "fill", "none", "scale-down"] as const

// -----------------------------------------------------------------------------
// Border radius
// -----------------------------------------------------------------------------

export const BORDER_RADIUS_PX = [
  0, 1, 2, 4, 6, 8, 10, 11, 12, 14, 16, 20, 24, 28, 30, 32, 40,
] as const

export const BORDER_RADIUS_NAMED: Record<string, string> = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
}

/** Maps directional radius shorthand to the two physical corners it affects. */
export const RADIUS_SIDES: Record<string, [string, string]> = {
  t: ["top-left", "top-right"],
  b: ["bottom-left", "bottom-right"],
  l: ["top-left", "bottom-left"],
  r: ["top-right", "bottom-right"],
}

// -----------------------------------------------------------------------------
// Typography
// -----------------------------------------------------------------------------

export const FS_PX_VALUES = [
  8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 38, 40, 42, 48, 56, 64, 86, 108,
] as const

export const FS_REM_VALUES = [
  0.5, 0.6, 0.65, 0.7, 0.75, 0.78, 0.8, 0.85, 0.875, 0.9, 0.95, 1, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5,
  1.75, 1.8, 2, 2.5, 3, 4, 5,
] as const

export const FS_EM_VALUES = [1, 1.2, 1.5, 2] as const

export const FONT_WEIGHTS: Record<string, string> = {
  "100": "100",
  "200": "200",
  "300": "300",
  "400": "400",
  "500": "500",
  "600": "600",
  "700": "700",
  "800": "800",
  "900": "900",
  bold: "bold",
  normal: "normal",
}

export const TEXT_ALIGNS = ["left", "center", "right", "justify", "start", "end"] as const
export const TEXT_TRANSFORMS = ["uppercase", "lowercase", "capitalize", "none"] as const
export const WHITE_SPACES = [
  "nowrap",
  "normal",
  "pre",
  "pre-wrap",
  "pre-line",
  "break-spaces",
] as const
export const LETTER_SPACING_EM = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2] as const

// -----------------------------------------------------------------------------
// Flex / alignment / justification
// -----------------------------------------------------------------------------

/** Map (alias suffix -> CSS keyword). */
export const ALIGN_VALUES: Record<string, string> = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
  "flex-start": "flex-start",
  "flex-end": "flex-end",
  baseline: "baseline",
  stretch: "stretch",
}

export const JUSTIFY_VALUES: Record<string, string> = {
  center: "center",
  right: "right",
  left: "left",
  start: "flex-start",
  end: "flex-end",
  "flex-start": "flex-start",
  "flex-end": "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
}

export const FLEX_WRAPS = ["nowrap", "wrap", "wrap-reverse"] as const
export const FLEX_DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"] as const
export const FLEX_FLOW_VALUES = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
  "nowrap",
  "wrap",
  "wrap-reverse",
] as const

// -----------------------------------------------------------------------------
// Z-index
// -----------------------------------------------------------------------------

export const Z_EXTREME = [500, 1000, 2000, 5000, 9999, 10000] as const

// -----------------------------------------------------------------------------
// Layout helpers
// -----------------------------------------------------------------------------

export const SIDES = ["top", "bottom", "left", "right", "start", "end"] as const

/** Map (logical side -> physical CSS property). */
export const SIDE_TO_PROP: Record<string, string> = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  start: "left",
  end: "right",
}

/** Anchored offsets that appear in class names like `.top-50-percent`. */
export const OFFSET_ANCHORS: Record<string, string> = {
  "0": "0",
  "50-percent": "50%",
  "50": "50%",
}

export const TRANSFORM_UTILS: Record<string, string> = {
  "translate-x-center": "translateX(-50%)",
  "translate-x-neg-50": "translateX(-50%)",
  "translate-y-center": "translateY(-50%)",
  "translate-y-neg-50": "translateY(-50%)",
  "translate-center": "translate(-50%, -50%)",
  "translate-middle": "translate(-50%, -50%)",
  "transform-none": "none",
  "rotate-90": "rotate(90deg)",
}

export const FLOAT_VALUES: Record<string, string> = {
  left: "left",
  right: "right",
  none: "none",
  start: "left",
  end: "right",
}

export const VERTICAL_ALIGNS = [
  "baseline",
  "top",
  "middle",
  "bottom",
  "sub",
  "super",
  "text-top",
  "text-bottom",
] as const

// -----------------------------------------------------------------------------
// Grid
// -----------------------------------------------------------------------------

export const GRID_FLOW_MAP: Record<string, string> = {
  row: "row",
  col: "column",
  dense: "dense",
  "row-dense": "row dense",
  "col-dense": "column dense",
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Turn a numeric value into the dashed form used in class names
 * (`0.5` -> `0-5`, `1.25` -> `1-25`).
 */
export const dasherize = (n: number | string): string => String(n).replace(/\./g, "-")

/** Build a Set from a readonly array for cheap O(1) membership tests. */
export const toSet = <T extends string | number>(arr: readonly T[]): Set<string> =>
  new Set(arr.map(String))

/** Read-only Sets keyed on the dasherized representation of each value. */
export const REM_SET = toSet(REM_VALUES.map(dasherize))
export const PX_SET = toSet(PX_VALUES)
export const EM_SET = toSet(EM_VALUES.map(dasherize))
export const FS_PX_SET = toSet(FS_PX_VALUES)
export const FS_REM_SET = toSet(FS_REM_VALUES.map(dasherize))
export const FS_EM_SET = toSet(FS_EM_VALUES.map(dasherize))
export const SIZE_PERCENT_SET = toSet(SIZE_PERCENTS)
export const OPACITY_SET = toSet(OPACITIES)
export const VIEWPORT_SIZE_SET = toSet(VIEWPORT_SIZES)
export const VIEWPORT_SPACING_SET = toSet(VIEWPORT_SPACING)
export const BORDER_RADIUS_PX_SET = toSet(BORDER_RADIUS_PX)
export const Z_EXTREME_SET = toSet(Z_EXTREME)
export const LETTER_SPACING_EM_SET = toSet(LETTER_SPACING_EM.map(dasherize))
