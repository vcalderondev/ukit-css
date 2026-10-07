#!/usr/bin/env node
/**
 * Integration test for extension.js — the vscode plumbing.
 *
 *   node editors/vscode/test/integration.mjs
 *
 * extension.js is the only file that imports `vscode`, and VS Code hands that
 * module to the extension at runtime. Here we intercept the require and inject
 * a minimal stub, then activate the extension for real and drive the registered
 * providers with fake documents. That catches wiring mistakes (wrong API name,
 * wrong argument order, a provider that throws) which `node --check` cannot.
 *
 * Exits non-zero if any assertion fails.
 */

import Module, { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const extRoot = resolve(here, "..")

// ---------------------------------------------------------------------------
// Minimal `vscode` stub
// ---------------------------------------------------------------------------

const recorded = {
  completions: null,
  hover: null,
  codeActions: null,
  completionTriggers: null,
  selector: null,
  diagnostics: new Map(), // uri string -> vscode.Diagnostic[]
  warnings: [],
  handlers: {},
  settings: {},
}

class Position {
  constructor(line, character) {
    this.line = line
    this.character = character
  }
}

class Range {
  constructor(start, end) {
    this.start = start
    this.end = end
  }
}

const vscodeStub = {
  CompletionItem: class CompletionItem {
    constructor(label, kind) {
      this.label = label
      this.kind = kind
    }
  },
  CompletionItemKind: { Value: 12, Class: 7, Constant: 21, Field: 5 },
  MarkdownString: class MarkdownString {
    constructor(value) {
      this.value = value
    }
  },
  Hover: class Hover {
    constructor(contents, range) {
      this.contents = contents
      this.range = range
    }
  },
  Diagnostic: class Diagnostic {
    constructor(range, message, severity) {
      this.range = range
      this.message = message
      this.severity = severity
    }
  },
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  CodeAction: class CodeAction {
    constructor(title, kind) {
      this.title = title
      this.kind = kind
    }
  },
  CodeActionKind: { QuickFix: { value: "quickfix" } },
  WorkspaceEdit: class WorkspaceEdit {
    constructor() {
      this.replacements = []
    }
    replace(uri, range, text) {
      this.replacements.push({ uri, range, text })
    }
  },
  Position,
  Range,
  languages: {
    createDiagnosticCollection(name) {
      return {
        name,
        set(uri, diagnostics) {
          recorded.diagnostics.set(uri.toString(), diagnostics)
        },
        delete(uri) {
          recorded.diagnostics.delete(uri.toString())
        },
        dispose() {
          recorded.diagnostics.clear()
        },
      }
    },
    registerCompletionItemProvider(selector, provider, ...triggers) {
      recorded.selector = selector
      recorded.completions = provider
      recorded.completionTriggers = triggers
      return { dispose() {} }
    },
    registerHoverProvider(_selector, provider) {
      recorded.hover = provider
      return { dispose() {} }
    },
    registerCodeActionsProvider(_selector, provider) {
      recorded.codeActions = provider
      return { dispose() {} }
    },
  },
  workspace: {
    getConfiguration() {
      return {
        get(key, fallback) {
          return key in recorded.settings ? recorded.settings[key] : fallback
        },
      }
    },
    onDidChangeTextDocument(handler) {
      recorded.handlers.change = handler
      return { dispose() {} }
    },
    onDidOpenTextDocument(handler) {
      recorded.handlers.open = handler
      return { dispose() {} }
    },
    onDidCloseTextDocument(handler) {
      recorded.handlers.close = handler
      return { dispose() {} }
    },
    onDidChangeConfiguration(handler) {
      recorded.handlers.configuration = handler
      return { dispose() {} }
    },
    textDocuments: [],
  },
  window: {
    showWarningMessage(message) {
      recorded.warnings.push(message)
      return Promise.resolve()
    },
  },
}

const originalLoad = Module._load
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "vscode") return vscodeStub
  return originalLoad.call(this, request, parent, isMain)
}

const manifest = require(join(extRoot, "src", "manifest.js"))
const extension = require(join(extRoot, "extension.js"))

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

let passed = 0
const failures = []

async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ok    ${name}`)
  } catch (error) {
    failures.push({ name, error })
    console.log(`  FAIL  ${name}`)
    console.log(`        ${error && error.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "expected a truthy value")
}

function eq(actual, expected, message) {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b)
    throw new Error(`${message || "values differ"}\n        actual:   ${a}\n        expected: ${b}`)
}

