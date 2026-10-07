// =============================================================================
// MANIFEST — public, machine-readable description of the class grammar
// -----------------------------------------------------------------------------
// Everything a tool needs to understand the package without reading its source:
//
//   import { buildManifest, listClasses, explainClass } from "@vcalderondev/ukit-css/manifest"
//
// The same data is serialised to `ukit.manifest.json` and `ukit.classes.txt` at
// build time (see scripts/generate.mjs) so editors, LLMs and CI can consume it
// straight from the published package.
// =============================================================================

import { FAMILIES, type GrammarFamily, type GrammarStem } from "./core/grammar.js"
import {
  diagnose,
  explainClass,
  getCatalog,
  SEMANTIC_TRAPS,
  shadowedSuffixes,
  suggestClasses,
  TAILWIND_ALIASES,
  type ClassExplanation,
  type Diagnostic,
} from "./core/catalog.js"
import { DEFAULT_BREAKPOINTS } from "./core/tokens.js"
import { VERSION } from "./core/version.js"

export const MANIFEST_SCHEMA_VERSION = 1

export interface ManifestStem {
  stem: string
  targets?: string
  values: string[]
}

export interface ManifestFamily {
  id: string
  title: string
  summary: string
  docs?: string
  cssProperties: string[]
  examples: string[]
  matchers: string[]
  bare: string[]
  stems: ManifestStem[]
  extra: string[]
}

export interface UkitManifest {
  /** Bump when the shape of this document changes. */
  schemaVersion: number
  /** Generator version (the package version). */
  version: string
  package: string
  description: string
  naming: Record<string, string>
  breakpoints: {
    values: { mobile: number; tablet: number; desktop: number }
    suffixes: { suffix: string; id: string; description: string }[]
    /** Every base utility accepts the suffixes below. */
    universal: true
    /** Documented exceptions where a suffix is shadowed by another class. */
    exceptions: { base: string; suffix: string; shadowedBy: string; reason: string }[]
  }
  counts: { families: number; base: number; withBreakpoints: number }
  /** Curated Tailwind -> ukit map for the misconceptions LLMs bring along. */
  tailwindAliases: Record<string, string[]>
  /**
   * Valid classes that mean something different from the Tailwind equivalent.
   * These produce CSS silently, so they are more dangerous than invalid names.
   */
  semanticTraps: Record<string, string>
  families: ManifestFamily[]
}

function toManifestStem(stem: GrammarStem): ManifestStem {
  const out: ManifestStem = { stem: stem.stem, values: [...stem.values] }
  if (stem.targets) out.targets = stem.targets
  return out
}

function toManifestFamily(family: GrammarFamily): ManifestFamily {
  const out: ManifestFamily = {
    id: family.id,
    title: family.title,
    summary: family.summary,
    cssProperties: [...family.cssProperties],
    examples: [...family.examples],
    matchers: [...family.matchers],
    bare: [...(family.bare ?? [])],
    stems: (family.stems ?? []).map(toManifestStem),
    extra: [...(family.extra ?? [])],
  }
  if (family.docs) out.docs = family.docs
  return out
}

/**
 * Build the full manifest. Deterministic: same grammar in, byte-identical JSON
 * out, so `npm run generate:check` can diff it in CI.
 */
export function buildManifest(): UkitManifest {
  const catalog = getCatalog()
  const { mobile, tablet, desktop } = DEFAULT_BREAKPOINTS
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    version: VERSION,
    package: "@vcalderondev/ukit-css",
    description:
      "JIT utility-first CSS engine. Class names are generated on demand, but the vocabulary is finite and fully enumerated here.",
    naming: {
      pattern: "<stem>-<value>[-m|-t]",
      decimals: "Dots become dashes: 1.5rem -> 1-5-rem",
      px: "The px unit attaches directly: p-16px",
      units: "rem / em / vh / vw use a dash: p-1-5-rem, gap-10vh",
      bareNumbers:
        "A bare number is a legacy alias resolved as em, then px, then rem: p-1 is 1em, p-16 is 16px, p-2-5 is 2.5rem",
      important: "Every utility except animate-* is emitted with !important",
      notTailwind:
        "These are NOT Tailwind names. p-4 is valid but means 4px (not 1rem). text-sm does not exist.",
      noColors:
        "There are no colour utilities and no colour scale. Theme through CSS variables (e.g. --border) or your own classes.",
      breakpoints: "Append -m (mobile) or -t (tablet) to any base utility.",
    },
    breakpoints: {
      values: { mobile, tablet, desktop },
      suffixes: [
        { suffix: "-m", id: "mobile", description: `max-width: ${mobile}px` },
        {
          suffix: "-t",
          id: "tablet",
          description: `min-width: ${mobile + 1}px and max-width: ${tablet}px`,
        },
      ],
      universal: true,
      exceptions: shadowedSuffixes(),
    },
    counts: {
      families: catalog.counts.families,
      base: catalog.counts.base,
      withBreakpoints: catalog.counts.withBreakpoints,
    },
    tailwindAliases: Object.fromEntries(
      Object.entries(TAILWIND_ALIASES).map(([k, v]) => [k, [...v]]),
    ),
    semanticTraps: { ...SEMANTIC_TRAPS },
    families: FAMILIES.map(toManifestFamily),
  }
}

/** Serialised manifest, ready to write to `ukit.manifest.json`. */
export function manifestJson(pretty = true): string {
  return `${JSON.stringify(buildManifest(), null, pretty ? 2 : 0)}\n`
}

/**
 * Every valid class name, sorted.
 * @param includeBreakpoints include the `-m` / `-t` variants (default: true)
 */
export function listClasses(includeBreakpoints = true): string[] {
  const catalog = getCatalog()
  return [...(includeBreakpoints ? catalog.allClasses : catalog.baseClasses)]
}

/** Newline-separated class list, ready to write to `ukit.classes.txt`. */
export function classesText(includeBreakpoints = true): string {
  return `${listClasses(includeBreakpoints).join("\n")}\n`
}

export { explainClass, suggestClasses, buildManifest as manifest }
export type { ClassExplanation, Diagnostic }

/** Validate a set of candidate class names, returning diagnostics with fixes. */
export function validateClasses(candidates: Iterable<string>): {
  valid: string[]
  unknown: string[]
  diagnostics: Diagnostic[]
} {
  return diagnose(candidates)
}

export type { GrammarFamily, GrammarStem }
