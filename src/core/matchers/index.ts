// =============================================================================
// MATCHER ENTRY POINT
// -----------------------------------------------------------------------------
// `matchCandidate(name)` walks every category matcher in order of specificity
// and returns the first match. It also handles the `-m` / `-t` breakpoint
// suffix and the `-i` (forced !important) display suffix.
//
// Ordering matters: more specific patterns must come before broader ones to
// avoid mis-matches (e.g. `border-radius-*` before `border-*`).
// =============================================================================

import type { Breakpoint, MatchResult } from "../types.js"
import { matchBackground, matchCursor, matchOutlineNone, matchPointerEvents, matchUserSelect } from "./base.js"
import { matchDisplay } from "./display.js"
import {
  matchContentSize,
  matchFixedSize,
  matchSizePercent,
  matchViewportSize,
  matchVwVhAlias,
} from "./sizing.js"
import {
  matchClearfix,
  matchFloat,
  matchOffset,
  matchPosition,
  matchTransform,
  matchVerticalAlign,
} from "./position.js"
import {
  matchAlignment,
  matchFlexDirection,
  matchFlexFlow,
  matchFlexGrowShrink,
  matchFlexShorthand,
  matchJustification,
  matchObjectFit,
} from "./flex.js"
import { matchOpacity, matchOverflow, matchZIndex } from "./z-overflow-opacity.js"
import { matchSpacing } from "./spacing.js"
import {
  matchFontFamily,
  matchFontSize,
  matchFontWeight,
  matchLetterSpacing,
  matchLineHeight,
  matchListStyle,
  matchText,
  matchTextDecoration,
  matchWhiteSpace,
} from "./typography.js"
import { matchBorder, matchBorderRadius } from "./borders.js"
import {
  matchGridColSpan,
  matchGridCols,
  matchGridFlow,
  matchGridRowSpan,
  matchGridRows,
} from "./grid.js"
import { matchAnimate } from "./animate.js"

export type Matcher = (name: string) => MatchResult | null

/**
 * Order is critical. We put narrow/specific matchers first and broader ones
 * last. Anything that shares a prefix with another matcher (border-radius vs
 * border, align-items vs align, justify-content vs justify) MUST be ordered
 * specific-first.
 */
const MATCHERS: Matcher[] = [
  // --- Background / cursor / interaction ---
  matchBackground,
  matchCursor,
  matchOutlineNone,
  matchPointerEvents,
  matchUserSelect,

  // --- Display ---
  matchDisplay,

  // --- Sizing (specific before generic) ---
  matchVwVhAlias, // w-100vw / h-100vh
  matchContentSize, // w-max-content, h-auto, ...
  matchViewportSize, // w-{n}vw, h-{n}vh
  matchFixedSize, // w-{n}px, max-w-{n}, min-h-{n}px, ...
  matchSizePercent, // w-50, h-100, ...

  // --- Position / offsets / transforms ---
  matchPosition,
  matchTransform, // canonical names like translate-center
  matchOffset, // top-*, bottom-*, left-*, right-*, start-*, end-*
  matchFloat,
  matchClearfix,

  // --- Flex / alignment / object-fit ---
  matchAlignment, // align-items / self / content
  matchJustification, // justify-content / items / self
  matchFlexGrowShrink,
  matchFlexDirection,
  matchFlexFlow,
  matchFlexShorthand,
  matchObjectFit,

  // --- Z-index / overflow / opacity ---
  matchZIndex,
  matchOverflow,
  matchOpacity,

  // --- Spacing (margin / padding / gap) ---
  matchSpacing,

  // --- Typography (specific before general) ---
  matchLetterSpacing, // letter-spacing-* before text-* (no overlap, but order keeps it tidy)
  matchFontSize,
  matchFontWeight,
  matchFontFamily,
  matchLineHeight,
  matchWhiteSpace,
  matchListStyle, // list-style-position-* before list-style-*
  matchTextDecoration, // text-decoration-* before text-*
  matchText, // text-{align|transform|ellipsis|ellipsis-N}

  // --- Borders (radius BEFORE border) ---
  matchBorderRadius, // border-radius-*, rounded-*
  matchBorder, // border, border-{side}, border-none, ...

  // --- Grid ---
  matchGridColSpan,
  matchGridCols,
  matchGridRowSpan,
  matchGridRows,
  matchGridFlow,

  // --- Animations ---
  matchAnimate,

  // --- Vertical-align LAST: '.align-*' conflicts in spelling with align-items
  // but those are filtered by `matchAlignment` returning null on bad suffix.
  matchVerticalAlign,
]

/**
 * The registry itself, exported so tooling can enumerate the matcher chain.
 *
 * `grammar.ts` is the declarative counterpart of this list: every function
 * below MUST be claimed by at least one grammar family, and the anti-drift
 * test (`test/catalog.test.mjs`) fails if a matcher is added here without a
 * matching declaration. Order is meaningful — see the comment above.
 */
export const MATCHER_REGISTRY: readonly Matcher[] = MATCHERS

function tryMatch(name: string): MatchResult | null {
  for (const fn of MATCHERS) {
    const r = fn(name)
    if (r) return r
  }
  return null
}

/**
 * High-level entry point used by the engine.
 *
 * Tries the candidate as-is first (so `.border-t` resolves to the top-side
 * border helper, not `.border` at tablet). If that fails AND the name ends in
 * `-m` or `-t`, retries with that suffix stripped, marking the rule as a
 * responsive variant.
 */
export function matchCandidate(
  name: string,
): { result: MatchResult; breakpoint: Breakpoint; selector: string } | null {
  // Public API: callers reach this with arbitrary values from JS, class names
  // composed at runtime, or a non-string slipping through a type boundary.
  // Returning null beats throwing `name.startsWith is not a function`.
  if (typeof name !== "string") return null

  const direct = tryMatch(name)
  if (direct) return { result: direct, breakpoint: "base", selector: name }

  if (name.length > 2) {
    const tail = name.slice(-2)
    if (tail === "-m") {
      const base = name.slice(0, -2)
      const r = tryMatch(base)
      if (r) return { result: r, breakpoint: "mobile", selector: name }
    } else if (tail === "-t") {
      const base = name.slice(0, -2)
      const r = tryMatch(base)
      if (r) return { result: r, breakpoint: "tablet", selector: name }
    }
  }
  return null
}
