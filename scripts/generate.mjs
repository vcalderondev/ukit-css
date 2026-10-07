#!/usr/bin/env node
// =============================================================================
// ARTIFACT GENERATOR
// -----------------------------------------------------------------------------
// Single command that regenerates every derived artifact from the declarative
// grammar, so nothing can drift:
//
//   ukit.manifest.json          machine-readable grammar (AI + editor tooling)
//   ukit.classes.txt            flat list of every valid class
//   src/generated/classes.ts    UkitClass types + cn() helper
//   docs/classes.md             full class reference for humans
//   llms.txt                    compact context file for LLMs
//   AGENTS.md                   generated family table, inside markers
//   editors/vscode/manifest.json bundled copy for the VS Code extension
//
// Usage:
//   node scripts/generate.mjs           # write
//   node scripts/generate.mjs --check   # fail if anything is out of date (CI)
//
// It imports the TypeScript sources directly through a resolve hook, so it
// needs no build step and no compiled output.
// =============================================================================

import { register } from "node:module"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

register("./ts-resolve.mjs", import.meta.url)

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")
const check = process.argv.includes("--check")

const { buildManifest, classesText, listClasses } = await import("../src/manifest.ts")
const { FAMILIES, enumerateFamily } = await import("../src/core/grammar.ts")

const manifest = buildManifest()

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const pascal = (s) =>
  s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

/** Escape a value for a TS string literal. */
const tsString = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`

/**
 * Render a union of string literals.
 * @returns an inline `"a" | "b"`, or a block starting with a newline:
 *          `\n  | "a"\n  | "b"` — ready to append straight after `=`.
 */
function tsUnion(literals, indent = "  ") {
  const parts = [...literals]
  if (parts.length === 0) return "never"
  if (parts.length === 1) return parts[0]
  const single = parts.join(" | ")
  if (single.length <= 84) return single
  return parts.map((part) => `\n${indent}| ${part}`).join("")
}

/** Compose a complete `export type` declaration, inline when it fits. */
function typeDecl(name, union, doc) {
  const lines = []
  if (doc) lines.push(doc)
  const inline = `export type ${name} = ${union}`
  if (!union.includes("\n") && inline.length <= 100) {
    lines.push(inline)
    return lines.join("\n")
  }
  const body = union.startsWith("\n")
    ? union
    : union
        .split(" | ")
        .map((part) => `\n  | ${part}`)
        .join("")
  lines.push(`export type ${name} =${body}`)
  return lines.join("\n")
}

/** Collapse a value list for human-facing docs. */
function previewValues(values, max = 24) {
  if (values.length <= max) return values.map((v) => `\`${v}\``).join(", ")
  return `${values
    .slice(0, max)
    .map((v) => `\`${v}\``)
    .join(", ")}, … (+${values.length - max} more)`
}

// -----------------------------------------------------------------------------
// src/generated/classes.ts
// -----------------------------------------------------------------------------

function generateTypes() {
  const header = [
    "// =============================================================================",
    "// AUTO-GENERATED FILE — DO NOT EDIT",
    "// -----------------------------------------------------------------------------",
    "// Regenerate with `npm run generate`.",
    "// Source of truth: src/core/grammar.ts (validated against the real matchers by",
    "// test/catalog.test.mjs, in both directions).",
    "//",
    `// Base utilities: ${manifest.counts.base} · including -m/-t: ${manifest.counts.withBreakpoints}`,
    "// =============================================================================",
    "",
  ].join("\n")

  const body = []
  const familyStemTypes = []
  const valueTypeByKey = new Map()

  for (const family of FAMILIES) {
    const famPascal = pascal(family.id)
    const stemTypeNames = []
    const bare = [...(family.bare ?? [])]
    const extra = [...(family.extra ?? [])]
    let valuesDeclared = 0

    for (const stem of family.stems ?? []) {
      // Share one value union between every stem that accepts the same values.
      const key = JSON.stringify(stem.values)
      let valueType = valueTypeByKey.get(key)
      if (!valueType) {
        valueType =
          valuesDeclared === 0
            ? `Ukit${famPascal}Values`
            : `Ukit${famPascal}${pascal(stem.stem)}Values`
        valuesDeclared++
        valueTypeByKey.set(key, valueType)
        body.push(
          typeDecl(
            valueType,
            tsUnion(stem.values.map(tsString)),
            `/** Values accepted after \`${stem.stem}-\`. */`,
          ),
        )
        body.push("")
      }
      const stemType = `Ukit${famPascal}${pascal(stem.stem)}`
      const targets = stem.targets ? ` — ${stem.targets}` : ""
      body.push(`/** \`${stem.stem}-*\`${targets} */`)
      body.push(`export type ${stemType} = \`${stem.stem}-\${${valueType}}\``)
      body.push("")
      stemTypeNames.push(stemType)
    }

    let bareType = null
    if (bare.length > 0 || extra.length > 0) {
      bareType = `Ukit${famPascal}Bare`
      body.push(
        typeDecl(
          bareType,
          tsUnion([...bare, ...extra].map(tsString)),
          `/** \`${family.id}\` classes that take no value. */`,
        ),
      )
      body.push("")
    }

    const parts = [...stemTypeNames, ...(bareType ? [bareType] : [])]
    body.push(
      typeDecl(
        `Ukit${famPascal}`,
        tsUnion(parts),
        `/** ${family.title} — ${family.summary} */`,
      ),
    )
    body.push("")
    familyStemTypes.push(`Ukit${famPascal}`)
  }

  const tail = [
    "// ---------------------------------------------------------------------------",
    "// The full vocabulary",
    "// ---------------------------------------------------------------------------",
    "",
    typeDecl("UkitClassBase", tsUnion(familyStemTypes), "/** Every base utility, without a breakpoint suffix. */"),
    "",
    "/** Breakpoint suffixes every base utility accepts. */",
    'export type UkitBreakpointSuffix = "" | "-m" | "-t"',
    "",
    "/**",
    " * Every valid class name, including the `-m` (mobile) and `-t` (tablet)",
    " * variants. Use it to type props, literal maps or test fixtures.",
    " *",
    " * Note: `.border` cannot take `-t`, because `.border-t` already means",
    " * border-top and the engine resolves the raw name first.",
    " */",
    "export type UkitClass = UkitClassBase | `${UkitClassBase}${UkitBreakpointSuffix}`",
    "",
    "/**",
    " * Strict union plus an escape hatch, so autocomplete works without rejecting",
    " * classes composed at runtime (`m-${size}-rem`).",
    " */",
    "export type UkitClassName = UkitClass | (string & {})",
    "",
    "/** Anything accepted in a class list: a class, or a falsy conditional slot. */",
    "export type UkitClassInput = UkitClassName | false | null | undefined",
    "",
    "/**",
    " * Join class names. Autocompletes the ukit vocabulary while accepting",
    " * conditionals, so it replaces `clsx`-style helpers in this codebase:",
    " *",
    " *   cn(\"d-flex\", \"align-items-center\", isOpen && \"d-none-m\")",
    " *",
    " * Runtime validation is intentionally *not* done here: see",
    " * `matchCandidate()` from the main entry (`npx ukit-css validate` for files).",
    " */",
    "export function cn(...parts: UkitClassInput[]): string {",
    '  return parts.filter(Boolean).join(" ")',
    "}",
    "",
  ].join("\n")

  return `${header}${body.join("\n")}${tail}`
}

