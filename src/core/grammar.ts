// =============================================================================
// GRAMMAR REGISTRY  (the declarative source of truth for tooling)
// -----------------------------------------------------------------------------
// Why this file exists
// --------------------
// The class vocabulary used to live only inside the matcher functions, as
// regexes and Set lookups. That is fine for the engine, but nothing else can
// read it: editors cannot autocomplete it, TypeScript cannot type it, and an
// LLM cannot learn it — it just hallucinates Tailwind names (`p-4`, `text-sm`)
// which the extractor silently drops, producing no CSS and no error.
//
// The JIT nature of the engine is irrelevant here. JIT decides which classes
// are *emitted*; the *input* grammar is fully static because every value set is
// a frozen `as const` array in `tokens.ts`. The vocabulary is therefore finite
// and enumerable — roughly 4 000 base utilities, ~12 000 including the `-m`
// and `-t` suffixes.
//
// This file declares that grammar once. Everything else is generated from it:
//   - ukit.manifest.json / ukit.classes.txt   (AI + editor tooling)
//   - src/generated/classes.ts                (UkitClass types + cn())
//   - docs/classes.md, llms.txt, AGENTS.md    (humans + LLMs)
//
// Contract with the matchers
// --------------------------
// This file does NOT decide what is valid; `matchCandidate()` does. The two are
// kept in lockstep by `test/catalog.test.mjs`, which enforces BOTH directions:
//   1. every class enumerated here must match the real matcher (forward), and
//   2. every class the real matcher accepts, over a fuzz corpus built from this
//      grammar, must be enumerated here (backward), and
//   3. every matcher in MATCHER_REGISTRY must be claimed by a family below.
// Adding a matcher without declaring it here fails CI.
// =============================================================================

import {
  ALIGN_VALUES,
  BORDER_RADIUS_NAMED,
  BORDER_RADIUS_PX,
  CURSORS,
  DISPLAYS,
  FLEX_DIRECTIONS,
  FLEX_FLOW_VALUES,
  FLEX_WRAPS,
  FLOAT_VALUES,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  FS_EM_VALUES,
  FS_PX_VALUES,
  FS_REM_VALUES,
  GRID_FLOW_MAP,
  JUSTIFY_VALUES,
  LETTER_SPACING_EM,
  LETTER_SPACING_PX,
  LINE_HEIGHTS,
  LIST_STYLE_POSITIONS,
  LIST_STYLE_TYPES,
  OBJECT_FITS,
  OFFSET_ANCHORS,
  OPACITIES,
  OVERFLOWS,
  POSITIONS,
  PX_VALUES,
  REM_VALUES,
  EM_VALUES,
  SIZE_PERCENTS,
  SIDES,
  TEXT_ALIGNS,
  TEXT_DECORATIONS,
  TEXT_TRANSFORMS,
  TRANSFORM_UTILS,
  USER_SELECTS,
  VERTICAL_ALIGNS,
  VIEWPORT_SIZES,
  VIEWPORT_SPACING,
  WHITE_SPACES,
  Z_EXTREME,
  dasherize,
} from "./tokens.js"
import { FIXED_SIZE_SET } from "./matchers/sizing.js"
import { ANIMATION_KEYFRAMES } from "./matchers/animate.js"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** One `<stem>-<value>` pair group inside a family. */
export interface GrammarStem {
  /** Stem without the trailing dash, e.g. `m`, `mt`, `max-w`, `grid-cols`. */
  stem: string
  /** Concrete values valid after the stem. Rendered as `` `${stem}-${value}` ``. */
  values: readonly string[]
  /** What this stem targets, for docs and editor hover (e.g. "margin-top"). */
  targets?: string
}

/**
 * A family is a group of utilities implemented by the same matcher(s).
 * Enumeration of a family is: `bare` + every `stem-value` + `extra`.
 */
export interface GrammarFamily {
  /** Stable identifier, also used to group generated types. */
  id: string
  /** Human/AI-facing title. */
  title: string
  /** One-line statement of what the family does. */
  summary: string
  /**
   * Matcher function names from `src/core/matchers` that implement this
   * family. Verified against MATCHER_REGISTRY by the anti-drift test.
   */
  matchers: readonly string[]
  /** Standalone class names that take no value (e.g. `border`, `clearfix`). */
  bare?: readonly string[]
  /** `stem-value` groups. */
  stems?: readonly GrammarStem[]
  /** Valid classes that do not fit the `stem-value` shape. */
  extra?: readonly string[]
  /** CSS properties this family writes, for docs and hover text. */
  cssProperties: readonly string[]
  /** Canonical examples used in docs and in the AI prompt-card. */
  examples: readonly string[]
  /** Longer prose for `docs/classes.md` and llms.txt. */
  docs?: string
}

