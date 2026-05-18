// =============================================================================
// SPACING MATCHERS (margin / padding / gap)
// -----------------------------------------------------------------------------
// Class shape: {prop}{dir?}-{value}{-unit?}
//   prop  -> m | p | gap
//   dir   -> t | b | l | r | s | e | x | y    (optional, none for `gap`)
//   unit  -> rem | px | em | vh | vw          (px has no dash, others use `-`)
//
// Legacy: a bare numeric value resolves to em (last), else px, else rem
// (preserving the SASS cascade where em overrides earlier units).
// =============================================================================

import type { MatchResult } from "../types.js"
import { EM_SET, PX_SET, REM_SET, VIEWPORT_SPACING_SET } from "../tokens.js"
import { dashToDot, declMany } from "./helpers.js"

const PROP_MAP: Record<string, string> = {
  m: "margin",
  p: "padding",
}

const SIDE_MAP: Record<string, string> = {
  t: "top",
  b: "bottom",
  l: "left",
  r: "right",
  s: "left", // logical start → physical left
  e: "right", // logical end → physical right
}

const AXIS_MAP: Record<string, string[]> = {
  x: ["left", "right"],
  y: ["top", "bottom"],
}

const AUTO_MARGINS: Record<string, string[]> = {
  "m-auto": ["margin"],
  "mt-auto": ["margin-top"],
  "mb-auto": ["margin-bottom"],
  "ms-auto": ["margin-left"],
  "me-auto": ["margin-right"],
  "mx-auto": ["margin-left", "margin-right"],
  "my-auto": ["margin-top", "margin-bottom"],
}

function parseSpacingValue(rest: string): { value: string; unit: string } | null {
  // {n}px
  const px = rest.match(/^(\d+)px$/)
  if (px && PX_SET.has(px[1]!)) return { value: px[1]!, unit: "px" }

  // {n}-rem  (e.g. 1-rem, 0-5-rem, 2-5-rem)
  const rem = rest.match(/^([\d-]+)-rem$/)
  if (rem && REM_SET.has(rem[1]!)) return { value: dashToDot(rem[1]!), unit: "rem" }

  // {n}-em
  const em = rest.match(/^([\d-]+)-em$/)
  if (em && EM_SET.has(em[1]!)) return { value: dashToDot(em[1]!), unit: "em" }

  // {n}vh / {n}vw (viewport-relative spacing)
  const vh = rest.match(/^(\d+)vh$/)
  if (vh && VIEWPORT_SPACING_SET.has(vh[1]!)) return { value: vh[1]!, unit: "vh" }
  const vw = rest.match(/^(\d+)vw$/)
  if (vw && VIEWPORT_SPACING_SET.has(vw[1]!)) return { value: vw[1]!, unit: "vw" }

  // Legacy alias (no unit suffix). Em wins because it was the last cascade.
  if (/^[\d-]+$/.test(rest)) {
    if (EM_SET.has(rest)) return { value: dashToDot(rest), unit: "em" }
    if (PX_SET.has(rest)) return { value: rest, unit: "px" }
    if (REM_SET.has(rest)) return { value: dashToDot(rest), unit: "rem" }
  }
  return null
}

export function matchSpacing(name: string): MatchResult | null {
  // Auto margins first (string-equality fast path).
  if (AUTO_MARGINS[name]) {
    const decls: Record<string, string> = {}
    for (const p of AUTO_MARGINS[name]!) decls[p] = "auto"
    return declMany(decls, { category: 7 })
  }

  // gap-{value}{-unit?}
  if (name.startsWith("gap-")) {
    const parsed = parseSpacingValue(name.slice(4))
    if (!parsed) return null
    return declMany({ gap: `${parsed.value}${parsed.unit}` }, { category: 7 })
  }

  // {m|p}{dir?}-{value}{-unit?}
  if (
    !(
      name.startsWith("m-") ||
      name.startsWith("p-") ||
      name.startsWith("mt-") ||
      name.startsWith("mb-") ||
      name.startsWith("ml-") ||
      name.startsWith("mr-") ||
      name.startsWith("ms-") ||
      name.startsWith("me-") ||
      name.startsWith("mx-") ||
      name.startsWith("my-") ||
      name.startsWith("pt-") ||
      name.startsWith("pb-") ||
      name.startsWith("pl-") ||
      name.startsWith("pr-") ||
      name.startsWith("ps-") ||
      name.startsWith("pe-") ||
      name.startsWith("px-") ||
      name.startsWith("py-")
    )
  ) {
    return null
  }

  const propLetter = name[0]!
  const propBase = PROP_MAP[propLetter]
  if (!propBase) return null
  const second = name[1]!
  let dir: string | null = null
  let valueStart = 2
  if (second !== "-") {
    dir = second
    valueStart = 3
  }
  if (name[valueStart - 1] !== "-") return null
  const rest = name.slice(valueStart)
  const parsed = parseSpacingValue(rest)
  if (!parsed) return null
  const value = `${parsed.value}${parsed.unit}`

  if (!dir) {
    return declMany({ [propBase]: value }, { category: 7 })
  }
  if (SIDE_MAP[dir]) {
    return declMany({ [`${propBase}-${SIDE_MAP[dir]}`]: value }, { category: 7 })
  }
  if (AXIS_MAP[dir]) {
    const decls: Record<string, string> = {}
    for (const side of AXIS_MAP[dir]!) decls[`${propBase}-${side}`] = value
    return declMany(decls, { category: 7 })
  }
  return null
}
