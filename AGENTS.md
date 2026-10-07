# AGENTS.md

Instructions for coding agents (and humans) working **on** this repository.
If you are looking for the user-facing docs, read [README.md](README.md).

## What this package is

`@vcalderondev/ukit-css` is a **JIT utility-first CSS engine**. It scans source
files, extracts the utility class names they contain, and emits CSS for *only*
those classes. Typical output is 2–30 KB instead of the ~770 KB a static
utility library would ship.

It is **not** a framework and it is **not** Tailwind. It has no runtime, no
reset beyond a tiny preflight, and no JavaScript dependency in the browser. The
whole thing is a scanner plus a matcher table.

## The thing almost everyone gets wrong

> The JIT part affects which CSS is **emitted**. It does **not** mean the class
> language is open-ended. The vocabulary is finite, declared, and fully
> enumerable — for the exact counts see the generated table at the bottom of
> this file, plus `ukit.manifest.json` and `ukit.classes.txt`.

Consequences you must respect when editing this repo or using the package:

1. **The class names are not Tailwind's.** `p-4` is *valid* but compiles to
   `padding: 4px !important`, not `1rem` — a bare number is a legacy alias
   resolved as `em`, then `px`, then `rem`. `text-sm`, `font-bold`,
   `items-center`, `flex-col` and `w-full` do not exist at all.
2. **Unknown classes fail silently.** `buildFromCandidates()` in
   `src/core/engine.ts` calls `continue` when a candidate does not match. No
   error, no warning, no CSS. A broken layout is usually a class-name typo.
   `npx ukit-css validate <glob>` exists to surface exactly this.
3. **Never hand-write class documentation, types or manifests.** They are all
   generated from `src/core/grammar.ts` by `npm run generate`. Editing the
   generated files is a bug; `npm run generate:check` fails in CI.

## Repository layout

```
src/core/grammar.ts        declarative class grammar — THE source of truth for tooling
src/core/catalog.ts        enumeration, explain, suggestions, diagnostics, anti-drift audit
src/core/matchers/*.ts     the actual rule matchers — THE source of truth for behaviour
src/core/tokens.ts         every numeric scale and keyword list
src/core/engine.ts         scan -> match -> generate pipeline
src/core/extractor.ts      permissive candidate scanner (works for any framework)
src/manifest.ts            public entry: buildManifest / listClasses / explainClass
src/cli.ts                 ukit-css build|watch|manifest|explain|validate|classes
src/generated/classes.ts   AUTO-GENERATED: UkitClass types + cn() helper
editors/vscode/            VS Code extension that autocompletes class/className
scripts/generate.mjs       writes every derived artifact
scripts/check-vendor.mjs   guard: the extension's vendored engine must match dist
scripts/check-release.mjs  guard: version / git tag / npm registry consistency
docs/classes.md            AUTO-GENERATED full reference
ukit.manifest.json         AUTO-GENERATED machine-readable grammar
ukit.classes.txt           AUTO-GENERATED flat list of every valid class
test/                      anti-drift, manifest, docs-link and CLI-free unit tests
```

## The two sources of truth, and how they are kept honest

`src/core/matchers/*` decides what is valid. `src/core/grammar.ts` *describes*
it for tooling, types, docs and editors. A refactor that touched only one of
them would make the manifest lie, so `npm test` enforces three things:

1. **Forward** — every class enumerated in `grammar.ts` must match the real
   matcher, as a base rule and as an `-m` / `-t` variant.
2. **Backward** — every `stem-value` pair the real matcher accepts, over a fuzz
   corpus built from the grammar, must also be declared.
3. **Linkage** — every function in `MATCHER_REGISTRY`
   (`src/core/matchers/index.ts`, exported for this purpose) must be claimed by
   at least one family via its `matchers: [...]` field.

So when you add a matcher:

1. Implement and register it in `src/core/matchers/index.ts`.
2. Declare a family for it in `src/core/grammar.ts`, including `matchers`,
   `stems`/`bare` and `examples`.
3. `npm test` — the linkage test tells you if you forgot step 2.
4. `npm run generate` and commit the regenerated artifacts.

## Commands

```bash
npm install
npm run verify          # typecheck + generate:check + tests + build + vendor + extension
npm run build           # tsup bundle (esm + cjs + d.ts) into dist/
npm run typecheck       # tsc --noEmit
npm test                # anti-drift, manifest and documentation-link suites
npm run generate        # regenerate manifest, types, docs, class list, llms.txt
npm run generate:check  # CI guard: fail if any generated artifact is stale
npm run vendor          # copy dist/manifest.cjs into the VS Code extension
npm run check:vendor    # CI guard: the vendored engine must match dist
npm run test:extension  # the extension's unit + integration suites
npm run release:check   # version / git tag / npm registry consistency
npm run format          # prettier
```

