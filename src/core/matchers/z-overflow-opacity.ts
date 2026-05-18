// =============================================================================
// Z-INDEX / OVERFLOW / OPACITY MATCHERS
// =============================================================================

import type { MatchResult } from "../types.js"
import { OPACITIES, OVERFLOWS, Z_EXTREME_SET } from "../tokens.js"
import { decl } from "./helpers.js"

const OPACITY_SET = new Set<string>(OPACITIES.map(String))
const OVERFLOW_SET = new Set<string>(OVERFLOWS)

// .z-1 ... .z-10, .z-10 ... .z-100 (decades), .z-500/1000/2000/5000/9999/10000
export function matchZIndex(name: string): MatchResult | null {
  if (!name.startsWith("z-")) return null
  const rest = name.slice(2)
  if (!/^\d+$/.test(rest)) return null
  const n = Number(rest)
  // Units 1-10, decades 10-100, plus extreme presets.
  const isUnit = n >= 1 && n <= 10
  const isDecade = n >= 10 && n <= 100 && n % 10 === 0
  if (isUnit || isDecade || Z_EXTREME_SET.has(String(n))) {
    return decl("z-index", String(n), { category: 6 })
  }
  return null
}

// .overflow-{val}, .overflow-x-{val}, .overflow-y-{val}
export function matchOverflow(name: string): MatchResult | null {
  if (name.startsWith("overflow-x-")) {
    const v = name.slice("overflow-x-".length)
    if (OVERFLOW_SET.has(v)) return decl("overflow-x", v, { category: 6 })
    return null
  }
  if (name.startsWith("overflow-y-")) {
    const v = name.slice("overflow-y-".length)
    if (OVERFLOW_SET.has(v)) return decl("overflow-y", v, { category: 6 })
    return null
  }
  if (name.startsWith("overflow-")) {
    const v = name.slice("overflow-".length)
    if (OVERFLOW_SET.has(v)) return decl("overflow", v, { category: 6 })
  }
  return null
}

// .opacity-{n} where n in OPACITIES
export function matchOpacity(name: string): MatchResult | null {
  if (!name.startsWith("opacity-")) return null
  const rest = name.slice("opacity-".length)
  if (!OPACITY_SET.has(rest)) return null
  const value = (Number(rest) * 0.01).toFixed(2).replace(/\.?0+$/, "")
  return decl("opacity", value === "" ? "0" : value, { category: 6 })
}