// -----------------------------------------------------------------------------
// Small builders / value sets
// -----------------------------------------------------------------------------

const strings = (xs: readonly (string | number)[]): string[] => xs.map(String)

/** Define a stem without repeating `values.map(String)` everywhere. */
const stem = (
  name: string,
  values: readonly (string | number)[],
  targets?: string,
): GrammarStem => ({ stem: name, values: strings(values), targets })

/** `[1, 2, 3]` -> `["1", "2", "3"]`; handy for grid/border counts. */
const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)

// Sizing: fixed pixel sizes accepted by `matchFixedSize` (0–64 + common large).
const FIXED_SIZES = [...FIXED_SIZE_SET].map(Number).sort((a, b) => a - b)

// Spacing values accepted by `parseSpacingValue`, in the same shapes the
// matcher accepts them (`{n}px`, `{n}-rem`, `{n}-em`, `{n}vh`, `{n}vw` and the
// legacy bare number).
const REM_DASHED = REM_VALUES.map(dasherize)
const EM_DASHED = EM_VALUES.map(dasherize)
const SPACING_UNIT_VALUES = [
  ...strings(PX_VALUES).map((n) => `${n}px`),
  ...REM_DASHED.map((v) => `${v}-rem`),
  ...EM_DASHED.map((v) => `${v}-em`),
  ...strings(VIEWPORT_SPACING).map((n) => `${n}vh`),
  ...strings(VIEWPORT_SPACING).map((n) => `${n}vw`),
]
/** Legacy bare numbers: em wins over px over rem (see matcher comment). */
const SPACING_BARE_VALUES = [...EM_DASHED, ...strings(PX_VALUES), ...REM_DASHED]
const SPACING_VALUES = [...SPACING_UNIT_VALUES, ...SPACING_BARE_VALUES]

/** Values accepted by `matchBorderRadius` after the stem (`rounded-`, `border-radius-`). */
const RADIUS_VALUES = [
  ...Object.keys(BORDER_RADIUS_NAMED),
  "50-percent",
  ...strings(BORDER_RADIUS_PX).map((n) => `${n}px`),
  ...["t", "b", "l", "r"].flatMap((side) =>
    strings(BORDER_RADIUS_PX).map((n) => `${side}-${n}px`),
  ),
]

const FS_VALUES = [
  ...strings(FS_PX_VALUES).map((n) => `${n}px`),
  ...strings(FS_REM_VALUES.map(dasherize)).map((v) => `${v}-rem`),
  ...strings(FS_EM_VALUES.map(dasherize)).map((v) => `${v}-em`),
  ...strings(FS_REM_VALUES.map(dasherize)),
]

const LETTER_SPACING_VALUES = [
  ...range(1, 10).map(String),
  ...LETTER_SPACING_PX.map(dasherize).map((v) => `${v}px`),
  ...range(1, 10).map((n) => `neg-${n}`),
  ...LETTER_SPACING_PX.map(dasherize).map((v) => `neg-${v}px`),
  ...LETTER_SPACING_EM.map(dasherize).map((v) => `${v}-em`),
  ...LETTER_SPACING_EM.map(dasherize).map((v) => `neg-${v}-em`),
]

/** Line-height values in the dash-for-dot form the matcher accepts. */
const LINE_HEIGHT_VALUES = LINE_HEIGHTS.map(dasherize)

/** z-index: units 1–10, decades up to 100, plus extreme presets. */
const Z_VALUES = [
  ...range(1, 10),
  ...range(1, 10).map((n) => n * 10),
  ...Z_EXTREME,
].map(String)

/** Offset values: anchors, px, rem and em, plus their `neg-` forms. */
const OFFSET_VALUES = [
  ...Object.keys(OFFSET_ANCHORS),
  ...strings(PX_VALUES).map((n) => `${n}px`),
  ...REM_DASHED.map((v) => `${v}-rem`),
  ...EM_DASHED.map((v) => `${v}-em`),
  ...strings(PX_VALUES).map((n) => `neg-${n}px`),
  ...REM_DASHED.map((v) => `neg-${v}-rem`),
  ...EM_DASHED.map((v) => `neg-${v}-em`),
]

