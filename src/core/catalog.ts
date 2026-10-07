// =============================================================================
// CATALOG
// -----------------------------------------------------------------------------
// Turns the declarative `grammar.ts` into a queryable, validated catalog:
//
//   createCatalog()      -> every valid class name + family metadata
//   explainClass(name)   -> the CSS a class emits (used by `ukit-css explain`)
//   suggestClasses(name) -> nearest valid class names ("did you mean…")
//   diagnose(candidates) -> unknown-but-utility-looking tokens, with suggestions
//
// `matchCandidate()` remains the single source of truth for validity. The
// catalog only *describes* it, and `auditCatalog()` proves the two agree — see
// test/catalog.test.mjs.
// =============================================================================

import type { Breakpoint, GeneratedRule } from "./types.js"
import { FAMILIES, allStems, enumerateFamily, type GrammarFamily } from "./grammar.js"
import { matchCandidate, MATCHER_REGISTRY } from "./matchers/index.js"
import { emitRule } from "./generator.js"
import { DEFAULT_BREAKPOINTS } from "./tokens.js"

export interface CatalogEntry {
  /** Base class name, without any `-m` / `-t` suffix. */
  name: string
  familyId: string
}

export interface Catalog {
  families: readonly GrammarFamily[]
  /** base class name -> family id (first declaring family wins). */
  byName: Map<string, CatalogEntry>
  /** Sorted base class names (no breakpoint suffix). */
  baseClasses: string[]
  /** Every class including the `-m` / `-t` variants. */
  allClasses: string[]
  /** Sorted unique stems across every family. */
  stems: string[]
  counts: {
    families: number
    base: number
    withBreakpoints: number
  }
}

const SUFFIXES = ["-m", "-t"] as const

export function createCatalog(): Catalog {
  const byName = new Map<string, CatalogEntry>()
  const all = new Set<string>()

  for (const family of FAMILIES) {
    for (const name of enumerateFamily(family)) {
      if (!byName.has(name)) byName.set(name, { name, familyId: family.id })
      all.add(name)
      for (const suffix of SUFFIXES) all.add(`${name}${suffix}`)
    }
  }

  const baseClasses = [...byName.keys()].sort()
  return {
    families: FAMILIES,
    byName,
    baseClasses,
    allClasses: [...all].sort(),
    stems: allStems(),
    counts: {
      families: FAMILIES.length,
      base: baseClasses.length,
      withBreakpoints: all.size,
    },
  }
}

// -----------------------------------------------------------------------------
// Explanation
// -----------------------------------------------------------------------------

export interface ClassExplanation {
  name: string
  valid: boolean
  /** Breakpoint the class applies at. */
  breakpoint?: Breakpoint
  /** Class name stripped of its breakpoint suffix. */
  base?: string
  familyId?: string
  familyTitle?: string
  /** CSS declarations, e.g. `{ margin: "1rem" }`. */
  declarations?: Record<string, string>
  /** How the declarations are rendered: `margin: 1rem !important;`. */
  declarationsText?: string
  /** A ready-to-paste CSS rule, exactly as the generator emits it. */
  css?: string
  /** True when the declaration is emitted with `!important`. */
  important?: boolean
  /** Query the media query the rule lands in, when responsive. */
  mediaQuery?: string
}

/** Breakpoint numbers used to describe a rule's media query. */
export interface BreakpointNumbers {
  mobile: number
  tablet: number
}

function mediaQueryFor(
  breakpoint: Breakpoint,
  bp: BreakpointNumbers = DEFAULT_BREAKPOINTS,
): string | undefined {
  if (breakpoint === "mobile") return `@media (max-width: ${bp.mobile}px)`
  if (breakpoint === "tablet")
    return `@media (min-width: ${bp.mobile + 1}px) and (max-width: ${bp.tablet}px)`
  return undefined
}

