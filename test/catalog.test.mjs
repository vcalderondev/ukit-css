// =============================================================================
// CATALOG / GRAMMAR TESTS
// -----------------------------------------------------------------------------
// The anti-drift suite. If any of these fail, the generated manifest, the
// TypeScript types and the documentation are lying about what the engine does.
// =============================================================================

import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"

import { auditCatalog, createCatalog, explainClass, looksLikeUtility, suggestClasses } from "../src/core/catalog.ts"
import { SEMANTIC_TRAPS, TAILWIND_ALIASES } from "../src/core/catalog.ts"
import { matchCandidate } from "../src/core/matchers/index.ts"
import { FAMILIES } from "../src/core/grammar.ts"
import {
  buildManifest,
  classesText,
  listClasses,
  MANIFEST_SCHEMA_VERSION,
  validateClasses,
} from "../src/manifest.ts"
import { VERSION } from "../src/core/version.ts"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")

// -----------------------------------------------------------------------------
// Anti-drift
// -----------------------------------------------------------------------------

describe("grammar <-> matchers anti-drift", () => {
  const audit = auditCatalog()

  it("enumerates only classes the matcher accepts (forward)", () => {
    assert.deepEqual(audit.forwardMismatches, [])
  })

  it("declares every class the matcher accepts over the fuzz corpus (backward)", () => {
    assert.deepEqual(audit.backwardUndeclared, [])
  })

  it("claims every matcher in the chain with a family", () => {
    assert.deepEqual(
      audit.unclaimedMatchers,
      [],
      "add a family in src/core/grammar.ts for these matchers",
    )
  })

  it("does not claim matchers that do not exist", () => {
    assert.deepEqual(audit.unknownMatchers, [])
  })

  it("has no class declared by two families", () => {
    assert.deepEqual(audit.duplicates, [])
  })

  it("keeps the enumeration non-trivial", () => {
    const catalog = createCatalog()
    assert.ok(catalog.counts.families >= 30, `expected many families, got ${catalog.counts.families}`)
    assert.ok(catalog.counts.base > 3000, `expected >3000 base classes, got ${catalog.counts.base}`)
    assert.equal(
      catalog.counts.withBreakpoints,
      catalog.counts.base * 3 - audit.shadowed.length,
      "every base class should have two breakpoint variants, minus documented shadowed suffixes",
    )
  })

  it("documents the only suffix collision in the vocabulary", () => {
    assert.deepEqual(
      audit.shadowed.map((s) => ({ base: s.base, suffix: s.suffix, shadowedBy: s.shadowedBy })),
      [{ base: "border", suffix: "-t", shadowedBy: "border-t" }],
      "a new collision must be reviewed and documented, not silently accepted",
    )
  })
})

// -----------------------------------------------------------------------------
// Version + manifest integrity
// -----------------------------------------------------------------------------

describe("manifest", () => {
  it("keeps VERSION in sync with package.json", () => {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
    assert.equal(VERSION, pkg.version)
  })

  it("is deterministic", () => {
    assert.deepEqual(buildManifest(), buildManifest())
  })

  it("advertises the schema version and real counts", () => {
    const manifest = buildManifest()
    assert.equal(manifest.schemaVersion, MANIFEST_SCHEMA_VERSION)
    const catalog = createCatalog()
    assert.deepEqual(manifest.counts, catalog.counts)
    assert.equal(manifest.families.length, FAMILIES.length)
  })

  it("matches the committed ukit.manifest.json", () => {
    const file = path.join(root, "ukit.manifest.json")
    assert.ok(existsSync(file), "ukit.manifest.json is missing — run `npm run generate`")
    assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), buildManifest())
  })

  it("matches the committed ukit.classes.txt", () => {
    const file = path.join(root, "ukit.classes.txt")
    assert.ok(existsSync(file), "ukit.classes.txt is missing — run `npm run generate`")
    assert.equal(readFileSync(file, "utf8"), classesText(true))
  })

  it("lists every valid class exactly once", () => {
    const all = listClasses(true)
    assert.equal(new Set(all).size, all.length, "duplicate class names in the catalog")
    for (const name of all) {
      assert.ok(matchCandidate(name), `${name} is listed but does not match`)
    }
    assert.equal(listClasses(false).length, createCatalog().counts.base)
  })
})