/**
 * Build a fake TextDocument, plus the Position of the optional `|` caret
 * marker (defaults to the end of the document).
 */
function documentWithCaret(source, languageId = "html", path = "/tmp/index.html") {
  const marker = source.indexOf("|")
  const text = marker === -1 ? source : source.slice(0, marker) + source.slice(marker + 1)
  const offset = marker === -1 ? text.length : marker

  const lineStarts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1)

  const document = {
    languageId,
    uri: { scheme: "file", path, toString: () => "file://" + path },
    getText: () => text,
    offsetAt(position) {
      return lineStarts[position.line] + position.character
    },
    positionAt(target) {
      let line = 0
      for (let i = lineStarts.length - 1; i >= 0; i--) {
        if (lineStarts[i] <= target) {
          line = i
          break
        }
      }
      return new Position(line, target - lineStarts[line])
    },
  }
  return { document, position: document.positionAt(offset), text }
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms))
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

const context = { subscriptions: [] }
extension.activate(context)

console.log("activation")

await test("registers its providers and every disposable", () => {
  assert(recorded.completions, "no completion provider registered")
  assert(recorded.hover, "no hover provider registered")
  assert(recorded.codeActions, "no code action provider registered")
  assert(
    context.subscriptions.length >= 7,
    `expected >= 7 disposables, got ${context.subscriptions.length}`,
  )
})

await test("registers for every documented language", () => {
  const languages = recorded.selector.map((entry) => entry.language)
  for (const id of [
    "html",
    "vue",
    "svelte",
    "astro",
    "javascriptreact",
    "typescriptreact",
    "javascript",
    "typescript",
    "php",
    "blade",
    "twig",
    "erb",
    "handlebars",
    "liquid",
    "markdown",
  ]) {
    assert(languages.includes(id), `missing language: ${id}`)
  }
})

await test("registers the required trigger characters", () => {
  eq(recorded.completionTriggers, ["-", '"', "'", "`", " ", ":", "{"], "trigger characters")
})

await test("activates cleanly with the vendored engine present", () => {
  eq(recorded.warnings, [], "no warning should be shown")
})

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

console.log("\nproviders")

await test("the completion provider returns vscode.CompletionItems with ranges", () => {
  const { document, position } = documentWithCaret('<div class="m-|"></div>')
  const items = recorded.completions.provideCompletionItems(document, position, {}, {})
  assert(Array.isArray(items), "expected an array of items")
  const labels = items.map((item) => item.label)
  assert(labels.includes("m-1-rem"), "m-1-rem missing")
  assert(labels.includes("m-16px"), "m-16px missing")

  const item = items.find((candidate) => candidate.label === "m-1-rem")
  assert(item.range instanceof Range, "item.range must be a vscode.Range")
  eq(item.range.start.character, 12, "range start replaces the whole token")
  eq(item.range.end.character, 14, "range end")
  assert(
    item.documentation && typeof item.documentation.value === "string",
    "documentation is a MarkdownString",
  )
  assert(
    item.documentation.value.includes("margin: 1rem !important"),
    "documentation shows the CSS",
  )
})

await test("the completion provider offers variants for a complete class", () => {
  const { document, position } = documentWithCaret('<div class="d-none|"></div>')
  const labels = recorded.completions
    .provideCompletionItems(document, position, {}, {})
    .map((item) => item.label)
  assert(labels.includes("d-none-m"), "d-none-m missing")
  assert(labels.includes("d-none-t"), "d-none-t missing")
})

await test("the completion provider is quiet outside a class value", () => {
  const { document, position } = documentWithCaret("<p>d-flx|</p>")
  eq(
    recorded.completions.provideCompletionItems(document, position, {}, {}),
    [],
    "no items in prose",
  )
})

await test("the hover provider returns a vscode.Hover with the emitted CSS", () => {
  const { document, position } = documentWithCaret('<div class="m-1-rem|"></div>')
  const result = recorded.hover.provideHover(document, position, {})
  assert(result, "expected a hover")
  assert(result.contents.value.includes(".m-1-rem {\n  margin: 1rem !important;\n}"), "hover CSS")
  assert(result.range instanceof Range, "hover range")
})

await test("the hover provider returns undefined outside class values", () => {
  const { document, position } = documentWithCaret("<p>d-flx|</p>")
  eq(recorded.hover.provideHover(document, position, {}), undefined, "no hover in prose")
})

