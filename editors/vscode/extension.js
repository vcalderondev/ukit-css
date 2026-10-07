"use strict"

/**
 * ukit-css for VS Code — activation and vscode plumbing.
 *
 * All decisions live in the pure modules under src/ (which is why they can be
 * tested without VS Code); this file only translates plain data to and from the
 * `vscode` API:
 *
 *   src/manifest.js     loads the vendored engine, builds the grammar index
 *   src/extract.js      finds class-bearing regions and the token at the caret
 *   src/completions.js  plain completion items      -> vscode.CompletionItem
 *   src/hover.js        { range, contents }         -> vscode.Hover
 *   src/diagnostics.js  plain diagnostics + fixes   -> vscode.Diagnostic / CodeAction
 *
 * No runtime dependencies: `vscode` is provided by the host, and the only other
 * module required is the vendored engine bundle.
 */

const vscode = require("vscode")

const manifest = require("./src/manifest.js")
const { getCompletions } = require("./src/completions.js")
const { getHover } = require("./src/hover.js")
const { getDiagnostics, SOURCE } = require("./src/diagnostics.js")

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Languages we register for (also listed in package.json activationEvents). */
const LANGUAGE_IDS = [
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
]

const SELECTOR = LANGUAGE_IDS.map((language) => ({ language }))

/** Characters that should re-open the completion list inside a class value. */
const TRIGGER_CHARACTERS = ["-", '"', "'", "`", " ", ":", "{"]

/** Quiet period after the last edit before diagnostics recompute. */
const DEBOUNCE_MS = 300

/** Per-document diagnostics budget, so minified/generated files stay cheap. */
const MAX_DOCUMENT_LENGTH = 2 * 1024 * 1024

/** Schemes that never hold user class names. */
const IGNORED_SCHEMES = new Set(["output", "vscode-terminal", "debug", "walkThrough", "comment"])

const COMPLETION_KINDS = {
  value: vscode.CompletionItemKind.Value,
  variant: vscode.CompletionItemKind.Value,
  stem: vscode.CompletionItemKind.Class,
  bare: vscode.CompletionItemKind.Constant,
}

const SUPPORTED_LANGUAGES = new Set(LANGUAGE_IDS)

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** @type {vscode.DiagnosticCollection|null} */
let diagnosticCollection = null
/** @type {Map<string, NodeJS.Timeout>} uri string -> pending debounce timer */
const diagnosticTimers = new Map()

let settings = { completions: true, diagnostics: true, hover: true }

/** One-time flags/messages, so a broken bundle cannot spam the log per keystroke. */
let degradedReported = false
const reportedFailures = new Set()

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

function activate(context) {
  settings = readSettings()
  diagnosticCollection = vscode.languages.createDiagnosticCollection(SOURCE)
  context.subscriptions.push(diagnosticCollection)

  // Touch the index once at activation: a missing/broken vendored bundle is
  // reported immediately, from one place, instead of on the first keystroke.
  getIndexOrReport()

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      SELECTOR,
      { provideCompletionItems },
      ...TRIGGER_CHARACTERS,
    ),
    vscode.languages.registerHoverProvider(SELECTOR, { provideHover }),
    vscode.languages.registerCodeActionsProvider(
      SELECTOR,
      { provideCodeActions },
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] },
    ),
    vscode.workspace.onDidChangeTextDocument((event) => scheduleDiagnostics(event.document)),
    vscode.workspace.onDidOpenTextDocument((document) => scheduleDiagnostics(document)),
    vscode.workspace.onDidCloseTextDocument((document) => clearDiagnostics(document)),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("ukitCss")) return
      settings = readSettings()
      refreshOpenDocuments()
    }),
  )

  // Documents already open when the extension activates.
  refreshOpenDocuments()
}

function deactivate() {
  for (const timer of diagnosticTimers.values()) clearTimeout(timer)
  diagnosticTimers.clear()
  if (diagnosticCollection) diagnosticCollection.dispose()
  diagnosticCollection = null
}

function readSettings() {
  const config = vscode.workspace.getConfiguration("ukitCss")
  return {
    completions: config.get("completions.enabled", true),
    diagnostics: config.get("diagnostics.enabled", true),
    hover: config.get("hover.enabled", true),
  }
}

function refreshOpenDocuments() {
  for (const document of vscode.workspace.textDocuments) scheduleDiagnostics(document)
}

// ---------------------------------------------------------------------------
// Guarded index access
// ---------------------------------------------------------------------------

/**
 * The grammar index, or null when the vendored engine is missing/broken.
 * Reports the problem exactly once and degrades gracefully — providers then
 * return "no suggestions" instead of throwing on every keystroke.
 */
function getIndexOrReport() {
  const index = manifest.getIndex()
  if (index) return index
  if (!degradedReported) {
    degradedReported = true
    const error = manifest.getEngineError() || manifest.getIndexError()
    const reason = error && error.message ? error.message : String(error || "unknown error")
    console.error(
      `[ukit-css] vendored engine unavailable — completions, hover and diagnostics are disabled. ` +
        `Reason: ${reason}. Fix: node editors/vscode/scripts/vendor.mjs (then reload the window).`,
    )
    vscode.window.showWarningMessage(
      `ukit-css: the vendored engine is missing or unreadable (${reason}). ` +
        `Class completions, hover and diagnostics are disabled until you run ` +
        `"node editors/vscode/scripts/vendor.mjs" and reload the window.`,
    )
  }
  return null
}