const SPACING_DIRECTIONS = [
  "m",
  "mt",
  "mb",
  "ml",
  "mr",
  "ms",
  "me",
  "mx",
  "my",
  "p",
  "pt",
  "pb",
  "pl",
  "pr",
  "ps",
  "pe",
  "px",
  "py",
]

/** Auto margins: the only `-auto` spacing classes the matcher accepts. */
const AUTO_MARGINS = ["m-auto", "mt-auto", "mb-auto", "ms-auto", "me-auto", "mx-auto", "my-auto"]

/**
 * CSS property each spacing direction writes. Mirrors `SIDE_MAP` / `AXIS_MAP` in
 * `matchers/spacing.ts`, including `s`/`e` mapping to the physical left/right.
 */
const SPACING_TARGETS: Record<string, string> = {
  m: "margin",
  mt: "margin-top",
  mb: "margin-bottom",
  ml: "margin-left",
  mr: "margin-right",
  ms: "margin-left",
  me: "margin-right",
  mx: "margin-left + margin-right",
  my: "margin-top + margin-bottom",
  p: "padding",
  pt: "padding-top",
  pb: "padding-bottom",
  pl: "padding-left",
  pr: "padding-right",
  ps: "padding-left",
  pe: "padding-right",
  px: "padding-left + padding-right",
  py: "padding-top + padding-bottom",
}

const SIZING_FIXED_PX = [...FIXED_SIZES].map((n) => `${n}px`)
const SIZING_LEGACY = [...FIXED_SIZES].map(String)

/**
 * Viewport-unit constraints. The constraint helpers take the axis-appropriate
 * unit only: `.max-w-100vw` but not `.max-w-100vh` (see `matchFixedSize`).
 */
const SIZING_VIEWPORT_VW = strings(VIEWPORT_SIZES).map((n) => `${n}vw`)
const SIZING_VIEWPORT_VH = strings(VIEWPORT_SIZES).map((n) => `${n}vh`)

/** Percentage constraints: `.max-w-90-percent`. */
const SIZING_PERCENT = strings(SIZE_PERCENTS).map((n) => `${n}-percent`)

/** `auto` reset for the constraint helpers: `.min-h-auto`. */
const SIZING_AUTO = ["auto"]

// -----------------------------------------------------------------------------
// The grammar
// -----------------------------------------------------------------------------

