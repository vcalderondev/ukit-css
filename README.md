# @vcalderondev/ukit-css

JIT utility-first CSS engine — Tailwind-style on-demand class generation for any frontend stack (React, Vue, Angular, Svelte, Next.js, Astro, plain HTML).

`ukit-css` is a powerful Node + TypeScript engine that scans your source files, extracts the classes you actually use, and emits **only those** as CSS. It supports rich utility class names (`m-1-rem`, `grid-cols-3-m`, `rounded-lg`, `text-ellipsis-3`, …) while dropping your bundle size to the absolute minimum.

## Read this before you write a class name

> **JIT affects which CSS is emitted. It does not make the class language open-ended.**
> The vocabulary is finite, declared and fully enumerable: **4,726 base utilities, 14,177 including breakpoint variants**, all listed in [ukit.classes.txt](ukit.classes.txt).

Because the class language is fixed, ukit can offer everything a static library offers — autocompletion, typo detection, hover docs, editor integration — while still shipping only the CSS you use.

Two things surprise people coming from Tailwind:

| You might write | Reality in ukit | Use instead |
| --- | --- | --- |
| `p-4` | **Valid**, but it means `padding: 4px !important` — not `1rem`. A bare number is a legacy alias resolved as `em`, then `px`, then `rem`. | `p-1-rem` or `p-16px` |
| `text-sm`, `font-bold`, `items-center`, `flex-col`, `w-full` | **Do not exist.** | `fs-0-875-rem`, `fw-700`, `align-items-center`, `flex-direction-column`, `w-100` |
| `text-white`, `bg-blue-500` | **There are no colour utilities at all**, and no colour scale. | Theme with CSS variables (`--border`) or your own classes. |