`npm test` and `npm run generate` import the TypeScript sources directly
through `scripts/ts-resolve.mjs`, a Node module-resolution hook that maps
`./foo.js` to `./foo.ts`. That is why no build step is needed first — do not
"fix" those imports to `.ts`, the published bundle relies on `.js` specifiers.

## The VS Code extension

`editors/vscode` ships **zero dependencies** and a byte-identical copy of the
built engine (`dist/manifest.cjs` -> `editors/vscode/vendor/manifest.cjs`). It
uses the real `explainClass()` and `suggestClasses()`, so hovers show the exact
CSS and suggestions can never drift from the matchers.

Therefore: **after changing anything in `src/`, run `npm run build && npm run vendor`**
and commit the refreshed `vendor/manifest.cjs`. `npm run check:vendor` fails in
CI if the copy is stale. The extension's own pure logic lives in
`editors/vscode/src/` and is tested without VS Code, so `npm run test:extension`
runs anywhere Node runs.

## Releasing

There are **two independent artifacts** with independent versions:

| Artifact | Version lives in | Workflow | Trigger |
| --- | --- | --- | --- |
| npm package | `package.json` + `src/core/version.ts` (must match) | `publish.yml` | push to `main` |
| VS Code extension | `editors/vscode/package.json` | `publish-extension.yml` | manual dispatch, or an `extension-v*` tag |

The npm workflow skips silently when the version is already on the registry. The
extension workflow defaults to `dry_run: true` because a Marketplace version can
never be reused, and it refuses to upload when the version already exists.

The extension needs two one-time things that cannot be automated from here:

1. A publisher on the Marketplace whose **ID matches the `publisher` field**
   (`vcalderondev`). It does not exist yet — `vsce publish` fails with
   "publisher not found" until it is created at
   <https://marketplace.visualstudio.com/manage>.
2. A `VSCE_PAT` secret (Azure DevOps PAT scoped to **Marketplace → Manage**).
   For Antigravity/Cursor/Windsurf/VSCodium, an `OVSX_PAT` for Open VSX too.

Run `npm run release:check` before any release; it audits the version against npm
and reports git tags that belong to other package identities.

## Conventions

- **Class-name shape is `{stem}-{value}[-m|-t]`.** Decimals become dashes
  (`1.5rem` → `1-5-rem`); `px` attaches directly (`p-16px`); `rem`, `em`, `vh`
  and `vw` use a dash (`p-1-5-rem`).
- **Every utility is emitted with `!important`**, except `animate-*`, which is
  deliberately overridable.
- **Breakpoint suffixes are universal** (`-m` = ≤576px, `-t` = 577–992px) with
  exactly one documented exception, derived by `shadowedSuffixes()`: `.border`
  cannot take `-t` because `.border-t` already means border-top and the engine
  resolves the raw name first.
- **Output order is deterministic**: rules sort by `(category, priority,
  selector)`. Keep new matchers inside an existing `category` unless the
  cascade demands otherwise, and never rely on declaration order alone.
- **The extractor stays permissive.** It intentionally does not parse
  HTML/JSX/Vue; it grabs bare tokens and lets the matchers decide. Do not add
  framework-specific parsing.
- Bump `src/core/version.ts` and `package.json` together — a test asserts they
  match, and the manifest embeds the version.

## Vocabulary

<!-- BEGIN GENERATED:FAMILIES -->

<!-- generated from src/core/grammar.ts — 4703 base utilities, 14108 with breakpoints -->