// -----------------------------------------------------------------------------
// explainClass
// -----------------------------------------------------------------------------

describe("explainClass", () => {
  it("explains a base utility with its declarations", () => {
    const info = explainClass("m-1-rem")
    assert.equal(info.valid, true)
    assert.equal(info.breakpoint, "base")
    assert.equal(info.familyId, "spacing")
    assert.equal(info.declarations.margin, "1rem")
    assert.equal(info.declarationsText, "margin: 1rem !important;")
    assert.equal(info.css, ".m-1-rem {\n  margin: 1rem !important;\n}")
  })

  it("resolves the breakpoint, selector and media query of a variant", () => {
    const info = explainClass("d-none-m")
    assert.equal(info.valid, true)
    assert.equal(info.breakpoint, "mobile")
    assert.equal(info.base, "d-none")
    assert.equal(info.mediaQuery, "@media (max-width: 576px)")
  })

  it("uses the project's breakpoints when they are supplied", () => {
    assert.equal(
      explainClass("d-none-m", { mobile: 480, tablet: 900 }).mediaQuery,
      "@media (max-width: 480px)",
    )
    assert.equal(
      explainClass("d-none-t", { mobile: 480, tablet: 900 }).mediaQuery,
      "@media (min-width: 481px) and (max-width: 900px)",
    )
  })

  it("keeps classes that legitimately end in -t as base rules", () => {
    const info = explainClass("border-t")
    assert.equal(info.breakpoint, "base")
    assert.equal(info.base, "border-t", "border-t is border-top, not the tablet variant of border")
    assert.equal(info.declarations["border-top"], "1px solid var(--border)")
  })

  it("still finds the base of a real breakpoint variant", () => {
    assert.equal(explainClass("border-t-m").base, "border-t")
    assert.equal(explainClass("m-1-rem-t").base, "m-1-rem")
  })

  it("reports invalid names without throwing", () => {
    const info = explainClass("p-4rem")
    assert.equal(info.valid, false)
    assert.equal(info.css, undefined)
  })

  it("marks animations as not important", () => {
    const info = explainClass("animate-fade-in")
    assert.equal(info.important, false)
    assert.equal(info.declarationsText, "animation: fadeIn 0.3s ease-in-out;")
  })
})

// -----------------------------------------------------------------------------
// Suggestions + diagnostics
// -----------------------------------------------------------------------------

describe("stem documentation", () => {
  it("documents what each stem targets, so the reference table is useful", () => {
    // Every stem in the two biggest families must name the CSS it writes,
    // otherwise docs/classes.md renders an empty Targets column.
    const spacing = FAMILIES.find((f) => f.id === "spacing")
    const missing = spacing.stems.filter((s) => !s.targets).map((s) => s.stem)
    assert.deepEqual(missing, [])
    assert.equal(spacing.stems.find((s) => s.stem === "mx").targets, "margin-left + margin-right")
    assert.equal(spacing.stems.find((s) => s.stem === "pt").targets, "padding-top")
    assert.ok(FAMILIES.find((f) => f.id === "text").stems[0].targets)
  })

  it("documents every stem across every family", () => {
    const undocumented = []
    for (const family of FAMILIES) {
      for (const s of family.stems ?? []) {
        if (!s.targets) undocumented.push(`${family.id}:${s.stem}`)
      }
    }
    assert.deepEqual(undocumented, [], "add a `targets` argument to every stem() call")
  })
})

