// =============================================================================
// PostCSS PLUGIN
// -----------------------------------------------------------------------------
// Drop-in for any toolchain that runs PostCSS (Vite, Webpack, Next.js, Nuxt,
// Angular, Astro, Eleventy, etc.).
//
// Usage in CSS:
//   @ukit;            /* expands to the JIT-generated CSS */
//
// Usage in postcss.config.js:
//   import ukit from "@vcalderondev/ukit-css/postcss"
//   export default { plugins: [ukit()] }
// =============================================================================

import type { AcceptedPlugin, AtRule, Result, Root } from "postcss"
import { build } from "./core/engine.js"
import { findConfigFile, loadConfigFile } from "./core/config.js"
import type { UkitConfig } from "./core/types.js"

export interface PostcssOptions extends UkitConfig {
  /** Optional path to a ukit.config.{js,mjs,cjs,json} file. */
  configFile?: string
}

/** Cap on warnings per compile, so a big refactor cannot flood the console. */
const MAX_WARNINGS = 12

const ukit = (options: PostcssOptions = {}): AcceptedPlugin => {
  return {
    postcssPlugin: "@vcalderondev/ukit-css",
    async Once(root: Root, helpers: { result: Result }) {
      // Locate every `@ukit;` directive — that's our placeholder for the
      // JIT output. If none exist, prepend at the top so consumers can drop
      // the plugin in without modifying their stylesheet.
      const directives: AtRule[] = []
      root.walkAtRules("ukit", (atRule) => {
        directives.push(atRule)
      })

      // Load user config from disk (if any) and merge with inline options.
      const cwd = process.cwd()
      const configPath = findConfigFile(cwd, options.configFile)
      const fileConfig = configPath ? await loadConfigFile(configPath) : {}
      const merged: UkitConfig = { ...fileConfig, ...options }
      delete (merged as PostcssOptions).configFile

      // Diagnostics are a development aid: on outside production, opt-in
      // inside it. Unknown classes never emit CSS, so silence here is how
      // typos and Tailwind habits slip through unnoticed.
      if (merged.diagnostics === undefined) {
        merged.diagnostics = process.env.NODE_ENV !== "production"
      }

      const result = await build(merged, cwd)

      // Inject scanned files as dependencies so PostCSS-aware bundlers
      // (Vite, Webpack) rebuild when those files change.
      for (const file of result.scannedFiles) {
        helpers.result.messages.push({
          type: "dependency",
          plugin: "@vcalderondev/ukit-css",
          file,
          parent: root.source?.input.file ?? "",
        })
      }

      for (const diagnostic of result.diagnostics.slice(0, MAX_WARNINGS)) {
        helpers.result.warn(
          `"${diagnostic.token}" matches no utility class, so no CSS was emitted.${
            diagnostic.suggestions.length > 0
              ? ` Did you mean ${diagnostic.suggestions.join(", ")}?`
              : ""
          }`,
          { plugin: "@vcalderondev/ukit-css" },
        )
      }
      if (result.diagnostics.length > MAX_WARNINGS) {
        helpers.result.warn(
          `… and ${result.diagnostics.length - MAX_WARNINGS} more unmatched class names. Run \`npx ukit-css validate\` for the full list.`,
          { plugin: "@vcalderondev/ukit-css" },
        )
      }

      const css = result.css.trim()
      if (directives.length === 0) {
        root.prepend(css)
        return
      }
      for (const directive of directives) {
        directive.replaceWith(css)
      }
    },
  }
}

// PostCSS requires this marker on plugin functions.
;(ukit as { postcss?: boolean }).postcss = true

export default ukit