/**
 * Explain a single class name: what it compiles to, which family it belongs to
 * and at which breakpoint it applies. Works for valid and invalid names, which
 * makes it the ideal primitive for both the CLI and LLM tooling.
 *
 * Pass the project's breakpoints (from `resolveConfig`) so the reported media
 * query matches the CSS the engine actually emits.
 */
export function explainClass(name: string, breakpoints?: BreakpointNumbers): ClassExplanation {
  if (typeof name !== "string") {
    // Never throw on a value that crossed a type boundary at runtime.
    return { name: String(name), valid: false }
  }
  const match = matchCandidate(name)
  if (!match) {
    return { name, valid: false, base: stripSuffix(name) }
  }
  const { result, breakpoint, selector } = match
  const important = result.important ?? true
  const entry = lookupFamily(name, selector, breakpoint)

  const declsText = Object.entries(result.decls)
    .map(([prop, value]) => `${prop}: ${value}${important ? " !important" : ""};`)
    .join(" ")

  const rule: GeneratedRule = {
    selector,
    decls: result.decls,
    important,
    breakpoint,
    category: result.category ?? 99,
    priority: result.priority ?? 0,
  }

  return {
    name,
    valid: true,
    breakpoint,
    base: stripSuffix(name),
    familyId: entry?.familyId,
    familyTitle: entry && FAMILY_TITLES.get(entry.familyId),
    declarations: result.decls,
    declarationsText: declsText,
    css: emitRule(rule, ""),
    important,
    mediaQuery: mediaQueryFor(breakpoint, breakpoints),
  }
}

const FAMILY_TITLES = new Map(FAMILIES.map((f) => [f.id, f.title]))

/**
 * The base form of a class, or the name itself when it is already a base rule.
 *
 * Driven by the oracle rather than by string matching: `.border-t` ends in `-t`
 * but compiles to `border-top` at every viewport, so it must NOT be reported as
 * the tablet variant of `.border`.
 */
export function stripSuffix(name: string): string {
  const match = matchCandidate(name)
  if (!match || match.breakpoint === "base") return name
  const suffix = match.breakpoint === "mobile" ? "-m" : "-t"
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name
}

function lookupFamily(
  name: string,
  selector: string,
  breakpoint: Breakpoint,
): CatalogEntry | undefined {
  const catalog = getCatalog()
  const candidates = breakpoint === "base" ? [name, selector] : [stripSuffix(name), selector, name]
  for (const c of candidates) {
    const hit = catalog.byName.get(c)
    if (hit) return hit
  }
  return undefined
}

// -----------------------------------------------------------------------------
// Suggestions
// -----------------------------------------------------------------------------

/**
 * Curated map for the misconceptions language models carry over from Tailwind.
 * Only names that are *invalid* here are listed — the catalogue cannot fix
 * `p-4`, which is valid but means 4px rather than 1rem (see AGENTS.md).
 */
export const TAILWIND_ALIASES: Readonly<Record<string, readonly string[]>> = {
  flex: ["d-flex"],
  grid: ["d-grid"],
  block: ["d-block"],
  "inline-block": ["d-inline-block"],
  hidden: ["d-none"],
  relative: ["position-relative"],
  absolute: ["position-absolute"],
  fixed: ["position-fixed"],
  sticky: ["position-sticky"],
  "items-center": ["align-items-center"],
  "items-start": ["align-items-start"],
  "items-end": ["align-items-end"],
  "justify-between": ["justify-content-between"],
  "justify-center": ["justify-content-center"],
  "justify-around": ["justify-content-around"],
  "flex-col": ["flex-direction-column"],
  "flex-row": ["flex-direction-row"],
  "flex-col-reverse": ["flex-direction-column-reverse"],
  "text-sm": ["fs-0-875-rem"],
  "text-base": ["fs-1-rem"],
  "text-lg": ["fs-1-2-rem"],
  "text-xl": ["fs-1-25-rem"],
  "text-2xl": ["fs-1-5-rem"],
  "text-3xl": ["fs-1-75-rem"],
  "font-bold": ["fw-700"],
  "font-semibold": ["fw-600"],
  "font-medium": ["fw-500"],
  "font-light": ["fw-300"],
  "w-full": ["w-100"],
  "h-full": ["h-100"],
  "w-screen": ["w-100vw"],
  "h-screen": ["h-100vh"],
  "rounded": ["rounded-8px"],
  "leading-none": ["lh-1"],
  "leading-tight": ["lh-1-5"],
  "leading-normal": ["lh-1-5"],
  "tracking-wide": ["letter-spacing-0-05-em"],
  "tracking-tight": ["letter-spacing-neg-0-02-em"],
  "gap-x-4": ["gap-16px"],
  "gap-y-4": ["gap-16px"],
  "space-y-4": ["my-16px"],
  "translate-x-1/2": ["translate-x-center"],
  "translate-y-1/2": ["translate-y-center"],
  "col-span-2": ["grid-col-span-2"],
  "row-span-2": ["grid-row-span-2"],
  "sr-only": ["text-ellipsis"],
}

