// =============================================================================
// PUBLIC API
// -----------------------------------------------------------------------------
// Re-exports the high-level engine + types so consumers can do:
//
//   import { build, Engine, defineConfig, cn } from "@vcalderondev/ukit-css"
//
// The full, machine-readable description of the class grammar lives in the
// `@vcalderondev/ukit-css/manifest` entry point.
// =============================================================================

export { build, buildFromCandidates, collectDiagnostics, Engine } from "./core/engine.js"
export type { BuildResult } from "./core/engine.js"
export { resolveConfig, findConfigFile, loadConfigFile } from "./core/config.js"
export { matchCandidate } from "./core/matchers/index.js"
export type { Diagnostic } from "./core/catalog.js"
export type {
  Breakpoint,
  Declarations,
  GeneratedRule,
  MatchResult,
  ResolvedConfig,
  UkitConfig,
} from "./core/types.js"

// Generated vocabulary types + the typed `cn()` helper. Types only: the unions
// are template literals, so they cost nothing at runtime.
export { cn } from "./generated/classes.js"
export type {
  UkitBreakpointSuffix,
  UkitClass,
  UkitClassBase,
  UkitClassInput,
  UkitClassName,
} from "./generated/classes.js"

import type { UkitConfig } from "./core/types.js"

/** Identity helper for typed config files (`ukit.config.js`). */
export function defineConfig(config: UkitConfig): UkitConfig {
  return config
}
