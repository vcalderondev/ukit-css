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
