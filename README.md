# @vcalderondev/sasskit

The definitive utility-first SASS toolkit for modern web development. Unified ruleset for layout, positioning, spacing, and typography with full responsive support.

## Installation

```bash
npm install @vcalderondev/sasskit
```

## Usage

In your main SASS file:

```sass
@use "@vcalderondev/sasskit" as rules
```

## Features

- **Utility-First**: Inspired by Tailwind but built with pure SASS power.
- **Responsive-Ready**: Every utility ships with `-m` (mobile) and `-t` (tablet) variants.
- **Modern SASS**: Uses SASS modules (`@use`, `@forward`) and modern built-ins.
- **Comprehensive**: Borders, Layout, Spacing, Typography, Display, and more.

## Modules

### Spacing
- Units: `rem`, `px`, `em`.
- Examples: `.m-1-rem`, `.pt-10px`, `.gap-20px`, `.mx-auto-m`.
- Directional: `t`, `b`, `s` (start), `e` (end), `x`, `y`.

### Typography
- Units: `rem`, `px`, `em`.
- Examples: `.fs-1-rem`, `.fs-16px`, `.fw-bold`, `.lh-1-5`.
- Legacy support for `.fs-1`, `.fs-2` aliases.

### Layout & Display
- **Display**: `.d-flex`, `.d-grid`, `.d-none`.
- **Sizing**: `.w-100`, `.h-100vh`, `.w-64px`.
- **Positioning**: `.position-absolute`, `.top-0`, `.translate-center`.
- **Z-Index**: Scale from `1` to `10,000`.

### Borders
- **Radius**: `.rounded-sm`, `.rounded-8px`, `.rounded-50-percent`.
- **Styles**: `.border-none`, `.border-s-none`.

---

License: MIT
Author: Victor Calderon <mail@vcalderon.dev>