/**
 * Classes that are **valid** but mean something different from what a Tailwind
 * habit suggests. These are the genuinely dangerous ones: they produce CSS, so
 * nothing warns you, and the layout is subtly wrong.
 *
 * Keyed by an example class, with the explanation as the value.
 */
export const SEMANTIC_TRAPS: Readonly<Record<string, string>> = {
  "p-4": "a bare number in the spacing family means px (after em), not rem — so p-4 is padding: 4px. Use p-1-rem for 1rem.",
  "m-2": "2px, not 0.5rem. The legacy bare-number alias resolves as em, then px, then rem.",
  "p-1": "1em, because em wins over px and rem for bare numbers.",
  "w-50": "a bare number in the sizing family is always a percentage — w-50 is width: 50%. Use w-50px or w-50vw for units.",
  "fs-1": "a bare number in the font-size family is rem — fs-1 is font-size: 1rem.",
  "rounded-md": "8px here, not Tailwind's 6px. The named radius scale is xs(2) sm(4) md(8) lg(12) xl(16) 2xl(24) full(9999).",
  "lh-1-5": "the dash is a decimal point, so this is line-height: 1.5.",
  "lh-4-5": "the dash is a decimal point, so this is line-height: 4.5. The scale is 1–2 in steps of 0.1, then 2.5, 3, 3.5, 4, 4.5 — there is no lh-1-25.",
  "h-100vh": "viewport units are written as a suffix and work for h/w plus the constraint helpers (min-h-100vh, max-h-60vh, max-w-100vw). There is no 'screen' keyword.",
  "border": "paints 1px solid var(--border); set --border to theme it.",
  "animate-spin": "the only family emitted without !important, so it stays overridable.",
}

let cachedCatalog: Catalog | null = null

/** Lazily-built shared catalog (the enumeration is cheap but not free). */
export function getCatalog(): Catalog {
  if (!cachedCatalog) cachedCatalog = createCatalog()
  return cachedCatalog
}

/** Cheap Levenshtein with an early-exit budget. */
function distance(a: string, b: string, budget: number): number {
  if (Math.abs(a.length - b.length) > budget) return budget + 1
  const prev = new Array<number>(b.length + 1)
  const curr = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    let rowMin = curr[0]!
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost)
      if (curr[j]! < rowMin) rowMin = curr[j]!
    }
    if (rowMin > budget) return budget + 1
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!
  }
  return prev[b.length]!
}

/** Longest grammar stem that `name` starts with, or null. */
function matchingStem(name: string, stems: readonly string[]): string | null {
  let best: string | null = null
  for (const stem of stems) {
    if (!name.startsWith(`${stem}-`)) continue
    if (!best || stem.length > best.length) best = stem
  }
  return best
}

/**
 * Nearest valid class names for `name`, best first.
 *
 * Strategy: (1) curated Tailwind misconceptions, (2) the same stem with the
 * nearest values, (3) the same value under the nearest stems, (4) a bounded
 * global scan. Returns an empty array when nothing is close, which is what
 * keeps the diagnostic layer free of false positives.
 */