// -----------------------------------------------------------------------------
// docs/classes.md
// -----------------------------------------------------------------------------

function generateDocs() {
  const lines = [
    "<!-- AUTO-GENERATED by scripts/generate.mjs — do not edit by hand. -->",
    "",
    "# ukit-css class reference",
    "",
    `The engine generates CSS on demand, but the **vocabulary is finite**: ${manifest.counts.base.toLocaleString("en-US")} base utilities, ${manifest.counts.withBreakpoints.toLocaleString("en-US")} including the \`-m\` and \`-t\` variants. This page is the complete reference.`,
    "",
    "## Naming rules",
    "",
    "| Rule | Detail |",
    "| --- | --- |",
    ...[
      ["Shape", "`<stem>-<value>[-m|-t]`"],
      ["Decimals", "Dots become dashes: `1.5rem` → `1-5-rem`"],
      ["px unit", "Attaches directly: `p-16px`"],
      ["rem / em / vh / vw", "Use a dash: `p-1-5-rem`, `gap-10vh`"],
      [
        "Bare numbers",
        "Legacy alias resolved as em, then px, then rem: `p-1` = 1em, `p-16` = 16px, `p-2-5` = 2.5rem",
      ],
      ["Breakpoints", "`-m` = ≤576px, `-t` = 577–992px, no suffix = all viewports"],
      ["`!important`", "Every utility except `animate-*` is emitted with `!important`"],
    ].map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "> **Not Tailwind.** `p-4` is valid here but means `4px`, not `1rem`. `text-sm` does not exist.",
    "",
    "### Valid classes that still surprise you",
    "",
    "These compile successfully, so nothing warns you — but they do not mean what the Tailwind name means.",
    "",
    "| Class | What it actually does |",
    "| --- | --- |",
    ...Object.entries(manifest.semanticTraps).map(([cls, note]) => `| \`${cls}\` | ${note} |`),
    "",
  ]

  for (const exception of manifest.breakpoints.exceptions) {
    const breakpoint = manifest.breakpoints.suffixes.find((s) => s.suffix === exception.suffix)
    lines.push(
      `> **Suffix exception:** \`.${exception.base}\` has no \`${exception.suffix}\` (${breakpoint?.id ?? "breakpoint"}) variant: \`.${exception.shadowedBy}\` is already a utility class of its own, and the engine resolves the raw name before stripping the suffix.`,
    )
    lines.push("")
  }

  lines.push("## Families", "")
  lines.push(
    "| Family | Classes | Stems | CSS properties |",
    "| --- | --- | --- | --- |",
  )
  for (const family of manifest.families) {
    const count = enumerateFamily(family).length
    lines.push(
      `| [${family.title}](#${family.id}) | ${count} | ${
        family.stems.length > 0 ? family.stems.map((s) => `\`${s.stem}\``).join(" ") : "—"
      } | ${family.cssProperties.map((p) => `\`${p}\``).join(", ")} |`,
    )
  }
  lines.push("")

  for (const family of manifest.families) {
    // Explicit anchor: the table of contents links by stable family id, while
    // the heading shows the human title. Relying on GitHub's heading slugs
    // would break every family whose id differs from its title.
    lines.push(`<a id="${family.id}"></a>`)
    lines.push("")
    lines.push(`### ${family.title}`)
    lines.push("")
    lines.push(family.summary)
    lines.push("")
    if (family.docs) {
      lines.push(family.docs)
      lines.push("")
    }
    lines.push(
      `- **Matchers:** ${family.matchers.map((m) => `\`${m}\``).join(", ")}`,
      `- **CSS properties:** ${family.cssProperties.map((p) => `\`${p}\``).join(", ")}`,
      `- **Examples:** ${family.examples.map((e) => `\`${e}\``).join(", ")}`,
    )
    if (family.bare.length > 0) {
      lines.push(`- **No value:** ${previewValues(family.bare)}`)
    }
    lines.push("")
    if (family.stems.length > 0) {
      lines.push("| Stem | Targets | Values |", "| --- | --- | --- |")
      for (const stem of family.stems) {
        lines.push(
          `| \`${stem.stem}-\` | ${stem.targets ?? "—"} | ${previewValues(stem.values)} |`,
        )
      }
      lines.push("")
    }
  }

  lines.push(
    "---",
    "",
    `Every class name listed here is also available as plain text in [ukit.classes.txt](../ukit.classes.txt) and as structured data in [ukit.manifest.json](../ukit.manifest.json).`,
    "",
  )
  return lines.join("\n")
}

