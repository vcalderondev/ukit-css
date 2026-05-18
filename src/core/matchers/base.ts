// =============================================================================
// BASE MATCHERS
// -----------------------------------------------------------------------------
// Background resets, cursor, outline, pointer-events.
// =============================================================================

import type { MatchResult } from "../types.js"
import { CURSORS } from "../tokens.js"
import { decl } from "./helpers.js"

const CURSOR_SET = new Set<string>(CURSORS)

export function matchBackground(name: string): MatchResult | null {
  if (name === "bg-transparent") return decl("background", "transparent", { category: 1 })
  if (name === "bg-none") return decl("background", "none", { category: 1 })
  return null
}

export function matchCursor(name: string): MatchResult | null {
  if (!name.startsWith("cursor-")) return null
  const value = name.slice("cursor-".length)
  if (!CURSOR_SET.has(value)) return null
  return decl("cursor", value, { category: 1 })
}

export function matchOutlineNone(name: string): MatchResult | null {
  if (name !== "outline-none") return null
  return decl("outline", "none", { category: 1 })
}

export function matchPointerEvents(name: string): MatchResult | null {
  if (name === "pointer-events-none") return decl("pointer-events", "none", { category: 1 })
  if (name === "pointer-events-auto") return decl("pointer-events", "auto", { category: 1 })
  return null
}