export const FAMILIES: readonly GrammarFamily[] = [
  {
    id: "background",
    title: "Background reset",
    summary: "Clears the background or sets it to transparent.",
    matchers: ["matchBackground"],
    bare: ["bg-transparent", "bg-none"],
    cssProperties: ["background"],
    examples: ["bg-transparent", "bg-none"],
  },
  {
    id: "cursor",
    title: "Cursor",
    summary: "Sets the mouse cursor, e.g. `cursor-pointer`.",
    matchers: ["matchCursor"],
    stems: [stem("cursor", CURSORS, "cursor")],
    cssProperties: ["cursor"],
    examples: ["cursor-pointer", "cursor-not-allowed", "cursor-grab"],
  },
  {
    id: "outline",
    title: "Outline",
    summary: "Removes the focus outline.",
    matchers: ["matchOutlineNone"],
    bare: ["outline-none"],
    cssProperties: ["outline"],
    examples: ["outline-none"],
  },
  {
    id: "pointer-events",
    title: "Pointer events",
    summary: "Enables or disables pointer interaction.",
    matchers: ["matchPointerEvents"],
    bare: ["pointer-events-none", "pointer-events-auto"],
    cssProperties: ["pointer-events"],
    examples: ["pointer-events-none"],
  },
  {
    id: "user-select",
    title: "User select",
    summary: "Controls text selection: `user-select-none`, `user-select-text`.",
    matchers: ["matchUserSelect"],
    stems: [stem("user-select", USER_SELECTS, "user-select")],
    cssProperties: ["user-select"],
    examples: ["user-select-none", "user-select-text", "user-select-all"],
  },

  // --- Display ---------------------------------------------------------------
  {
    id: "display",
    title: "Display",
    summary: "Sets the `display` value, e.g. `d-flex`, `d-none`, `d-grid`.",
    matchers: ["matchDisplay"],
    stems: [
      stem("d", [...DISPLAYS, ...DISPLAYS.map((d) => `${d}-i`)], "display"),
    ],
    cssProperties: ["display"],
    examples: ["d-flex", "d-grid", "d-none", "d-none-m", "d-block-i"],
    docs: "The `-i` variant is an explicit alias kept for parity with the legacy stylesheet; it emits the same declarations.",
  },

  // --- Sizing ----------------------------------------------------------------
  {
    id: "sizing-percent",
    title: "Sizing — percentages",
    summary: "Percentage width/height: `w-50` is `width: 50%`.",
    matchers: ["matchSizePercent"],
    stems: [
      stem("w", SIZE_PERCENTS, "width"),
      stem("h", SIZE_PERCENTS, "height"),
    ],
    cssProperties: ["width", "height"],
    examples: ["w-50", "h-100", "w-100-m"],
    docs: "A bare number is always a percentage. Use `w-100px` or `w-100vw` for other units.",
  },
  {
    id: "sizing-fixed",
    title: "Sizing — fixed pixels",
    summary:
      "Pixel width/height and min/max constraints: `w-320px`, `max-w-1200`, `min-h-100vh`, `max-w-90-percent`.",
    matchers: ["matchFixedSize"],
    stems: [
      stem("w", SIZING_FIXED_PX, "width"),
      stem("h", SIZING_FIXED_PX, "height"),
      stem(
        "max-w",
        [...SIZING_FIXED_PX, ...SIZING_LEGACY, ...SIZING_VIEWPORT_VW, ...SIZING_PERCENT, ...SIZING_AUTO],
        "max-width",
      ),
      stem(
        "min-w",
        [...SIZING_FIXED_PX, ...SIZING_LEGACY, ...SIZING_VIEWPORT_VW, ...SIZING_PERCENT, ...SIZING_AUTO],
        "min-width",
      ),
      stem(
        "max-h",
        [...SIZING_FIXED_PX, ...SIZING_LEGACY, ...SIZING_VIEWPORT_VH, ...SIZING_PERCENT, ...SIZING_AUTO],
        "max-height",
      ),
      stem(
        "min-h",
        [...SIZING_FIXED_PX, ...SIZING_LEGACY, ...SIZING_VIEWPORT_VH, ...SIZING_PERCENT, ...SIZING_AUTO],
        "min-height",
      ),
    ],
    cssProperties: ["width", "height", "max-width", "min-width", "max-height", "min-height"],
    examples: ["w-320px", "h-64px", "max-w-1200", "min-h-100vh", "max-w-90-percent"],
    docs: "The `min-`/`max-` helpers also accept the axis-appropriate viewport unit (`min-h-100vh`, `max-w-100vw`), percentages (`max-w-90-percent`), `auto` (`min-h-auto`) and a legacy bare-pixel form (`max-w-1200`).",
  },
  {
    id: "sizing-viewport",
    title: "Sizing — viewport",
    summary: "Viewport-relative sizing: `w-100vw`, `h-50vh`.",
    matchers: ["matchViewportSize", "matchVwVhAlias"],
    stems: [
      stem("w", strings(VIEWPORT_SIZES).map((n) => `${n}vw`), "width"),
      stem("h", strings(VIEWPORT_SIZES).map((n) => `${n}vh`), "height"),
    ],
    cssProperties: ["width", "height"],
    examples: ["w-100vw", "h-100vh", "h-50vh"],
  },
  {
    id: "sizing-content",
    title: "Sizing — intrinsic & auto",
    summary: "Content-driven sizing shortcuts: `w-fit-content`, `h-auto`.",
    matchers: ["matchContentSize"],
    bare: [
      "w-max-content",
      "w-min-content",
      "w-fit-content",
      "h-max-content",
      "h-min-content",
      "h-fit-content",
      "w-auto",
      "h-auto",
    ],
    cssProperties: ["width", "height"],
    examples: ["w-fit-content", "h-auto", "w-max-content"],
  },

  // --- Position --------------------------------------------------------------
  {
    id: "position",
    title: "Position",
    summary: "Sets the `position` value: `position-absolute`, `position-sticky`.",
    matchers: ["matchPosition"],
    stems: [stem("position", POSITIONS, "position")],
    cssProperties: ["position"],
    examples: ["position-relative", "position-absolute", "position-fixed"],
  },
  {
    id: "offset",
    title: "Offsets",
    summary:
      "Edge offsets in px/rem/em or anchors: `top-0`, `left-50-percent`, `top-16px`, `right-1-5-rem`, `bottom-neg-5px`.",
    matchers: ["matchOffset"],
    stems: SIDES.map((side) => stem(side, OFFSET_VALUES, side)),
    cssProperties: ["top", "bottom", "left", "right"],
    examples: ["top-0", "left-50-percent", "bottom-16px", "start-50", "right-neg-5px"],
    docs: "`start` maps to `left` and `end` maps to `right`, mirroring the logical-side helpers. Numeric offsets take a `neg-` prefix for negative values (`top-neg-8px`); the anchors `0`, `50` and `50-percent` are always positive.",
  },
  {
    id: "transform",
    title: "Transform helpers",
    summary: "Named transform shortcuts for centring and rotating.",
    matchers: ["matchTransform"],
    bare: Object.keys(TRANSFORM_UTILS),
    cssProperties: ["transform"],
    examples: ["translate-center", "translate-x-center", "rotate-90"],
  },
  {
    id: "float",
    title: "Float",
    summary: "Floats an element: `float-left`, `float-right`.",
    matchers: ["matchFloat"],
    stems: [stem("float", Object.keys(FLOAT_VALUES), "float")],
    cssProperties: ["float"],
    examples: ["float-left", "float-right"],
  },
  {
    id: "clearfix",
    title: "Clearfix",
    summary: "Clears floats.",
    matchers: ["matchClearfix"],
    bare: ["clearfix"],
    cssProperties: ["clear"],
    examples: ["clearfix"],
  },
  {
    id: "vertical-align",
    title: "Vertical align",
    summary: "`vertical-align` keywords: `align-middle`, `align-top`.",
    matchers: ["matchVerticalAlign"],
    stems: [stem("align", VERTICAL_ALIGNS, "vertical-align")],
    cssProperties: ["vertical-align"],
    examples: ["align-middle", "align-top"],
    docs: "Not to be confused with `align-items-*`, which is flexbox alignment.",
  },

  // --- Flexbox ---------------------------------------------------------------
  {
    id: "align",
    title: "Flex alignment",
    summary: "`align-items`, `align-self`, `align-content`: `align-items-center`.",
    matchers: ["matchAlignment"],
    stems: [
      stem("align-items", Object.keys(ALIGN_VALUES), "align-items"),
      stem("align-self", Object.keys(ALIGN_VALUES), "align-self"),
      stem("align-content", Object.keys(ALIGN_VALUES), "align-content"),
    ],
    cssProperties: ["align-items", "align-self", "align-content"],
    examples: ["align-items-center", "align-self-start", "align-content-stretch"],
  },
  {
    id: "justify",
    title: "Justification",
    summary: "`justify-content`, `justify-items`, `justify-self`: `justify-content-between`.",
    matchers: ["matchJustification"],
    stems: [
      stem("justify-content", Object.keys(JUSTIFY_VALUES), "justify-content"),
      stem("justify-items", Object.keys(JUSTIFY_VALUES), "justify-items"),
      stem("justify-self", Object.keys(JUSTIFY_VALUES), "justify-self"),
    ],
    cssProperties: ["justify-content", "justify-items", "justify-self"],
    examples: ["justify-content-between", "justify-content-center", "justify-items-center"],
  },
  {
    id: "flex-shorthand",
    title: "Flex shorthand & wrap",
    summary: "`flex-1`, `flex-none` and the flex-wrap keywords.",
    matchers: ["matchFlexShorthand"],
    bare: ["flex-0", "flex-1", "flex-none"],
    stems: [stem("flex", FLEX_WRAPS, "flex-wrap")],
    cssProperties: ["flex", "flex-wrap"],
    examples: ["flex-1", "flex-none", "flex-wrap"],
  },
  {
    id: "flex-grow-shrink",
    title: "Flex grow / shrink",
    summary: "`flex-grow-1`, `flex-shrink-0`.",
    matchers: ["matchFlexGrowShrink"],
    bare: ["flex-grow-0", "flex-grow-1", "flex-shrink-0", "flex-shrink-1"],
    cssProperties: ["flex-grow", "flex-shrink"],
    examples: ["flex-grow-1", "flex-shrink-0"],
  },
  {
    id: "flex-direction",
    title: "Flex direction",
    summary: "`flex-direction-column`, `flex-direction-row`.",
    matchers: ["matchFlexDirection"],
    stems: [stem("flex-direction", FLEX_DIRECTIONS, "flex-direction")],
    cssProperties: ["flex-direction"],
    examples: ["flex-direction-column", "flex-direction-row"],
  },
  {
    id: "flex-flow",
    title: "Flex flow",
    summary: "`flex-flow-*` shorthand.",
    matchers: ["matchFlexFlow"],
    stems: [stem("flex-flow", FLEX_FLOW_VALUES, "flex-flow")],
    cssProperties: ["flex-flow"],
    examples: ["flex-flow-row-wrap"],
  },
  {
    id: "object-fit",
    title: "Object fit",
    summary: "`object-cover`, `object-contain`.",
    matchers: ["matchObjectFit"],
    stems: [stem("object", OBJECT_FITS, "object-fit")],
    cssProperties: ["object-fit"],
    examples: ["object-cover", "object-contain"],
  },

  // --- Z-index / overflow / opacity -----------------------------------------
  {
    id: "z-index",
    title: "Z-index",
    summary:
      "Stacking order: `z-1`…`z-10`, decades up to `z-100`, plus presets like `z-200`, `z-3000`, `z-9999`.",
    matchers: ["matchZIndex"],
    stems: [stem("z", Z_VALUES, "z-index")],
    cssProperties: ["z-index"],
    examples: ["z-1", "z-50", "z-200", "z-9999"],
  },
  {
    id: "overflow",
    title: "Overflow",
    summary: "`overflow-hidden`, `overflow-x-auto`, `overflow-y-scroll`.",
    matchers: ["matchOverflow"],
    stems: [
      stem("overflow", OVERFLOWS, "overflow"),
      stem("overflow-x", OVERFLOWS, "overflow-x"),
      stem("overflow-y", OVERFLOWS, "overflow-y"),
    ],
    cssProperties: ["overflow", "overflow-x", "overflow-y"],
    examples: ["overflow-hidden", "overflow-x-auto"],
  },
  {
    id: "opacity",
    title: "Opacity",
    summary: "`opacity-50` is `opacity: .5`.",
    matchers: ["matchOpacity"],
    stems: [stem("opacity", strings(OPACITIES), "opacity")],
    cssProperties: ["opacity"],
    examples: ["opacity-0", "opacity-50", "opacity-100"],
  },

  // --- Spacing ---------------------------------------------------------------
  {
    id: "spacing",
    title: "Spacing — margin, padding, gap",
    summary:
      "`{m|p}{direction?}-{value}{unit?}` e.g. `m-1-rem`, `pt-16px`, `mx-auto`, `gap-1-5-rem`.",
    matchers: ["matchSpacing"],
    bare: AUTO_MARGINS,
    stems: [
      ...SPACING_DIRECTIONS.map((dir) => stem(dir, SPACING_VALUES, SPACING_TARGETS[dir])),
      stem("gap", SPACING_VALUES, "gap"),
    ],
    cssProperties: ["margin", "padding", "gap"],
    examples: ["m-1-rem", "pt-16px", "mx-auto", "gap-1-5-rem", "p-2-5-rem-m"],
    docs: [
      "Directions: `t` `b` `l` `r` `s` `e` (single side), `x` `y` (axis).",
      "Units: `px` has no dash (`p-16px`); `rem`, `em`, `vh`, `vw` use a dash (`p-1-5-rem`).",
      "A bare number is a legacy alias: `em` wins, then `px`, then `rem` — so `p-1` is `1em` but `p-16` is `16px`.",
      "Only the margin family accepts `auto`: `m-auto`, `mx-auto`, `mt-auto`, `mb-auto`, `ms-auto`, `me-auto`, `my-auto`.",
    ].join(" "),
  },

  // --- Typography ------------------------------------------------------------
  {
    id: "font-family",
    title: "Font family",
    summary: "Generic font stacks: `font-family-mono`, `font-family-sans`, `font-family-serif`.",
    matchers: ["matchFontFamily"],
    stems: [stem("font-family", Object.keys(FONT_FAMILIES), "font-family")],
    cssProperties: ["font-family"],
    examples: ["font-family-mono", "font-family-sans"],
    docs: "Each value reads a CSS variable first and falls back to a generic stack — `font-family-mono` is `var(--font-mono, ui-monospace, …)`. Theme the stack by defining `--font-mono`, `--font-sans` or `--font-serif`. There is no family for project-specific faces; declare those in your own stylesheet.",
  },
  {
    id: "font-size",
    title: "Font size",
    summary: "`fs-1-5-rem`, `fs-16px`, `fs-2-em`.",
    matchers: ["matchFontSize"],
    stems: [stem("fs", FS_VALUES, "font-size")],
    cssProperties: ["font-size"],
    examples: ["fs-1-rem", "fs-16px", "fs-1-5-rem"],
  },
  {
    id: "font-weight",
    title: "Font weight",
    summary: "`fw-700`, `fw-bold`, `fw-normal`.",
    matchers: ["matchFontWeight"],
    stems: [stem("fw", Object.keys(FONT_WEIGHTS), "font-weight")],
    cssProperties: ["font-weight"],
    examples: ["fw-400", "fw-700", "fw-bold"],
  },
  {
    id: "text",
    title: "Text align, transform & ellipsis",
    summary:
      "`text-center`, `text-uppercase`, `text-ellipsis` (single line) and `text-ellipsis-3` (clamp).",
    matchers: ["matchText"],
    bare: ["text-ellipsis", ...range(2, 6).map((n) => `text-ellipsis-${n}`)],
    stems: [stem("text", [...TEXT_ALIGNS, ...TEXT_TRANSFORMS], "text-align or text-transform")],
    cssProperties: ["text-align", "text-transform", "text-overflow", "white-space"],
    examples: ["text-center", "text-uppercase", "text-ellipsis-3"],
  },
  {
    id: "text-decoration",
    title: "Text decoration",
    summary: "`text-decoration-none`, `text-decoration-underline`, `text-decoration-line-through`.",
    matchers: ["matchTextDecoration"],
    stems: [stem("text-decoration", TEXT_DECORATIONS, "text-decoration")],
    cssProperties: ["text-decoration"],
    examples: ["text-decoration-none", "text-decoration-underline"],
  },
  {
    id: "list-style",
    title: "List style",
    summary: "`list-style-none`, `list-style-disc`, `list-style-position-inside`.",
    matchers: ["matchListStyle"],
    stems: [
      stem("list-style", LIST_STYLE_TYPES, "list-style-type"),
      stem("list-style-position", LIST_STYLE_POSITIONS, "list-style-position"),
    ],
    cssProperties: ["list-style-type", "list-style-position"],
    examples: ["list-style-none", "list-style-disc", "list-style-position-inside"],
    docs: "`list-style-*` writes `list-style-type`; the marker position is the separate `list-style-position-*` stem.",
  },
  {
    id: "line-height",
    title: "Line height",
    summary: "`lh-1`, `lh-1-2`, `lh-1-5`, `lh-4-5` — the dash is the decimal point.",
    matchers: ["matchLineHeight"],
    stems: [stem("lh", LINE_HEIGHT_VALUES, "line-height")],
    cssProperties: ["line-height"],
    examples: ["lh-1", "lh-1-2", "lh-1-5", "lh-4-5"],
    docs: "`1`–`2` in steps of `0.05` (so `lh-1-45` is `1.45`), then `2.5`, `3`, `3.5`, `4`, `4.5`. Values are unitless multipliers, so they inherit the element's own font size.",
  },
  {
    id: "white-space",
    title: "White space",
    summary: "`ws-nowrap`, `ws-pre-wrap`.",
    matchers: ["matchWhiteSpace"],
    stems: [stem("ws", WHITE_SPACES, "white-space")],
    cssProperties: ["white-space"],
    examples: ["ws-nowrap", "ws-pre-wrap"],
  },
  {
    id: "letter-spacing",
    title: "Letter spacing",
    summary:
      "`letter-spacing-1`, `letter-spacing-0-5px`, `letter-spacing-0-1-em`, `letter-spacing-neg-1`.",
    matchers: ["matchLetterSpacing"],
    stems: [stem("letter-spacing", LETTER_SPACING_VALUES, "letter-spacing")],
    cssProperties: ["letter-spacing"],
    examples: ["letter-spacing-1", "letter-spacing-0-5px", "letter-spacing-0-1-em", "letter-spacing-neg-2"],
    docs: "Pixel values accept the fractional `0-5` step (`letter-spacing-0-5px`); `em` values are relative to the element's font size. Every numeric form also has a `neg-` counterpart.",
  },

  // --- Borders ---------------------------------------------------------------
  {
    id: "border-radius",
    title: "Border radius",
    summary: "`rounded-lg`, `rounded-12px`, `rounded-t-8px`, `rounded-full`.",
    matchers: ["matchBorderRadius"],
    stems: [
      stem("rounded", RADIUS_VALUES, "border-radius"),
      stem("border-radius", RADIUS_VALUES, "border-radius"),
    ],
    cssProperties: ["border-radius"],
    examples: ["rounded-lg", "rounded-full", "rounded-r-12px"],
  },
  {
    id: "border",
    title: "Borders",
    summary: "`border`, per-side `border-t`, clears like `border-none`, `border-t-none`.",
    matchers: ["matchBorder"],
    bare: [
      "border",
      "border-none",
      "border-transparent",
      ...["t", "b", "l", "r", "s", "e"].map((side) => `border-${side}`),
      ...["t", "b", "l", "r", "s", "e"].map((side) => `border-${side}-none`),
    ],
    cssProperties: ["border", "border-top", "border-right", "border-bottom", "border-left"],
    examples: ["border", "border-t", "border-none"],
    docs: "Borders paint `1px solid var(--border)`, so the theme variable drives the colour.",
  },

  // --- Grid ------------------------------------------------------------------
  {
    id: "grid-cols",
    title: "Grid columns",
    summary: "`grid-cols-3` sets `display: grid` plus a 3-column template.",
    matchers: ["matchGridCols"],
    stems: [stem("grid-cols", range(1, 12), "grid-template-columns")],
    cssProperties: ["grid-template-columns", "display"],
    examples: ["grid-cols-3", "grid-cols-1-m"],
  },
  {
    id: "grid-col-span",
    title: "Grid column span",
    summary: "`grid-col-span-2`, `grid-col-span-full`.",
    matchers: ["matchGridColSpan"],
    bare: ["grid-col-span-full"],
    stems: [stem("grid-col-span", range(1, 12), "grid-column")],
    cssProperties: ["grid-column"],
    examples: ["grid-col-span-2"],
  },
  {
    id: "grid-rows",
    title: "Grid rows",
    summary: "`grid-rows-3` sets `display: grid` plus a 3-row template.",
    matchers: ["matchGridRows"],
    stems: [stem("grid-rows", range(1, 6), "grid-template-rows")],
    cssProperties: ["grid-template-rows", "display"],
    examples: ["grid-rows-2"],
  },
  {
    id: "grid-row-span",
    title: "Grid row span",
    summary: "`grid-row-span-2`, `grid-row-span-full`.",
    matchers: ["matchGridRowSpan"],
    bare: ["grid-row-span-full"],
    stems: [stem("grid-row-span", range(1, 6), "grid-row")],
    cssProperties: ["grid-row"],
    examples: ["grid-row-span-2"],
  },
  {
    id: "grid-flow",
    title: "Grid auto flow",
    summary: "`grid-flow-row`, `grid-flow-col-dense`.",
    matchers: ["matchGridFlow"],
    stems: [stem("grid-flow", Object.keys(GRID_FLOW_MAP), "grid-auto-flow")],
    cssProperties: ["grid-auto-flow"],
    examples: ["grid-flow-row", "grid-flow-col-dense"],
  },

  // --- Animations ------------------------------------------------------------
  {
    id: "animate",
    title: "Animations",
    summary: "Ready-made keyframe animations; the `@keyframes` block is emitted on demand.",
    matchers: ["matchAnimate"],
    bare: Object.keys(ANIMATION_KEYFRAMES),
    cssProperties: ["animation"],
    examples: ["animate-fade-in", "animate-spin", "animate-pulse"],
    docs: "Animations are the only utilities emitted without `!important`, so they stay overridable.",
  },
]

