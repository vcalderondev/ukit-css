// =============================================================================
// Vite PLUGIN
// -----------------------------------------------------------------------------
// Exposes a virtual module so consumers can do:
//
//   // main.ts
//   import "virtual:sasskit.css"
//
// On every dev request (and once at build time) the plugin scans the project
// for utility candidates and serves the JIT-generated CSS. Hot reloads kick
// in automatically when any scanned file changes.
//
// Compatible with Vite 4 / 5 / 6.
// =============================================================================

import path from "node:path"
import type { Plugin, ViteDevServer } from "vite"
import { Engine } from "./core/engine.js"
import { findConfigFile, loadConfigFile } from "./core/config.js"
import type { SasskitConfig } from "./core/types.js"

export interface ViteSasskitOptions extends SasskitConfig {
  /** Optional path to a sasskit.config.{js,mjs,cjs,json} file. */
  configFile?: string
  /** Virtual module specifier. Default: `virtual:sasskit.css`. */
  virtualId?: string
}

const DEFAULT_VIRTUAL = "virtual:sasskit.css"

export default function sasskitVite(options: ViteSasskitOptions = {}): Plugin {
  const virtualId = options.virtualId ?? DEFAULT_VIRTUAL
  const resolvedVirtual = `\0${virtualId}`

  let engine: Engine | null = null
  let server: ViteDevServer | null = null
  let rootCwd = process.cwd()

  async function ensureEngine() {
    if (engine) return engine
    const configPath = findConfigFile(rootCwd, options.configFile)
    const fileConfig = configPath ? await loadConfigFile(configPath) : {}
    const merged: SasskitConfig = { ...fileConfig, ...options }
    delete (merged as ViteSasskitOptions).configFile
    delete (merged as ViteSasskitOptions).virtualId
    engine = new Engine(merged, rootCwd)
    await engine.scanAll()
    return engine
  }

  function invalidateVirtual() {
    if (!server) return
    const mod = server.moduleGraph.getModuleById(resolvedVirtual)
    if (mod) {
      server.moduleGraph.invalidateModule(mod)
      server.ws.send({
        type: "update",
        updates: [
          {
            type: "js-update",
            path: virtualId,
            acceptedPath: virtualId,
            timestamp: Date.now(),
          },
        ],
      })
    }
  }

  return {
    name: "@vcalderondev/sasskit",
    enforce: "pre",
    configResolved(c) {
      rootCwd = c.root
    },
    configureServer(devServer) {
      server = devServer
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtual
      return null
    },
    async load(id) {
      if (id !== resolvedVirtual) return null
      const eng = await ensureEngine()
      const { css, scannedFiles } = eng.build()
      // Register scanned files as deps so the virtual module is invalidated
      // when they change.
      for (const f of scannedFiles) this.addWatchFile(f)
      return css
    },
    async handleHotUpdate(ctx) {
      if (!engine) return
      const abs = path.resolve(ctx.file)
      // Only react to files that are part of the content globs.
      const config = engine.getConfig()
      // Cheap heuristic: if the changed file's extension matches any glob's
      // implied set, treat it as relevant. False positives only cost one
      // rebuild.
      await engine.refreshFile(abs)
      invalidateVirtual()
      // Avoid Vite's default HMR for the virtual id so our manual update wins.
      void config
    },
  }
}
