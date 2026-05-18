// =============================================================================
// CONFIG RESOLVER
// -----------------------------------------------------------------------------
// Merges the user-supplied SasskitConfig with sensible defaults. Also handles
// loading config from disk (`sasskit.config.{js,mjs,cjs,ts,json}`).
// =============================================================================

import { existsSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { DEFAULT_BREAKPOINTS } from "./tokens.js"
import type { ResolvedConfig, SasskitConfig } from "./types.js"

const DEFAULT_CONTENT = [
  "./**/*.{html,js,mjs,cjs,jsx,ts,tsx,vue,svelte,astro,php,twig,blade.php,erb,hbs,liquid}",
]

export function resolveConfig(user: SasskitConfig = {}, cwd = process.cwd()): ResolvedConfig {
  return {
    content: user.content && user.content.length > 0 ? user.content : DEFAULT_CONTENT,
    output: user.output ? path.resolve(cwd, user.output) : null,
    mobile: user.mobile ?? DEFAULT_BREAKPOINTS.mobile,
    tablet: user.tablet ?? DEFAULT_BREAKPOINTS.tablet,
    desktop: user.desktop ?? DEFAULT_BREAKPOINTS.desktop,
    preflight: user.preflight ?? true,
    keyframes: user.keyframes ?? true,
    safelist: user.safelist ?? [],
    minify: user.minify ?? false,
  }
}

const CONFIG_CANDIDATES = [
  "sasskit.config.ts",
  "sasskit.config.mjs",
  "sasskit.config.js",
  "sasskit.config.cjs",
  "sasskit.config.json",
]

/**
 * Find a config file in `cwd`. Returns null if none exists.
 */
export function findConfigFile(cwd: string, explicit?: string): string | null {
  if (explicit) {
    const abs = path.isAbsolute(explicit) ? explicit : path.resolve(cwd, explicit)
    return existsSync(abs) ? abs : null
  }
  for (const name of CONFIG_CANDIDATES) {
    const abs = path.resolve(cwd, name)
    if (existsSync(abs)) return abs
  }
  return null
}

/**
 * Load and resolve a config file. Supports JSON, ESM and CJS. TypeScript
 * configs are only supported if the user has a runtime loader installed
 * (we don't ship one to keep dependencies small).
 */
export async function loadConfigFile(filePath: string): Promise<SasskitConfig> {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === ".json") {
    const { readFile } = await import("node:fs/promises")
    return JSON.parse(await readFile(filePath, "utf8")) as SasskitConfig
  }
  if (ext === ".ts") {
    throw new Error(
      `TypeScript configs require a TS loader. Use sasskit.config.js / .mjs instead, or pre-compile your config.`,
    )
  }
  const url = pathToFileURL(filePath).href
  const mod = (await import(url)) as { default?: SasskitConfig } & SasskitConfig
  return (mod.default ?? mod) as SasskitConfig
}