/** Log the first occurrence of an unexpected failure, then stay quiet. */
function reportFailure(what, error) {
  if (reportedFailures.has(what)) return
  reportedFailures.add(what)
  console.error(`[ukit-css] ${what} failed: ${error && error.stack ? error.stack : error}`)
}

// ---------------------------------------------------------------------------
// Completions
// ---------------------------------------------------------------------------

function provideCompletionItems(document, position) {
  try {
    if (!settings.completions) return undefined
    const index = getIndexOrReport()
    if (!index) return undefined

    const text = document.getText()
    if (text.length > MAX_DOCUMENT_LENGTH) return undefined

    const items = getCompletions(text, document.offsetAt(position), index)
    return items.map((item) => toCompletionItem(item, document))
  } catch (error) {
    reportFailure("completion", error)
    return undefined
  }
}

function toCompletionItem(item, document) {
  const kind = COMPLETION_KINDS[item.kind] || vscode.CompletionItemKind.Value
  const completion = new vscode.CompletionItem(item.label, kind)

  completion.insertText = item.insertText || item.label
  completion.detail = item.detail
  if (item.documentation) {
    const markdown = new vscode.MarkdownString(item.documentation)
    markdown.supportHtml = false
    completion.documentation = markdown
  }
  if (item.sortText) completion.sortText = item.sortText

  // The range covers the whole class token, so VS Code filters the vocabulary
  // itself and picking an item replaces the partially typed token.
  completion.range = new vscode.Range(
    document.positionAt(item.range.start),
    document.positionAt(item.range.end),
  )
  return completion
}

// ---------------------------------------------------------------------------
// Hover
// ---------------------------------------------------------------------------

function provideHover(document, position) {
  try {
    if (!settings.hover) return undefined
    const index = getIndexOrReport()
    if (!index) return undefined

    const text = document.getText()
    if (text.length > MAX_DOCUMENT_LENGTH) return undefined

    const result = getHover(text, document.offsetAt(position), index)
    if (!result) return undefined

    const markdown = new vscode.MarkdownString(result.contents.join("\n\n"))
    markdown.supportHtml = false
    const range = new vscode.Range(
      document.positionAt(result.range.start),
      document.positionAt(result.range.end),
    )
    return new vscode.Hover(markdown, range)
  } catch (error) {
    reportFailure("hover", error)
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Diagnostics (debounced)
// ---------------------------------------------------------------------------

function scheduleDiagnostics(document) {
  if (!diagnosticCollection) return
  const key = document.uri.toString()

  const pending = diagnosticTimers.get(key)
  if (pending) clearTimeout(pending)

  if (!settings.diagnostics || !isDiagnosable(document)) {
    diagnosticTimers.delete(key)
    diagnosticCollection.delete(document.uri)
    return
  }

  diagnosticTimers.set(
    key,
    setTimeout(() => {
      diagnosticTimers.delete(key)
      refreshDiagnostics(document)
    }, DEBOUNCE_MS),
  )
}

function isDiagnosable(document) {
  if (!SUPPORTED_LANGUAGES.has(document.languageId)) return false
  if (IGNORED_SCHEMES.has(document.uri.scheme)) return false
  return document.getText().length <= MAX_DOCUMENT_LENGTH
}

function refreshDiagnostics(document) {
  try {
    if (!diagnosticCollection) return
    if (!settings.diagnostics || !isDiagnosable(document)) {
      diagnosticCollection.delete(document.uri)
      return
    }
    const index = getIndexOrReport()
    if (!index) return

    const text = document.getText()
    const diagnostics = getDiagnostics(text, index).map((entry) => {
      const range = new vscode.Range(
        document.positionAt(entry.start),
        document.positionAt(entry.end),
      )
      const diagnostic = new vscode.Diagnostic(
        range,
        entry.message,
        vscode.DiagnosticSeverity.Warning,
      )
      diagnostic.source = SOURCE
      diagnostic.code = "unknown-class"
      // Payload consumed by the Quick Fix provider below.
      diagnostic.data = { suggestions: entry.suggestions }
      return diagnostic
    })

    diagnosticCollection.set(document.uri, diagnostics)
  } catch (error) {
    reportFailure("diagnostics", error)
  }
}

function clearDiagnostics(document) {
  const key = document.uri.toString()
  const pending = diagnosticTimers.get(key)
  if (pending) clearTimeout(pending)
  diagnosticTimers.delete(key)
  if (diagnosticCollection) diagnosticCollection.delete(document.uri)
}

// ---------------------------------------------------------------------------
// Quick Fix code actions
// ---------------------------------------------------------------------------

function provideCodeActions(document, _range, context) {
  try {
    const actions = []
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== SOURCE) continue
      const suggestions =
        diagnostic.data && Array.isArray(diagnostic.data.suggestions)
          ? diagnostic.data.suggestions
          : []
      if (!suggestions.length) continue

      // Best suggestion first and marked preferred; the rest stay available.
      suggestions.slice(0, 3).forEach((suggestion, position) => {
        const action = new vscode.CodeAction(
          `Replace with "${suggestion}"`,
          vscode.CodeActionKind.QuickFix,
        )
        action.diagnostics = [diagnostic]
        action.isPreferred = position === 0
        action.edit = new vscode.WorkspaceEdit()
        action.edit.replace(document.uri, diagnostic.range, suggestion)
        actions.push(action)
      })
    }
    return actions
  } catch (error) {
    reportFailure("code action", error)
    return []
  }
}

module.exports = { activate, deactivate }
