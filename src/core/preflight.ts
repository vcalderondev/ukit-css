// =============================================================================
// PREFLIGHT + KEYFRAMES
// -----------------------------------------------------------------------------
// Static CSS blocks that are emitted independently of the JIT scan:
//
//   - preflight() returns the lightweight CSS reset that used to live in
//     _base.sass (box-sizing, list reset, anchor reset, etc.).
//   - keyframes() returns every @keyframes the toolkit defines. Only emitted
//     when at least one `.animate-*` class is matched (unless the user forces
//     it via config.keyframes = true).
// =============================================================================

/**
 * Returns the global CSS reset block. Always emitted at the top of the output
 * (before any utility) so utilities have higher specificity.
 */
export function preflight(): string {
  return `/* @sasskit preflight */
*,
*::before,
*::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
img, video { max-width: 100%; height: auto; }
ul, ol { list-style: none; padding: 0; margin: 0; }
a { text-decoration: none; color: inherit; }
button { background: none; border: none; padding: 0; cursor: pointer; font: inherit; color: inherit; }
`
}

/** Map (animation class -> keyframes name) used by the engine. */
export const KEYFRAMES_BY_NAME: Record<string, string> = {
  fadeIn: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
  fadeInUp: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`,
  fadeInScale: `@keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`,
  slideInRight: `@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`,
  spin: `@keyframes spin { to { transform: rotate(360deg); } }`,
  pulse: `@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`,
}

/** Emit a specific subset of keyframes by name. */
export function emitKeyframes(names: readonly string[]): string {
  if (names.length === 0) return ""
  const seen = new Set<string>()
  const parts: string[] = []
  for (const n of names) {
    if (seen.has(n)) continue
    seen.add(n)
    const block = KEYFRAMES_BY_NAME[n]
    if (block) parts.push(block)
  }
  return parts.length > 0 ? `/* @sasskit keyframes */\n${parts.join("\n")}\n` : ""
}