// -----------------------------------------------------------------------------
// Derivation
// -----------------------------------------------------------------------------

/** Every stem used anywhere in the grammar (used by the backward fuzz check). */
export function allStems(): string[] {
  const out = new Set<string>()
  for (const fam of FAMILIES) for (const s of fam.stems ?? []) out.add(s.stem)
  return [...out].sort()
}

/** Every value string used anywhere in the grammar. */
export function allValues(): string[] {
  const out = new Set<string>()
  for (const fam of FAMILIES) {
    for (const s of fam.stems ?? []) for (const v of s.values) out.add(v)
    for (const b of fam.bare ?? []) out.add(b)
    for (const e of fam.extra ?? []) out.add(e)
  }
  return [...out].sort()
}

/**
 * Enumerate the base (no breakpoint suffix) class names of a single family.
 * Order is family-declaration order; the catalog sorts and dedupes.
 */
export function enumerateFamily(family: GrammarFamily): string[] {
  const out: string[] = []
  out.push(...(family.bare ?? []))
  for (const s of family.stems ?? []) {
    for (const v of s.values) out.push(`${s.stem}-${v}`)
  }
  out.push(...(family.extra ?? []))
  return out
}

/** Breakpoint suffixes every base utility accepts, mapped to the media query. */
export const BREAKPOINT_SUFFIXES: Readonly<Record<string, string>> = {
  "-m": "mobile",
  "-t": "tablet",
}

/** Matcher names claimed by at least one family. */
export function declaredMatchers(): string[] {
  const out = new Set<string>()
  for (const fam of FAMILIES) for (const m of fam.matchers) out.add(m)
  return [...out].sort()
}
