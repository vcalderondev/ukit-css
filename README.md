# @vcalderondev/sasskit

JIT utility-first CSS engine — Tailwind-style on-demand class generation for any frontend stack (React, Vue, Angular, Svelte, Next.js, Astro, plain HTML).

`v3.0` is a **complete rewrite**: the SASS-based ruleset became a Node + TypeScript engine that scans your source files, extracts the classes you actually use, and emits **only those** as CSS. The same class names you already know (`m-1-rem`, `grid-cols-3-m`, `rounded-lg`, `text-ellipsis-3`, …) keep working — but your bundle drops from hundreds of kilobytes to a couple of kilobytes.

## Why JIT?

| Mode                    | Output                        | Notes                                                |
| ----------------------- | ----------------------------- | ---------------------------------------------------- |
| `v2.x` (full SASS)      | ~770 KB compiled & minified   | Every utility shipped, used or not                   |
| `v3.x` (JIT)            | typically 2–30 KB per project | Only the classes you actually reference              |

In a real demo project that uses 46 distinct utilities across HTML/JSX/Vue templates the engine emits ~2.4 KB minified — a **99.7% reduction** versus the legacy build.

## Installation

```bash
npm install -D @vcalderondev/sasskit
```

## Quick start (CLI)

Create a config file at the root of your project:

```js
// sasskit.config.mjs
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}"],
  output: "./dist/sasskit.css",
}
```

Then build:

```bash
npx sasskit build
```

Or watch for changes during development:

```bash
npx sasskit watch
```

Add `--minify` for production builds, `--output` to override the destination, `--content` to add globs from the command line.

## Integration recipes

### Vite (React / Vue / Svelte / vanilla)

```ts
// vite.config.ts
import { defineConfig } from "vite"
import sasskit from "@vcalderondev/sasskit/vite"

export default defineConfig({
  plugins: [sasskit()],
})
```

```ts
// main.ts (or main.tsx)
import "virtual:sasskit.css"
```

HMR is wired in: every time you touch a content file the virtual stylesheet rebuilds and hot-reloads.

### PostCSS (Next.js, Angular, Nuxt, Astro, Webpack, anywhere)

```js
// postcss.config.mjs
import sasskit from "@vcalderondev/sasskit/postcss"

export default {
  plugins: [sasskit()],
}
```

```css
/* src/styles/app.css */
@sasskit;
```

The `@sasskit;` at-rule is expanded to the JIT output. If you omit it the plugin prepends the CSS to the entry file automatically.

### Next.js (without a custom PostCSS plugin)

Use the CLI in a script and import the generated file:

```jsonc
// package.json
{
  "scripts": {
    "css:build": "sasskit build -o app/sasskit.css --minify",
    "css:dev":   "sasskit watch -o app/sasskit.css"
  }
}
```

```tsx
// app/layout.tsx
import "./sasskit.css"
```

### Angular

```jsonc
// angular.json (excerpt)
{
  "styles": ["src/sasskit.css", "src/styles.scss"]
}
```

```bash
# during development
npx sasskit watch -o src/sasskit.css
# before production build
npx sasskit build -o src/sasskit.css --minify
```

### Plain HTML

```bash
npx sasskit build --content "./public/**/*.html" -o ./public/sasskit.css --minify
```

```html
<link rel="stylesheet" href="/sasskit.css" />
```

## Configuration

```ts
// sasskit.config.mjs (or .js / .cjs / .json)
import { defineConfig } from "@vcalderondev/sasskit"

export default defineConfig({
  // Globs scanned for class candidates. The engine reads each file as text
  // and pulls out any token that could be a utility class — so it works with
  // Angular [class.x], Vue :class, React clsx(), Svelte class:foo, etc.
  content: ["./src/**/*.{html,ts,tsx,vue,svelte}"],

  // Output path (used by the CLI). Plugins ignore this.
  output: "./dist/app.css",

  // Breakpoint overrides — same defaults as the legacy SASS package.
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
})
```

## Utility reference

The class vocabulary is unchanged from `v2.x`. Every utility ships with a base, `-m` (mobile, ≤ 576 px) and `-t` (tablet, 577–992 px) variant.

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

For the full vocabulary refer to the matchers in `src/core/matchers/` — each file documents the patterns it recognises.

## Programmatic API

```ts
import { build, Engine, defineConfig } from "@vcalderondev/sasskit"

// One-shot build
const { css, matchedClasses } = await build({
  content: ["./src/**/*.tsx"],
})

// Long-lived engine (incremental rebuilds, watch mode, plugins)
const engine = new Engine({ content: ["./src/**/*.tsx"] })
await engine.scanAll()
const { css: output } = engine.build()
```

## Migrating from v2.x

The class names are identical, so 95 % of projects just need to swap the SASS import for the JIT setup:

```diff
- // styles.sass
- @use "@vcalderondev/sasskit" as rules
+ // postcss.config.mjs (or vite.config.ts / CLI)
+ import sasskit from "@vcalderondev/sasskit/postcss"
+ export default { plugins: [sasskit()] }
```

`v2.x` will keep working on npm under that major; install it explicitly if you need the legacy SASS-only build:

```bash
npm install @vcalderondev/sasskit@^2
```

## License

MIT — Victor Calderon &lt;mail@vcalderon.dev&gt;
