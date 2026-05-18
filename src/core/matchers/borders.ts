// =============================================================================
// BORDER MATCHERS
// -----------------------------------------------------------------------------
// border-radius (px + named + side variants), applied borders, border styles.
// =============================================================================

import type { MatchResult } from "../types.js"
import { BORDER_RADIUS_NAMED, BORDER_RADIUS_PX_SET, RADIUS_SIDES } from "../tokens.js"
import { decl, declMany } from "./helpers.js"

// Pretty `.border` (all sides) — themed via --border CSS variable.
function appliedBorder(): MatchResult {
  return decl("border", "1px solid var(--border)", { category: 9 })
}

// Per-side `.border-{t|b|l|r|s|e}` → 1px solid var(--border) on that side.
const BORDER_SIDE_MAP: Record<string, string> = {
  t: "top",
  b: "bottom",
  l: "left",
  r: "right",
  s: "inline-start",
  e: "inline-end",
}

// Per-side clear: `.border-{side}-none`.
function sideClear(side: string): MatchResult {
  const physical = BORDER_SIDE_MAP[side]!
  return decl(`border-${physical}`, "none", { category: 9 })
}

export function matchBorderRadius(name: string): MatchResult | null {
  for (const prefix of ["border-radius", "rounded"]) {
    if (!name.startsWith(`${prefix}-`)) continue
    const rest = name.slice(prefix.length + 1)

    // Named tokens: xs/sm/md/lg/xl/2xl/full
    if (BORDER_RADIUS_NAMED[rest] !== undefined) {
      return decl("border-radius", BORDER_RADIUS_NAMED[rest]!, { category: 9 })
    }
    // 50-percent
    if (rest === "50-percent") {
      return decl("border-radius", "50%", { category: 9 })
    }
    // Numeric px scale: {n}px
    const pxFull = rest.match(/^(\d+)px$/)
    if (pxFull && BORDER_RADIUS_PX_SET.has(pxFull[1]!)) {
      return decl("border-radius", `${pxFull[1]}px`, { category: 9 })
    }
    // Directional radius: {t|b|l|r}-{n}px
    const sideMatch = rest.match(/^([tblr])-(\d+)px$/)
    if (sideMatch && BORDER_RADIUS_PX_SET.has(sideMatch[2]!)) {
      const corners = RADIUS_SIDES[sideMatch[1]!]!
      const decls: Record<string, string> = {}
      for (const corner of corners) decls[`border-${corner}-radius`] = `${sideMatch[2]}px`
      return declMany(decls, { category: 9 })
    }
  }
  return null
}

export function matchBorder(name: string): MatchResult | null {
  // .border (all sides)
  if (name === "border") return appliedBorder()
  // .border-none, .border-transparent
  if (name === "border-none") return decl("border", "none", { category: 9 })
  if (name === "border-transparent") return decl("border-color", "transparent", { category: 9 })

  // .border-{t|b|l|r|s|e} (per side, 1px solid var(--border))
  const sideMatch = name.match(/^border-([tblrse])$/)
  if (sideMatch) {
    const physical = BORDER_SIDE_MAP[sideMatch[1]!]!
    return decl(`border-${physical}`, "1px solid var(--border)", {
      category: 9,
    })
  }
  // .border-{side}-none
  const clearMatch = name.match(/^border-([tblrse])-none$/)
  if (clearMatch) return sideClear(clearMatch[1]!)

  return null
}