// -----------------------------------------------------------------------------
// llms.txt
// -----------------------------------------------------------------------------

function generateLlmsTxt() {
  const lines = [
    "# @vcalderondev/ukit-css",
    "",
    "> JIT utility-first CSS engine. You write class names in your markup; a build step scans your files and emits only the CSS you actually use. It looks Tailwind-like but the vocabulary is different and much more explicit.",
    "",
    "## The one thing to understand first",
    "",
    "Class names are **not** Tailwind names. The JIT part only affects which CSS is *emitted*; the set of valid class names is fixed and finite, and it is fully listed below.",
    "",
    "- `p-4` is **valid** but means `padding: 4px`, not `1rem`. A bare number is a legacy alias resolved as em, then px, then rem.",
    "- `text-sm`, `font-bold`, `items-center`, `flex-col`, `w-full` do **not** exist. Use `fs-0-875-rem`, `fw-700`, `align-items-center`, `flex-direction-column`, `w-100`.",
    "- There are **no colour utilities** at all. Theme through CSS variables (e.g. `--border`) or your own classes.",
    "- A class that does not match the vocabulary is **silently ignored** (no error, no CSS). If a layout is broken, check the class names first with `npx ukit-css validate <glob>`.",
    "",
    "### Valid but surprising (these DO compile)",
    "",
    "| Class | What it actually does |",
    "| --- | --- |",
    ...Object.entries(manifest.semanticTraps).map(([cls, note]) => `| \`${cls}\` | ${note} |`),
    "",
    "## Grammar",
    "",
    "```",
    "<stem>-<value>[-m|-t]",
    "",
    "-m  mobile   max-width: 576px",
    "-t  tablet   577px .. 992px",
    "    (none)   all viewports",
    "```",
    "",
    "- Decimals become dashes: `1.5rem` -> `1-5-rem`",
    "- `px` attaches directly (`p-16px`); `rem`/`em`/`vh`/`vw` use a dash (`p-1-5-rem`)",
    "- Every utility except `animate-*` is emitted with `!important`",
    `- Vocabulary size: ${manifest.counts.base} base utilities, ${manifest.counts.withBreakpoints} with breakpoints`,
    ...manifest.breakpoints.exceptions.map((e) => {
      const bp = manifest.breakpoints.suffixes.find((s) => s.suffix === e.suffix)
      return `- Known exception: \`.${e.base}\` has no \`${e.suffix}\` (${bp?.id ?? "breakpoint"}) variant, because \`.${e.shadowedBy}\` is already a different class.`
    }),
    "",
    "## Families",
    "",
    "| Family | Stems | Examples |",
    "| --- | --- | --- |",
  ]

  for (const family of manifest.families) {
    lines.push(
      `| ${family.title} | ${
        family.stems.length > 0
          ? family.stems.map((s) => `\`${s.stem}-\``).join(" ")
          : family.bare.map((b) => `\`${b}\``).join(" ")
      } | ${family.examples.map((e) => `\`${e}\``).join(", ")} |`,
    )
  }

  lines.push(
    "",
    "## Tools you can run",
    "",
    "```bash",
    "npx ukit-css explain m-1-rem-m   # what a class compiles to, and at which breakpoint",
    "npx ukit-css validate \"src/**/*.{html,tsx}\"   # unknown-but-intended classes, with fixes",
    "npx ukit-css manifest -o ukit.manifest.json  # the full grammar as JSON",
    "npx ukit-css classes            # every valid class name, one per line",
    "```",
    "",
    "## Docs",
    "",
    "- [docs/classes.md](docs/classes.md): complete reference, every stem and value",
    "- [ukit.manifest.json](ukit.manifest.json): the same grammar as structured data",
    "- [ukit.classes.txt](ukit.classes.txt): the flat list of every valid class",
    "- [AGENTS.md](AGENTS.md): instructions for coding agents working on this repo",
    "",
  )
  return lines.join("\n")
}

