// =============================================================================
// PostCSS PLUGIN
// -----------------------------------------------------------------------------
// Drop-in for any toolchain that runs PostCSS (Vite, Webpack, Next.js, Nuxt,
// Angular, Astro, Eleventy, etc.).
//
// Usage in CSS:
//   @sasskit;            /* expands to the JIT-generated CSS */
//
// Usage in postcss.config.js:
//   import sasskit from "@vcalderondev/sasskit/postcss"
//   export default { plugins: [sasskit()] }
// =============================================================================

import type { AcceptedPlugin, AtRule, Result, Root } from "postcss"
import { build } from "./core/engine.js"
import { findConfigFile, loadConfigFile } from "./core/config.js"
import type { SasskitConfig } from "./core/types.js"

export interface PostcssOptions extends SasskitConfig {
  /** Optional path to a sasskit.config.{js,mjs,cjs,json} file. */
  configFile?: string
}

const sasskit = (options: PostcssOptions = {}): AcceptedPlugin => {
  return {
    postcssPlugin: "@vcalderondev/sasskit",
    async Once(root: Root, helpers: { result: Result }) {
      // Locate every `@sasskit;` directive — that's our placeholder for the
      // JIT output. If none exist, prepend at the top so consumers can drop
      // the plugin in without modifying their stylesheet.
      const directives: AtRule[] = []
      root.walkAtRules("sasskit", (atRule) => {
        directives.push(atRule)
      })

      // Load user config from disk (if any) and merge with inline options.
      const cwd = process.cwd()
      const configPath = findConfigFile(cwd, options.configFile)
      const fileConfig = configPath ? await loadConfigFile(configPath) : {}
      const merged: SasskitConfig = { ...fileConfig, ...options }
      delete (merged as PostcssOptions).configFile

      const result = await build(merged, cwd)

      // Inject scanned files as dependencies so PostCSS-aware bundlers
      // (Vite, Webpack) rebuild when those files change.
      for (const file of result.scannedFiles) {
        helpers.result.messages.push({
          type: "dependency",
          plugin: "@vcalderondev/sasskit",
          file,
          parent: root.source?.input.file ?? "",
        })
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
;(sasskit as { postcss?: boolean }).postcss = true

export default sasskit
