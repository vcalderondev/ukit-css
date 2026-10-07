'use strict';

// src/core/tokens.ts
var DEFAULT_BREAKPOINTS = {
  mobile: 576,
  tablet: 992,
  desktop: 1200
};
var REM_VALUES = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5];
var PX_VALUES = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  30,
  32,
  35,
  40,
  45,
  48,
  50,
  60,
  64,
  80,
  100
];
var EM_VALUES = [1, 1.5, 2];
var VIEWPORT_SPACING = [5, 10, 15, 20, 25, 30, 40, 50];
var DISPLAYS = [
  "none",
  "inline-block",
  "inline",
  "block",
  "grid",
  "inline-grid",
  "flex",
  "inline-flex"
];
var POSITIONS = ["relative", "absolute", "fixed", "sticky"];
var SIZE_PERCENTS = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
var VIEWPORT_SIZES = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
var COMMON_FIXED_SIZES = [
  80,
  100,
  120,
  140,
  160,
  180,
  200,
  240,
  280,
  300,
  320,
  360,
  400,
  420,
  450,
  480,
  500,
  550,
  600,
  700,
  750,
  800,
  920,
  1e3,
  1200
];
var OPACITIES = [
  0,
  2,
  4,
  5,
  10,
  15,
  20,
  25,
  30,
  40,
  50,
  60,
  70,
  75,
  80,
  85,
  90,
  100
];
var OVERFLOWS = ["auto", "hidden", "scroll", "visible"];
var CURSORS = [
  "pointer",
  "default",
  "move",
  "not-allowed",
  "help",
  "wait",
  "text",
  "grab",
  "grabbing",
  "zoom-in",
  "zoom-out"
];
var OBJECT_FITS = ["cover", "contain", "fill", "none", "scale-down"];
var BORDER_RADIUS_PX = [
  0,
  1,
  2,
  4,
  6,
  8,
  10,
  11,
  12,
  14,
  16,
  20,
  24,
  28,
  30,
  32,
  40
];
var BORDER_RADIUS_NAMED = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px"
};
var RADIUS_SIDES = {
  t: ["top-left", "top-right"],
  b: ["bottom-left", "bottom-right"],
  l: ["top-left", "bottom-left"],
  r: ["top-right", "bottom-right"]
};
var FS_PX_VALUES = [
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  18,
  20,
  22,
  24,
  26,
  28,
  32,
  36,
  38,
  40,
  42,
  48,
  56,
  64,
  86,
  108
];
var FS_REM_VALUES = [
  0.5,
  0.6,
  0.65,
  0.7,
  0.75,
  0.78,
  0.8,
  0.85,
  0.875,
  0.9,
  0.95,
  1,
  1.1,
  1.2,
  1.25,
  1.3,
  1.4,
  1.5,
  1.75,
  1.8,
  2,
  2.5,
  3,
  4,
  5
];
var FS_EM_VALUES = [1, 1.2, 1.5, 2];
var FONT_WEIGHTS = {
  "100": "100",
  "200": "200",
  "300": "300",
  "400": "400",
  "500": "500",
  "600": "600",
  "700": "700",
  "800": "800",
  "900": "900",
  bold: "bold",
  normal: "normal"
};
var TEXT_ALIGNS = ["left", "center", "right", "justify", "start", "end"];
var TEXT_TRANSFORMS = ["uppercase", "lowercase", "capitalize", "none"];
var WHITE_SPACES = [
  "nowrap",
  "normal",
  "pre",
  "pre-wrap",
  "pre-line",
  "break-spaces"
];
var LETTER_SPACING_EM = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2];
var ALIGN_VALUES = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
  "flex-start": "flex-start",
  "flex-end": "flex-end",
  baseline: "baseline",
  stretch: "stretch"
};
var JUSTIFY_VALUES = {
  center: "center",
  right: "right",
  left: "left",
  start: "flex-start",
  end: "flex-end",
  "flex-start": "flex-start",
  "flex-end": "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
var FLEX_WRAPS = ["nowrap", "wrap", "wrap-reverse"];
var FLEX_DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"];
var FLEX_FLOW_VALUES = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
  "nowrap",
  "wrap",
  "wrap-reverse"
];
var Z_EXTREME = [500, 1e3, 2e3, 5e3, 9999, 1e4];
var SIDES = ["top", "bottom", "left", "right", "start", "end"];
var SIDE_TO_PROP = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  start: "left",
  end: "right"
};
var OFFSET_ANCHORS = {
  "0": "0",
  "50-percent": "50%",
  "50": "50%"
};
var TRANSFORM_UTILS = {
  "translate-x-center": "translateX(-50%)",
  "translate-x-neg-50": "translateX(-50%)",
  "translate-y-center": "translateY(-50%)",
  "translate-y-neg-50": "translateY(-50%)",
  "translate-center": "translate(-50%, -50%)",
  "translate-middle": "translate(-50%, -50%)",
  "transform-none": "none",
  "rotate-90": "rotate(90deg)"
};
var FLOAT_VALUES = {
  left: "left",
  right: "right",
  none: "none",
  start: "left",
  end: "right"
};
var VERTICAL_ALIGNS = [
  "baseline",
  "top",
  "middle",
  "bottom",
  "sub",
  "super",
  "text-top",
  "text-bottom"
];
var GRID_FLOW_MAP = {
  row: "row",
  col: "column",
  dense: "dense",
  "row-dense": "row dense",
  "col-dense": "column dense"
};
var dasherize = (n) => String(n).replace(/\./g, "-");
var toSet = (arr) => new Set(arr.map(String));
var REM_SET = toSet(REM_VALUES.map(dasherize));
var PX_SET = toSet(PX_VALUES);
var EM_SET = toSet(EM_VALUES.map(dasherize));
var FS_PX_SET = toSet(FS_PX_VALUES);
var FS_REM_SET = toSet(FS_REM_VALUES.map(dasherize));
var FS_EM_SET = toSet(FS_EM_VALUES.map(dasherize));
var SIZE_PERCENT_SET = toSet(SIZE_PERCENTS);
toSet(OPACITIES);
var VIEWPORT_SIZE_SET = toSet(VIEWPORT_SIZES);
var VIEWPORT_SPACING_SET = toSet(VIEWPORT_SPACING);
var BORDER_RADIUS_PX_SET = toSet(BORDER_RADIUS_PX);
var Z_EXTREME_SET = toSet(Z_EXTREME);
var LETTER_SPACING_EM_SET = toSet(LETTER_SPACING_EM.map(dasherize));

// src/core/matchers/helpers.ts
var dashToDot = (s) => s.replace(/-/g, ".");
var decl = (prop, value, extra) => ({
  decls: { [prop]: value },
  important: true,
  ...extra
});
var declMany = (decls, extra) => ({
  decls,
  important: true,
  ...extra
});

// src/core/matchers/sizing.ts
var FIXED_SIZE_SET = /* @__PURE__ */ new Set();
for (let i = 0; i <= 64; i++) FIXED_SIZE_SET.add(String(i));
for (const s of COMMON_FIXED_SIZES) FIXED_SIZE_SET.add(String(s));
function matchSizePercent(name) {
  let prop;
  let rest;
  if (name.startsWith("w-")) {
    prop = "width";
    rest = name.slice(2);
  } else if (name.startsWith("h-")) {
    prop = "height";
    rest = name.slice(2);
  } else {
    return null;
  }
  if (!SIZE_PERCENT_SET.has(rest)) return null;
  return decl(prop, `${rest}%`, { category: 3 });
}
function matchViewportSize(name) {
  let vMatch = name.match(/^w-(\d+)vw$/);
  if (vMatch && VIEWPORT_SIZE_SET.has(vMatch[1]))
    return decl("width", `${vMatch[1]}vw`, { category: 3 });
  vMatch = name.match(/^h-(\d+)vh$/);
  if (vMatch && VIEWPORT_SIZE_SET.has(vMatch[1]))
    return decl("height", `${vMatch[1]}vh`, { category: 3 });
  return null;
}
function matchContentSize(name) {
  if (name === "w-max-content") return decl("width", "max-content", { category: 3 });
  if (name === "w-min-content") return decl("width", "min-content", { category: 3 });
  if (name === "w-fit-content") return decl("width", "fit-content", { category: 3 });
  if (name === "h-max-content") return decl("height", "max-content", { category: 3 });
  if (name === "h-min-content") return decl("height", "min-content", { category: 3 });
  if (name === "h-fit-content") return decl("height", "fit-content", { category: 3 });
  if (name === "h-auto") return decl("height", "auto", { category: 3 });
  if (name === "w-auto") return decl("width", "auto", { category: 3 });
  return null;
}
var FIXED_PROP_MAP = {
  w: "width",
  h: "height",
  "max-w": "max-width",
  "min-w": "min-width",
  "min-h": "min-height",
  "max-h": "max-height"
};
var FIXED_LEGACY_PROPS = {
  "max-w": "max-width",
  "min-w": "min-width",
  "min-h": "min-height",
  "max-h": "max-height"
};
function matchFixedSize(name) {
  const orderedPrefixes = ["max-w", "min-w", "max-h", "min-h", "w", "h"];
  for (const prefix of orderedPrefixes) {
    if (!name.startsWith(`${prefix}-`)) continue;
    const rest = name.slice(prefix.length + 1);
    const px = rest.match(/^(\d+)px$/);
    if (px && FIXED_SIZE_SET.has(px[1])) {
      return decl(FIXED_PROP_MAP[prefix], `${px[1]}px`, { category: 3 });
    }
    if (FIXED_LEGACY_PROPS[prefix] && /^\d+$/.test(rest) && FIXED_SIZE_SET.has(rest)) {
      return decl(FIXED_LEGACY_PROPS[prefix], `${rest}px`, { category: 3 });
    }
  }
  return null;
}
function matchVwVhAlias(name) {
  if (name === "w-100vw") return decl("width", "100vw", { category: 3 });
  if (name === "h-100vh") return decl("height", "100vh", { category: 3 });
  return null;
}

