// =============================================================================
// POSITIONING + LAYOUT MATCHERS
// -----------------------------------------------------------------------------
// position-*, top/bottom/left/right/start/end offsets, transform helpers,
// float, vertical-align, clearfix.
// =============================================================================

import type { MatchResult } from "../types.js"
import {
  EM_SET,
  FLOAT_VALUES,
  OFFSET_ANCHORS,
  POSITIONS,
  PX_SET,
  REM_SET,
  SIDES,
  SIDE_TO_PROP,
  TRANSFORM_UTILS,
  VERTICAL_ALIGNS,
} from "../tokens.js"
import { dashToDot, decl } from "./helpers.js"

const POSITION_SET = new Set<string>(POSITIONS)
const SIDES_SET = new Set<string>(SIDES)
const VERTICAL_ALIGN_SET = new Set<string>(VERTICAL_ALIGNS)

// .position-{relative|absolute|fixed|sticky}
export function matchPosition(name: string): MatchResult | null {
  if (!name.startsWith("position-")) return null
  const value = name.slice("position-".length)
  if (!POSITION_SET.has(value)) return null
  return decl("position", value, { category: 4 })
}

// Edge offsets: .top-0, .bottom-50-percent, .start-50, .end-0, etc.
// Numeric offsets: .top-10px, .right-1-5-rem, etc.
export function matchOffset(name: string): MatchResult | null {
  // Find which side prefix matches (avoid collisions: 'start' before 's', etc.)
  let side: string | null = null
  for (const s of SIDES) {
    if (name === s || name.startsWith(`${s}-`)) {
      side = s
      break
    }
  }
  if (!side) return null
  if (name === side) return null // `.top` alone is not a class
  const rest = name.slice(side.length + 1)
  const prop = SIDE_TO_PROP[side]!

  // Anchored offsets: 0, 50-percent, 50
  if (OFFSET_ANCHORS[rest] !== undefined) {
    return decl(prop, OFFSET_ANCHORS[rest]!, { category: 4 })
  }
  // Pixel offsets
  const px = rest.match(/^(\d+)px$/)
  if (px && PX_SET.has(px[1]!)) {
    return decl(prop, `${px[1]}px`, { category: 4 })
  }
  // Rem offsets: .top-0-5-rem, .left-1-rem
  const remM = rest.match(/^([\d-]+)-rem$/)
  if (remM && REM_SET.has(remM[1]!)) {
    return decl(prop, `${dashToDot(remM[1]!)}rem`, { category: 4 })
  }
  // Em offsets (not in original SASS but harmless to support)
  const emM = rest.match(/^([\d-]+)-em$/)
  if (emM && EM_SET.has(emM[1]!)) {
    return decl(prop, `${dashToDot(emM[1]!)}em`, { category: 4 })
  }
  return null
}

// .translate-x-center, .translate-center, .rotate-90, .transform-none, ...
export function matchTransform(name: string): MatchResult | null {
  if (TRANSFORM_UTILS[name] !== undefined) {
    return decl("transform", TRANSFORM_UTILS[name]!, { category: 4 })
  }
  return null
}

// .float-{name}
export function matchFloat(name: string): MatchResult | null {
  if (!name.startsWith("float-")) return null
  const value = name.slice("float-".length)
  if (FLOAT_VALUES[value] === undefined) return null
  return decl("float", FLOAT_VALUES[value]!, { category: 4 })
}

// .align-{baseline|top|middle|bottom|sub|super|text-top|text-bottom}
export function matchVerticalAlign(name: string): MatchResult | null {
  if (!name.startsWith("align-")) return null
  const value = name.slice("align-".length)
  if (!VERTICAL_ALIGN_SET.has(value)) return null
  return decl("vertical-align", value, { category: 4 })
}

// .clearfix
export function matchClearfix(name: string): MatchResult | null {
  if (name !== "clearfix") return null
  return decl("clear", "both", { category: 4 })
}
