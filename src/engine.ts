// =============================================================================
// `@vcalderondev/sasskit/engine` ENTRY
// -----------------------------------------------------------------------------
// Slim re-export of the engine module for consumers who only need the JIT
// pipeline (without the convenience helpers in the root entry).
// =============================================================================

export * from "./core/engine.js"
export type { ResolvedConfig, SasskitConfig } from "./core/types.js"
