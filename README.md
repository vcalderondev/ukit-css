# @vcalderondev/sass-ruleset

Unified SASS ruleset for layout, positioning, and spacing.

## Installation

```bash
npm install @vcalderondev/sass-ruleset
```

## Usage

In your main SASS file:

```sass
@use "@vcalderondev/sass-ruleset" as rules
```

## Utilities

### Display
- `.d-flex`, `.d-grid`, `.d-block`, `.d-none`...
- Responsive: `.d-none-m` (mobile), `.d-none-t` (tablet).

### Spacing
- Units: `rem`, `px`, `em`.
- Examples:
  - `.m-1-rem` (1rem)
  - `.m-0-5-rem` (0.5rem)
  - `.m-10px` (10px)
  - `.m-1-em` (1em)
  - `.gap-5px` (5px gap)
  - `.gap-1-5-rem` (1.5rem gap)
  - `.mx-auto`, `.ms-auto`, `.me-auto`
- Directions: `t` (top), `b` (bottom), `l` (left), `r` (right), `s` (start), `e` (end), `x`, `y`.
- Responsive: `.m-1-rem-m`, `.m-10px-t`.

### Typography
- `.fs-15px` (15px)
- `.fs-1-rem` (1rem)
- `.fs-1-em` (1em)
- `.fs-0-875-rem` (0.875rem)
- `.fw-bold`, `.fw-500`.
- `.text-center`, `.text-uppercase`.

### Layout
- `.w-100`, `.h-100`, `.w-max-content`.
- `.position-relative`, `.position-absolute`.
- `.flex-1`, `.justify-content-center`, `.align-items-center`.

### Animations
- `.animate-fade-in`, `.animate-fade-in-up`, `.animate-spin`.