// src/core/matchers/animate.ts
var ANIMATIONS = {
  "animate-fade-in": "fadeIn 0.3s ease-in-out",
  "animate-fade-in-up": "fadeInUp 0.4s ease-out",
  "animate-fade-in-scale": "fadeInScale 0.3s ease-out",
  "animate-slide-in-right": "slideInRight 0.4s ease-out",
  "animate-spin": "spin 1s linear infinite",
  "animate-pulse": "pulse 2s infinite ease-in-out"
};
var ANIMATION_KEYFRAMES = {
  "animate-fade-in": "fadeIn",
  "animate-fade-in-up": "fadeInUp",
  "animate-fade-in-scale": "fadeInScale",
  "animate-slide-in-right": "slideInRight",
  "animate-spin": "spin",
  "animate-pulse": "pulse"
};
function matchAnimate(name) {
  if (ANIMATIONS[name] === void 0) return null;
  return decl("animation", ANIMATIONS[name], {
    category: 11,
    important: false
  });
}

// src/core/grammar.ts
var strings = (xs) => xs.map(String);
var stem = (name, values, targets) => ({ stem: name, values: strings(values), targets });
var range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
var FIXED_SIZES = [...FIXED_SIZE_SET].map(Number).sort((a, b) => a - b);
var REM_DASHED = REM_VALUES.map(dasherize);
var EM_DASHED = EM_VALUES.map(dasherize);
var SPACING_UNIT_VALUES = [
  ...strings(PX_VALUES).map((n) => `${n}px`),
  ...REM_DASHED.map((v) => `${v}-rem`),
  ...EM_DASHED.map((v) => `${v}-em`),
  ...strings(VIEWPORT_SPACING).map((n) => `${n}vh`),
  ...strings(VIEWPORT_SPACING).map((n) => `${n}vw`)
];
var SPACING_BARE_VALUES = [...EM_DASHED, ...strings(PX_VALUES), ...REM_DASHED];
var SPACING_VALUES = [...SPACING_UNIT_VALUES, ...SPACING_BARE_VALUES];
var RADIUS_VALUES = [
  ...Object.keys(BORDER_RADIUS_NAMED),
  "50-percent",
  ...strings(BORDER_RADIUS_PX).map((n) => `${n}px`),
  ...["t", "b", "l", "r"].flatMap(
    (side) => strings(BORDER_RADIUS_PX).map((n) => `${side}-${n}px`)
  )
];
var FS_VALUES = [
  ...strings(FS_PX_VALUES).map((n) => `${n}px`),
  ...strings(FS_REM_VALUES.map(dasherize)).map((v) => `${v}-rem`),
  ...strings(FS_EM_VALUES.map(dasherize)).map((v) => `${v}-em`),
  ...strings(FS_REM_VALUES.map(dasherize))
];
var LETTER_SPACING_VALUES = [
  ...range(1, 10).map(String),
  ...range(1, 10).map((n) => `${n}px`),
  ...range(1, 10).map((n) => `neg-${n}`),
  ...range(1, 10).map((n) => `neg-${n}px`),
  ...LETTER_SPACING_EM.map(dasherize).map((v) => `${v}-em`),
  ...LETTER_SPACING_EM.map(dasherize).map((v) => `neg-${v}-em`)
];
var Z_VALUES = [
  ...range(1, 10),
  ...range(1, 10).map((n) => n * 10),
  ...Z_EXTREME
].map(String);
var OFFSET_VALUES = [
  ...Object.keys(OFFSET_ANCHORS),
  ...strings(PX_VALUES).map((n) => `${n}px`),
  ...REM_DASHED.map((v) => `${v}-rem`),
  ...EM_DASHED.map((v) => `${v}-em`)
];
var SPACING_DIRECTIONS = [
  "m",
  "mt",
  "mb",
  "ml",
  "mr",
  "ms",
  "me",
  "mx",
  "my",
  "p",
  "pt",
  "pb",
  "pl",
  "pr",
  "ps",
  "pe",
  "px",
  "py"
];
var AUTO_MARGINS = ["m-auto", "mt-auto", "mb-auto", "ms-auto", "me-auto", "mx-auto", "my-auto"];
var SPACING_TARGETS = {
  m: "margin",
  mt: "margin-top",
  mb: "margin-bottom",
  ml: "margin-left",
  mr: "margin-right",
  ms: "margin-left",
  me: "margin-right",
  mx: "margin-left + margin-right",
  my: "margin-top + margin-bottom",
  p: "padding",
  pt: "padding-top",
  pb: "padding-bottom",
  pl: "padding-left",
  pr: "padding-right",
  ps: "padding-left",
  pe: "padding-right",
  px: "padding-left + padding-right",
  py: "padding-top + padding-bottom"
};
var SIZING_FIXED_PX = [...FIXED_SIZES].map((n) => `${n}px`);
var SIZING_LEGACY = [...FIXED_SIZES].map(String);
var FAMILIES = [
  {
    id: "background",
    title: "Background reset",
    summary: "Clears the background or sets it to transparent.",
    matchers: ["matchBackground"],
    bare: ["bg-transparent", "bg-none"],
    cssProperties: ["background"],
    examples: ["bg-transparent", "bg-none"]
  },
  {
    id: "cursor",
    title: "Cursor",
    summary: "Sets the mouse cursor, e.g. `cursor-pointer`.",
    matchers: ["matchCursor"],
    stems: [stem("cursor", CURSORS, "cursor")],
    cssProperties: ["cursor"],
    examples: ["cursor-pointer", "cursor-not-allowed", "cursor-grab"]
  },
  {
    id: "outline",
    title: "Outline",
    summary: "Removes the focus outline.",
    matchers: ["matchOutlineNone"],
    bare: ["outline-none"],
    cssProperties: ["outline"],
    examples: ["outline-none"]
  },
  {
    id: "pointer-events",
    title: "Pointer events",
    summary: "Enables or disables pointer interaction.",
    matchers: ["matchPointerEvents"],
    bare: ["pointer-events-none", "pointer-events-auto"],
    cssProperties: ["pointer-events"],
    examples: ["pointer-events-none"]
  },
  // --- Display ---------------------------------------------------------------
  {
    id: "display",
    title: "Display",
    summary: "Sets the `display` value, e.g. `d-flex`, `d-none`, `d-grid`.",
    matchers: ["matchDisplay"],
    stems: [
      stem("d", [...DISPLAYS, ...DISPLAYS.map((d) => `${d}-i`)], "display")
    ],
    cssProperties: ["display"],
    examples: ["d-flex", "d-grid", "d-none", "d-none-m", "d-block-i"],
    docs: "The `-i` variant is an explicit alias kept for parity with the legacy stylesheet; it emits the same declarations."
  },
  // --- Sizing ----------------------------------------------------------------
  {
    id: "sizing-percent",
    title: "Sizing \u2014 percentages",
    summary: "Percentage width/height: `w-50` is `width: 50%`.",
    matchers: ["matchSizePercent"],
    stems: [
      stem("w", SIZE_PERCENTS, "width"),
      stem("h", SIZE_PERCENTS, "height")
    ],
    cssProperties: ["width", "height"],
    examples: ["w-50", "h-100", "w-100-m"],
    docs: "A bare number is always a percentage. Use `w-100px` or `w-100vw` for other units."
  },
  {
    id: "sizing-fixed",
    title: "Sizing \u2014 fixed pixels",
    summary: "Pixel width/height and min/max constraints: `w-320px`, `max-w-1200`.",
    matchers: ["matchFixedSize"],
    stems: [
      stem("w", SIZING_FIXED_PX, "width"),
      stem("h", SIZING_FIXED_PX, "height"),
      stem("max-w", [...SIZING_FIXED_PX, ...SIZING_LEGACY], "max-width"),
      stem("min-w", [...SIZING_FIXED_PX, ...SIZING_LEGACY], "min-width"),
      stem("max-h", [...SIZING_FIXED_PX, ...SIZING_LEGACY], "max-height"),
      stem("min-h", [...SIZING_FIXED_PX, ...SIZING_LEGACY], "min-height")
    ],
    cssProperties: ["width", "height", "max-width", "min-width", "max-height", "min-height"],
    examples: ["w-320px", "h-64px", "max-w-1200", "min-h-100"]
  },
  {
    id: "sizing-viewport",
    title: "Sizing \u2014 viewport",
    summary: "Viewport-relative sizing: `w-100vw`, `h-50vh`.",
    matchers: ["matchViewportSize", "matchVwVhAlias"],
    stems: [
      stem("w", strings(VIEWPORT_SIZES).map((n) => `${n}vw`), "width"),
      stem("h", strings(VIEWPORT_SIZES).map((n) => `${n}vh`), "height")
    ],
    cssProperties: ["width", "height"],
    examples: ["w-100vw", "h-100vh", "h-50vh"]
  },
  {
    id: "sizing-content",
    title: "Sizing \u2014 intrinsic & auto",
    summary: "Content-driven sizing shortcuts: `w-fit-content`, `h-auto`.",
    matchers: ["matchContentSize"],
    bare: [
      "w-max-content",
      "w-min-content",
      "w-fit-content",
      "h-max-content",
      "h-min-content",
      "h-fit-content",
      "w-auto",
      "h-auto"
    ],
    cssProperties: ["width", "height"],
    examples: ["w-fit-content", "h-auto", "w-max-content"]
  },
  // --- Position --------------------------------------------------------------
  {
    id: "position",
    title: "Position",
    summary: "Sets the `position` value: `position-absolute`, `position-sticky`.",
    matchers: ["matchPosition"],
    stems: [stem("position", POSITIONS, "position")],
    cssProperties: ["position"],
    examples: ["position-relative", "position-absolute", "position-fixed"]
  },
  {
    id: "offset",
    title: "Offsets",
    summary: "Edge offsets in px/rem/em or anchors: `top-0`, `left-50-percent`, `top-16px`, `right-1-5-rem`.",
    matchers: ["matchOffset"],
    stems: SIDES.map((side) => stem(side, OFFSET_VALUES, side)),
    cssProperties: ["top", "bottom", "left", "right"],
    examples: ["top-0", "left-50-percent", "bottom-16px", "start-50"],
    docs: "`start` maps to `left` and `end` maps to `right`, mirroring the logical-side helpers."
  },
  {
    id: "transform",
    title: "Transform helpers",
    summary: "Named transform shortcuts for centring and rotating.",
    matchers: ["matchTransform"],
    bare: Object.keys(TRANSFORM_UTILS),
    cssProperties: ["transform"],
    examples: ["translate-center", "translate-x-center", "rotate-90"]
  },
  {
    id: "float",
    title: "Float",
    summary: "Floats an element: `float-left`, `float-right`.",
    matchers: ["matchFloat"],
    stems: [stem("float", Object.keys(FLOAT_VALUES), "float")],
    cssProperties: ["float"],
    examples: ["float-left", "float-right"]
  },
  {
    id: "clearfix",
    title: "Clearfix",
    summary: "Clears floats.",
    matchers: ["matchClearfix"],
    bare: ["clearfix"],
    cssProperties: ["clear"],
    examples: ["clearfix"]
  },
  {
    id: "vertical-align",
    title: "Vertical align",
    summary: "`vertical-align` keywords: `align-middle`, `align-top`.",
    matchers: ["matchVerticalAlign"],
    stems: [stem("align", VERTICAL_ALIGNS, "vertical-align")],
    cssProperties: ["vertical-align"],
    examples: ["align-middle", "align-top"],
    docs: "Not to be confused with `align-items-*`, which is flexbox alignment."
  },
  // --- Flexbox ---------------------------------------------------------------
  {
    id: "align",
    title: "Flex alignment",
    summary: "`align-items`, `align-self`, `align-content`: `align-items-center`.",
    matchers: ["matchAlignment"],
    stems: [
      stem("align-items", Object.keys(ALIGN_VALUES), "align-items"),
      stem("align-self", Object.keys(ALIGN_VALUES), "align-self"),
      stem("align-content", Object.keys(ALIGN_VALUES), "align-content")
    ],
    cssProperties: ["align-items", "align-self", "align-content"],
    examples: ["align-items-center", "align-self-start", "align-content-stretch"]
  },
  {
    id: "justify",
    title: "Justification",
    summary: "`justify-content`, `justify-items`, `justify-self`: `justify-content-between`.",
    matchers: ["matchJustification"],
    stems: [
      stem("justify-content", Object.keys(JUSTIFY_VALUES), "justify-content"),
      stem("justify-items", Object.keys(JUSTIFY_VALUES), "justify-items"),
      stem("justify-self", Object.keys(JUSTIFY_VALUES), "justify-self")
    ],
    cssProperties: ["justify-content", "justify-items", "justify-self"],
    examples: ["justify-content-between", "justify-content-center", "justify-items-center"]
  },
  {
    id: "flex-shorthand",
    title: "Flex shorthand & wrap",
    summary: "`flex-1`, `flex-none` and the flex-wrap keywords.",
    matchers: ["matchFlexShorthand"],
    bare: ["flex-0", "flex-1", "flex-none"],
    stems: [stem("flex", FLEX_WRAPS, "flex-wrap")],
    cssProperties: ["flex", "flex-wrap"],
    examples: ["flex-1", "flex-none", "flex-wrap"]
  },
  {
    id: "flex-grow-shrink",
    title: "Flex grow / shrink",
    summary: "`flex-grow-1`, `flex-shrink-0`.",
    matchers: ["matchFlexGrowShrink"],
    bare: ["flex-grow-0", "flex-grow-1", "flex-shrink-0", "flex-shrink-1"],
    cssProperties: ["flex-grow", "flex-shrink"],
    examples: ["flex-grow-1", "flex-shrink-0"]
  },
  {
    id: "flex-direction",
    title: "Flex direction",
    summary: "`flex-direction-column`, `flex-direction-row`.",
    matchers: ["matchFlexDirection"],
    stems: [stem("flex-direction", FLEX_DIRECTIONS, "flex-direction")],
    cssProperties: ["flex-direction"],
    examples: ["flex-direction-column", "flex-direction-row"]
  },
  {
    id: "flex-flow",
    title: "Flex flow",
    summary: "`flex-flow-*` shorthand.",
    matchers: ["matchFlexFlow"],
    stems: [stem("flex-flow", FLEX_FLOW_VALUES, "flex-flow")],
    cssProperties: ["flex-flow"],
    examples: ["flex-flow-row-wrap"]
  },
  {
    id: "object-fit",
    title: "Object fit",
    summary: "`object-cover`, `object-contain`.",
    matchers: ["matchObjectFit"],
    stems: [stem("object", OBJECT_FITS, "object-fit")],
    cssProperties: ["object-fit"],
    examples: ["object-cover", "object-contain"]
  },
  // --- Z-index / overflow / opacity -----------------------------------------
  {
    id: "z-index",
    title: "Z-index",
    summary: "Stacking order: `z-1`\u2026`z-10`, decades up to `z-100`, plus presets like `z-9999`.",
    matchers: ["matchZIndex"],
    stems: [stem("z", Z_VALUES, "z-index")],
    cssProperties: ["z-index"],
    examples: ["z-1", "z-50", "z-9999"]
  },
  {
    id: "overflow",
    title: "Overflow",
    summary: "`overflow-hidden`, `overflow-x-auto`, `overflow-y-scroll`.",
    matchers: ["matchOverflow"],
    stems: [
      stem("overflow", OVERFLOWS, "overflow"),
      stem("overflow-x", OVERFLOWS, "overflow-x"),
      stem("overflow-y", OVERFLOWS, "overflow-y")
    ],
    cssProperties: ["overflow", "overflow-x", "overflow-y"],
    examples: ["overflow-hidden", "overflow-x-auto"]
  },
  {
    id: "opacity",
    title: "Opacity",
    summary: "`opacity-50` is `opacity: .5`.",
    matchers: ["matchOpacity"],
    stems: [stem("opacity", strings(OPACITIES), "opacity")],
    cssProperties: ["opacity"],
    examples: ["opacity-0", "opacity-50", "opacity-100"]
  },
  // --- Spacing ---------------------------------------------------------------
  {
    id: "spacing",
    title: "Spacing \u2014 margin, padding, gap",
    summary: "`{m|p}{direction?}-{value}{unit?}` e.g. `m-1-rem`, `pt-16px`, `mx-auto`, `gap-1-5-rem`.",
    matchers: ["matchSpacing"],
    bare: AUTO_MARGINS,
    stems: [
      ...SPACING_DIRECTIONS.map((dir) => stem(dir, SPACING_VALUES, SPACING_TARGETS[dir])),
      stem("gap", SPACING_VALUES, "gap")
    ],
    cssProperties: ["margin", "padding", "gap"],
    examples: ["m-1-rem", "pt-16px", "mx-auto", "gap-1-5-rem", "p-2-5-rem-m"],
    docs: [
      "Directions: `t` `b` `l` `r` `s` `e` (single side), `x` `y` (axis).",
      "Units: `px` has no dash (`p-16px`); `rem`, `em`, `vh`, `vw` use a dash (`p-1-5-rem`).",
      "A bare number is a legacy alias: `em` wins, then `px`, then `rem` \u2014 so `p-1` is `1em` but `p-16` is `16px`.",
      "Only the margin family accepts `auto`: `m-auto`, `mx-auto`, `mt-auto`, `mb-auto`, `ms-auto`, `me-auto`, `my-auto`."
    ].join(" ")
  },
  // --- Typography ------------------------------------------------------------
  {
    id: "font-size",
    title: "Font size",
    summary: "`fs-1-5-rem`, `fs-16px`, `fs-2-em`.",
    matchers: ["matchFontSize"],
    stems: [stem("fs", FS_VALUES, "font-size")],
    cssProperties: ["font-size"],
    examples: ["fs-1-rem", "fs-16px", "fs-1-5-rem"]
  },
  {
    id: "font-weight",
    title: "Font weight",
    summary: "`fw-700`, `fw-bold`, `fw-normal`.",
    matchers: ["matchFontWeight"],
    stems: [stem("fw", Object.keys(FONT_WEIGHTS), "font-weight")],
    cssProperties: ["font-weight"],
    examples: ["fw-400", "fw-700", "fw-bold"]
  },
  {
    id: "text",
    title: "Text align, transform & ellipsis",
    summary: "`text-center`, `text-uppercase`, `text-ellipsis` (single line) and `text-ellipsis-3` (clamp).",
    matchers: ["matchText"],
    bare: ["text-ellipsis", ...range(2, 6).map((n) => `text-ellipsis-${n}`)],
    stems: [stem("text", [...TEXT_ALIGNS, ...TEXT_TRANSFORMS], "text-align or text-transform")],
    cssProperties: ["text-align", "text-transform", "text-overflow", "white-space"],
    examples: ["text-center", "text-uppercase", "text-ellipsis-3"]
  },
  {
    id: "line-height",
    title: "Line height",
    summary: "`lh-1`, `lh-1-5`, `lh-2`.",
    matchers: ["matchLineHeight"],
    stems: [stem("lh", [...range(1, 4).map(String), ...range(1, 4).map((n) => `${n}-5`)], "line-height")],
    cssProperties: ["line-height"],
    examples: ["lh-1", "lh-1-5"]
  },
  {
    id: "white-space",
    title: "White space",
    summary: "`ws-nowrap`, `ws-pre-wrap`.",
    matchers: ["matchWhiteSpace"],
    stems: [stem("ws", WHITE_SPACES, "white-space")],
    cssProperties: ["white-space"],
    examples: ["ws-nowrap", "ws-pre-wrap"]
  },
  {
    id: "letter-spacing",
    title: "Letter spacing",
    summary: "`letter-spacing-1`, `letter-spacing-0-1-em`, `letter-spacing-neg-1`.",
    matchers: ["matchLetterSpacing"],
    stems: [stem("letter-spacing", LETTER_SPACING_VALUES, "letter-spacing")],
    cssProperties: ["letter-spacing"],
    examples: ["letter-spacing-1", "letter-spacing-0-1-em", "letter-spacing-neg-2"]
  },
  // --- Borders ---------------------------------------------------------------
  {
    id: "border-radius",
    title: "Border radius",
    summary: "`rounded-lg`, `rounded-12px`, `rounded-t-8px`, `rounded-full`.",
    matchers: ["matchBorderRadius"],
    stems: [
      stem("rounded", RADIUS_VALUES, "border-radius"),
      stem("border-radius", RADIUS_VALUES, "border-radius")
    ],
    cssProperties: ["border-radius"],
    examples: ["rounded-lg", "rounded-full", "rounded-r-12px"]
  },
  {
    id: "border",
    title: "Borders",
    summary: "`border`, per-side `border-t`, clears like `border-none`, `border-t-none`.",
    matchers: ["matchBorder"],
    bare: [
      "border",
      "border-none",
      "border-transparent",
      ...["t", "b", "l", "r", "s", "e"].map((side) => `border-${side}`),
      ...["t", "b", "l", "r", "s", "e"].map((side) => `border-${side}-none`)
    ],
    cssProperties: ["border", "border-top", "border-right", "border-bottom", "border-left"],
    examples: ["border", "border-t", "border-none"],
    docs: "Borders paint `1px solid var(--border)`, so the theme variable drives the colour."
  },
  // --- Grid ------------------------------------------------------------------
  {
    id: "grid-cols",
    title: "Grid columns",
    summary: "`grid-cols-3` sets `display: grid` plus a 3-column template.",
    matchers: ["matchGridCols"],
    stems: [stem("grid-cols", range(1, 12), "grid-template-columns")],
    cssProperties: ["grid-template-columns", "display"],
    examples: ["grid-cols-3", "grid-cols-1-m"]
  },
  {
    id: "grid-col-span",
    title: "Grid column span",
    summary: "`grid-col-span-2`, `grid-col-span-full`.",
    matchers: ["matchGridColSpan"],
    bare: ["grid-col-span-full"],
    stems: [stem("grid-col-span", range(1, 12), "grid-column")],
    cssProperties: ["grid-column"],
    examples: ["grid-col-span-2"]
  },
  {
    id: "grid-rows",
    title: "Grid rows",
    summary: "`grid-rows-3` sets `display: grid` plus a 3-row template.",
    matchers: ["matchGridRows"],
    stems: [stem("grid-rows", range(1, 6), "grid-template-rows")],
    cssProperties: ["grid-template-rows", "display"],
    examples: ["grid-rows-2"]
  },
  {
    id: "grid-row-span",
    title: "Grid row span",
    summary: "`grid-row-span-2`, `grid-row-span-full`.",
    matchers: ["matchGridRowSpan"],
    bare: ["grid-row-span-full"],
    stems: [stem("grid-row-span", range(1, 6), "grid-row")],
    cssProperties: ["grid-row"],
    examples: ["grid-row-span-2"]
  },
  {
    id: "grid-flow",
    title: "Grid auto flow",
    summary: "`grid-flow-row`, `grid-flow-col-dense`.",
    matchers: ["matchGridFlow"],
    stems: [stem("grid-flow", Object.keys(GRID_FLOW_MAP), "grid-auto-flow")],
    cssProperties: ["grid-auto-flow"],
    examples: ["grid-flow-row", "grid-flow-col-dense"]
  },
  // --- Animations ------------------------------------------------------------
  {
    id: "animate",
    title: "Animations",
    summary: "Ready-made keyframe animations; the `@keyframes` block is emitted on demand.",
    matchers: ["matchAnimate"],
    bare: Object.keys(ANIMATION_KEYFRAMES),
    cssProperties: ["animation"],
    examples: ["animate-fade-in", "animate-spin", "animate-pulse"],
    docs: "Animations are the only utilities emitted without `!important`, so they stay overridable."
  }
];
function allStems() {
  const out = /* @__PURE__ */ new Set();
  for (const fam of FAMILIES) for (const s of fam.stems ?? []) out.add(s.stem);
  return [...out].sort();
}
function enumerateFamily(family) {
  const out = [];
  out.push(...family.bare ?? []);
  for (const s of family.stems ?? []) {
    for (const v of s.values) out.push(`${s.stem}-${v}`);
  }
  out.push(...family.extra ?? []);
  return out;
}

