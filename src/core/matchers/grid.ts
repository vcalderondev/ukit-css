// =============================================================================
// GRID MATCHERS
// =============================================================================

import type { MatchResult } from "../types.js"
import { GRID_FLOW_MAP } from "../tokens.js"
import { declMany } from "./helpers.js"

// .grid-cols-{1-12} → display:grid + grid-template-columns
export function matchGridCols(name: string): MatchResult | null {
  const m = name.match(/^grid-cols-(\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  if (n < 1 || n > 12) return null
  return declMany(
    {
      display: "grid",
      "grid-template-columns": `repeat(${n}, minmax(0, 1fr))`,
    },
    { category: 10 },
  )
}

// .grid-col-span-{1-12}, .grid-col-span-full
export function matchGridColSpan(name: string): MatchResult | null {
  if (name === "grid-col-span-full") {
    return declMany({ "grid-column": "1 / -1" }, { category: 10 })
  }
  const m = name.match(/^grid-col-span-(\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  if (n < 1 || n > 12) return null
  return declMany({ "grid-column": `span ${n} / span ${n}` }, { category: 10 })
}

// .grid-rows-{1-6}
export function matchGridRows(name: string): MatchResult | null {
  const m = name.match(/^grid-rows-(\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  if (n < 1 || n > 6) return null
  return declMany(
    {
      display: "grid",
      "grid-template-rows": `repeat(${n}, minmax(0, 1fr))`,
    },
    { category: 10 },
  )
}

// .grid-row-span-{1-6}, .grid-row-span-full
export function matchGridRowSpan(name: string): MatchResult | null {
  if (name === "grid-row-span-full") {
    return declMany({ "grid-row": "1 / -1" }, { category: 10 })
  }
  const m = name.match(/^grid-row-span-(\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  if (n < 1 || n > 6) return null
  return declMany({ "grid-row": `span ${n} / span ${n}` }, { category: 10 })
}

// .grid-flow-{name}
export function matchGridFlow(name: string): MatchResult | null {
  if (!name.startsWith("grid-flow-")) return null
  const v = name.slice("grid-flow-".length)
  if (GRID_FLOW_MAP[v] === undefined) return null
  return declMany({ "grid-auto-flow": GRID_FLOW_MAP[v]! }, { category: 10 })
}
