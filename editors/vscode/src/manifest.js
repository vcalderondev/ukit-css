"use strict"

/**
 * Loads the vendored ukit engine and builds the grammar index every editor
 * feature runs on.
 *
 * This module is pure (no `vscode` import) so it can be exercised with plain
 * Node — see test/selftest.mjs.
 *
 * Two rules it exists to enforce:
 *
 *   1. The engine is the only source of truth. Class validity, CSS output and
 *      "did you mean" suggestions all come from the vendored bundle. This
 *      module never re-implements matching, it only *indexes* what the engine
 *      reports so completion requests are cheap.
 *   2. The index is built once, lazily, on first use. `listClasses()` (12k
 *      strings) is never called at runtime, and no per-keystroke work touches
 *      the manifest.
 *
 * Indexed grammar: stems -> values (merged across families, because e.g. `w`
 * is declared by three sizing families), bare classes, breakpoints, the
 * breakpoint exceptions and the Tailwind alias table.
 */

const VENDOR_BUNDLE = "../vendor/manifest.cjs"
const FALLBACK_MANIFEST = "../manifest.json"

// ---------------------------------------------------------------------------
// Engine loading
// ---------------------------------------------------------------------------

let engineLoaded = false
let engineValue = null
let engineLoadError = null

let indexValue = null
let indexError = null

/** Require the vendored bundle at most once; never throw. */
function loadEngine() {
  if (engineLoaded) return engineValue
  engineLoaded = true
  try {
    engineValue = require(VENDOR_BUNDLE)
  } catch (err) {
    engineValue = null
    engineLoadError = toError(err)
  }
  return engineValue
}

function toError(err) {
  return err instanceof Error ? err : new Error(String(err))
}

/** @returns {object|null} the vendored engine, or null when it is missing. */
function getEngine() {
  return loadEngine()
}

/** @returns {Error|null} why the engine could not be loaded. */
function getEngineError() {
  loadEngine()
  return engineLoadError
}

/** @returns {Error|null} why the index could not be built. */
function getIndexError() {
  return indexError
}

/**
 * @returns {object|null} the lazily built grammar index, or null when the
 * vendored engine is missing/broken. Callers must treat null as "feature off".
 */
function getIndex() {
  if (indexValue) return indexValue
  const engine = loadEngine()
  if (!engine) return null
  try {
    indexValue = buildIndex(engine)
    indexError = null
  } catch (err) {
    indexValue = null
    indexError = toError(err)
  }
  return indexValue
}

/**
 * Robustness/test hook. Pass `null` to simulate a missing vendored bundle and
 * check that every feature degrades to "no suggestions" instead of throwing.
 */
function __setEngine(engine) {
  engineLoaded = true
  engineValue = engine || null
  engineLoadError = engine ? null : new Error("engine disabled (__setEngine(null))")
  indexValue = null
  indexError = null
}

// ---------------------------------------------------------------------------
// Guarded engine calls
//
// `explainClass`/`suggestClasses` throw on non-string input (verified against
// the vendored bundle: null, undefined, numbers, objects, arrays all throw
// "name.startsWith is not a function"). Tokens reaching these helpers come
// from user documents, so every call is type-guarded *and* wrapped.
// ---------------------------------------------------------------------------

/** @returns {object|null} explainClass(name), or null if unsupported/invalid input. */
function explainGuarded(engine, name) {
  if (typeof name !== "string") return null
  try {
    const info = engine.explainClass(name)
    return info && typeof info === "object" ? info : null
  } catch {
    return null
  }
}

/** @returns {string[]} suggestClasses(name, limit), or [] on any problem. */
function suggestGuarded(engine, name, limit) {
  if (typeof name !== "string" || name === "") return []
  try {
    const out = engine.suggestClasses(name, limit)
    if (!Array.isArray(out)) return []
    return out.filter((item) => typeof item === "string")
  } catch {
    return []
  }
}