// src/core/matchers/base.ts
var CURSOR_SET = new Set(CURSORS);
function matchBackground(name) {
  if (name === "bg-transparent") return decl("background", "transparent", { category: 1 });
  if (name === "bg-none") return decl("background", "none", { category: 1 });
  return null;
}
function matchCursor(name) {
  if (!name.startsWith("cursor-")) return null;
  const value = name.slice("cursor-".length);
  if (!CURSOR_SET.has(value)) return null;
  return decl("cursor", value, { category: 1 });
}
function matchOutlineNone(name) {
  if (name !== "outline-none") return null;
  return decl("outline", "none", { category: 1 });
}
function matchPointerEvents(name) {
  if (name === "pointer-events-none") return decl("pointer-events", "none", { category: 1 });
  if (name === "pointer-events-auto") return decl("pointer-events", "auto", { category: 1 });
  return null;
}

// src/core/matchers/display.ts
var DISPLAY_SET = new Set(DISPLAYS);
function matchDisplay(name) {
  if (!name.startsWith("d-")) return null;
  let rest = name.slice(2);
  if (rest.endsWith("-i")) {
    rest = rest.slice(0, -2);
  }
  if (!DISPLAY_SET.has(rest)) return null;
  return decl("display", rest, { category: 2 });
}

// src/core/matchers/position.ts
var POSITION_SET = new Set(POSITIONS);
var VERTICAL_ALIGN_SET = new Set(VERTICAL_ALIGNS);
function matchPosition(name) {
  if (!name.startsWith("position-")) return null;
  const value = name.slice("position-".length);
  if (!POSITION_SET.has(value)) return null;
  return decl("position", value, { category: 4 });
}
function matchOffset(name) {
  let side = null;
  for (const s of SIDES) {
    if (name === s || name.startsWith(`${s}-`)) {
      side = s;
      break;
    }
  }
  if (!side) return null;
  if (name === side) return null;
  const rest = name.slice(side.length + 1);
  const prop = SIDE_TO_PROP[side];
  if (OFFSET_ANCHORS[rest] !== void 0) {
    return decl(prop, OFFSET_ANCHORS[rest], { category: 4 });
  }
  const px = rest.match(/^(\d+)px$/);
  if (px && PX_SET.has(px[1])) {
    return decl(prop, `${px[1]}px`, { category: 4 });
  }
  const remM = rest.match(/^([\d-]+)-rem$/);
  if (remM && REM_SET.has(remM[1])) {
    return decl(prop, `${dashToDot(remM[1])}rem`, { category: 4 });
  }
  const emM = rest.match(/^([\d-]+)-em$/);
  if (emM && EM_SET.has(emM[1])) {
    return decl(prop, `${dashToDot(emM[1])}em`, { category: 4 });
  }
  return null;
}
function matchTransform(name) {
  if (TRANSFORM_UTILS[name] !== void 0) {
    return decl("transform", TRANSFORM_UTILS[name], { category: 4 });
  }
  return null;
}
function matchFloat(name) {
  if (!name.startsWith("float-")) return null;
  const value = name.slice("float-".length);
  if (FLOAT_VALUES[value] === void 0) return null;
  return decl("float", FLOAT_VALUES[value], { category: 4 });
}
function matchVerticalAlign(name) {
  if (!name.startsWith("align-")) return null;
  const value = name.slice("align-".length);
  if (!VERTICAL_ALIGN_SET.has(value)) return null;
  return decl("vertical-align", value, { category: 4 });
}
function matchClearfix(name) {
  if (name !== "clearfix") return null;
  return decl("clear", "both", { category: 4 });
}