export function suggestClasses(name: string, limit = 3): string[] {
  if (typeof name !== "string" || name.length === 0) return []
  if (matchCandidate(name)) return []
  const catalog = getCatalog()
  const out: string[] = []
  const seen = new Set<string>()
  const push = (candidate: string) => {
    if (seen.has(candidate) || out.length >= limit) return
    if (!catalog.byName.has(candidate) && !catalog.byName.has(stripSuffix(candidate))) return
    seen.add(candidate)
    out.push(candidate)
  }

  // 1. Curated misconceptions win outright: `text-sm` should suggest the
  //    font-size utility, not every class that happens to end in `-sm`.
  const curated = TAILWIND_ALIASES[name]
  if (curated) {
    for (const alias of curated) push(alias)
    if (out.length > 0) return out.slice(0, limit)
  }

  const base = stripSuffix(name)
  const stem = matchingStem(base, catalog.stems)
  if (stem) {
    const rest = base.slice(stem.length + 1)
    const sameStem = catalog.baseClasses.filter((c) => c.startsWith(`${stem}-`))
    const scored = sameStem
      .map((c) => ({ c, d: distance(rest, c.slice(stem.length + 1), 2) }))
      .filter((s) => s.d <= 2)
      .sort((a, b) => a.d - b.d || a.c.length - b.c.length)
    for (const s of scored) push(s.c)
  }

  if (out.length < limit) {
    const tail = stem ? base.slice(stem.length + 1) : null
    if (tail) {
      const otherStems = catalog.baseClasses.filter((c) => c.endsWith(`-${tail}`))
      for (const c of otherStems.sort((a, b) => a.length - b.length)) push(c)
    }
  }

  if (out.length === 0) {
    // Only the global fallback is this strict. Longer tokens are almost always
    // real identifiers or CSS keywords that merely resemble a class, and the
    // useful cases (`text-sm`, `items-center`) are covered by the curated
    // aliases and the tail match above, not by raw edit distance.
    const budget = base.length >= 8 ? 1 : 2
    const scored = catalog.baseClasses
      .filter((c) => Math.abs(c.length - base.length) <= budget + 1)
      .map((c) => ({ c, d: distance(base, c, budget) }))
      .filter((s) => s.d <= budget)
      .sort((a, b) => a.d - b.d || a.c.length - b.c.length)
    for (const s of scored) push(s.c)
  }

  return out.slice(0, limit)
}

// -----------------------------------------------------------------------------
// Diagnostics
// -----------------------------------------------------------------------------

/** Lexical shape of a class name: lowercase, digits and dashes only. */
const CLASS_SHAPE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

/**
 * First gate every *reported* token must pass: it must look like a utility
 * class at all — lowercase, dashes, between 3 and 48 characters.
 *
 * The extractor scrapes arbitrary text on purpose, so it also yields things
 * that are obviously not classes. Without this gate, inline CSS or arithmetic
 * in a scanned file produces nonsense warnings: `z-index: -1` and
 * `box-sizing: border-box` would be reported as near misses of `m-1` and
 * `border-b`.
 */
export function isClassShaped(token: string): boolean {
  if (typeof token !== "string") return false
  if (token.length < 3 || token.length > 48) return false
  return CLASS_SHAPE.test(token) && token.includes("-")
}

/**
 * Stricter gate used by the public `looksLikeUtility()` helper: the token must
 * look like a class *and* start with a stem the grammar actually has (or be a
 * known Tailwind misconception), *and* have a close suggestion.
 */
export function looksLikeUtility(token: string, suggestions?: string[]): boolean {
  if (!isClassShaped(token)) return false
  const catalog = getCatalog()
  if (!matchingStem(token, catalog.stems) && !TAILWIND_ALIASES[token]) return false
  const near = suggestions ?? suggestClasses(token, 1)
  return near.length > 0
}

