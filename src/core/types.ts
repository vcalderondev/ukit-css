// =============================================================================
// SHARED TYPES
// =============================================================================

/**
 * Breakpoint identifier used by the `-m` (mobile) and `-t` (tablet) suffixes.
 * `base` means the rule applies on every viewport.
 */
export type Breakpoint = "base" | "mobile" | "tablet"

/**
 * A flat CSS declaration map. Order is preserved by Map semantics in the
 * generator, so callers can rely on declaration order if needed.
 */
export type Declarations = Record<string, string>

/**
 * Outcome of a rule matcher.
 *
 * - `decls` are the CSS declarations to emit.
 * - `important` controls whether `!important` is appended; defaults to `true`
 *   for utility classes (matching the original SASS behaviour) and `false` for
 *   the few "base" utilities that should not.
 * - `category` is used by the generator to keep output stable and grouped.
 */
export interface MatchResult {
  decls: Declarations
  important?: boolean
  /** Optional category index for stable output ordering. */
  category?: number
  /** Optional priority within a category for stable output ordering. */
  priority?: number
}

/**
 * A rule produced by the engine, ready to be emitted as a CSS block.
 */
export interface GeneratedRule {
  selector: string
  decls: Declarations
  important: boolean
  breakpoint: Breakpoint
  category: number
  priority: number
}

/**
 * User configuration. All fields are optional; sensible defaults apply.
 */
export interface SasskitConfig {
  /** Glob patterns of source files to scan for class candidates. */
  content?: string[]
  /** Where to write the output CSS when running the CLI. */
  output?: string
  /** Override the default mobile breakpoint (default: 576). */
  mobile?: number
  /** Override the default tablet breakpoint (default: 992). */
  tablet?: number
  /** Override the default desktop breakpoint (default: 1200). */
  desktop?: number
  /** Inject the CSS reset and stateless helpers (default: true). */
  preflight?: boolean
  /** Inject the keyframes module (default: true). */
  keyframes?: boolean
  /**
   * Class names to always include, even if they don't appear in scanned files.
   * Use this for dynamically generated class names.
   */
  safelist?: string[]
  /** Minify the output CSS (default: false). */
  minify?: boolean
}

export interface ResolvedConfig extends Required<Omit<SasskitConfig, "content" | "output">> {
  content: string[]
  output: string | null
}