// src/core/matchers/flex.ts
var FLEX_WRAP_SET = new Set(FLEX_WRAPS);
var FLEX_DIR_SET = new Set(FLEX_DIRECTIONS);
var FLEX_FLOW_SET = new Set(FLEX_FLOW_VALUES);
var OBJECT_FIT_SET = new Set(OBJECT_FITS);
var ALIGN_PROPS = ["align-items", "align-self", "align-content"];
var JUSTIFY_PROPS = ["justify-content", "justify-items", "justify-self"];
function matchAlignment(name) {
  for (const prop of ALIGN_PROPS) {
    if (!name.startsWith(`${prop}-`)) continue;
    const suffix = name.slice(prop.length + 1);
    const value = ALIGN_VALUES[suffix];
    if (value === void 0) return null;
    return decl(prop, value, { category: 5 });
  }
  return null;
}
function matchJustification(name) {
  for (const prop of JUSTIFY_PROPS) {
    if (!name.startsWith(`${prop}-`)) continue;
    const suffix = name.slice(prop.length + 1);
    const value = JUSTIFY_VALUES[suffix];
    if (value === void 0) return null;
    return decl(prop, value, { category: 5 });
  }
  return null;
}
function matchFlexShorthand(name) {
  if (name === "flex-0") return decl("flex", "0", { category: 5 });
  if (name === "flex-1") return decl("flex", "1", { category: 5 });
  if (name === "flex-none") return decl("flex", "none", { category: 5 });
  if (name.startsWith("flex-")) {
    const v = name.slice("flex-".length);
    if (FLEX_WRAP_SET.has(v)) {
      return decl("flex-wrap", v, { category: 5 });
    }
  }
  return null;
}
function matchFlexGrowShrink(name) {
  if (name === "flex-grow-0") return decl("flex-grow", "0", { category: 5 });
  if (name === "flex-grow-1") return decl("flex-grow", "1", { category: 5 });
  if (name === "flex-shrink-0") return decl("flex-shrink", "0", { category: 5 });
  if (name === "flex-shrink-1") return decl("flex-shrink", "1", { category: 5 });
  return null;
}
function matchFlexDirection(name) {
  if (!name.startsWith("flex-direction-")) return null;
  const v = name.slice("flex-direction-".length);
  if (!FLEX_DIR_SET.has(v)) return null;
  return decl("flex-direction", v, { category: 5 });
}
function matchFlexFlow(name) {
  if (!name.startsWith("flex-flow-")) return null;
  const v = name.slice("flex-flow-".length);
  if (!FLEX_FLOW_SET.has(v)) return null;
  return decl("flex-flow", v, { category: 5 });
}
function matchObjectFit(name) {
  if (!name.startsWith("object-")) return null;
  const v = name.slice("object-".length);
  if (!OBJECT_FIT_SET.has(v)) return null;
  return decl("object-fit", v, { category: 5 });
}

