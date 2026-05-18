// =============================================================================
// SIZING MATCHERS
// -----------------------------------------------------------------------------
// width / height percent + viewport + fixed pixel, plus min-w / min-h / max-w.
// =============================================================================

import type { MatchResult } from "../types.js"
import { COMMON_FIXED_SIZES, SIZE_PERCENT_SET, VIEWPORT_SIZE_SET } from "../tokens.js"
import { decl, declMany } from "./helpers.js"

// Build sets of valid fixed-pixel sizes (1–64 + common large sizes).
const FIXED_SIZE_SET = new Set<string>()
for (let i = 0; i <= 64; i++) FIXED_SIZE_SET.add(String(i))
for (const s of COMMON_FIXED_SIZES) FIXED_SIZE_SET.add(String(s))

// Percentage-based width / height: .w-50, .h-100, ...
export function matchSizePercent(name: string): MatchResult | null {
  let prop: "width" | "height"
  let rest: string
  if (name.startsWith("w-")) {
    prop = "width"
    rest = name.slice(2)
  } else if (name.startsWith("h-")) {
    prop = "height"
    rest = name.slice(2)
  } else {
    return null
  }
  if (!SIZE_PERCENT_SET.has(rest)) return null
  return decl(prop, `${rest}%`, { category: 3 })
}

// Viewport-relative sizes: .w-{n}vw, .h-{n}vh, .w-100vw, .h-100vh.
export function matchViewportSize(name: string): MatchResult | null {
  let vMatch = name.match(/^w-(\d+)vw$/)
  if (vMatch && VIEWPORT_SIZE_SET.has(vMatch[1]!))
    return decl("width", `${vMatch[1]}vw`, { category: 3 })
  vMatch = name.match(/^h-(\d+)vh$/)
  if (vMatch && VIEWPORT_SIZE_SET.has(vMatch[1]!))
    return decl("height", `${vMatch[1]}vh`, { category: 3 })
  return null
}

// Content-driven shortcuts.
export function matchContentSize(name: string): MatchResult | null {
  if (name === "w-max-content") return decl("width", "max-content", { category: 3 })
  if (name === "w-min-content") return decl("width", "min-content", { category: 3 })
  if (name === "w-fit-content") return decl("width", "fit-content", { category: 3 })
  if (name === "h-max-content") return decl("height", "max-content", { category: 3 })
  if (name === "h-min-content") return decl("height", "min-content", { category: 3 })
  if (name === "h-fit-content") return decl("height", "fit-content", { category: 3 })
  if (name === "h-auto") return decl("height", "auto", { category: 3 })
  if (name === "w-auto") return decl("width", "auto", { category: 3 })
  return null
}

// Fixed pixel sizes: .w-32px, .h-100px, .max-w-{n}, .min-w-{n}px, etc.
// Legacy alias (no `px` suffix) only for max-w / min-w / min-h.
const FIXED_PROP_MAP: Record<string, string> = {
  w: "width",
  h: "height",
  "max-w": "max-width",
  "min-w": "min-width",
  "min-h": "min-height",
  "max-h": "max-height",
}
const FIXED_LEGACY_PROPS: Record<string, string> = {
  "max-w": "max-width",
  "min-w": "min-width",
  "min-h": "min-height",
  "max-h": "max-height",
}

export function matchFixedSize(name: string): MatchResult | null {
  // Try every prefix from longest to shortest so `min-w-100px` matches
  // `min-w` and not `w`.
  const orderedPrefixes = ["max-w", "min-w", "max-h", "min-h", "w", "h"]
  for (const prefix of orderedPrefixes) {
    if (!name.startsWith(`${prefix}-`)) continue
    const rest = name.slice(prefix.length + 1)
    const px = rest.match(/^(\d+)px$/)
    if (px && FIXED_SIZE_SET.has(px[1]!)) {
      return decl(FIXED_PROP_MAP[prefix]!, `${px[1]}px`, { category: 3 })
    }
    // Legacy form (no px suffix) is only valid for min-/max- helpers.
    if (FIXED_LEGACY_PROPS[prefix] && /^\d+$/.test(rest) && FIXED_SIZE_SET.has(rest)) {
      return decl(FIXED_LEGACY_PROPS[prefix]!, `${rest}px`, { category: 3 })
    }
  }
  return null
}

// Zero special case for min-/max- legacy (`.min-w-0`, `.min-h-0`, `.max-w-0`).
// Already covered by matchFixedSize because `0` is in FIXED_SIZE_SET.

// `.w-100vw` and `.h-100vh` alias entries.
export function matchVwVhAlias(name: string): MatchResult | null {
  if (name === "w-100vw") return decl("width", "100vw", { category: 3 })
  if (name === "h-100vh") return decl("height", "100vh", { category: 3 })
  return null
}

// Auto margins live in spacing matcher; auto sizing belongs here.
export function matchAutoSize(name: string): MatchResult | null {
  // Already handled in matchContentSize, retained for clarity.
  return null
}

// Re-export helper for declMany if needed by other modules.
export { declMany }