await test("diagnostics are debounced, published, and turned into a quick fix", async () => {
  const { document } = documentWithCaret('<div class="d-flx"></div>', "html", "/tmp/diag.html")
  assert(recorded.handlers.change, "no onDidChangeTextDocument handler")
  recorded.handlers.change({ document })

  eq(
    recorded.diagnostics.get("file:///tmp/diag.html"),
    undefined,
    "nothing published before the debounce",
  )
  await sleep(450)

  const published = recorded.diagnostics.get("file:///tmp/diag.html")
  assert(Array.isArray(published), "no diagnostics published after the debounce")
  eq(published.length, 1, "one diagnostic")
  eq(published[0].source, "ukit-css", "source")
  eq(published[0].severity, 1, "warning severity")
  assert(published[0].message.includes("d-flex"), "message mentions the fix")

  const actions = recorded.codeActions.provideCodeActions(document, published[0].range, {
    diagnostics: published,
  })
  assert(actions.length >= 1, "expected a quick fix")
  assert(actions[0].isPreferred, "the best suggestion should be preferred")
  eq(actions[0].edit.replacements[0].text, "d-flex", "the fix replaces the token with d-flex")
})

await test("closing a document clears its diagnostics", async () => {
  const { document } = documentWithCaret('<div class="d-flx"></div>', "html", "/tmp/closed.html")
  recorded.handlers.change({ document })
  await sleep(450)
  assert(recorded.diagnostics.get("file:///tmp/closed.html"), "expected diagnostics first")

  recorded.handlers.close(document)
  eq(recorded.diagnostics.get("file:///tmp/closed.html"), undefined, "diagnostics cleared on close")
})

await test("an unsupported language is never diagnosed", async () => {
  const { document } = documentWithCaret('<div class="d-flx"></div>', "plaintext", "/tmp/plain.txt")
  recorded.handlers.change({ document })
  await sleep(450)
  eq(recorded.diagnostics.get("file:///tmp/plain.txt"), undefined, "plaintext is not scanned")
})

await test("disabling diagnostics clears them and stops publishing", async () => {
  const { document } = documentWithCaret('<div class="d-flx"></div>', "html", "/tmp/off.html")
  vscodeStub.workspace.textDocuments.push(document)

  recorded.handlers.configuration({ affectsConfiguration: () => true })
  await sleep(450)
  assert(recorded.diagnostics.get("file:///tmp/off.html"), "diagnostics published while enabled")

  recorded.settings["diagnostics.enabled"] = false
  recorded.handlers.configuration({ affectsConfiguration: () => true })
  eq(recorded.diagnostics.get("file:///tmp/off.html"), undefined, "cleared once disabled")
  assert(
    Array.isArray(
      recorded.completions.provideCompletionItems(document, document.positionAt(0), {}, {}),
    ),
    "completions stay enabled",
  )

  vscodeStub.workspace.textDocuments.length = 0
  recorded.settings = {}
})

// ---------------------------------------------------------------------------
// Degradation
// ---------------------------------------------------------------------------

console.log("\ndegradation")

await test("a missing vendored engine warns once and disables the features", () => {
  const realEngine = manifest.getEngine()
  const secondContext = { subscriptions: [] }
  try {
    manifest.__setEngine(null)
    extension.activate(secondContext)

    eq(recorded.warnings.length, 1, "exactly one warning")
    assert(recorded.warnings[0].includes("vendored engine"), "the warning explains the problem")
    assert(recorded.warnings[0].includes("vendor.mjs"), "the warning explains the fix")

    const { document, position } = documentWithCaret('<div class="m-|"></div>')
    eq(
      recorded.completions.provideCompletionItems(document, position, {}, {}),
      undefined,
      "completions off",
    )
    eq(recorded.hover.provideHover(document, position, {}), undefined, "hover off")
  } finally {
    manifest.__setEngine(realEngine)
  }

  // The features come back as soon as the engine is restored.
  const { document, position } = documentWithCaret('<div class="m-|"></div>')
  assert(
    Array.isArray(recorded.completions.provideCompletionItems(document, position, {}, {})),
    "completions back",
  )
})

await test("deactivate disposes everything without throwing", () => {
  extension.deactivate()
  extension.deactivate() // idempotent
})

// ---------------------------------------------------------------------------

await sleep(50) // let any stray debounce fire; a throw here would fail the run
console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) {
  console.log("\nFailures:")
  for (const failure of failures) console.log(`  - ${failure.name}`)
  process.exit(1)
}
process.exit(0)