// src/core/matchers/z-overflow-opacity.ts
var OPACITY_SET2 = new Set(OPACITIES.map(String));
var OVERFLOW_SET = new Set(OVERFLOWS);
function matchZIndex(name) {
  if (!name.startsWith("z-")) return null;
  const rest = name.slice(2);
  if (!/^\d+$/.test(rest)) return null;
  const n = Number(rest);
  const isUnit = n >= 1 && n <= 10;
  const isDecade = n >= 10 && n <= 100 && n % 10 === 0;
  if (isUnit || isDecade || Z_EXTREME_SET.has(String(n))) {
    return decl("z-index", String(n), { category: 6 });
  }
  return null;
}
function matchOverflow(name) {
  if (name.startsWith("overflow-x-")) {
    const v = name.slice("overflow-x-".length);
    if (OVERFLOW_SET.has(v)) return decl("overflow-x", v, { category: 6 });
    return null;
  }
  if (name.startsWith("overflow-y-")) {
    const v = name.slice("overflow-y-".length);
    if (OVERFLOW_SET.has(v)) return decl("overflow-y", v, { category: 6 });
    return null;
  }
  if (name.startsWith("overflow-")) {
    const v = name.slice("overflow-".length);
    if (OVERFLOW_SET.has(v)) return decl("overflow", v, { category: 6 });
  }
  return null;
}
function matchOpacity(name) {
  if (!name.startsWith("opacity-")) return null;
  const rest = name.slice("opacity-".length);
  if (!OPACITY_SET2.has(rest)) return null;
  const value = (Number(rest) * 0.01).toFixed(2).replace(/\.?0+$/, "");
  return decl("opacity", value === "" ? "0" : value, { category: 6 });
}

// src/core/matchers/spacing.ts
var PROP_MAP = {
  m: "margin",
  p: "padding"
};
var SIDE_MAP = {
  t: "top",
  b: "bottom",
  l: "left",
  r: "right",
  s: "left",
  // logical start → physical left
  e: "right"
  // logical end → physical right
};
var AXIS_MAP = {
  x: ["left", "right"],
  y: ["top", "bottom"]
};
var AUTO_MARGINS2 = {
  "m-auto": ["margin"],
  "mt-auto": ["margin-top"],
  "mb-auto": ["margin-bottom"],
  "ms-auto": ["margin-left"],
  "me-auto": ["margin-right"],
  "mx-auto": ["margin-left", "margin-right"],
  "my-auto": ["margin-top", "margin-bottom"]
};
function parseSpacingValue(rest) {
  const px = rest.match(/^(\d+)px$/);
  if (px && PX_SET.has(px[1])) return { value: px[1], unit: "px" };
  const rem = rest.match(/^([\d-]+)-rem$/);
  if (rem && REM_SET.has(rem[1])) return { value: dashToDot(rem[1]), unit: "rem" };
  const em = rest.match(/^([\d-]+)-em$/);
  if (em && EM_SET.has(em[1])) return { value: dashToDot(em[1]), unit: "em" };
  const vh = rest.match(/^(\d+)vh$/);
  if (vh && VIEWPORT_SPACING_SET.has(vh[1])) return { value: vh[1], unit: "vh" };
  const vw = rest.match(/^(\d+)vw$/);
  if (vw && VIEWPORT_SPACING_SET.has(vw[1])) return { value: vw[1], unit: "vw" };
  if (/^[\d-]+$/.test(rest)) {
    if (EM_SET.has(rest)) return { value: dashToDot(rest), unit: "em" };
    if (PX_SET.has(rest)) return { value: rest, unit: "px" };
    if (REM_SET.has(rest)) return { value: dashToDot(rest), unit: "rem" };
  }
  return null;
}
function matchSpacing(name) {
  if (AUTO_MARGINS2[name]) {
    const decls = {};
    for (const p of AUTO_MARGINS2[name]) decls[p] = "auto";
    return declMany(decls, { category: 7 });
  }
  if (name.startsWith("gap-")) {
    const parsed2 = parseSpacingValue(name.slice(4));
    if (!parsed2) return null;
    return declMany({ gap: `${parsed2.value}${parsed2.unit}` }, { category: 7 });
  }
  if (!(name.startsWith("m-") || name.startsWith("p-") || name.startsWith("mt-") || name.startsWith("mb-") || name.startsWith("ml-") || name.startsWith("mr-") || name.startsWith("ms-") || name.startsWith("me-") || name.startsWith("mx-") || name.startsWith("my-") || name.startsWith("pt-") || name.startsWith("pb-") || name.startsWith("pl-") || name.startsWith("pr-") || name.startsWith("ps-") || name.startsWith("pe-") || name.startsWith("px-") || name.startsWith("py-"))) {
    return null;
  }
  const propLetter = name[0];
  const propBase = PROP_MAP[propLetter];
  if (!propBase) return null;
  const second = name[1];
  let dir = null;
  let valueStart = 2;
  if (second !== "-") {
    dir = second;
    valueStart = 3;
  }
  if (name[valueStart - 1] !== "-") return null;
  const rest = name.slice(valueStart);
  const parsed = parseSpacingValue(rest);
  if (!parsed) return null;
  const value = `${parsed.value}${parsed.unit}`;
  if (!dir) {
    return declMany({ [propBase]: value }, { category: 7 });
  }
  if (SIDE_MAP[dir]) {
    return declMany({ [`${propBase}-${SIDE_MAP[dir]}`]: value }, { category: 7 });
  }
  if (AXIS_MAP[dir]) {
    const decls = {};
    for (const side of AXIS_MAP[dir]) decls[`${propBase}-${side}`] = value;
    return declMany(decls, { category: 7 });
  }
  return null;
}