/** Markdown fenced CSS block for a class, or "" when the engine is unsure. */
function cssFence(engine, name) {
  const info = explainGuarded(engine, name)
  if (!info || !info.valid || typeof info.css !== "string") return ""
  return "```css\n" + info.css + "\n```"
}

// ---------------------------------------------------------------------------
// Index building
// ---------------------------------------------------------------------------

/**
 * Read the manifest. Prefer the engine's own `buildManifest()` (it is verified
 * byte-identical to ukit.manifest.json) and fall back to the generated copy
 * that ships next to the extension.
 */
function readManifest(engine) {
  if (engine && typeof engine.buildManifest === "function") {
    const manifest = engine.buildManifest()
    if (manifest && Array.isArray(manifest.families)) return manifest
  }
  if (engine && engine.manifest && typeof engine.manifest === "object") {
    return engine.manifest
  }
  return require(FALLBACK_MANIFEST)
}

function normalizeBreakpoints(raw) {
  const source = raw && typeof raw === "object" ? raw : {}
  const suffixes = Array.isArray(source.suffixes) ? source.suffixes : []
  const exceptions = Array.isArray(source.exceptions) ? source.exceptions : []
  return {
    values: source.values && typeof source.values === "object" ? source.values : {},
    suffixes: suffixes.filter((s) => s && typeof s.suffix === "string"),
    universal: Boolean(source.universal),
    exceptions: exceptions.filter(
      (e) => e && typeof e.base === "string" && typeof e.suffix === "string",
    ),
  }
}

function normalizeAliases(raw) {
  const aliases = new Map()
  if (!raw || typeof raw !== "object") return aliases
  for (const [from, to] of Object.entries(raw)) {
    if (Array.isArray(to))
      aliases.set(
        from,
        to.filter((item) => typeof item === "string"),
      )
  }
  return aliases
}

/**
 * Build the index from an engine. Exported (and engine-injectable) so the
 * self-test can build it from a stub.
 *
 * @param {object} engine vendored engine bundle
 * @returns {object} index
 */
