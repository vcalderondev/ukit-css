// =============================================================================
// ANIMATION MATCHERS
// -----------------------------------------------------------------------------
// Maps `.animate-{name}` classes to the matching @keyframes name + timing.
// The keyframes themselves are emitted globally by the generator when ANY
// animate-* class is matched.
// =============================================================================

import type { MatchResult } from "../types.js"
import { decl } from "./helpers.js"

const ANIMATIONS: Record<string, string> = {
  "animate-fade-in": "fadeIn 0.3s ease-in-out",
  "animate-fade-in-up": "fadeInUp 0.4s ease-out",
  "animate-fade-in-scale": "fadeInScale 0.3s ease-out",
  "animate-slide-in-right": "slideInRight 0.4s ease-out",
  "animate-spin": "spin 1s linear infinite",
  "animate-pulse": "pulse 2s infinite ease-in-out",
}

/**
 * Maps each animation class to the keyframes it depends on. Used by the engine
 * to emit the right `@keyframes` blocks on demand.
 */
export const ANIMATION_KEYFRAMES: Record<string, string> = {
  "animate-fade-in": "fadeIn",
  "animate-fade-in-up": "fadeInUp",
  "animate-fade-in-scale": "fadeInScale",
  "animate-slide-in-right": "slideInRight",
  "animate-spin": "spin",
  "animate-pulse": "pulse",
}

export function matchAnimate(name: string): MatchResult | null {
  if (ANIMATIONS[name] === undefined) return null
  // Animations are NOT !important by default — they should be overridable.
  return decl("animation", ANIMATIONS[name]!, {
    category: 11,
    important: false,
  })
}