// src/core/matchers/typography.ts
var TEXT_ALIGN_SET = new Set(TEXT_ALIGNS);
var TEXT_TRANSFORM_SET = new Set(TEXT_TRANSFORMS);
var WHITE_SPACE_SET = new Set(WHITE_SPACES);
function matchFontSize(name) {
  if (!name.startsWith("fs-")) return null;
  const rest = name.slice(3);
  const px = rest.match(/^(\d+)px$/);
  if (px && FS_PX_SET.has(px[1])) {
    return decl("font-size", `${px[1]}px`, { category: 8 });
  }
  const rem = rest.match(/^([\d-]+)-rem$/);
  if (rem && FS_REM_SET.has(rem[1])) {
    return decl("font-size", `${dashToDot(rem[1])}rem`, { category: 8 });
  }
  const em = rest.match(/^([\d-]+)-em$/);
  if (em && FS_EM_SET.has(em[1])) {
    return decl("font-size", `${dashToDot(em[1])}em`, { category: 8 });
  }
  if (/^[\d-]+$/.test(rest) && FS_REM_SET.has(rest)) {
    return decl("font-size", `${dashToDot(rest)}rem`, { category: 8 });
  }
  return null;
}
function matchFontWeight(name) {
  if (!name.startsWith("fw-")) return null;
  const value = name.slice(3);
  if (FONT_WEIGHTS[value] === void 0) return null;
  return decl("font-weight", FONT_WEIGHTS[value], { category: 8 });
}
function matchText(name) {
  if (name === "text-ellipsis") {
    return declMany(
      {
        overflow: "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap"
      },
      { category: 8 }
    );
  }
  const clamp = name.match(/^text-ellipsis-([2-6])$/);
  if (clamp) {
    return declMany(
      {
        display: "-webkit-box",
        "-webkit-line-clamp": clamp[1],
        "-webkit-box-orient": "vertical",
        overflow: "hidden"
      },
      { category: 8 }
    );
  }
  if (!name.startsWith("text-")) return null;
  const value = name.slice("text-".length);
  if (TEXT_ALIGN_SET.has(value)) {
    return decl("text-align", value, { category: 8 });
  }
  if (TEXT_TRANSFORM_SET.has(value)) {
    return decl("text-transform", value, { category: 8 });
  }
  return null;
}
function matchLineHeight(name) {
  if (!name.startsWith("lh-")) return null;
  const rest = name.slice(3);
  if (/^[1-4]$/.test(rest)) {
    return decl("line-height", rest, { category: 8 });
  }
  const half = rest.match(/^([1-4])-5$/);
  if (half) {
    return decl("line-height", `${half[1]}.5`, { category: 8 });
  }
  return null;
}
function matchWhiteSpace(name) {
  if (!name.startsWith("ws-")) return null;
  const value = name.slice(3);
  if (!WHITE_SPACE_SET.has(value)) return null;
  return decl("white-space", value, { category: 8 });
}
function matchLetterSpacing(name) {
  if (!name.startsWith("letter-spacing-")) return null;
  const rest = name.slice("letter-spacing-".length);
  const negative = rest.startsWith("neg-");
  const body = negative ? rest.slice("neg-".length) : rest;
  const sign = negative ? "-" : "";
  const px = body.match(/^(\d+)px$/);
  if (px) {
    const n = Number(px[1]);
    if (n >= 1 && n <= 10) {
      return decl("letter-spacing", `${sign}${n}px`, { category: 8 });
    }
  }
  if (/^\d+$/.test(body)) {
    const n = Number(body);
    if (n >= 1 && n <= 10) {
      return decl("letter-spacing", `${sign}${n}px`, { category: 8 });
    }
  }
  const em = body.match(/^([\d-]+)-em$/);
  if (em && LETTER_SPACING_EM_SET.has(em[1])) {
    return decl("letter-spacing", `${sign}${dashToDot(em[1])}em`, {
      category: 8
    });
  }
  return null;
}

// src/core/matchers/borders.ts
function appliedBorder() {
  return decl("border", "1px solid var(--border)", { category: 9 });
}
var BORDER_SIDE_MAP = {
  t: "top",
  b: "bottom",
  l: "left",
  r: "right",
  s: "inline-start",
  e: "inline-end"
};
function sideClear(side) {
  const physical = BORDER_SIDE_MAP[side];
  return decl(`border-${physical}`, "none", { category: 9 });
}
function matchBorderRadius(name) {
  for (const prefix of ["border-radius", "rounded"]) {
    if (!name.startsWith(`${prefix}-`)) continue;
    const rest = name.slice(prefix.length + 1);
    if (BORDER_RADIUS_NAMED[rest] !== void 0) {
      return decl("border-radius", BORDER_RADIUS_NAMED[rest], { category: 9 });
    }
    if (rest === "50-percent") {
      return decl("border-radius", "50%", { category: 9 });
    }
    const pxFull = rest.match(/^(\d+)px$/);
    if (pxFull && BORDER_RADIUS_PX_SET.has(pxFull[1])) {
      return decl("border-radius", `${pxFull[1]}px`, { category: 9 });
    }
    const sideMatch = rest.match(/^([tblr])-(\d+)px$/);
    if (sideMatch && BORDER_RADIUS_PX_SET.has(sideMatch[2])) {
      const corners = RADIUS_SIDES[sideMatch[1]];
      const decls = {};
      for (const corner of corners) decls[`border-${corner}-radius`] = `${sideMatch[2]}px`;
      return declMany(decls, { category: 9 });
    }
  }
  return null;
}
function matchBorder(name) {
  if (name === "border") return appliedBorder();
  if (name === "border-none") return decl("border", "none", { category: 9 });
  if (name === "border-transparent") return decl("border-color", "transparent", { category: 9 });
  const sideMatch = name.match(/^border-([tblrse])$/);
  if (sideMatch) {
    const physical = BORDER_SIDE_MAP[sideMatch[1]];
    return decl(`border-${physical}`, "1px solid var(--border)", {
      category: 9
    });
  }
  const clearMatch = name.match(/^border-([tblrse])-none$/);
  if (clearMatch) return sideClear(clearMatch[1]);
  return null;
}