function buildIndex(engine) {
  const manifest = readManifest(engine)
  if (!manifest || !Array.isArray(manifest.families)) {
    throw new Error("ukit manifest is missing a `families` array")
  }

  const breakpoints = normalizeBreakpoints(manifest.breakpoints)
  const aliases = normalizeAliases(manifest.tailwindAliases)

  /** @type {Array<object>} bare classes (take no value): `border`, `clearfix`, ... */
  const bare = []
  /** @type {Map<string, object>} stem name -> merged stem info */
  const stemsByName = new Map()
  const families = []

  for (const family of manifest.families) {
    if (!family || typeof family.id !== "string") continue
    const title = typeof family.title === "string" && family.title ? family.title : family.id
    const cssProperties = Array.isArray(family.cssProperties) ? family.cssProperties.slice() : []
    const examples = Array.isArray(family.examples) ? family.examples.slice() : []

    families.push({ id: family.id, title, summary: family.summary || "", cssProperties, examples })

    for (const name of Array.isArray(family.bare) ? family.bare : []) {
      if (typeof name !== "string") continue
      bare.push({
        name,
        familyId: family.id,
        familyTitle: title,
        cssProperties,
        example: name,
      })
    }

    for (const entry of Array.isArray(family.stems) ? family.stems : []) {
      if (!entry || typeof entry.stem !== "string" || !entry.stem) continue
      let stem = stemsByName.get(entry.stem)
      if (!stem) {
        stem = {
          stem: entry.stem,
          values: [],
          valueSet: new Set(),
          families: [],
          cssProperties: [],
          // Precise per-stem target (e.g. `mt` -> "margin-top"), which beats the
          // family-wide property list when choosing between sibling stems.
          targets: "",
          examples: [],
        }
        stemsByName.set(entry.stem, stem)
      }
      if (!stem.targets && typeof entry.targets === "string") stem.targets = entry.targets
      if (!stem.families.some((f) => f.id === family.id)) {
        stem.families.push({ id: family.id, title })
      }
      for (const prop of cssProperties)
        if (!stem.cssProperties.includes(prop)) stem.cssProperties.push(prop)
      for (const value of Array.isArray(entry.values) ? entry.values : []) {
        if (typeof value !== "string" || !value) continue
        if (stem.valueSet.has(value)) continue // e.g. `w`/`h` declared by 3 families
        stem.valueSet.add(value)
        stem.values.push(value)
      }
      for (const example of examples) stem.examples.push(example)
    }
  }

  // Finish stems now that every family has contributed its values.
  const stems = []
  for (const stem of stemsByName.values()) {
    const titles = stem.families.map((f) => f.title)
    const example =
      stem.examples.find((ex) => typeof ex === "string" && ex.startsWith(stem.stem + "-")) ||
      (stem.values.length ? stem.stem + "-" + stem.values[0] : stem.stem)
    stem.detail = titles.join(" / ") || stem.stem
    stem.example = example
    stem.documentation = [
      `**\`${stem.stem}-\`** — ${stem.detail}`,
      stem.targets ? `Targets: \`${stem.targets}\`` : "",
      `Example \`${example}\``,
      cssFence(engine, example),
      `${stem.values.length} value${stem.values.length === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join("\n\n")
    delete stem.valueSet
    delete stem.examples
    stems.push(stem)
  }
  stems.sort((a, b) => a.stem.localeCompare(b.stem))

  for (const item of bare) {
    item.detail = item.familyTitle
    item.documentation = [
      `**\`${item.name}\`** — ${item.familyTitle}`,
      cssFence(engine, item.name),
      item.cssProperties.length
        ? `Properties: ${item.cssProperties.map((p) => "`" + p + "`").join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n")
  }
  bare.sort((a, b) => a.name.localeCompare(b.name))

  const counts = manifest.counts && typeof manifest.counts === "object" ? manifest.counts : {}

  const index = {
    schemaVersion: manifest.schemaVersion,
    version: manifest.version,
    packageName: manifest.package,
    description: manifest.description,
    naming: manifest.naming || {},
    counts,
    breakpoints,
    families,
    stems,
    stemsByName,
    bare,
    aliases,

    /** True only for strings the engine accepts as base classes. */
    isValid(name) {
      const info = explainGuarded(engine, name)
      return Boolean(info && info.valid)
    },

    /** explainClass(name) with input guard + try/catch. */
    explain(name) {
      return explainGuarded(engine, name)
    },

    /** suggestClasses(name, limit) with input guard + try/catch. */
    suggest(name, limit) {
      return suggestGuarded(engine, name, limit)
    },

    /**
     * Breakpoint variants that may be appended to `name`.
     *
     * Only offered when `name` is a valid *base* class, and never when the
     * manifest marks the suffix as shadowed — the single documented exception
     * is `.border` + `-t`, because `.border-t` already means border-top and the
     * engine resolves the raw name first.
     */
    variantsFor(name) {
      if (typeof name !== "string" || !name) return []
      const info = explainGuarded(engine, name)
      if (!info || !info.valid || info.breakpoint !== "base") return []
      const out = []
      for (const suffixInfo of breakpoints.suffixes) {
        const shadowed = breakpoints.exceptions.some(
          (exception) => exception.base === name && exception.suffix === suffixInfo.suffix,
        )
        if (shadowed) continue
        const candidate = name + suffixInfo.suffix
        const variant = explainGuarded(engine, candidate)
        if (variant && variant.valid) {
          out.push({
            name: candidate,
            suffix: suffixInfo.suffix,
            suffixId: suffixInfo.id,
            mediaQuery: variant.mediaQuery || suffixInfo.description || "",
          })
        }
      }
      return out
    },
  }

  return index
}

module.exports = {
  getEngine,
  getEngineError,
  getIndex,
  getIndexError,
  buildIndex,
  __setEngine,
  // exposed for tests and for callers that want the guarded variants directly
  explainGuarded,
  suggestGuarded,
}
