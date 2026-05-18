// =============================================================================
// JIT ENGINE
// -----------------------------------------------------------------------------
// End-to-end pipeline:
//   1. Resolve config + glob content files
//   2. Extract candidate class names from all source files
//   3. Match each candidate against the rule registry
//   4. Generate the final CSS (preflight + keyframes + utilities)
//
// The engine exposes a stateful `Engine` class for incremental rebuilds
// (used by watch mode and bundler plugins) and a stateless `build()` helper
// for one-shot CLI runs.
// =============================================================================

import type { GeneratedRule, ResolvedConfig, SasskitConfig } from "./types.js"
import { resolveConfig } from "./config.js"
import {
  extractCandidatesFromFiles,
  extractCandidatesFromSource,
  resolveContentGlobs,
} from "./extractor.js"
import { matchCandidate } from "./matchers/index.js"
import { ANIMATION_KEYFRAMES } from "./matchers/animate.js"
import { generateCss } from "./generator.js"
import { emitKeyframes, preflight } from "./preflight.js"

export interface BuildResult {
  css: string
  matchedClasses: string[]
  /** Files that were scanned for candidates. */
  scannedFiles: string[]
  /** Number of distinct candidates considered (before matching). */
  candidateCount: number
}

/**
 * Stateless one-shot build. Used by the CLI for a single compile pass.
 */
export async function build(user: SasskitConfig = {}, cwd = process.cwd()): Promise<BuildResult> {
  const config = resolveConfig(user, cwd)
  const files = await resolveContentGlobs(config.content, cwd)
  const candidates = await extractCandidatesFromFiles(files)
  // Always include safelist entries as candidates.
  for (const c of config.safelist) candidates.add(c)
  return buildFromCandidates(candidates, config, files)
}

/**
 * Match a set of candidates against the registry and emit CSS.
 * Exported so plugins can supply their own candidate set (e.g. from a Vite
 * transform hook) without re-globbing the filesystem.
 */
export function buildFromCandidates(
  candidates: Iterable<string>,
  config: ResolvedConfig,
  scannedFiles: string[] = [],
): BuildResult {
  const rules: GeneratedRule[] = []
  const matchedClasses: string[] = []
  const usedKeyframes = new Set<string>()
  let candidateCount = 0

  for (const cand of candidates) {
    candidateCount++
    const match = matchCandidate(cand)
    if (!match) continue
    matchedClasses.push(cand)
    const { result, breakpoint, selector } = match
    rules.push({
      selector,
      decls: result.decls,
      important: result.important ?? true,
      breakpoint,
      category: result.category ?? 99,
      priority: result.priority ?? 0,
    })
    // Track which keyframes are needed.
    const kf = ANIMATION_KEYFRAMES[cand.replace(/-[mt]$/, "")]
    if (kf) usedKeyframes.add(kf)
  }

  // Build the prelude (preflight + keyframes).
  const preludeParts: string[] = []
  if (config.preflight) preludeParts.push(preflight())
  if (config.keyframes && usedKeyframes.size > 0) {
    preludeParts.push(emitKeyframes([...usedKeyframes]))
  }

  const css = generateCss(rules, config, preludeParts.join("\n"))

  return {
    css,
    matchedClasses,
    scannedFiles,
    candidateCount,
  }
}

/**
 * Stateful engine for watch mode. Holds candidate state between rebuilds so
 * adding a new class to a single file doesn't require re-scanning every file.
 */
export class Engine {
  private config: ResolvedConfig
  private cwd: string
  private candidatesByFile = new Map<string, Set<string>>()

  constructor(user: SasskitConfig = {}, cwd: string = process.cwd()) {
    this.config = resolveConfig(user, cwd)
    this.cwd = cwd
  }

  getConfig(): ResolvedConfig {
    return this.config
  }

  /** Scan all configured content files and seed the candidate cache. */
  async scanAll(): Promise<string[]> {
    const files = await resolveContentGlobs(this.config.content, this.cwd)
    await Promise.all(files.map((f) => this.refreshFile(f)))
    return files
  }

  /** Re-scan a single file (call this from a watcher on change events). */
  async refreshFile(file: string): Promise<void> {
    const { readFile } = await import("node:fs/promises")
    try {
      const buf = await readFile(file)
      if (buf.byteLength > 4 * 1024 * 1024) {
        this.candidatesByFile.set(file, new Set())
        return
      }
      const set = extractCandidatesFromSource(buf.toString("utf8"))
      this.candidatesByFile.set(file, set)
    } catch {
      this.candidatesByFile.delete(file)
    }
  }

  /** Forget a file (call from a watcher on unlink events). */
  forgetFile(file: string): void {
    this.candidatesByFile.delete(file)
  }

  /** Build CSS from the current candidate cache. */
  build(): BuildResult {
    const all = new Set<string>()
    for (const set of this.candidatesByFile.values()) {
      for (const c of set) all.add(c)
    }
    for (const c of this.config.safelist) all.add(c)
    return buildFromCandidates(all, this.config, [...this.candidatesByFile.keys()])
  }
}