The dangerous ones are in the first row: they compile, so nothing warns you, and the result is subtly wrong. The full list of these "valid but surprising" classes is in [docs/classes.md](docs/classes.md#valid-classes-that-still-surprise-you).

And the most important consequence: **an unknown class is silently ignored** — no error, no warning, no CSS. If a layout looks broken, run:

```bash
npx ukit-css validate "src/**/*.{html,tsx,vue}"
```

```
scanned 1 files · 18 candidates · 12 matched

  ⚠ d-flx → did you mean d-flex?
  ⚠ items-center → did you mean align-items-center?
  ⚠ text-sm → did you mean fs-0-875-rem?
```

## Why JIT?

| Mode                    | Output                        | Notes                                                |
| ----------------------- | ----------------------------- | ---------------------------------------------------- |
| Legacy (Static CSS)      | ~770 KB compiled & minified   | Every utility shipped, used or not                   |
| JIT (ukit-css)          | typically 2–30 KB per project | Only the classes you actually reference              |

In a real project that uses 46 distinct utilities across HTML/JSX/Vue templates, the engine emits ~2.4 KB minified — a **99.7% reduction** versus static utility libraries.

## Installation

```bash
npm install -D @vcalderondev/ukit-css
```

## Quick start (CLI)

Create a configuration file at the root of your project:

```js
// ukit.config.mjs
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}"],
  output: "./dist/ukit.css",
}
```

Then build:

```bash
npx ukit-css build
```

Or watch for changes during development:

```bash
npx ukit-css watch
```

Add `--minify` for production builds, `--output` to override the destination, or `--content` to override globs from the command line.

### All CLI commands

| Command | What it does |
| --- | --- |
| `ukit-css build` | Compile the CSS once. |
| `ukit-css watch` | Recompile on every change. |
| `ukit-css validate [glob]` | Report classes that look like utilities but match nothing, with suggestions. Exits non-zero, so it gates CI. |
| `ukit-css explain <class>...` | Show exactly what a class compiles to, its family and its breakpoint. |
| `ukit-css manifest` | Print the whole class grammar as JSON. |
| `ukit-css classes` | Print every valid class name, one per line. |

```bash
npx ukit-css explain m-1-rem-m
```
```
✓ m-1-rem-m — mobile (@media (max-width: 576px))
  family: Spacing — margin, padding, gap
  base:   m-1-rem
  css:
    .m-1-rem-m {
      margin: 1rem !important;
    }
```

## Integration recipes

### Vite (React / Vue / Svelte / vanilla)

```ts
// vite.config.ts
import { defineConfig } from "vite"
import ukit from "@vcalderondev/ukit-css/vite"

export default defineConfig({
  plugins: [ukit()],
})
```

```ts
// main.ts (or main.tsx)
import "virtual:ukit.css"
```

HMR is wired in: every time you touch a content file, the virtual stylesheet rebuilds and hot-reloads instantly.

### PostCSS (Next.js, Angular, Nuxt, Astro, Webpack, anywhere)

```js
// postcss.config.mjs
import ukit from "@vcalderondev/ukit-css/postcss"

export default {
  plugins: [ukit()],
}
```

```css
/* src/styles/app.css */
@ukit;
```

The `@ukit;` at-rule is expanded to the JIT output. If you omit it, the plugin prepends the CSS to the entry file automatically.

### Next.js (without a custom PostCSS plugin)

Use the CLI in a script and import the generated file:

```json
// package.json
{
  "scripts": {
    "css:build": "ukit-css build -o app/ukit.css --minify",
    "css:dev":   "ukit-css watch -o app/ukit.css"
  }
}
```

```tsx
// app/layout.tsx
import "./ukit.css"
```

### Angular

```json
// angular.json (excerpt)
{
  "styles": ["src/ukit.css", "src/styles.scss"]
}
```

```bash
# during development
npx ukit-css watch -o src/ukit.css
# before production build
npx ukit-css build -o src/ukit.css --minify
```

### Plain HTML

```bash
npx ukit-css build --content "./public/**/*.html" -o ./public/ukit.css --minify
```

```html
<link rel="stylesheet" href="/ukit.css" />
```

---

## Autocompletion & tooling

The class language is fixed, so tooling can be exact rather than best-effort. Four ways to get completions and feedback, all driven by the same generated grammar.

### 1. TypeScript types + `cn()`

`ukit-css` ships generated types covering the entire vocabulary. Any string literal is autocompleted, and the strict `UkitClass` type gets spelling suggestions from TypeScript itself:

```ts
import { cn, type UkitClass } from "@vcalderondev/ukit-css"

cn("d-flex", "align-items-center", isOpen && "d-none-m")   // autocompletes every class
cn(`m-${size}-rem`)                                        // dynamic values still allowed

const strict: UkitClass = "d-flx"
//    ^ Type '"d-flx"' is not assignable to type 'UkitClass'. Did you mean '"d-flex"'?
```

- `cn()` accepts the whole vocabulary for autocompletion **and** arbitrary strings, so runtime-composed class names keep working.
- `UkitClass` is the strict union (4,726 base + 14,177 with `-m`/`-t`) when you want typos to be compile errors.
- Also exported: `UkitClassName`, `UkitClassBase`, `UkitBreakpointSuffix` and one type per family (e.g. `UkitSpacing`, `UkitGridCols`).

### 2. VS Code extension

[`editors/vscode`](editors/vscode) provides completions in `class` / `className` for HTML, Vue, Svelte, Astro, JSX/TSX and more, plus hover with the emitted CSS, warnings for unknown classes and a quick fix that swaps in the closest match.

### 3. Dev-server warnings

The Vite and PostCSS plugins report unknown-but-intended classes in development, so a typo shows up in the console instead of silently producing no CSS. Disable with `diagnostics: false`.

### 4. Machine-readable grammar

```ts
import { buildManifest, listClasses, explainClass, suggestClasses } from "@vcalderondev/ukit-css/manifest"
```

| Artifact | Contents |
| --- | --- |
| [ukit.manifest.json](ukit.manifest.json) | Families, stems, every accepted value, CSS properties, breakpoint rules, Tailwind aliases. |
| [ukit.classes.txt](ukit.classes.txt) | Flat list of all 14,177 valid class names. |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents working on this repo. |
| [llms.txt](llms.txt) | Compact context file for LLMs. |
| [docs/classes.md](docs/classes.md) | Full human-readable reference. |

If you are an AI agent reading this: read [llms.txt](llms.txt) first. It contains the grammar, the traps and the tool commands in one page.

---

## Configuration

```ts
// ukit.config.mjs (or .js / .cjs / .json)
import { defineConfig } from "@vcalderondev/ukit-css"

export default defineConfig({
  // Globs scanned for class candidates. The engine reads each file as text
  // and pulls out any token that could be a utility class — so it works with
  // Angular [class.x], Vue :class, React clsx(), Svelte class:foo, etc.
  content: ["./src/**/*.{html,ts,tsx,vue,svelte}"],

  // Output path (used by the CLI). Plugins ignore this.
  output: "./dist/app.css",

  // Breakpoint overrides.
  mobile: 576,
  tablet: 992,
  desktop: 1200,

  // Toggle the CSS reset + the keyframes block.
  preflight: true,
  keyframes: true,

  // Class names to always include even if they don't appear in source files
  // (useful for classes that are composed dynamically: `m-${size}-rem`, etc.).
  safelist: ["m-1-rem", "m-2-rem", "m-3-rem"],

  // Minify the output.
  minify: false,

  // Report classes that look like utilities but match nothing, with
  // "did you mean" suggestions. Off by default; the bundler plugins turn it
  // on in development and `ukit-css validate` always enables it.
  diagnostics: false,
})
```

---

## Utility reference

Every utility ships with a base, `-m` (mobile, ≤ 576 px) and `-t` (tablet, 577–992 px) variant.

| Category   | Examples                                                                  |
| ---------- | ------------------------------------------------------------------------- |
| Display    | `d-flex`, `d-grid`, `d-none-m`                                            |
| Sizing     | `w-50`, `h-100vh`, `min-w-200px`, `max-w-90`                              |
| Spacing    | `m-1-rem`, `pt-16px`, `gap-1-5-rem`, `mx-auto`                            |
| Position   | `position-absolute`, `top-50-percent`, `left-50-percent`, `translate-center` |
| Flex       | `align-items-center`, `justify-content-between`, `flex-direction-column`  |
| Typography | `fs-1-rem`, `fw-700`, `text-center`, `lh-1-5`, `text-ellipsis-3`          |
| Borders    | `rounded-lg`, `rounded-r-12px`, `border`, `border-t`, `border-none`       |
| Grid       | `grid-cols-3`, `grid-cols-1-m`, `grid-col-span-2`, `grid-row-span-full`   |
| Z-index    | `z-1`, `z-50`, `z-9999`                                                   |
| Opacity    | `opacity-50`, `opacity-0`                                                 |
| Overflow   | `overflow-hidden`, `overflow-x-auto`                                      |
| Animate    | `animate-fade-in`, `animate-fade-in-up`, `animate-spin`, `animate-pulse`  |

Naming convention (spacing): `{prop}{dir?}-{value}[-{unit}][-{breakpoint}]`. Example: `pt-1-5-rem-m` → `padding-top: 1.5rem` on mobile.

This table is a summary. The **complete** vocabulary — every stem and every accepted value, 4,726 base classes in 44 families — lives in [docs/classes.md](docs/classes.md), and as structured data in [ukit.manifest.json](ukit.manifest.json). It is generated from the same declaration the engine is tested against, so it cannot drift. To inspect one class:

```bash
npx ukit-css explain pt-1-5-rem-m
```

---

## Programmatic API

```ts
import { build, Engine, defineConfig, cn, matchCandidate } from "@vcalderondev/ukit-css"

// One-shot build
const { css, matchedClasses, diagnostics } = await build({
  content: ["./src/**/*.tsx"],
})

// Long-lived engine (incremental rebuilds, watch mode, plugins)
const engine = new Engine({ content: ["./src/**/*.tsx"] })
await engine.scanAll()
const { css: output } = engine.build()

// Is a single class valid? (the engine's own oracle)
matchCandidate("m-1-rem")   // => { result, breakpoint, selector } | null
```

### Grammar API

```ts
import {
  buildManifest,   // the whole grammar as a plain object
  manifestJson,    // ...or as a JSON string
  listClasses,     // every valid class name
  explainClass,    // what a class compiles to
  suggestClasses,  // nearest valid names, for typo fixes
  validateClasses, // split candidates into valid / unknown / actionable
} from "@vcalderondev/ukit-css/manifest"

explainClass("d-none-m").mediaQuery   // "@media (max-width: 576px)"
suggestClasses("items-center")        // ["align-items-center"]
```

This is the same surface the CLI and the editor extensions use, so anything you build on top of it stays consistent with the engine by construction.

## License

MIT — Victor Calderon <mail@vcalderon.dev>