// src/core/matchers/grid.ts
function matchGridCols(name) {
  const m = name.match(/^grid-cols-(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 12) return null;
  return declMany(
    {
      display: "grid",
      "grid-template-columns": `repeat(${n}, minmax(0, 1fr))`
    },
    { category: 10 }
  );
}
function matchGridColSpan(name) {
  if (name === "grid-col-span-full") {
    return declMany({ "grid-column": "1 / -1" }, { category: 10 });
  }
  const m = name.match(/^grid-col-span-(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 12) return null;
  return declMany({ "grid-column": `span ${n} / span ${n}` }, { category: 10 });
}
function matchGridRows(name) {
  const m = name.match(/^grid-rows-(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 6) return null;
  return declMany(
    {
      display: "grid",
      "grid-template-rows": `repeat(${n}, minmax(0, 1fr))`
    },
    { category: 10 }
  );
}
function matchGridRowSpan(name) {
  if (name === "grid-row-span-full") {
    return declMany({ "grid-row": "1 / -1" }, { category: 10 });
  }
  const m = name.match(/^grid-row-span-(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 6) return null;
  return declMany({ "grid-row": `span ${n} / span ${n}` }, { category: 10 });
}
function matchGridFlow(name) {
  if (!name.startsWith("grid-flow-")) return null;
  const v = name.slice("grid-flow-".length);
  if (GRID_FLOW_MAP[v] === void 0) return null;
  return declMany({ "grid-auto-flow": GRID_FLOW_MAP[v] }, { category: 10 });
}

// src/core/matchers/index.ts
var MATCHERS = [
  // --- Background / cursor / interaction ---
  matchBackground,
  matchCursor,
  matchOutlineNone,
  matchPointerEvents,
  // --- Display ---
  matchDisplay,
  // --- Sizing (specific before generic) ---
  matchVwVhAlias,
  // w-100vw / h-100vh
  matchContentSize,
  // w-max-content, h-auto, ...
  matchViewportSize,
  // w-{n}vw, h-{n}vh
  matchFixedSize,
  // w-{n}px, max-w-{n}, min-h-{n}px, ...
  matchSizePercent,
  // w-50, h-100, ...
  // --- Position / offsets / transforms ---
  matchPosition,
  matchTransform,
  // canonical names like translate-center
  matchOffset,
  // top-*, bottom-*, left-*, right-*, start-*, end-*
  matchFloat,
  matchClearfix,
  // --- Flex / alignment / object-fit ---
  matchAlignment,
  // align-items / self / content
  matchJustification,
  // justify-content / items / self
  matchFlexGrowShrink,
  matchFlexDirection,
  matchFlexFlow,
  matchFlexShorthand,
  matchObjectFit,
  // --- Z-index / overflow / opacity ---
  matchZIndex,
  matchOverflow,
  matchOpacity,
  // --- Spacing (margin / padding / gap) ---
  matchSpacing,
  // --- Typography (specific before general) ---
  matchLetterSpacing,
  // letter-spacing-* before text-* (no overlap, but order keeps it tidy)
  matchFontSize,
  matchFontWeight,
  matchLineHeight,
  matchWhiteSpace,
  matchText,
  // text-{align|transform|ellipsis|ellipsis-N}
  // --- Borders (radius BEFORE border) ---
  matchBorderRadius,
  // border-radius-*, rounded-*
  matchBorder,
  // border, border-{side}, border-none, ...
  // --- Grid ---
  matchGridColSpan,
  matchGridCols,
  matchGridRowSpan,
  matchGridRows,
  matchGridFlow,
  // --- Animations ---
  matchAnimate,
  // --- Vertical-align LAST: '.align-*' conflicts in spelling with align-items
  // but those are filtered by `matchAlignment` returning null on bad suffix.
  matchVerticalAlign
];
function tryMatch(name) {
  for (const fn of MATCHERS) {
    const r = fn(name);
    if (r) return r;
  }
  return null;
}
function matchCandidate(name) {
  if (typeof name !== "string") return null;
  const direct = tryMatch(name);
  if (direct) return { result: direct, breakpoint: "base", selector: name };
  if (name.length > 2) {
    const tail = name.slice(-2);
    if (tail === "-m") {
      const base = name.slice(0, -2);
      const r = tryMatch(base);
      if (r) return { result: r, breakpoint: "mobile", selector: name };
    } else if (tail === "-t") {
      const base = name.slice(0, -2);
      const r = tryMatch(base);
      if (r) return { result: r, breakpoint: "tablet", selector: name };
    }
  }
  return null;
}

// src/core/generator.ts
function escapeSelector(name) {
  return name;
}
function emitRule(rule, indent) {
  const sel = `.${escapeSelector(rule.selector)}`;
  const body = [];
  for (const [prop, value] of Object.entries(rule.decls)) {
    const v = rule.important ? `${value} !important` : value;
    body.push(`${indent}  ${prop}: ${v};`);
  }
  return `${indent}${sel} {
${body.join("\n")}
${indent}}`;
}

// src/core/catalog.ts
var SUFFIXES = ["-m", "-t"];
function createCatalog() {
  const byName = /* @__PURE__ */ new Map();
  const all = /* @__PURE__ */ new Set();
  for (const family of FAMILIES) {
    for (const name of enumerateFamily(family)) {
      if (!byName.has(name)) byName.set(name, { name, familyId: family.id });
      all.add(name);
      for (const suffix of SUFFIXES) all.add(`${name}${suffix}`);
    }
  }
  const baseClasses = [...byName.keys()].sort();
  return {
    families: FAMILIES,
    byName,
    baseClasses,
    allClasses: [...all].sort(),
    stems: allStems(),
    counts: {
      families: FAMILIES.length,
      base: baseClasses.length,
      withBreakpoints: all.size
    }
  };
}
function mediaQueryFor(breakpoint, bp = DEFAULT_BREAKPOINTS) {
  if (breakpoint === "mobile") return `@media (max-width: ${bp.mobile}px)`;
  if (breakpoint === "tablet")
    return `@media (min-width: ${bp.mobile + 1}px) and (max-width: ${bp.tablet}px)`;
  return void 0;
}
function explainClass(name, breakpoints) {
  if (typeof name !== "string") {
    return { name: String(name), valid: false };
  }
  const match = matchCandidate(name);
  if (!match) {
    return { name, valid: false, base: stripSuffix(name) };
  }
  const { result, breakpoint, selector } = match;
  const important = result.important ?? true;
  const entry = lookupFamily(name, selector, breakpoint);
  const declsText = Object.entries(result.decls).map(([prop, value]) => `${prop}: ${value}${important ? " !important" : ""};`).join(" ");
  const rule = {
    selector,
    decls: result.decls,
    important,
    category: result.category ?? 99,
    priority: result.priority ?? 0
  };
  return {
    name,
    valid: true,
    breakpoint,
    base: stripSuffix(name),
    familyId: entry?.familyId,
    familyTitle: entry && FAMILY_TITLES.get(entry.familyId),
    declarations: result.decls,
    declarationsText: declsText,
    css: emitRule(rule, ""),
    important,
    mediaQuery: mediaQueryFor(breakpoint, breakpoints)
  };
}
var FAMILY_TITLES = new Map(FAMILIES.map((f) => [f.id, f.title]));
function stripSuffix(name) {
  const match = matchCandidate(name);
  if (!match || match.breakpoint === "base") return name;
  const suffix = match.breakpoint === "mobile" ? "-m" : "-t";
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}
function lookupFamily(name, selector, breakpoint) {
  const catalog = getCatalog();
  const candidates = breakpoint === "base" ? [name, selector] : [stripSuffix(name), selector, name];
  for (const c of candidates) {
    const hit = catalog.byName.get(c);
    if (hit) return hit;
  }
  return void 0;
}
var TAILWIND_ALIASES = {
  flex: ["d-flex"],
  grid: ["d-grid"],
  block: ["d-block"],
  "inline-block": ["d-inline-block"],
  hidden: ["d-none"],
  relative: ["position-relative"],
  absolute: ["position-absolute"],
  fixed: ["position-fixed"],
  sticky: ["position-sticky"],
  "items-center": ["align-items-center"],
  "items-start": ["align-items-start"],
  "items-end": ["align-items-end"],
  "justify-between": ["justify-content-between"],
  "justify-center": ["justify-content-center"],
  "justify-around": ["justify-content-around"],
  "flex-col": ["flex-direction-column"],
  "flex-row": ["flex-direction-row"],
  "flex-col-reverse": ["flex-direction-column-reverse"],
  "text-sm": ["fs-0-875-rem"],
  "text-base": ["fs-1-rem"],
  "text-lg": ["fs-1-2-rem"],
  "text-xl": ["fs-1-25-rem"],
  "text-2xl": ["fs-1-5-rem"],
  "text-3xl": ["fs-1-75-rem"],
  "font-bold": ["fw-700"],
  "font-semibold": ["fw-600"],
  "font-medium": ["fw-500"],
  "font-light": ["fw-300"],
  "w-full": ["w-100"],
  "h-full": ["h-100"],
  "w-screen": ["w-100vw"],
  "h-screen": ["h-100vh"],
  "rounded": ["rounded-8px"],
  "leading-none": ["lh-1"],
  "leading-tight": ["lh-1-5"],
  "leading-normal": ["lh-1-5"],
  "tracking-wide": ["letter-spacing-0-05-em"],
  "tracking-tight": ["letter-spacing-neg-0-02-em"],
  "gap-x-4": ["gap-16px"],
  "gap-y-4": ["gap-16px"],
  "space-y-4": ["my-16px"],
  "translate-x-1/2": ["translate-x-center"],
  "translate-y-1/2": ["translate-y-center"],
  "col-span-2": ["grid-col-span-2"],
  "row-span-2": ["grid-row-span-2"],
  "sr-only": ["text-ellipsis"]
};
var SEMANTIC_TRAPS = {
  "p-4": "a bare number in the spacing family means px (after em), not rem \u2014 so p-4 is padding: 4px. Use p-1-rem for 1rem.",
  "m-2": "2px, not 0.5rem. The legacy bare-number alias resolves as em, then px, then rem.",
  "p-1": "1em, because em wins over px and rem for bare numbers.",
  "w-50": "a bare number in the sizing family is always a percentage \u2014 w-50 is width: 50%. Use w-50px or w-50vw for units.",
  "fs-1": "a bare number in the font-size family is rem \u2014 fs-1 is font-size: 1rem.",
  "rounded-md": "8px here, not Tailwind's 6px. The named radius scale is xs(2) sm(4) md(8) lg(12) xl(16) 2xl(24) full(9999).",
  "lh-1-5": "the dash is a decimal point, so this is line-height: 1.5.",
  "lh-4-5": "only 1, 2, 3, 4 and 1.5, 2.5, 3.5, 4.5 exist \u2014 there is no lh-1-25.",
  "h-100vh": "viewport height works for h and w only. min-h and max-h accept pixels, so Tailwind's min-h-screen has no equivalent here.",
  "border": "paints 1px solid var(--border); set --border to theme it.",
  "animate-spin": "the only family emitted without !important, so it stays overridable."
};
var cachedCatalog = null;
function getCatalog() {
  if (!cachedCatalog) cachedCatalog = createCatalog();
  return cachedCatalog;
}
function distance(a, b, budget) {
  if (Math.abs(a.length - b.length) > budget) return budget + 1;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > budget) return budget + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}
function matchingStem(name, stems) {
  let best = null;
  for (const stem2 of stems) {
    if (!name.startsWith(`${stem2}-`)) continue;
    if (!best || stem2.length > best.length) best = stem2;
  }
  return best;
}
function suggestClasses(name, limit = 3) {
  if (typeof name !== "string" || name.length === 0) return [];
  if (matchCandidate(name)) return [];
  const catalog = getCatalog();
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (candidate) => {
    if (seen.has(candidate) || out.length >= limit) return;
    if (!catalog.byName.has(candidate) && !catalog.byName.has(stripSuffix(candidate))) return;
    seen.add(candidate);
    out.push(candidate);
  };
  const curated = TAILWIND_ALIASES[name];
  if (curated) {
    for (const alias of curated) push(alias);
    if (out.length > 0) return out.slice(0, limit);
  }
  const base = stripSuffix(name);
  const stem2 = matchingStem(base, catalog.stems);
  if (stem2) {
    const rest = base.slice(stem2.length + 1);
    const sameStem = catalog.baseClasses.filter((c) => c.startsWith(`${stem2}-`));
    const scored = sameStem.map((c) => ({ c, d: distance(rest, c.slice(stem2.length + 1), 2) })).filter((s) => s.d <= 2).sort((a, b) => a.d - b.d || a.c.length - b.c.length);
    for (const s of scored) push(s.c);
  }
  if (out.length < limit) {
    const tail = stem2 ? base.slice(stem2.length + 1) : null;
    if (tail) {
      const otherStems = catalog.baseClasses.filter((c) => c.endsWith(`-${tail}`));
      for (const c of otherStems.sort((a, b) => a.length - b.length)) push(c);
    }
  }
  if (out.length === 0) {
    const budget = base.length >= 8 ? 1 : 2;
    const scored = catalog.baseClasses.filter((c) => Math.abs(c.length - base.length) <= budget + 1).map((c) => ({ c, d: distance(base, c, budget) })).filter((s) => s.d <= budget).sort((a, b) => a.d - b.d || a.c.length - b.c.length);
    for (const s of scored) push(s.c);
  }
  return out.slice(0, limit);
}
var CLASS_SHAPE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
function isClassShaped(token) {
  if (typeof token !== "string") return false;
  if (token.length < 3 || token.length > 48) return false;
  return CLASS_SHAPE.test(token) && token.includes("-");
}
function diagnoseUnknown(unknown, limit = 3) {
  const out = [];
  for (const token of unknown) {
    if (!isClassShaped(token)) continue;
    const suggestions = suggestClasses(token, limit);
    if (suggestions.length > 0) out.push({ token, suggestions });
  }
  return out.sort((a, b) => a.token.localeCompare(b.token));
}
function diagnose(candidates, limit = 3) {
  const valid = [];
  const unknown = [];
  for (const token of candidates) {
    if (typeof token !== "string") continue;
    if (matchCandidate(token)) valid.push(token);
    else unknown.push(token);
  }
  valid.sort();
  unknown.sort();
  return { valid, unknown, diagnostics: diagnoseUnknown(unknown, limit) };
}
function shadowedSuffixes() {
  const catalog = getCatalog();
  const out = [];
  for (const base of catalog.baseClasses) {
    for (const suffix of SUFFIXES) {
      const combined = `${base}${suffix}`;
      if (!catalog.byName.has(combined)) continue;
      const match = matchCandidate(combined);
      if (match && match.breakpoint === "base") {
        out.push({
          base,
          suffix,
          shadowedBy: combined,
          reason: `.${combined} is itself a class, and the engine resolves the raw name before stripping the suffix`
        });
      }
    }
  }
  return out;
}

// src/core/version.ts
var VERSION = "1.1.1";

// src/manifest.ts
var MANIFEST_SCHEMA_VERSION = 1;
function toManifestStem(stem2) {
  const out = { stem: stem2.stem, values: [...stem2.values] };
  if (stem2.targets) out.targets = stem2.targets;
  return out;
}
function toManifestFamily(family) {
  const out = {
    id: family.id,
    title: family.title,
    summary: family.summary,
    cssProperties: [...family.cssProperties],
    examples: [...family.examples],
    matchers: [...family.matchers],
    bare: [...family.bare ?? []],
    stems: (family.stems ?? []).map(toManifestStem),
    extra: [...family.extra ?? []]
  };
  if (family.docs) out.docs = family.docs;
  return out;
}
function buildManifest() {
  const catalog = getCatalog();
  const { mobile, tablet, desktop } = DEFAULT_BREAKPOINTS;
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    version: VERSION,
    package: "@vcalderondev/ukit-css",
    description: "JIT utility-first CSS engine. Class names are generated on demand, but the vocabulary is finite and fully enumerated here.",
    naming: {
      pattern: "<stem>-<value>[-m|-t]",
      decimals: "Dots become dashes: 1.5rem -> 1-5-rem",
      px: "The px unit attaches directly: p-16px",
      units: "rem / em / vh / vw use a dash: p-1-5-rem, gap-10vh",
      bareNumbers: "A bare number is a legacy alias resolved as em, then px, then rem: p-1 is 1em, p-16 is 16px, p-2-5 is 2.5rem",
      important: "Every utility except animate-* is emitted with !important",
      notTailwind: "These are NOT Tailwind names. p-4 is valid but means 4px (not 1rem). text-sm does not exist.",
      noColors: "There are no colour utilities and no colour scale. Theme through CSS variables (e.g. --border) or your own classes.",
      breakpoints: "Append -m (mobile) or -t (tablet) to any base utility."
    },
    breakpoints: {
      values: { mobile, tablet, desktop },
      suffixes: [
        { suffix: "-m", id: "mobile", description: `max-width: ${mobile}px` },
        {
          suffix: "-t",
          id: "tablet",
          description: `min-width: ${mobile + 1}px and max-width: ${tablet}px`
        }
      ],
      universal: true,
      exceptions: shadowedSuffixes()
    },
    counts: {
      families: catalog.counts.families,
      base: catalog.counts.base,
      withBreakpoints: catalog.counts.withBreakpoints
    },
    tailwindAliases: Object.fromEntries(
      Object.entries(TAILWIND_ALIASES).map(([k, v]) => [k, [...v]])
    ),
    semanticTraps: { ...SEMANTIC_TRAPS },
    families: FAMILIES.map(toManifestFamily)
  };
}
function manifestJson(pretty = true) {
  return `${JSON.stringify(buildManifest(), null, pretty ? 2 : 0)}
`;
}
function listClasses(includeBreakpoints = true) {
  const catalog = getCatalog();
  return [...includeBreakpoints ? catalog.allClasses : catalog.baseClasses];
}
function classesText(includeBreakpoints = true) {
  return `${listClasses(includeBreakpoints).join("\n")}
`;
}
function validateClasses(candidates) {
  return diagnose(candidates);
}

exports.MANIFEST_SCHEMA_VERSION = MANIFEST_SCHEMA_VERSION;
exports.buildManifest = buildManifest;
exports.classesText = classesText;
exports.explainClass = explainClass;
exports.listClasses = listClasses;
exports.manifest = buildManifest;
exports.manifestJson = manifestJson;
exports.suggestClasses = suggestClasses;
exports.validateClasses = validateClasses;
