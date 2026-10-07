// =============================================================================
// CLI
// -----------------------------------------------------------------------------
//   ukit-css build    [-c config] [--content glob]... [-o file] [-m]
//   ukit-css watch    [-c config] [--content glob]... [-o file] [-m]
//   ukit-css manifest [-o file] [--flat]
//   ukit-css classes  [-o file] [--no-breakpoints]
//   ukit-css explain  <class>...
//   ukit-css validate [-c config] [glob]... [--json] [--max-warnings n]
//   ukit-css help | --version
//
// Designed to be invoked through the `bin/ukit-css.mjs` shim.
// =============================================================================

import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import kleur from "kleur"
import { findConfigFile, loadConfigFile, resolveConfig } from "./core/config.js"
import { Engine, build } from "./core/engine.js"
import { classesText, explainClass, manifestJson, suggestClasses } from "./manifest.js"
import type { UkitConfig } from "./core/types.js"

type Command = "build" | "watch" | "manifest" | "classes" | "explain" | "validate" | "help" | "version"

const COMMANDS: readonly Command[] = [
  "build",
  "watch",
  "manifest",
  "classes",
  "explain",
  "validate",
  "help",
  "version",
]

interface Argv {
  command: Command
  config?: string
  content: string[]
  output?: string
  minify?: boolean
  /** Positional arguments (class names for `explain`, globs for `validate`). */
  positional: string[]
  json: boolean
  flat: boolean
  noBreakpoints: boolean
  maxWarnings: number
}

function parseArgv(argv: readonly string[]): Argv {
  const out: Argv = {
    command: "help",
    content: [],
    positional: [],
    json: false,
    flat: false,
    noBreakpoints: false,
    maxWarnings: 0,
  }
  if (argv.length === 0) return out

  const [cmd, ...rest] = argv
  if (cmd === "--version" || cmd === "-v") return { ...out, command: "version" }
  if (cmd === "--help" || cmd === "-h" || cmd === "help") return out
  if (!COMMANDS.includes(cmd as Command)) {
    console.error(kleur.red(`Unknown command: ${cmd}`))
    return out
  }
  out.command = cmd as Command

  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]!
    const next = rest[i + 1]
    if (a === "--config" || a === "-c") {
      out.config = next
      i++
    } else if (a === "--content") {
      if (next) out.content.push(next)
      i++
    } else if (a === "--output" || a === "-o") {
      out.output = next
      i++
    } else if (a === "--minify" || a === "-m") {
      out.minify = true
    } else if (a === "--json") {
      out.json = true
    } else if (a === "--flat") {
      out.flat = true
    } else if (a === "--no-breakpoints") {
      out.noBreakpoints = true
    } else if (a === "--max-warnings") {
      out.maxWarnings = Number(next ?? 0) || 0
      i++
    } else if (a === "--help" || a === "-h") {
      out.command = "help"
      return out
    } else if (a.startsWith("-")) {
      console.error(kleur.red(`Unknown flag: ${a}`))
    } else {
      out.positional.push(a)
    }
  }
  return out
}

function printHelp(): void {
  console.log(`${kleur.bold("ukit-css")} — JIT utility-first CSS engine

${kleur.bold("Usage")}
  ukit-css build [options]              Compile the CSS once.
  ukit-css watch [options]              Recompile on change.
  ukit-css manifest [options]           Print the class grammar as JSON.
  ukit-css classes [options]            Print every valid class name.
  ukit-css explain <class>...           Show what a class compiles to.
  ukit-css validate [glob]...           Report unknown-but-intended classes.

${kleur.bold("Options")}
  -c, --config <path>     Path to ukit.config.{js,mjs,cjs,json}
      --content <glob>    Source glob to scan (repeatable). Overrides config.
  -o, --output <file>     Output path (CSS, manifest or class list).
  -m, --minify            Minify the output CSS.
      --flat              With manifest: also write ukit.classes.txt.
      --no-breakpoints    With classes: omit the -m / -t variants.
      --json              With validate: machine-readable report.
      --max-warnings <n>  With validate: exit 1 above this many findings.
  -h, --help              Show this help.
  -v, --version           Print the version.

${kleur.bold("Examples")}
  ukit-css build -o dist/app.css --minify
  ukit-css explain m-1-rem-m d-none-m
  ukit-css validate "src/**/*.{html,tsx,vue}"
  ukit-css manifest -o ukit.manifest.json --flat
  ukit-css classes --no-breakpoints > classes.txt
`)
}

