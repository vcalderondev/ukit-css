// =============================================================================
// TYPOGRAPHY MATCHERS
// -----------------------------------------------------------------------------
// font-size, font-weight, text-align, text-transform, line-height,
// white-space, text-ellipsis (+ multi-line clamp), letter-spacing.
// =============================================================================

import type { MatchResult } from "../types.js"
import {
  FONT_WEIGHTS,
  FS_EM_SET,
  FS_PX_SET,
  FS_REM_SET,
  LETTER_SPACING_EM_SET,
  LETTER_SPACING_PX_SET,
  LINE_HEIGHT_SET,
  TEXT_ALIGNS,
  TEXT_TRANSFORMS,
  WHITE_SPACES,
} from "../tokens.js"
import { dashToDot, decl, declMany } from "./helpers.js"

const TEXT_ALIGN_SET = new Set<string>(TEXT_ALIGNS)
const TEXT_TRANSFORM_SET = new Set<string>(TEXT_TRANSFORMS)
const WHITE_SPACE_SET = new Set<string>(WHITE_SPACES)

// .fs-{value}{-unit?}
export function matchFontSize(name: string): MatchResult | null {
  if (!name.startsWith("fs-")) return null
  const rest = name.slice(3)

  // .fs-{n}px
  const px = rest.match(/^(\d+)px$/)
  if (px && FS_PX_SET.has(px[1]!)) {
    return decl("font-size", `${px[1]}px`, { category: 8 })
  }
  // .fs-{n}-rem
  const rem = rest.match(/^([\d-]+)-rem$/)
  if (rem && FS_REM_SET.has(rem[1]!)) {
    return decl("font-size", `${dashToDot(rem[1]!)}rem`, { category: 8 })
  }
  // .fs-{n}-em
  const em = rest.match(/^([\d-]+)-em$/)
  if (em && FS_EM_SET.has(em[1]!)) {
    return decl("font-size", `${dashToDot(em[1]!)}em`, { category: 8 })
  }
  // Legacy bare alias (.fs-1, .fs-0-875) — rem scale.
  if (/^[\d-]+$/.test(rest) && FS_REM_SET.has(rest)) {
    return decl("font-size", `${dashToDot(rest)}rem`, { category: 8 })
  }
  return null
}

// .fw-{name}
export function matchFontWeight(name: string): MatchResult | null {
  if (!name.startsWith("fw-")) return null
  const value = name.slice(3)
  if (FONT_WEIGHTS[value] === undefined) return null
  return decl("font-weight", FONT_WEIGHTS[value]!, { category: 8 })
}

// .text-{align}, .text-{transform}, .text-ellipsis, .text-ellipsis-{2-6}
export function matchText(name: string): MatchResult | null {
  if (name === "text-ellipsis") {
    return declMany(
      {
        overflow: "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap",
      },
      { category: 8 },
    )
  }
  const clamp = name.match(/^text-ellipsis-([2-6])$/)
  if (clamp) {
    return declMany(
      {
        display: "-webkit-box",
        "-webkit-line-clamp": clamp[1]!,
        "-webkit-box-orient": "vertical",
        overflow: "hidden",
      },
      { category: 8 },
    )
  }
  if (!name.startsWith("text-")) return null
  const value = name.slice("text-".length)
  if (TEXT_ALIGN_SET.has(value)) {
    return decl("text-align", value, { category: 8 })
  }
  if (TEXT_TRANSFORM_SET.has(value)) {
    return decl("text-transform", value, { category: 8 })
  }
  return null
}

// .lh-{value} where value is a dasherized decimal (`.lh-1`, `.lh-1-5`, `.lh-1-2`).
export function matchLineHeight(name: string): MatchResult | null {
  if (!name.startsWith("lh-")) return null
  const rest = name.slice(3)
  if (!LINE_HEIGHT_SET.has(rest)) return null
  return decl("line-height", dashToDot(rest), { category: 8 })
}

// .ws-{value}
export function matchWhiteSpace(name: string): MatchResult | null {
  if (!name.startsWith("ws-")) return null
  const value = name.slice(3)
  if (!WHITE_SPACE_SET.has(value)) return null
  return decl("white-space", value, { category: 8 })
}

// .letter-spacing-{n}px / .letter-spacing-{n}
// .letter-spacing-neg-{n}px / .letter-spacing-neg-{n}
// .letter-spacing-{val}-em / .letter-spacing-neg-{val}-em
export function matchLetterSpacing(name: string): MatchResult | null {
  if (!name.startsWith("letter-spacing-")) return null
  const rest = name.slice("letter-spacing-".length)
  const negative = rest.startsWith("neg-")
  const body = negative ? rest.slice("neg-".length) : rest
  const sign = negative ? "-" : ""

  // px (with suffix), including the fractional 0-5 step
  const px = body.match(/^([\d-]+)px$/)
  if (px && LETTER_SPACING_PX_SET.has(px[1]!)) {
    return decl("letter-spacing", `${sign}${dashToDot(px[1]!)}px`, { category: 8 })
  }
  // Legacy: bare integer 1-10 → px
  if (/^\d+$/.test(body)) {
    const n = Number(body)
    if (n >= 1 && n <= 10) {
      return decl("letter-spacing", `${sign}${n}px`, { category: 8 })
    }
  }
  // em form
  const em = body.match(/^([\d-]+)-em$/)
  if (em && LETTER_SPACING_EM_SET.has(em[1]!)) {
    return decl("letter-spacing", `${sign}${dashToDot(em[1]!)}em`, {
      category: 8,
    })
  }
  return null
}