export interface Diagnostic {
  token: string
  suggestions: string[]
}

/**
 * Diagnostics for tokens already known to be invalid. Split out from `diagnose`
 * so the engine can reuse the candidate scan it already performed instead of
 * validating every token twice.
 *
 * Only class-shaped tokens are considered; a token that is not even spelled
 * like a class is never worth a warning, however close a suggestion happens to
 * be.
 */
export function diagnoseUnknown(unknown: Iterable<string>, limit = 3): Diagnostic[] {
  const out: Diagnostic[] = []
  for (const token of unknown) {
    if (!isClassShaped(token)) continue
    const suggestions = suggestClasses(token, limit)
    if (suggestions.length > 0) out.push({ token, suggestions })
  }
  return out.sort((a, b) => a.token.localeCompare(b.token))
}

/**
 * Classify candidates into "valid" and "unknown but likely intended"
 * diagnostics. Used by the CLI (`ukit-css validate`) and by the Vite/PostCSS
 * plugins, which is what turns the JIT's silent-drop failure mode into an
 * actionable warning.
 */
export function diagnose(candidates: Iterable<string>, limit = 3): {
  valid: string[]
  unknown: string[]
  diagnostics: Diagnostic[]
} {
  const valid: string[] = []
  const unknown: string[] = []

  for (const token of candidates) {
    // Non-strings are not candidates at all: they neither match nor deserve a
    // "unknown class" report.
    if (typeof token !== "string") continue
    if (matchCandidate(token)) valid.push(token)
    else unknown.push(token)
  }

  valid.sort()
  unknown.sort()
  return { valid, unknown, diagnostics: diagnoseUnknown(unknown, limit) }
}

export interface ShadowedSuffix {
  /** Base utility whose breakpoint form is shadowed. */
  base: string
  /** The suffix that cannot be used. */
  suffix: string
  /** The class that wins instead. */
  shadowedBy: string
  reason: string
}

/**
 * The `-m` / `-t` suffix is not compositional in one edge case: the engine tries
 * the raw name first (`matchCandidate`), so a base utility whose suffixed form
 * is *itself* a class can never express that breakpoint.
 *
 * The single instance in the whole vocabulary is `.border` + `-t`, which
 * collides with `.border-t` (border-top). This function derives the list from
 * the grammar instead of hardcoding it, so a new collision is caught by the
 * anti-drift test rather than silently mis-documented.
 */
export function shadowedSuffixes(): ShadowedSuffix[] {
  const catalog = getCatalog()
  const out: ShadowedSuffix[] = []
  for (const base of catalog.baseClasses) {
    for (const suffix of SUFFIXES) {
      const combined = `${base}${suffix}`
      if (!catalog.byName.has(combined)) continue
      const match = matchCandidate(combined)
      if (match && match.breakpoint === "base") {
        out.push({
          base,
          suffix,
          shadowedBy: combined,
          reason: `.${combined} is itself a class, and the engine resolves the raw name before stripping the suffix`,
        })
      }
    }
  }
  return out
}

/** Grammar card: a compact summary aimed at LLMs (see AGENTS.md / llms.txt). */export function grammarCard(): {
  package: string
  naming: Record<string, string>
  counts: Catalog["counts"]
  families: { id: string; title: string; summary: string; properties: string[]; examples: string[] }[]
} {
  const catalog = getCatalog()
  return {
    package: "@vcalderondev/ukit-css",
    naming: {
      pattern: "<stem>-<value>[-<breakpoint>]",
      breakpoints: "-m = mobile (max-width: 576px), -t = tablet (577-992px), no suffix = all viewports",
      decimals: "Dots become dashes: 1.5rem -> 1-5-rem",
      units: "px attaches directly (p-16px); rem/em/vh/vw use a dash (p-1-5-rem)",
      important: "Every utility except animate-* is emitted with !important",
      warning: "These are NOT Tailwind names. p-4 is valid but means 4px, not 1rem.",
    },
    counts: catalog.counts,
    families: catalog.families.map((f) => ({
      id: f.id,
      title: f.title,
      summary: f.summary,
      properties: [...f.cssProperties],
      examples: [...f.examples],
    })),
  }
}