async function loadUserConfig(cwd: string, explicit?: string): Promise<UkitConfig> {
  const file = findConfigFile(cwd, explicit)
  if (!file) return {}
  return loadConfigFile(file)
}

async function writeOutput(content: string, output: string | null | undefined): Promise<void> {
  if (!output) {
    process.stdout.write(content)
    return
  }
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, content, "utf8")
}

function applyCliOverrides(base: UkitConfig, argv: Argv): UkitConfig {
  const merged: UkitConfig = { ...base }
  if (argv.content.length > 0) merged.content = argv.content
  if (argv.output) merged.output = argv.output
  if (argv.minify) merged.minify = true
  return merged
}

/** Shared warning block used by `build`, `watch` and the plugins. */
export function formatDiagnostics(
  diagnostics: readonly { token: string; suggestions: string[] }[],
  limit = 8,
  showHint = true,
): string {
  const lines = diagnostics.slice(0, limit).map(
    (d) =>
      `  ${kleur.yellow("⚠")} ${kleur.bold(d.token)} ${kleur.dim("→ did you mean")} ${d.suggestions
        .map((s) => kleur.green(s))
        .join(kleur.dim(", "))}${kleur.dim("?")}`,
  )
  if (diagnostics.length > limit) {
    lines.push(kleur.dim(`  … and ${diagnostics.length - limit} more`))
  }
  if (showHint) {
    lines.push(
      kleur.dim(
        "  These classes match nothing, so no CSS is emitted for them. Run `ukit-css validate` for the full list.",
      ),
    )
  }
  return lines.join("\n")
}

// -----------------------------------------------------------------------------
// Commands
// -----------------------------------------------------------------------------

async function cmdBuild(argv: Argv): Promise<number> {
  const cwd = process.cwd()
  const userConfig = await loadUserConfig(cwd, argv.config)
  const merged = applyCliOverrides(userConfig, argv)
  const start = Date.now()
  const result = await build(merged, cwd)
  const config = resolveConfig(merged, cwd)
  await writeOutput(result.css, config.output)
  const took = Date.now() - start
  console.error(
    kleur.green("✓") +
      kleur.dim(
        ` matched ${result.matchedClasses.length} classes / ${result.candidateCount} candidates / ${result.scannedFiles.length} files in ${took} ms`,
      ),
  )
  if (config.output) {
    console.error(kleur.dim(`  → ${path.relative(cwd, config.output)}`))
  }
  if (result.diagnostics.length > 0) {
    console.error(formatDiagnostics(result.diagnostics))
  }
  return 0
}

async function cmdWatch(argv: Argv): Promise<number> {
  const cwd = process.cwd()
  const userConfig = await loadUserConfig(cwd, argv.config)
  const merged = applyCliOverrides(userConfig, argv)
  const engine = new Engine(merged, cwd)
  const config = engine.getConfig()
  if (!config.output) {
    console.error(kleur.red("watch mode requires an --output path"))
    return 1
  }

  const files = await engine.scanAll()
  const rebuild = async (label: string) => {
    const start = Date.now()
    const result = engine.build()
    await writeOutput(result.css, config.output!)
    console.error(
      kleur.green("✓") +
        kleur.dim(
          ` ${label} → ${result.matchedClasses.length} classes / ${result.scannedFiles.length} files / ${Date.now() - start} ms`,
        ),
    )
    if (result.diagnostics.length > 0) {
      console.error(formatDiagnostics(result.diagnostics, 5))
    }
  }
  await rebuild("initial build")

  const { default: chokidar } = await import("chokidar")
  const watcher = chokidar.watch(config.content, {
    cwd,
    ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
    ignoreInitial: true,
  })
  watcher.on("add", async (rel) => {
    const file = path.resolve(cwd, rel)
    await engine.refreshFile(file)
    await rebuild(`+ ${rel}`)
  })
  watcher.on("change", async (rel) => {
    const file = path.resolve(cwd, rel)
    await engine.refreshFile(file)
    await rebuild(`~ ${rel}`)
  })
  watcher.on("unlink", async (rel) => {
    const file = path.resolve(cwd, rel)
    engine.forgetFile(file)
    await rebuild(`- ${rel}`)
  })

  console.error(
    kleur.dim(`watching ${files.length} files across ${config.content.length} pattern(s)…`),
  )
  // Keep the process alive.
  await new Promise(() => {})
  return 0
}

