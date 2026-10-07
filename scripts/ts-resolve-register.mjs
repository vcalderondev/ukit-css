// =============================================================================
// REGISTER THE TS RESOLVE HOOK FOR TESTS
// -----------------------------------------------------------------------------
// `npm test` loads this through `node --import`, which makes `./foo.js`
// resolve to `./foo.ts` so tests can import the TypeScript sources directly.
// =============================================================================

import { register } from "node:module"

register("./ts-resolve.mjs", import.meta.url)