| Family | Stems | Examples |
| --- | --- | --- |
| Background reset | `bg-transparent` `bg-none` | `bg-transparent`, `bg-none` |
| Cursor | `cursor-` | `cursor-pointer`, `cursor-not-allowed`, `cursor-grab` |
| Outline | `outline-none` | `outline-none` |
| Pointer events | `pointer-events-none` `pointer-events-auto` | `pointer-events-none` |
| Display | `d-` | `d-flex`, `d-grid`, `d-none`, `d-none-m`, `d-block-i` |
| Sizing — percentages | `w-` `h-` | `w-50`, `h-100`, `w-100-m` |
| Sizing — fixed pixels | `w-` `h-` `max-w-` `min-w-` `max-h-` `min-h-` | `w-320px`, `h-64px`, `max-w-1200`, `min-h-100vh`, `max-w-90-percent` |
| Sizing — viewport | `w-` `h-` | `w-100vw`, `h-100vh`, `h-50vh` |
| Sizing — intrinsic & auto | `w-max-content` `w-min-content` `w-fit-content` `h-max-content` `h-min-content` `h-fit-content` `w-auto` `h-auto` | `w-fit-content`, `h-auto`, `w-max-content` |
| Position | `position-` | `position-relative`, `position-absolute`, `position-fixed` |
| Offsets | `top-` `bottom-` `left-` `right-` `start-` `end-` | `top-0`, `left-50-percent`, `bottom-16px`, `start-50`, `right-neg-5px` |
| Transform helpers | `translate-x-center` `translate-x-neg-50` `translate-y-center` `translate-y-neg-50` `translate-center` `translate-middle` `transform-none` `rotate-90` | `translate-center`, `translate-x-center`, `rotate-90` |
| Float | `float-` | `float-left`, `float-right` |
| Clearfix | `clearfix` | `clearfix` |
| Vertical align | `align-` | `align-middle`, `align-top` |
| Flex alignment | `align-items-` `align-self-` `align-content-` | `align-items-center`, `align-self-start`, `align-content-stretch` |
| Justification | `justify-content-` `justify-items-` `justify-self-` | `justify-content-between`, `justify-content-center`, `justify-items-center` |
| Flex shorthand & wrap | `flex-` | `flex-1`, `flex-none`, `flex-wrap` |
| Flex grow / shrink | `flex-grow-0` `flex-grow-1` `flex-shrink-0` `flex-shrink-1` | `flex-grow-1`, `flex-shrink-0` |
| Flex direction | `flex-direction-` | `flex-direction-column`, `flex-direction-row` |
| Flex flow | `flex-flow-` | `flex-flow-row-wrap` |
| Object fit | `object-` | `object-cover`, `object-contain` |
| Z-index | `z-` | `z-1`, `z-50`, `z-200`, `z-9999` |
| Overflow | `overflow-` `overflow-x-` `overflow-y-` | `overflow-hidden`, `overflow-x-auto` |
| Opacity | `opacity-` | `opacity-0`, `opacity-50`, `opacity-100` |
| Spacing — margin, padding, gap | `m-` `mt-` `mb-` `ml-` `mr-` `ms-` `me-` `mx-` `my-` `p-` `pt-` `pb-` `pl-` `pr-` `ps-` `pe-` `px-` `py-` `gap-` | `m-1-rem`, `pt-16px`, `mx-auto`, `gap-1-5-rem`, `p-2-5-rem-m` |
| Font size | `fs-` | `fs-1-rem`, `fs-16px`, `fs-1-5-rem` |
| Font weight | `fw-` | `fw-400`, `fw-700`, `fw-bold` |
| Text align, transform & ellipsis | `text-` | `text-center`, `text-uppercase`, `text-ellipsis-3` |
| Line height | `lh-` | `lh-1`, `lh-1-2`, `lh-1-5`, `lh-4-5` |
| White space | `ws-` | `ws-nowrap`, `ws-pre-wrap` |
| Letter spacing | `letter-spacing-` | `letter-spacing-1`, `letter-spacing-0-5px`, `letter-spacing-0-1-em`, `letter-spacing-neg-2` |
| Border radius | `rounded-` `border-radius-` | `rounded-lg`, `rounded-full`, `rounded-r-12px` |
| Borders | `border` `border-none` `border-transparent` `border-t` `border-b` `border-l` `border-r` `border-s` `border-e` `border-t-none` `border-b-none` `border-l-none` `border-r-none` `border-s-none` `border-e-none` | `border`, `border-t`, `border-none` |
| Grid columns | `grid-cols-` | `grid-cols-3`, `grid-cols-1-m` |
| Grid column span | `grid-col-span-` | `grid-col-span-2` |
| Grid rows | `grid-rows-` | `grid-rows-2` |
| Grid row span | `grid-row-span-` | `grid-row-span-2` |
| Grid auto flow | `grid-flow-` | `grid-flow-row`, `grid-flow-col-dense` |
| Animations | `animate-fade-in` `animate-fade-in-up` `animate-fade-in-scale` `animate-slide-in-right` `animate-spin` `animate-pulse` | `animate-fade-in`, `animate-spin`, `animate-pulse` |

<!-- END GENERATED:FAMILIES -->

Full per-stem value tables: [docs/classes.md](docs/classes.md). Structured
data: [ukit.manifest.json](ukit.manifest.json).
