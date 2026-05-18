// =============================================================================
// CANDIDATE EXTRACTOR
// -----------------------------------------------------------------------------
// Scans source files (HTML, JSX, TSX, Vue, Svelte, Angular templates, JS/TS,
// PHP, Twig, Blade, ERB, etc.) and produces a Set of "candidate" strings —
// anything that *could* be a utility class name. The engine then tries each
// candidate against the matcher registry.
//
// We deliberately use a permissive regex (Tailwind-style) instead of a real
// HTML/JSX parser so we don't have to special-case every framework:
//   - Angular: [class.x]="..." / [ngClass]="{x: ...}"
//   - Vue:     :class="['x', { y: ... }]"
//   - React:   className="x y" / className={clsx('x', cond && 'y')}
//   - Svelte:  class:x / class="x"
//   - HTML:    class="x"
//
// All of these eventually contain the class name as a bare token, which our
// regex captures.
// =============================================================================

import { readFile } from "node:fs/promises"
import path from "node:path"

/**
 * Tailwind-style permissive candidate regex. Matches sequences that don't
 * contain whitespace, quotes, angle brackets or colons — these are the
 * characters that almost always delimit tokens in source code.
 *
 * Trailing punctuation (`,` `;` `.`) is stripped post-match.
 */
const CANDIDATE_RE = /[^\s"'`<>(){}\[\]=]+/g

/** Characters we strip from the tail of a candidate before matching. */
const TRIM_CHARS = new Set([",", ";", ":", ".", "!", "?", ")", "]", "}", "/", "\\"])

function cleanCandidate(raw: string): string {
  let s = raw
  // Strip leading punctuation
  while (s.length > 0 && (TRIM_CHARS.has(s[0]!) || s[0] === "+" || s[0] === "-")) {
    // Keep leading `-` because some classes start with it after `neg-` etc.
    // but `-` alone at the start is usually noise. The matcher rejects
    // anything invalid anyway.
    if (s[0] === "-" || s[0] === "+") break
    s = s.slice(1)
  }
  while (s.length > 0 && TRIM_CHARS.has(s[s.length - 1]!)) {
    s = s.slice(0, -1)
  }
  return s
}

/**
 * Extract candidate utility-class strings from a single piece of source code.
 * Returns a Set to deduplicate naturally.
 */
export function extractCandidatesFromSource(source: string): Set<string> {
  const out = new Set<string>()
  const matches = source.match(CANDIDATE_RE)
  if (!matches) return out
  for (const m of matches) {
    const cleaned = cleanCandidate(m)
    if (!cleaned) continue
    // Cheap pre-filter: every utility class contains at least one `-` OR is
    // one of a handful of bare names (border, clearfix). The matcher itself
    // does the final validation; this filter just avoids running the matcher
    // chain on every random identifier.
    if (cleaned.includes("-") || cleaned === "border" || cleaned === "clearfix") {
      out.add(cleaned)
    }
  }
  return out
}

/**
 * Read a list of files and aggregate every candidate across all of them.
 * Skips binary / oversized files gracefully.
 */
export async function extractCandidatesFromFiles(files: readonly string[]): Promise<Set<string>> {
  const all = new Set<string>()
  await Promise.all(
    files.map(async (file) => {
      try {
        const buf = await readFile(file)
        // Skip files > 4 MB — almost certainly not source code.
        if (buf.byteLength > 4 * 1024 * 1024) return
        const text = buf.toString("utf8")
        for (const c of extractCandidatesFromSource(text)) all.add(c)
      } catch {
        // Ignore unreadable files (binary, permission errors, etc.).
      }
    }),
  )
  return all
}

/**
 * Expand a list of glob patterns into concrete file paths using fast-glob.
 * Imported lazily so the package works in environments where fast-glob
 * isn't desired (programmatic use can pass file paths directly).
 */
export async function resolveContentGlobs(
  patterns: readonly string[],
  cwd: string,
): Promise<string[]> {
  if (patterns.length === 0) return []
  const { default: fg } = await import("fast-glob")
  const files = await fg(patterns as string[], {
    cwd,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
  })
  return files.map((f) => path.resolve(f))
}
