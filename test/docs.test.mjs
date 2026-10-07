// =============================================================================
// DOCUMENTATION TESTS
// -----------------------------------------------------------------------------
// The docs are generated, so they can break silently: a heading renamed in
// grammar.ts can orphan a link from the table of contents, and a stale file
// reference in prose is invisible until a reader clicks it.
//
// These checks caught a real regression: the family index linked to `#spacing`
// while the heading slug was `#spacing--margin-padding-gap`.
// =============================================================================

import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"

import { FAMILIES } from "../src/core/grammar.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const DOC_FILES = ["README.md", "AGENTS.md", "llms.txt", "docs/classes.md"]

/** Anchors a document exposes: explicit `<a id|name>` plus heading slugs. */
function anchorsOf(file) {
  const text = readFileSync(path.join(root, file), "utf8")
  const anchors = new Set()
  for (const m of text.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) anchors.add(m[1])
  for (const m of text.matchAll(/^#{1,6}\s+(.*)$/gm)) {
    anchors.add(
      m[1]
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-"),
    )
  }
  return anchors
}

describe("documentation", () => {
  it("resolves every relative link", () => {
    const broken = []
    for (const file of DOC_FILES) {
      const text = readFileSync(path.join(root, file), "utf8")
      for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
        const target = m[1]
        if (/^(https?:|mailto:|#!)/.test(target)) continue
        const [rawPath] = target.split("#")
        if (rawPath === "") continue
        if (!existsSync(path.resolve(root, path.dirname(file), rawPath))) {
          broken.push(`${file} -> ${rawPath}`)
        }
      }
    }
    assert.deepEqual(broken, [])
  })

  it("resolves every in-document and cross-document anchor", () => {
    const broken = []
    for (const file of DOC_FILES) {
      const text = readFileSync(path.join(root, file), "utf8")
      for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
        const target = m[1]
        if (/^(https?:|mailto:|#!)/.test(target)) continue
        const [rawPath, anchor] = target.split("#")
        if (!anchor) continue
        const targetFile = rawPath === "" ? file : path.relative(root, path.resolve(root, path.dirname(file), rawPath))
        if (!existsSync(path.join(root, targetFile))) continue
        if (!anchorsOf(targetFile).has(anchor)) {
          broken.push(`${file} -> ${target}`)
        }
      }
    }
    assert.deepEqual(broken, [])
  })

  it("gives every grammar family a reachable section in docs/classes.md", () => {
    const anchors = anchorsOf("docs/classes.md")
    const missing = FAMILIES.filter((f) => !anchors.has(f.id)).map((f) => f.id)
    assert.deepEqual(missing, [], "add the explicit <a id> anchor in scripts/generate.mjs")
  })

  it("documents the naming traps the tests rely on", () => {
    const llms = readFileSync(path.join(root, "llms.txt"), "utf8")
    assert.match(llms, /p-4/)                     // the bare-number trap
    assert.match(llms, /no colour utilities/i)    // there is no colour scale
    assert.match(llms, /silently ignored/i)       // the silent-drop failure mode
    assert.match(llms, /ukit-css validate/)       // how to find them
  })
})