// -----------------------------------------------------------------------------
// AGENTS.md generated block
// -----------------------------------------------------------------------------

const BEGIN = "<!-- BEGIN GENERATED:FAMILIES -->"
const END = "<!-- END GENERATED:FAMILIES -->"

function generateAgentsBlock() {
  const lines = [
    BEGIN,
    "",
    `<!-- generated from src/core/grammar.ts — ${manifest.counts.base} base utilities, ${manifest.counts.withBreakpoints} with breakpoints -->`,
    "",
    "| Family | Stems | Examples |",
    "| --- | --- | --- |",
  ]
  for (const family of manifest.families) {
    lines.push(
      `| ${family.title} | ${
        family.stems.length > 0
          ? family.stems.map((s) => `\`${s.stem}-\``).join(" ")
          : family.bare.map((b) => `\`${b}\``).join(" ")
      } | ${family.examples.map((e) => `\`${e}\``).join(", ")} |`,
    )
  }
  lines.push("", END)
  return lines.join("\n")
}

function injectAgentsBlock(existing) {
  const block = generateAgentsBlock()
  const start = existing.indexOf(BEGIN)
  const end = existing.indexOf(END)
  if (start === -1 || end === -1) {
    throw new Error(`AGENTS.md must contain ${BEGIN} and ${END} markers`)
  }
  return existing.slice(0, start) + block + existing.slice(end + END.length)
}

// -----------------------------------------------------------------------------
// Write / check
// -----------------------------------------------------------------------------

const artifacts = new Map()

artifacts.set("ukit.manifest.json", `${JSON.stringify(manifest, null, 2)}\n`)
artifacts.set("ukit.classes.txt", classesText(true))
artifacts.set("src/generated/classes.ts", generateTypes())
artifacts.set("docs/classes.md", generateDocs())
artifacts.set("llms.txt", generateLlmsTxt())
artifacts.set("editors/vscode/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`)

const agentsPath = path.join(root, "AGENTS.md")
if (existsSync(agentsPath)) {
  artifacts.set("AGENTS.md", injectAgentsBlock(await readFile(agentsPath, "utf8")))
}

let stale = 0
for (const [rel, content] of artifacts) {
  const abs = path.join(root, rel)
  const current = existsSync(abs) ? await readFile(abs, "utf8") : null
  if (current === content) continue
  if (check) {
    stale++
    console.error(`✗ ${rel} is out of date`)
    continue
  }
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, content, "utf8")
  console.error(`${current === null ? "+" : "~"} ${rel}`)
}

if (check) {
  if (stale > 0) {
    console.error(`\n${stale} artifact(s) out of date — run \`npm run generate\`.`)
    process.exit(1)
  }
  console.error("✓ all generated artifacts are up to date")
} else {
  const classes = listClasses(true)
  console.error(
    `✓ ${manifest.counts.families} families / ${manifest.counts.base} base classes / ${classes.length} total`,
  )
}
