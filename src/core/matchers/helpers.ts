// =============================================================================
// MATCHER HELPERS
// -----------------------------------------------------------------------------
// Small utilities shared by every category matcher. Centralising them avoids
// repetition and keeps individual matchers terse.
// =============================================================================

import type { Breakpoint, MatchResult } from "../types.js"

/** Replace `-` with `.` so `0-5` becomes `0.5`. */
export const dashToDot = (s: string): string => s.replace(/-/g, ".")

/** Strip an optional `-m` (mobile) or `-t` (tablet) suffix. */
export function stripBreakpoint(name: string): {
  base: string
  breakpoint: Breakpoint
} {
  if (name.length > 2) {
    const tail = name.slice(-2)
    if (tail === "-m") return { base: name.slice(0, -2), breakpoint: "mobile" }
    if (tail === "-t") return { base: name.slice(0, -2), breakpoint: "tablet" }
  }
  return { base: name, breakpoint: "base" }
}

/** Convenience: build a MatchResult from a single declaration. */
export const decl = (prop: string, value: string, extra?: Partial<MatchResult>): MatchResult => ({
  decls: { [prop]: value },
  important: true,
  ...extra,
})

/** Convenience: build a MatchResult from multiple declarations. */
export const declMany = (
  decls: Record<string, string>,
  extra?: Partial<MatchResult>,
): MatchResult => ({
  decls,
  important: true,
  ...extra,
})

/** Generic numeric-or-decimal value parser (`0`, `5`, `0-5`, `1-25`). */
const NUMERIC = /^\d+(?:-\d+)?$/

export function parseDashedNumber(s: string): number | null {
  if (!NUMERIC.test(s)) return null
  const n = Number(dashToDot(s))
  return Number.isFinite(n) ? n : null
}