// -----------------------------------------------------------------------------
// Anti-drift audit
// -----------------------------------------------------------------------------

export interface CatalogAudit {
  /** Enumerated classes the real matcher rejects (the declaration is wrong). */
  forwardMismatches: string[]
  /** Classes the matcher accepts over the fuzz corpus but the grammar omits. */
  backwardUndeclared: string[]
  /** Matcher functions in the chain claimed by no grammar family. */
  unclaimedMatchers: string[]
  /** Grammar families claiming matcher names that do not exist. */
  unknownMatchers: string[]
  /** Class names declared by more than one family. */
  duplicates: { name: string; families: string[] }[]
  /** Base utilities whose breakpoint form is shadowed (see `shadowedSuffixes`). */
  shadowed: ShadowedSuffix[]
}

/**
 * Prove that `grammar.ts` and the matcher chain describe the same language,
 * in both directions, plus that every matcher is documented by a family.
 *
 * This is the guarantee that makes the generated manifest, types and docs
 * trustworthy: they can never silently drift away from real engine behaviour.
 */
export function auditCatalog(): CatalogAudit {
  const forwardMismatches: string[] = []
  const shadowed = shadowedSuffixes()
  const shadowedKeys = new Set(shadowed.map((s) => `${s.base}${s.suffix}`))

  for (const family of FAMILIES) {
    for (const name of enumerateFamily(family)) {
      const base = matchCandidate(name)
      if (!base || base.breakpoint !== "base") {
        forwardMismatches.push(`${name} (${family.id}: base form rejected)`)
        continue
      }
      const mobile = matchCandidate(`${name}-m`)
      if (!mobile || mobile.breakpoint !== "mobile") {
        forwardMismatches.push(`${name}-m (${family.id}: mobile form rejected)`)
      }
      const tablet = matchCandidate(`${name}-t`)
      if ((!tablet || tablet.breakpoint !== "tablet") && !shadowedKeys.has(`${name}-t`)) {
        forwardMismatches.push(`${name}-t (${family.id}: tablet form rejected)`)
      }
    }
  }

  // Backward: cross every stem with every value used anywhere in the grammar.
  // Any hit that is not declared means a matcher accepts a shape the grammar
  // does not describe.
  const catalog = getCatalog()
  const backwardUndeclared: string[] = []
  const stems = allStems()
  const values = new Set<string>()
  for (const family of FAMILIES) {
    for (const s of family.stems ?? []) for (const v of s.values) values.add(v)
  }
  for (const stem of stems) {
    for (const value of values) {
      const candidate = `${stem}-${value}`
      if (catalog.byName.has(candidate)) continue
      if (matchCandidate(candidate)) backwardUndeclared.push(candidate)
    }
  }

  const registryNames = new Set(MATCHER_REGISTRY.map((fn) => fn.name))
  const claimed = new Set<string>()
  for (const family of FAMILIES) for (const m of family.matchers) claimed.add(m)

  const unclaimedMatchers = [...registryNames].filter((n) => !claimed.has(n)).sort()
  const unknownMatchers = [...claimed].filter((n) => !registryNames.has(n)).sort()

  const seen = new Map<string, string[]>()
  for (const family of FAMILIES) {
    for (const name of new Set(enumerateFamily(family))) {
      const list = seen.get(name)
      if (list) list.push(family.id)
      else seen.set(name, [family.id])
    }
  }
  const duplicates = [...seen.entries()]
    .filter(([, families]) => families.length > 1)
    .map(([name, families]) => ({ name, families }))

  return {
    forwardMismatches: [...new Set(forwardMismatches)].sort(),
    backwardUndeclared: [...new Set(backwardUndeclared)].sort(),
    unclaimedMatchers,
    unknownMatchers,
    duplicates,
    shadowed,
  }
}