describe("public API robustness", () => {
  // A JS caller, or a value that crossed a type boundary, must never crash the
  // build. The extension and bundler plugins hit these paths with raw input.
  const junk = [null, undefined, 123, {}, [], true, Symbol("s")]

  it("matchCandidate returns null instead of throwing", () => {
    for (const value of junk) assert.equal(matchCandidate(value), null)
  })

  it("explainClass returns an invalid explanation instead of throwing", () => {
    for (const value of junk) {
      const info = explainClass(value)
      assert.equal(info.valid, false)
      assert.equal(info.css, undefined)
    }
  })

  it("suggestClasses returns an empty list instead of throwing", () => {
    for (const value of junk) assert.deepEqual(suggestClasses(value), [])
    assert.deepEqual(suggestClasses(""), [])
  })

  it("looksLikeUtility returns false instead of throwing", () => {
    for (const value of junk) assert.equal(looksLikeUtility(value), false)
  })

  it("validateClasses skips non-string candidates", () => {
    const result = validateClasses(["m-1-rem", null, undefined, 42, "d-flx"])
    assert.deepEqual(result.valid, ["m-1-rem"])
    assert.deepEqual(result.unknown, ["d-flx"])
    assert.deepEqual(result.diagnostics.map((d) => d.token), ["d-flx"])
  })
})

describe("curated misconception data", () => {
  it("only maps names that are actually invalid", () => {
    for (const key of Object.keys(TAILWIND_ALIASES)) {
      assert.equal(
        matchCandidate(key),
        null,
        `"${key}" is already a valid class, so an alias for it can never fire`,
      )
    }
  })

  it("only points at classes that exist", () => {
    for (const [key, targets] of Object.entries(TAILWIND_ALIASES)) {
      assert.ok(targets.length > 0, `"${key}" has no alias target`)
      for (const target of targets) {
        assert.ok(
          matchCandidate(target),
          `alias "${key}" -> "${target}" points at a class the engine rejects`,
        )
      }
    }
  })

  it("makes every semantic trap a real class", () => {
    const traps = Object.keys(SEMANTIC_TRAPS)
    assert.ok(traps.length >= 5, "expected the documented traps to be non-trivial")
    for (const key of traps) {
      assert.ok(matchCandidate(key), `semantic trap "${key}" is not a valid class`)
    }
  })

  it("ships both maps in the manifest", () => {
    const manifest = buildManifest()
    assert.deepEqual(manifest.tailwindAliases["text-sm"], ["fs-0-875-rem"])
    assert.match(manifest.semanticTraps["p-4"], /4px/)
  })
})

describe("suggestClasses", () => {
  it("returns nothing for a valid class", () => {
    assert.deepEqual(suggestClasses("m-1-rem"), [])
  })

  it("maps Tailwind misconceptions to real classes", () => {
    assert.deepEqual(suggestClasses("text-sm"), ["fs-0-875-rem"])
    assert.deepEqual(suggestClasses("items-center"), ["align-items-center"])
    assert.deepEqual(suggestClasses("flex-col"), ["flex-direction-column"])
    assert.deepEqual(suggestClasses("w-full"), ["w-100"])
  })

  it("suggests a near miss within the same stem", () => {
    const out = suggestClasses("d-flx")
    assert.ok(out.includes("d-flex"), `expected d-flex in ${JSON.stringify(out)}`)
  })

  it("stays silent when nothing is close", () => {
    assert.deepEqual(suggestClasses("p-button__icon"), [])
    assert.deepEqual(suggestClasses("someRandomIdentifier"), [])
  })
})

describe("looksLikeUtility", () => {
  it("accepts a plausible misspelling of a real utility", () => {
    assert.equal(looksLikeUtility("d-flx"), true)
  })

  it("rejects BEM names, paths and unknown stems", () => {
    assert.equal(looksLikeUtility("p-button__icon"), false)
    assert.equal(looksLikeUtility("src/components/Button"), false)
    assert.equal(looksLikeUtility("data-testid"), false)
    assert.equal(looksLikeUtility("someRandomIdentifier"), false)
    assert.equal(looksLikeUtility("UPPER-CASE"), false)
  })
})

describe("validateClasses", () => {
  it("splits valid, unknown and actionable tokens", () => {
    const result = validateClasses(["m-1-rem", "text-sm", "d-flx", "p-button__icon", "border"])
    assert.deepEqual(result.valid, ["border", "m-1-rem"])
    assert.deepEqual(result.unknown, ["d-flx", "p-button__icon", "text-sm"])
    assert.deepEqual(
      result.diagnostics.map((d) => d.token),
      ["d-flx", "text-sm"],
    )
  })
})