async function cmdManifest(argv: Argv): Promise<number> {
  const json = manifestJson(true)
  await writeOutput(json, argv.output)
  if (argv.flat) {
    const flatPath = argv.output
      ? path.join(path.dirname(argv.output), "ukit.classes.txt")
      : null
    await writeOutput(classesText(true), flatPath)
    if (flatPath) console.error(kleur.dim(`  → ${path.relative(process.cwd(), flatPath)}`))
  }
  return 0
}

async function cmdClasses(argv: Argv): Promise<number> {
  await writeOutput(classesText(!argv.noBreakpoints), argv.output)
  return 0
}

async function cmdExplain(argv: Argv): Promise<number> {
  if (argv.positional.length === 0) {
    console.error(kleur.red("explain requires at least one class name"))
    console.error(kleur.dim("  ukit-css explain m-1-rem-m d-none-m"))
    return 1
  }
  // Respect the project's breakpoints, so the reported media query is the one
  // the engine will actually emit.
  const userConfig = await loadUserConfig(process.cwd(), argv.config)
  const breakpoints = {
    mobile: userConfig.mobile ?? 576,
    tablet: userConfig.tablet ?? 992,
  }
  let invalid = 0
  for (const name of argv.positional) {
    const info = explainClass(name, breakpoints)
    if (!info.valid) {
      invalid++
      const suggestions = suggestClasses(name, 3)
      console.log(`${kleur.red("✗")} ${kleur.bold(name)} ${kleur.dim("matches nothing")}`)
      if (suggestions.length > 0) {
        console.log(`  ${kleur.dim("did you mean:")} ${suggestions.map((s) => kleur.green(s)).join(kleur.dim(", "))}`)
      }
      continue
    }
    const where = info.breakpoint === "base" ? "all viewports" : `${info.breakpoint} (${info.mediaQuery})`
    console.log(`${kleur.green("✓")} ${kleur.bold(name)} ${kleur.dim(`— ${where}`)}`)
    if (info.familyTitle) console.log(`  ${kleur.dim("family:")} ${info.familyTitle}`)
    if (info.base && info.base !== name) console.log(`  ${kleur.dim("base:")}   ${info.base}`)
    console.log(`  ${kleur.dim("css:")}`)
    for (const line of (info.css ?? "").split("\n")) {
      console.log(`    ${line}`)
    }
  }
  return invalid > 0 ? 1 : 0
}

async function cmdValidate(argv: Argv): Promise<number> {
  const cwd = process.cwd()
  const userConfig = await loadUserConfig(cwd, argv.config)
  const merged = applyCliOverrides(userConfig, argv)
  // Validation is the whole point of this command, so it always runs.
  merged.diagnostics = true

  const result = await build(merged, cwd)
  const report = {
    scannedFiles: result.scannedFiles.length,
    candidates: result.candidateCount,
    matched: result.matchedClasses.length,
    unknown: result.diagnostics.length,
    diagnostics: result.diagnostics,
  }

  if (argv.json) {
    await writeOutput(`${JSON.stringify(report, null, 2)}\n`, argv.output)
  } else {
    console.error(
      kleur.dim(
        `scanned ${report.scannedFiles} files · ${report.candidates} candidates · ${report.matched} matched`,
      ),
    )
    if (result.diagnostics.length === 0) {
      console.error(kleur.green("✓") + kleur.dim(" no unknown utility classes"))
    } else {
      console.error("")
      console.error(formatDiagnostics(result.diagnostics, Number.MAX_SAFE_INTEGER, false))
    }
  }

  return result.diagnostics.length > argv.maxWarnings ? 1 : 0
}

async function readPkgVersion(): Promise<string> {
  try {
    const url = new URL("../package.json", import.meta.url)
    const { readFile } = await import("node:fs/promises")
    const text = await readFile(url, "utf8")
    return JSON.parse(text).version ?? "unknown"
  } catch {
    return "unknown"
  }
}

export async function run(argv: readonly string[]): Promise<number> {
  const parsed = parseArgv(argv)
  switch (parsed.command) {
    case "build":
      return cmdBuild(parsed)
    case "watch":
      return cmdWatch(parsed)
    case "manifest":
      return cmdManifest(parsed)
    case "classes":
      return cmdClasses(parsed)
    case "explain":
      return cmdExplain(parsed)
    case "validate":
      return cmdValidate(parsed)
    case "version": {
      console.log(await readPkgVersion())
      return 0
    }
    case "help":
    default:
      printHelp()
      return 0
  }
}
