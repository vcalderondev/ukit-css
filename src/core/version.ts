// =============================================================================
// VERSION
// -----------------------------------------------------------------------------
// Single source of truth for the version string that appears in the generated
// manifest. `test/catalog.test.mjs` asserts it matches package.json, and the
// release workflow bumps both together (see AGENTS.md).
// =============================================================================

export const VERSION = "1.1.0"
