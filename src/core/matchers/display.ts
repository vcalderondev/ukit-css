// =============================================================================
// DISPLAY MATCHERS
// =============================================================================

import type { MatchResult } from "../types.js"
import { DISPLAYS } from "../tokens.js"
import { decl } from "./helpers.js"

const DISPLAY_SET = new Set<string>(DISPLAYS)

export function matchDisplay(name: string): MatchResult | null {
  if (!name.startsWith("d-")) return null
  let rest = name.slice(2)

  // `.d-{value}-i` — explicit !important alias, same output as the base.
  if (rest.endsWith("-i")) {
    rest = rest.slice(0, -2)
  }
  if (!DISPLAY_SET.has(rest)) return null
  return decl("display", rest, { category: 2 })
}
