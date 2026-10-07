# ukit-css for VS Code

Class-name IntelliSense for [`@vcalderondev/ukit-css`](https://github.com/vcalderondev/ukit-css#readme): completions,
hover documentation, diagnostics and Quick Fixes for the `class` / `className`
values in HTML, JSX/TSX, Vue, Svelte, Astro, PHP and the usual template
languages.

The extension does **not** re-implement any part of ukit. It ships the engine's
own generated bundle (`dist/manifest.cjs` → `vendor/manifest.cjs`) and asks it
what is valid, what CSS a class emits and what a typo probably meant. If the
engine changes, the extension changes with it — there is no second vocabulary to
keep in sync.

## Install

There is no marketplace listing yet — build and install a VSIX:

```bash
cd editors/vscode
node scripts/vendor.mjs                  # required once; the copy is committed
npx @vscode/vsce package                 # needs network access
code --install-extension ukit-css-*.vsix
```

Or copy/symlink the `editors/vscode` folder into `~/.vscode/extensions/ukit-css`.
`vendor/manifest.cjs` must exist either way; without it the extension activates,
logs one clear error and disables its features rather than failing per keystroke.

### VS Code forks (Antigravity, Cursor, Windsurf, VSCodium, …)

The extension only uses stable public `vscode` API — `registerCompletionItemProvider`,
`registerHoverProvider`, `registerCodeActionsProvider`, `createDiagnosticCollection`,
`workspace.getConfiguration` and the usual item/diagnostic types. No `proposed`
API, no bundler, no dependency on anything Marketplace-specific, so any recent
fork runs it. Verified end to end against **Antigravity IDE 1.107.0** (VS Code
base 1.107.0, which satisfies the `engines.vscode: ^1.75.0` requirement):

```bash
npx @vscode/vsce package
antigravity-ide --install-extension "$PWD/ukit-css-1.0.2.vsix"
# then reload the window so the extension activates
```

Uninstall with `antigravity-ide --uninstall-extension vcalderondev.ukit-css`.

These forks normally ship **Open VSX** as their gallery instead of the Microsoft
Marketplace, so installing by published id requires publishing there:

```bash
npx ovsx publish ukit-css-1.0.2.vsix -p <OPEN_VSX_TOKEN>
```

Installing from a local VSIX path needs no registry at all.

## Features

### Completions

Triggered inside a class value (`-` `"` `'` `` ` `` space `:` `{`).

| You type | You get |
| --- | --- |
| `class="` | every stem (`m`, `mt`, `grid-cols`, `d`, …) and every valueless class (`border`, `clearfix`, `animate-spin`) |
| `class="m-` | every `m` value: `m-1-rem`, `m-16px`, `m-auto`, … |
| `class="d-none` | `d-none` plus the responsive variants `d-none-m` and `d-none-t` |
| `class="border` | `border-m` (but **not** `border-t` — see the documented exception below) |

Each value item shows the CSS properties it targets as `detail` and the exact
rule that will be emitted as `documentation`. Filtering is left to VS Code: items
are returned with a `range` covering the whole token, so the fuzzy matcher ranks
the ~4,000 base classes without any per-keystroke work in JavaScript.

### Hover

Hovering any known class shows the family, the *exact* CSS the build will emit,
the CSS properties, and whether a breakpoint media query is involved:

```css
.m-1-rem {
  margin: 1rem !important;
}
```

Hovering an unknown class offers the closest valid classes (`d-flx` →
“Did you mean `d-flex`?”). Nothing is shown when the engine has no suggestion.

### Diagnostics and Quick Fix

A class token that the engine rejects **and** for which it has a suggestion is
reported as a warning from `ukit-css`, with a Quick Fix that replaces the token
with the best suggestion:

```
Unknown ukit-css class "d-flx". Did you mean "d-flex"?   [Replace with "d-flex"]
```

Unknown tokens with *no* suggestion are never reported. That one condition is
what keeps BEM names (`p-button__icon`), identifiers, file paths and prose quiet.
Diagnostics are only collected inside class-bearing regions, debounced (300 ms)
after the last edit, capped per document, and cleared when a document is closed.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `ukitCss.completions.enabled` | `true` | Suggest class names inside `class` / `className` values and class directives. |
| `ukitCss.diagnostics.enabled` | `true` | Warn about unknown classes that have a close suggestion. |
| `ukitCss.hover.enabled` | `true` | Show generated CSS, family and breakpoint on hover. |

## Supported languages

`html`, `vue`, `svelte`, `astro`, `javascriptreact`, `typescriptreact`,
`javascript`, `typescript`, `php`, `blade`, `twig`, `erb`, `handlebars`,
`liquid`, `markdown`.

These are the places class values are looked for:

```html
<div class="m-1-rem d-flex"></div>
<div className={"m-1-rem p-4"} />
<div :class="'m-1-rem d-flex'" />
<div :class="{ 'm-1-rem': isActive }"></div>   <!-- only the string literal -->
<div class:list={["m-1-rem", "p-4"]}></div>
cn("m-1-rem p-4")
clsx('d-flex gap-1-rem')
```

Braced expressions (`:class="{ active: isActive }"`, `className={cond ? "d-flex" : x}`)
are reduced to their string literals, so JavaScript identifiers bound to classes
are never flagged.

## Development

Everything is plain CommonJS + `.mjs` and has **zero** runtime and dev
dependencies — VS Code provides `vscode` at runtime, and the only other module
required is the vendored engine.

```bash
cd editors/vscode

# 1. Vendor the engine. Required after any `npm run build` at the repo root:
#    the vendored copy is byte-identical to dist/manifest.cjs on purpose.
node scripts/vendor.mjs

# 2. Run the pure-module tests (no VS Code needed) and the wiring tests.
node test/selftest.mjs      # grammar index, completions, hover, diagnostics
node test/integration.mjs   # extension.js driven through a stub `vscode` module

# or both
npm test
```

`node scripts/vendor.mjs` fails loudly if `dist/manifest.cjs` is missing, if it
contains an external `require()`, or if `explainClass("m-1-rem").css` is not
exactly `.m-1-rem {\n  margin: 1rem !important;\n}`.

At the repo root this is wired as `npm run vendor`, and `npm run check:vendor`
fails if the committed copy goes stale after a rebuild. `package.json`'s
`version` tracks the engine version — bump it together with the engine.

### Trying it by hand

Open the `editors/vscode` folder as the workspace and press `F5` (see
`.vscode/launch.json`), then edit an `.html` or `.tsx` file in the new window.
This is also the quickest way to check the completion and hover widgets.

### Packaging

```bash
cd editors/vscode
npx @vscode/vsce package        # needs network access; produces ukit-css-<version>.vsix
```

`.vscodeignore` keeps tests, scripts and tooling config out of the archive;
`extension.js`, `src/`, `vendor/manifest.cjs`, `manifest.json`, `package.json`,
`icon.png` and this README are what ship.

## Publishing

### One-time setup (only you can do this)

1. **Create the publisher.** Sign in at
   <https://marketplace.visualstudio.com/manage> with the Microsoft account you
   want to own the extension and create a publisher whose **ID matches the
   `publisher` field in `package.json`** — currently `vcalderondev`. The ID is
   permanent and is what appears in the extension's identity
   (`vcalderondev.ukit-css`). If you pick a different ID, change `publisher` in
   `package.json` to match; `vsce` refuses to publish when they disagree.
2. **Create a Personal Access Token.** In Azure DevOps, create a PAT scoped to
   **Marketplace → Manage**. `vsce` uses it as `VSCE_PAT`.
3. **Optional, for Antigravity/Cursor/Windsurf/VSCodium:** create an
   [Open VSX](https://open-vsx.org) account and an access token (`OVSX_PAT`).

Store both as repository secrets if you want the workflow to publish for you.

### Publishing with GitHub Actions

`.github/workflows/publish-extension.yml` is **manual on purpose** — a
Marketplace version can never be reused, so nothing publishes by accident:

- `workflow_dispatch` with a `target` (`marketplace` / `openvsx` / `both`) and a
  `dry_run` toggle that defaults to **true**, so the first run only validates.
- Pushing a tag named `extension-v*` publishes to the Marketplace.

The job builds the engine, asserts `npm run check:vendor` (the vendored engine
must match `dist/manifest.cjs`), runs the extension tests, packages the VSIX,
uploads it as an artifact, and skips the upload with a clear notice if that
version already exists.

### Publishing by hand

```bash
cd editors/vscode
npm test                                   # 50 tests must pass
npm run package:vsix                       # -> ukit-css-<version>.vsix

VSCE_PAT=<token> npm run publish:marketplace
OVSX_PAT=<token> npm run publish:openvsx ./ukit-css-<version>.vsix
```

Bump `version` in `editors/vscode/package.json` before every publish. It is
independent of the engine's version: the extension can be re-released (a typo in
a tooltip, a new trigger character) without a new npm release, and vice versa.
Only re-run `npm run vendor` when the engine itself changed.

### Layout

```
extension.js            activate/deactivate + all vscode plumbing
src/manifest.js         loads the vendored engine, builds the grammar index (lazily)
src/extract.js          finds class-bearing regions and the token at the caret
src/completions.js      completion logic            (pure, no vscode)
src/hover.js            hover logic                 (pure)
src/diagnostics.js      diagnostics + fix payload   (pure)
scripts/vendor.mjs      dist/manifest.cjs -> vendor/manifest.cjs
vendor/manifest.cjs     vendored engine (generated — do not edit)
test/selftest.mjs       pure-module tests
test/integration.mjs    extension.js tests with a stubbed `vscode`
```

`src/extract.js` is not in the original sketch of the tree; it exists so that
completions, hover and diagnostics share one definition of “where do class
tokens live”, instead of three drifting copies.

## Notes and deliberate scope

- **`border` + `-t`.** Breakpoint suffixes are universal with exactly one
  documented exception: `.border-t` already means `border-top`, so `border` is
  only offered the `-m` variant. The bare class `border-t` is still completed.
- **Short tokens are not diagnosed.** Tokens shorter than 3 characters (`p`,
  `mt`, `w`, `h1`) are usually a stem halfway through being typed, and the
  engine's nearest suggestion for them is misleading rather than helpful. They
  are still completed normally.
- **No second matcher.** Nothing in this extension decides whether a class is
  valid — `explainClass()` does. The only local predicates are a
  `[a-z0-9-]+` charset gate (verified against all 12,092 classes in
  `test/selftest.mjs`) and the length floor above; both only *suppress* work.
- **Defensive engine calls.** The vendored `explainClass()`/`suggestClasses()`
  throw on non-string input (`name.startsWith is not a function`). Every call
  goes through a type guard plus `try`/`catch` in `src/manifest.js`.
- **No bundler, no `@types/vscode`.** `extension.js` is plain CommonJS calling
  `require("vscode")`; JSDoc marks the intent and keeps the file readable
  without a build step.
- **Text-based extraction, not a parser.** Framework-specific parsing is
  intentionally out of scope, mirroring the engine's own permissive extractor.
  Multi-line class attributes work; a multi-line braced expression works while
  the braces are balanced (VS Code auto-closes them), which is the normal
  editing case.
- Diagnostics are skipped for documents over 2 MB, for languages outside the
  list above, and for output/debug/terminal buffers (remote and virtual
  workspaces are still scanned).
