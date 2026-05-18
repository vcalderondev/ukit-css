// =============================================================================
// PUBLIC API
// -----------------------------------------------------------------------------
// Re-exports the high-level engine + types so consumers can do:
//
//   import { build, Engine, defineConfig } from "@vcalderondev/sasskit"
// =============================================================================

export { build, buildFromCandidates, Engine } from "./core/engine.js"
export type { BuildResult } from "./core/engine.js"
export { resolveConfig, findConfigFile, loadConfigFile } from "./core/config.js"
export { matchCandidate } from "./core/matchers/index.js"
export type {
  Breakpoint,
  Declarations,
  GeneratedRule,
  MatchResult,
  ResolvedConfig,
  SasskitConfig,
} from "./core/types.js"

import type { SasskitConfig } from "./core/types.js"

/** Identity helper for typed config files (`sasskit.config.js`). */
export function defineConfig(config: SasskitConfig): SasskitConfig {
  return config
}
