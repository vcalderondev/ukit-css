// =============================================================================
// FLEXBOX MATCHERS
// -----------------------------------------------------------------------------
// align-items/self/content, justify-content/items/self, flex shorthand,
// flex-grow, flex-shrink, flex-wrap, flex-direction, flex-flow, object-fit.
// =============================================================================

import type { MatchResult } from "../types.js"
import {
  ALIGN_VALUES,
  FLEX_DIRECTIONS,
  FLEX_FLOW_VALUES,
  FLEX_WRAPS,
  JUSTIFY_VALUES,
  OBJECT_FITS,
} from "../tokens.js"
import { decl } from "./helpers.js"

const FLEX_WRAP_SET = new Set<string>(FLEX_WRAPS)
const FLEX_DIR_SET = new Set<string>(FLEX_DIRECTIONS)
const FLEX_FLOW_SET = new Set<string>(FLEX_FLOW_VALUES)
const OBJECT_FIT_SET = new Set<string>(OBJECT_FITS)

const ALIGN_PROPS = ["align-items", "align-self", "align-content"] as const
const JUSTIFY_PROPS = ["justify-content", "justify-items", "justify-self"] as const

export function matchAlignment(name: string): MatchResult | null {
  for (const prop of ALIGN_PROPS) {
    if (!name.startsWith(`${prop}-`)) continue
    const suffix = name.slice(prop.length + 1)
    const value = ALIGN_VALUES[suffix]
    if (value === undefined) return null
    return decl(prop, value, { category: 5 })
  }
  return null
}

export function matchJustification(name: string): MatchResult | null {
  for (const prop of JUSTIFY_PROPS) {
    if (!name.startsWith(`${prop}-`)) continue
    const suffix = name.slice(prop.length + 1)
    const value = JUSTIFY_VALUES[suffix]
    if (value === undefined) return null
    return decl(prop, value, { category: 5 })
  }
  return null
}

// .flex-0, .flex-1, .flex-none, .flex-{wrap}
export function matchFlexShorthand(name: string): MatchResult | null {
  if (name === "flex-0") return decl("flex", "0", { category: 5 })
  if (name === "flex-1") return decl("flex", "1", { category: 5 })
  if (name === "flex-none") return decl("flex", "none", { category: 5 })
  if (name.startsWith("flex-")) {
    const v = name.slice("flex-".length)
    if (FLEX_WRAP_SET.has(v)) {
      return decl("flex-wrap", v, { category: 5 })
    }
  }
  return null
}

// .flex-grow-{0|1}, .flex-shrink-{0|1}
export function matchFlexGrowShrink(name: string): MatchResult | null {
  if (name === "flex-grow-0") return decl("flex-grow", "0", { category: 5 })
  if (name === "flex-grow-1") return decl("flex-grow", "1", { category: 5 })
  if (name === "flex-shrink-0") return decl("flex-shrink", "0", { category: 5 })
  if (name === "flex-shrink-1") return decl("flex-shrink", "1", { category: 5 })
  return null
}

// .flex-direction-{value}
export function matchFlexDirection(name: string): MatchResult | null {
  if (!name.startsWith("flex-direction-")) return null
  const v = name.slice("flex-direction-".length)
  if (!FLEX_DIR_SET.has(v)) return null
  return decl("flex-direction", v, { category: 5 })
}

// .flex-flow-{value}
export function matchFlexFlow(name: string): MatchResult | null {
  if (!name.startsWith("flex-flow-")) return null
  const v = name.slice("flex-flow-".length)
  if (!FLEX_FLOW_SET.has(v)) return null
  return decl("flex-flow", v, { category: 5 })
}

// .object-{value}
export function matchObjectFit(name: string): MatchResult | null {
  if (!name.startsWith("object-")) return null
  const v = name.slice("object-".length)
  if (!OBJECT_FIT_SET.has(v)) return null
  return decl("object-fit", v, { category: 5 })
}
