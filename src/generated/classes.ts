// =============================================================================
// AUTO-GENERATED FILE — DO NOT EDIT
// -----------------------------------------------------------------------------
// Regenerate with `npm run generate`.
// Source of truth: src/core/grammar.ts (validated against the real matchers by
// test/catalog.test.mjs, in both directions).
//
// Base utilities: 4726 · including -m/-t: 14177
// =============================================================================
/** `background` classes that take no value. */
export type UkitBackgroundBare = "bg-transparent" | "bg-none"

/** Background reset — Clears the background or sets it to transparent. */
export type UkitBackground = UkitBackgroundBare

/** Values accepted after `cursor-`. */
export type UkitCursorValues =
  | "pointer"
  | "default"
  | "move"
  | "not-allowed"
  | "help"
  | "wait"
  | "text"
  | "grab"
  | "grabbing"
  | "zoom-in"
  | "zoom-out"

/** `cursor-*` — cursor */
export type UkitCursorCursor = `cursor-${UkitCursorValues}`

/** Cursor — Sets the mouse cursor, e.g. `cursor-pointer`. */
export type UkitCursor = UkitCursorCursor

/** `outline` classes that take no value. */
export type UkitOutlineBare = "outline-none"

/** Outline — Removes the focus outline. */
export type UkitOutline = UkitOutlineBare

/** `pointer-events` classes that take no value. */
export type UkitPointerEventsBare = "pointer-events-none" | "pointer-events-auto"

/** Pointer events — Enables or disables pointer interaction. */
export type UkitPointerEvents = UkitPointerEventsBare

/** Values accepted after `user-select-`. */
export type UkitUserSelectValues = "none" | "text" | "all" | "auto" | "contain"

/** `user-select-*` — user-select */
export type UkitUserSelectUserSelect = `user-select-${UkitUserSelectValues}`

/** User select — Controls text selection: `user-select-none`, `user-select-text`. */
export type UkitUserSelect = UkitUserSelectUserSelect

/** Values accepted after `d-`. */
export type UkitDisplayValues =
  | "none"
  | "inline-block"
  | "inline"
  | "block"
  | "grid"
  | "inline-grid"
  | "flex"
  | "inline-flex"
  | "none-i"
  | "inline-block-i"
  | "inline-i"
  | "block-i"
  | "grid-i"
  | "inline-grid-i"
  | "flex-i"
  | "inline-flex-i"

/** `d-*` — display */
export type UkitDisplayD = `d-${UkitDisplayValues}`

/** Display — Sets the `display` value, e.g. `d-flex`, `d-none`, `d-grid`. */
export type UkitDisplay = UkitDisplayD

/** Values accepted after `w-`. */
export type UkitSizingPercentValues =
  | "0"
  | "5"
  | "10"
  | "15"
  | "20"
  | "25"
  | "30"
  | "40"
  | "50"
  | "60"
  | "70"
  | "75"
  | "80"
  | "90"
  | "100"

/** `w-*` — width */
export type UkitSizingPercentW = `w-${UkitSizingPercentValues}`

/** `h-*` — height */
export type UkitSizingPercentH = `h-${UkitSizingPercentValues}`

/** Sizing — percentages — Percentage width/height: `w-50` is `width: 50%`. */
export type UkitSizingPercent = UkitSizingPercentW | UkitSizingPercentH

/** Values accepted after `w-`. */
export type UkitSizingFixedValues =
  | "0px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "5px"
  | "6px"
  | "7px"
  | "8px"
  | "9px"
  | "10px"
  | "11px"
  | "12px"
  | "13px"
  | "14px"
  | "15px"
  | "16px"
  | "17px"
  | "18px"
  | "19px"
  | "20px"
  | "21px"
  | "22px"
  | "23px"
  | "24px"
  | "25px"
  | "26px"
  | "27px"
  | "28px"
  | "29px"
  | "30px"
  | "31px"
  | "32px"
  | "33px"
  | "34px"
  | "35px"
  | "36px"
  | "37px"
  | "38px"
  | "39px"
  | "40px"
  | "41px"
  | "42px"
  | "43px"
  | "44px"
  | "45px"
  | "46px"
  | "47px"
  | "48px"
  | "49px"
  | "50px"
  | "51px"
  | "52px"
  | "53px"
  | "54px"
  | "55px"
  | "56px"
  | "57px"
  | "58px"
  | "59px"
  | "60px"
  | "61px"
  | "62px"
  | "63px"
  | "64px"
  | "80px"
  | "100px"
  | "120px"
  | "140px"
  | "160px"
  | "180px"
  | "200px"
  | "240px"
  | "280px"
  | "300px"
  | "320px"
  | "360px"
  | "380px"
  | "400px"
  | "420px"
  | "450px"
  | "480px"
  | "500px"
  | "550px"
  | "560px"
  | "600px"
  | "640px"
  | "650px"
  | "700px"
  | "750px"
  | "800px"
  | "920px"
  | "1000px"
  | "1200px"

/** `w-*` — width */
export type UkitSizingFixedW = `w-${UkitSizingFixedValues}`

/** `h-*` — height */
export type UkitSizingFixedH = `h-${UkitSizingFixedValues}`

/** Values accepted after `max-w-`. */
export type UkitSizingFixedMaxWValues =
  | "0px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "5px"
  | "6px"
  | "7px"
  | "8px"
  | "9px"
  | "10px"
  | "11px"
  | "12px"
  | "13px"
  | "14px"
  | "15px"
  | "16px"
  | "17px"
  | "18px"
  | "19px"
  | "20px"
  | "21px"
  | "22px"
  | "23px"
  | "24px"
  | "25px"
  | "26px"
  | "27px"
  | "28px"
  | "29px"
  | "30px"
  | "31px"
  | "32px"
  | "33px"
  | "34px"
  | "35px"
  | "36px"
  | "37px"
  | "38px"
  | "39px"
  | "40px"
  | "41px"
  | "42px"
  | "43px"
  | "44px"
  | "45px"
  | "46px"
  | "47px"
  | "48px"
  | "49px"
  | "50px"
  | "51px"
  | "52px"
  | "53px"
  | "54px"
  | "55px"
  | "56px"
  | "57px"
  | "58px"
  | "59px"
  | "60px"
  | "61px"
  | "62px"
  | "63px"
  | "64px"
  | "80px"
  | "100px"
  | "120px"
  | "140px"
  | "160px"
  | "180px"
  | "200px"
  | "240px"
  | "280px"
  | "300px"
  | "320px"
  | "360px"
  | "380px"
  | "400px"
  | "420px"
  | "450px"
  | "480px"
  | "500px"
  | "550px"
  | "560px"
  | "600px"
  | "640px"
  | "650px"
  | "700px"
  | "750px"
  | "800px"
  | "920px"
  | "1000px"
  | "1200px"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31"
  | "32"
  | "33"
  | "34"
  | "35"
  | "36"
  | "37"
  | "38"
  | "39"
  | "40"
  | "41"
  | "42"
  | "43"
  | "44"
  | "45"
  | "46"
  | "47"
  | "48"
  | "49"
  | "50"
  | "51"
  | "52"
  | "53"
  | "54"
  | "55"
  | "56"
  | "57"
  | "58"
  | "59"
  | "60"
  | "61"
  | "62"
  | "63"
  | "64"
  | "80"
  | "100"
  | "120"
  | "140"
  | "160"
  | "180"
  | "200"
  | "240"
  | "280"
  | "300"
  | "320"
  | "360"
  | "380"
  | "400"
  | "420"
  | "450"
  | "480"
  | "500"
  | "550"
  | "560"
  | "600"
  | "640"
  | "650"
  | "700"
  | "750"
  | "800"
  | "920"
  | "1000"
  | "1200"
  | "10vw"
  | "20vw"
  | "25vw"
  | "30vw"
  | "40vw"
  | "50vw"
  | "60vw"
  | "70vw"
  | "75vw"
  | "80vw"
  | "85vw"
  | "90vw"
  | "95vw"
  | "100vw"
  | "0-percent"
  | "5-percent"
  | "10-percent"
  | "15-percent"
  | "20-percent"
  | "25-percent"
  | "30-percent"
  | "40-percent"
  | "50-percent"
  | "60-percent"
  | "70-percent"
  | "75-percent"
  | "80-percent"
  | "90-percent"
  | "100-percent"
  | "auto"

/** `max-w-*` — max-width */
export type UkitSizingFixedMaxW = `max-w-${UkitSizingFixedMaxWValues}`

/** `min-w-*` — min-width */
export type UkitSizingFixedMinW = `min-w-${UkitSizingFixedMaxWValues}`

/** Values accepted after `max-h-`. */
export type UkitSizingFixedMaxHValues =
  | "0px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "5px"
  | "6px"
  | "7px"
  | "8px"
  | "9px"
  | "10px"
  | "11px"
  | "12px"
  | "13px"
  | "14px"
  | "15px"
  | "16px"
  | "17px"
  | "18px"
  | "19px"
  | "20px"
  | "21px"
  | "22px"
  | "23px"
  | "24px"
  | "25px"
  | "26px"
  | "27px"
  | "28px"
  | "29px"
  | "30px"
  | "31px"
  | "32px"
  | "33px"
  | "34px"
  | "35px"
  | "36px"
  | "37px"
  | "38px"
  | "39px"
  | "40px"
  | "41px"
  | "42px"
  | "43px"
  | "44px"
  | "45px"
  | "46px"
  | "47px"
  | "48px"
  | "49px"
  | "50px"
  | "51px"
  | "52px"
  | "53px"
  | "54px"
  | "55px"
  | "56px"
  | "57px"
  | "58px"
  | "59px"
  | "60px"
  | "61px"
  | "62px"
  | "63px"
  | "64px"
  | "80px"
  | "100px"
  | "120px"
  | "140px"
  | "160px"
  | "180px"
  | "200px"
  | "240px"
  | "280px"
  | "300px"
  | "320px"
  | "360px"
  | "380px"
  | "400px"
  | "420px"
  | "450px"
  | "480px"
  | "500px"
  | "550px"
  | "560px"
  | "600px"
  | "640px"
  | "650px"
  | "700px"
  | "750px"
  | "800px"
  | "920px"
  | "1000px"
  | "1200px"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31"
  | "32"
  | "33"
  | "34"
  | "35"
  | "36"
  | "37"
  | "38"
  | "39"
  | "40"
  | "41"
  | "42"
  | "43"
  | "44"
  | "45"
  | "46"
  | "47"
  | "48"
  | "49"
  | "50"
  | "51"
  | "52"
  | "53"
  | "54"
  | "55"
  | "56"
  | "57"
  | "58"
  | "59"
  | "60"
  | "61"
  | "62"
  | "63"
  | "64"
  | "80"
  | "100"
  | "120"
  | "140"
  | "160"
  | "180"
  | "200"
  | "240"
  | "280"
  | "300"
  | "320"
  | "360"
  | "380"
  | "400"
  | "420"
  | "450"
  | "480"
  | "500"
  | "550"
  | "560"
  | "600"
  | "640"
  | "650"
  | "700"
  | "750"
  | "800"
  | "920"
  | "1000"
  | "1200"
  | "10vh"
  | "20vh"
  | "25vh"
  | "30vh"
  | "40vh"
  | "50vh"
  | "60vh"
  | "70vh"
  | "75vh"
  | "80vh"
  | "85vh"
  | "90vh"
  | "95vh"
  | "100vh"
  | "0-percent"
  | "5-percent"
  | "10-percent"
  | "15-percent"
  | "20-percent"
  | "25-percent"
  | "30-percent"
  | "40-percent"
  | "50-percent"
  | "60-percent"
  | "70-percent"
  | "75-percent"
  | "80-percent"
  | "90-percent"
  | "100-percent"
  | "auto"

/** `max-h-*` — max-height */
export type UkitSizingFixedMaxH = `max-h-${UkitSizingFixedMaxHValues}`

/** `min-h-*` — min-height */
export type UkitSizingFixedMinH = `min-h-${UkitSizingFixedMaxHValues}`

/** Sizing — fixed pixels — Pixel width/height and min/max constraints: `w-320px`, `max-w-1200`, `min-h-100vh`, `max-w-90-percent`. */
export type UkitSizingFixed =
  | UkitSizingFixedW
  | UkitSizingFixedH
  | UkitSizingFixedMaxW
  | UkitSizingFixedMinW
  | UkitSizingFixedMaxH
  | UkitSizingFixedMinH

/** Values accepted after `w-`. */
export type UkitSizingViewportValues =
  | "10vw"
  | "20vw"
  | "25vw"
  | "30vw"
  | "40vw"
  | "50vw"
  | "60vw"
  | "70vw"
  | "75vw"
  | "80vw"
  | "85vw"
  | "90vw"
  | "95vw"
  | "100vw"

/** `w-*` — width */
export type UkitSizingViewportW = `w-${UkitSizingViewportValues}`

/** Values accepted after `h-`. */
export type UkitSizingViewportHValues =
  | "10vh"
  | "20vh"
  | "25vh"
  | "30vh"
  | "40vh"
  | "50vh"
  | "60vh"
  | "70vh"
  | "75vh"
  | "80vh"
  | "85vh"
  | "90vh"
  | "95vh"
  | "100vh"

/** `h-*` — height */
export type UkitSizingViewportH = `h-${UkitSizingViewportHValues}`

/** Sizing — viewport — Viewport-relative sizing: `w-100vw`, `h-50vh`. */
export type UkitSizingViewport = UkitSizingViewportW | UkitSizingViewportH

/** `sizing-content` classes that take no value. */
export type UkitSizingContentBare =
  | "w-max-content"
  | "w-min-content"
  | "w-fit-content"
  | "h-max-content"
  | "h-min-content"
  | "h-fit-content"
  | "w-auto"
  | "h-auto"

/** Sizing — intrinsic & auto — Content-driven sizing shortcuts: `w-fit-content`, `h-auto`. */
export type UkitSizingContent = UkitSizingContentBare

/** Values accepted after `position-`. */
export type UkitPositionValues = "relative" | "absolute" | "fixed" | "sticky"

/** `position-*` — position */
export type UkitPositionPosition = `position-${UkitPositionValues}`

/** Position — Sets the `position` value: `position-absolute`, `position-sticky`. */
export type UkitPosition = UkitPositionPosition

/** Values accepted after `top-`. */
export type UkitOffsetValues =
  | "0"
  | "50"
  | "50-percent"
  | "0px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "5px"
  | "6px"
  | "7px"
  | "8px"
  | "9px"
  | "10px"
  | "11px"
  | "12px"
  | "13px"
  | "14px"
  | "15px"
  | "16px"
  | "17px"
  | "18px"
  | "19px"
  | "20px"
  | "21px"
  | "22px"
  | "23px"
  | "24px"
  | "25px"
  | "28px"
  | "30px"
  | "32px"
  | "35px"
  | "40px"
  | "45px"
  | "48px"
  | "50px"
  | "60px"
  | "64px"
  | "68px"
  | "80px"
  | "100px"
  | "110px"
  | "0-rem"
  | "0-25-rem"
  | "0-5-rem"
  | "0-75-rem"
  | "1-rem"
  | "1-25-rem"
  | "1-5-rem"
  | "2-rem"
  | "2-5-rem"
  | "3-rem"
  | "4-rem"
  | "5-rem"
  | "1-em"
  | "1-5-em"
  | "2-em"
  | "neg-0px"
  | "neg-1px"
  | "neg-2px"
  | "neg-3px"
  | "neg-4px"
  | "neg-5px"
  | "neg-6px"
  | "neg-7px"
  | "neg-8px"
  | "neg-9px"
  | "neg-10px"
  | "neg-11px"
  | "neg-12px"
  | "neg-13px"
  | "neg-14px"
  | "neg-15px"
  | "neg-16px"
  | "neg-17px"
  | "neg-18px"
  | "neg-19px"
  | "neg-20px"
  | "neg-21px"
  | "neg-22px"
  | "neg-23px"
  | "neg-24px"
  | "neg-25px"
  | "neg-28px"
  | "neg-30px"
  | "neg-32px"
  | "neg-35px"
  | "neg-40px"
  | "neg-45px"
  | "neg-48px"
  | "neg-50px"
  | "neg-60px"
  | "neg-64px"
  | "neg-68px"
  | "neg-80px"
  | "neg-100px"
  | "neg-110px"
  | "neg-0-rem"
  | "neg-0-25-rem"
  | "neg-0-5-rem"
  | "neg-0-75-rem"
  | "neg-1-rem"
  | "neg-1-25-rem"
  | "neg-1-5-rem"
  | "neg-2-rem"
  | "neg-2-5-rem"
  | "neg-3-rem"
  | "neg-4-rem"
  | "neg-5-rem"
  | "neg-1-em"
  | "neg-1-5-em"
  | "neg-2-em"

/** `top-*` — top */
export type UkitOffsetTop = `top-${UkitOffsetValues}`

/** `bottom-*` — bottom */
export type UkitOffsetBottom = `bottom-${UkitOffsetValues}`

/** `left-*` — left */
export type UkitOffsetLeft = `left-${UkitOffsetValues}`

/** `right-*` — right */
export type UkitOffsetRight = `right-${UkitOffsetValues}`

/** `start-*` — start */
export type UkitOffsetStart = `start-${UkitOffsetValues}`

/** `end-*` — end */
export type UkitOffsetEnd = `end-${UkitOffsetValues}`

/** Offsets — Edge offsets in px/rem/em or anchors: `top-0`, `left-50-percent`, `top-16px`, `right-1-5-rem`, `bottom-neg-5px`. */
export type UkitOffset =
  | UkitOffsetTop
  | UkitOffsetBottom
  | UkitOffsetLeft
  | UkitOffsetRight
  | UkitOffsetStart
  | UkitOffsetEnd

/** `transform` classes that take no value. */
export type UkitTransformBare =
  | "translate-x-center"
  | "translate-x-neg-50"
  | "translate-y-center"
  | "translate-y-neg-50"
  | "translate-center"
  | "translate-middle"
  | "transform-none"
  | "rotate-90"

/** Transform helpers — Named transform shortcuts for centring and rotating. */
export type UkitTransform = UkitTransformBare

/** Values accepted after `float-`. */
export type UkitFloatValues = "left" | "right" | "none" | "start" | "end"

/** `float-*` — float */
export type UkitFloatFloat = `float-${UkitFloatValues}`

/** Float — Floats an element: `float-left`, `float-right`. */
export type UkitFloat = UkitFloatFloat

/** `clearfix` classes that take no value. */
export type UkitClearfixBare = "clearfix"

/** Clearfix — Clears floats. */
export type UkitClearfix = UkitClearfixBare

/** Values accepted after `align-`. */
export type UkitVerticalAlignValues =
  | "baseline"
  | "top"
  | "middle"
  | "bottom"
  | "sub"
  | "super"
  | "text-top"
  | "text-bottom"

/** `align-*` — vertical-align */
export type UkitVerticalAlignAlign = `align-${UkitVerticalAlignValues}`

/** Vertical align — `vertical-align` keywords: `align-middle`, `align-top`. */
export type UkitVerticalAlign = UkitVerticalAlignAlign

/** Values accepted after `align-items-`. */
export type UkitAlignValues =
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "baseline"
  | "stretch"

/** `align-items-*` — align-items */
export type UkitAlignAlignItems = `align-items-${UkitAlignValues}`

/** `align-self-*` — align-self */
export type UkitAlignAlignSelf = `align-self-${UkitAlignValues}`

/** `align-content-*` — align-content */
export type UkitAlignAlignContent = `align-content-${UkitAlignValues}`

/** Flex alignment — `align-items`, `align-self`, `align-content`: `align-items-center`. */
export type UkitAlign = UkitAlignAlignItems | UkitAlignAlignSelf | UkitAlignAlignContent

/** Values accepted after `justify-content-`. */
export type UkitJustifyValues =
  | "center"
  | "right"
  | "left"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "between"
  | "around"
  | "evenly"
  | "space-between"
  | "space-around"
  | "space-evenly"

/** `justify-content-*` — justify-content */
export type UkitJustifyJustifyContent = `justify-content-${UkitJustifyValues}`

/** `justify-items-*` — justify-items */
export type UkitJustifyJustifyItems = `justify-items-${UkitJustifyValues}`

/** `justify-self-*` — justify-self */
export type UkitJustifyJustifySelf = `justify-self-${UkitJustifyValues}`

/** Justification — `justify-content`, `justify-items`, `justify-self`: `justify-content-between`. */
export type UkitJustify =
  | UkitJustifyJustifyContent
  | UkitJustifyJustifyItems
  | UkitJustifyJustifySelf

/** Values accepted after `flex-`. */
export type UkitFlexShorthandValues = "nowrap" | "wrap" | "wrap-reverse"

/** `flex-*` — flex-wrap */
export type UkitFlexShorthandFlex = `flex-${UkitFlexShorthandValues}`

/** `flex-shorthand` classes that take no value. */
export type UkitFlexShorthandBare = "flex-0" | "flex-1" | "flex-none"

/** Flex shorthand & wrap — `flex-1`, `flex-none` and the flex-wrap keywords. */
export type UkitFlexShorthand = UkitFlexShorthandFlex | UkitFlexShorthandBare

/** `flex-grow-shrink` classes that take no value. */
export type UkitFlexGrowShrinkBare =
  | "flex-grow-0"
  | "flex-grow-1"
  | "flex-shrink-0"
  | "flex-shrink-1"

/** Flex grow / shrink — `flex-grow-1`, `flex-shrink-0`. */
export type UkitFlexGrowShrink = UkitFlexGrowShrinkBare

/** Values accepted after `flex-direction-`. */
export type UkitFlexDirectionValues = "row" | "row-reverse" | "column" | "column-reverse"

/** `flex-direction-*` — flex-direction */
export type UkitFlexDirectionFlexDirection = `flex-direction-${UkitFlexDirectionValues}`

/** Flex direction — `flex-direction-column`, `flex-direction-row`. */
export type UkitFlexDirection = UkitFlexDirectionFlexDirection

/** Values accepted after `flex-flow-`. */
export type UkitFlexFlowValues =
  | "row"
  | "row-reverse"
  | "column"
  | "column-reverse"
  | "nowrap"
  | "wrap"
  | "wrap-reverse"

/** `flex-flow-*` — flex-flow */
export type UkitFlexFlowFlexFlow = `flex-flow-${UkitFlexFlowValues}`

/** Flex flow — `flex-flow-*` shorthand. */
export type UkitFlexFlow = UkitFlexFlowFlexFlow

/** Values accepted after `object-`. */
export type UkitObjectFitValues = "cover" | "contain" | "fill" | "none" | "scale-down"

/** `object-*` — object-fit */
export type UkitObjectFitObject = `object-${UkitObjectFitValues}`

/** Object fit — `object-cover`, `object-contain`. */
export type UkitObjectFit = UkitObjectFitObject

/** Values accepted after `z-`. */
export type UkitZIndexValues =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "10"
  | "20"
  | "30"
  | "40"
  | "50"
  | "60"
  | "70"
  | "80"
  | "90"
  | "100"
  | "200"
  | "500"
  | "1000"
  | "2000"
  | "3000"
  | "5000"
  | "9999"
  | "10000"

/** `z-*` — z-index */
export type UkitZIndexZ = `z-${UkitZIndexValues}`

/** Z-index — Stacking order: `z-1`…`z-10`, decades up to `z-100`, plus presets like `z-200`, `z-3000`, `z-9999`. */
export type UkitZIndex = UkitZIndexZ

/** Values accepted after `overflow-`. */
export type UkitOverflowValues = "auto" | "hidden" | "scroll" | "visible"

/** `overflow-*` — overflow */
export type UkitOverflowOverflow = `overflow-${UkitOverflowValues}`

/** `overflow-x-*` — overflow-x */
export type UkitOverflowOverflowX = `overflow-x-${UkitOverflowValues}`

/** `overflow-y-*` — overflow-y */
export type UkitOverflowOverflowY = `overflow-y-${UkitOverflowValues}`

/** Overflow — `overflow-hidden`, `overflow-x-auto`, `overflow-y-scroll`. */
export type UkitOverflow = UkitOverflowOverflow | UkitOverflowOverflowX | UkitOverflowOverflowY

/** Values accepted after `opacity-`. */
export type UkitOpacityValues =
  | "0"
  | "2"
  | "4"
  | "5"
  | "10"
  | "15"
  | "20"
  | "25"
  | "30"
  | "40"
  | "50"
  | "55"
  | "60"
  | "70"
  | "75"
  | "80"
  | "85"
  | "90"
  | "100"

/** `opacity-*` — opacity */
export type UkitOpacityOpacity = `opacity-${UkitOpacityValues}`

/** Opacity — `opacity-50` is `opacity: .5`. */
export type UkitOpacity = UkitOpacityOpacity

/** Values accepted after `m-`. */
export type UkitSpacingValues =
  | "0px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "5px"
  | "6px"
  | "7px"
  | "8px"
  | "9px"
  | "10px"
  | "11px"
  | "12px"
  | "13px"
  | "14px"
  | "15px"
  | "16px"
  | "17px"
  | "18px"
  | "19px"
  | "20px"
  | "21px"
  | "22px"
  | "23px"
  | "24px"
  | "25px"
  | "28px"
  | "30px"
  | "32px"
  | "35px"
  | "40px"
  | "45px"
  | "48px"
  | "50px"
  | "60px"
  | "64px"
  | "68px"
  | "80px"
  | "100px"
  | "110px"
  | "0-rem"
  | "0-25-rem"
  | "0-5-rem"
  | "0-75-rem"
  | "1-rem"
  | "1-25-rem"
  | "1-5-rem"
  | "2-rem"
  | "2-5-rem"
  | "3-rem"
  | "4-rem"
  | "5-rem"
  | "1-em"
  | "1-5-em"
  | "2-em"
  | "5vh"
  | "10vh"
  | "15vh"
  | "20vh"
  | "25vh"
  | "30vh"
  | "40vh"
  | "50vh"
  | "5vw"
  | "10vw"
  | "15vw"
  | "20vw"
  | "25vw"
  | "30vw"
  | "40vw"
  | "50vw"
  | "1"
  | "1-5"
  | "2"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "28"
  | "30"
  | "32"
  | "35"
  | "40"
  | "45"
  | "48"
  | "50"
  | "60"
  | "64"
  | "68"
  | "80"
  | "100"
  | "110"
  | "0"
  | "0-25"
  | "0-5"
  | "0-75"
  | "1"
  | "1-25"
  | "1-5"
  | "2"
  | "2-5"
  | "3"
  | "4"
  | "5"

/** `m-*` — margin */
export type UkitSpacingM = `m-${UkitSpacingValues}`

/** `mt-*` — margin-top */
export type UkitSpacingMt = `mt-${UkitSpacingValues}`

/** `mb-*` — margin-bottom */
export type UkitSpacingMb = `mb-${UkitSpacingValues}`

/** `ml-*` — margin-left */
export type UkitSpacingMl = `ml-${UkitSpacingValues}`

/** `mr-*` — margin-right */
export type UkitSpacingMr = `mr-${UkitSpacingValues}`

/** `ms-*` — margin-left */
export type UkitSpacingMs = `ms-${UkitSpacingValues}`

/** `me-*` — margin-right */
export type UkitSpacingMe = `me-${UkitSpacingValues}`

/** `mx-*` — margin-left + margin-right */
export type UkitSpacingMx = `mx-${UkitSpacingValues}`

/** `my-*` — margin-top + margin-bottom */
export type UkitSpacingMy = `my-${UkitSpacingValues}`

/** `p-*` — padding */
export type UkitSpacingP = `p-${UkitSpacingValues}`

/** `pt-*` — padding-top */
export type UkitSpacingPt = `pt-${UkitSpacingValues}`

/** `pb-*` — padding-bottom */
export type UkitSpacingPb = `pb-${UkitSpacingValues}`

/** `pl-*` — padding-left */
export type UkitSpacingPl = `pl-${UkitSpacingValues}`

/** `pr-*` — padding-right */
export type UkitSpacingPr = `pr-${UkitSpacingValues}`

/** `ps-*` — padding-left */
export type UkitSpacingPs = `ps-${UkitSpacingValues}`

/** `pe-*` — padding-right */
export type UkitSpacingPe = `pe-${UkitSpacingValues}`

/** `px-*` — padding-left + padding-right */
export type UkitSpacingPx = `px-${UkitSpacingValues}`

/** `py-*` — padding-top + padding-bottom */
export type UkitSpacingPy = `py-${UkitSpacingValues}`

/** `gap-*` — gap */
export type UkitSpacingGap = `gap-${UkitSpacingValues}`

/** `spacing` classes that take no value. */
export type UkitSpacingBare =
  | "m-auto"
  | "mt-auto"
  | "mb-auto"
  | "ms-auto"
  | "me-auto"
  | "mx-auto"
  | "my-auto"

/** Spacing — margin, padding, gap — `{m|p}{direction?}-{value}{unit?}` e.g. `m-1-rem`, `pt-16px`, `mx-auto`, `gap-1-5-rem`. */
export type UkitSpacing =
  | UkitSpacingM
  | UkitSpacingMt
  | UkitSpacingMb
  | UkitSpacingMl
  | UkitSpacingMr
  | UkitSpacingMs
  | UkitSpacingMe
  | UkitSpacingMx
  | UkitSpacingMy
  | UkitSpacingP
  | UkitSpacingPt
  | UkitSpacingPb
  | UkitSpacingPl
  | UkitSpacingPr
  | UkitSpacingPs
  | UkitSpacingPe
  | UkitSpacingPx
  | UkitSpacingPy
  | UkitSpacingGap
  | UkitSpacingBare

/** Values accepted after `font-family-`. */
export type UkitFontFamilyValues = "sans" | "serif" | "mono"

/** `font-family-*` — font-family */
export type UkitFontFamilyFontFamily = `font-family-${UkitFontFamilyValues}`

/** Font family — Generic font stacks: `font-family-mono`, `font-family-sans`, `font-family-serif`. */
export type UkitFontFamily = UkitFontFamilyFontFamily

/** Values accepted after `fs-`. */
export type UkitFontSizeValues =
  | "6px"
  | "8px"
  | "9px"
  | "10px"
  | "11px"
  | "12px"
  | "13px"
  | "14px"
  | "15px"
  | "16px"
  | "17px"
  | "18px"
  | "20px"
  | "22px"
  | "24px"
  | "26px"
  | "28px"
  | "32px"
  | "36px"
  | "38px"
  | "40px"
  | "42px"
  | "48px"
  | "56px"
  | "64px"
  | "86px"
  | "108px"
  | "120px"
  | "0-5-rem"
  | "0-55-rem"
  | "0-6-rem"
  | "0-65-rem"
  | "0-7-rem"
  | "0-75-rem"
  | "0-78-rem"
  | "0-8-rem"
  | "0-85-rem"
  | "0-875-rem"
  | "0-9-rem"
  | "0-95-rem"
  | "1-rem"
  | "1-05-rem"
  | "1-1-rem"
  | "1-15-rem"
  | "1-2-rem"
  | "1-25-rem"
  | "1-3-rem"
  | "1-4-rem"
  | "1-5-rem"
  | "1-6-rem"
  | "1-75-rem"
  | "1-8-rem"
  | "2-rem"
  | "2-5-rem"
  | "3-rem"
  | "3-5-rem"
  | "4-rem"
  | "5-rem"
  | "1-em"
  | "1-2-em"
  | "1-5-em"
  | "2-em"
  | "0-5"
  | "0-55"
  | "0-6"
  | "0-65"
  | "0-7"
  | "0-75"
  | "0-78"
  | "0-8"
  | "0-85"
  | "0-875"
  | "0-9"
  | "0-95"
  | "1"
  | "1-05"
  | "1-1"
  | "1-15"
  | "1-2"
  | "1-25"
  | "1-3"
  | "1-4"
  | "1-5"
  | "1-6"
  | "1-75"
  | "1-8"
  | "2"
  | "2-5"
  | "3"
  | "3-5"
  | "4"
  | "5"

/** `fs-*` — font-size */
export type UkitFontSizeFs = `fs-${UkitFontSizeValues}`

/** Font size — `fs-1-5-rem`, `fs-16px`, `fs-2-em`. */
export type UkitFontSize = UkitFontSizeFs

/** Values accepted after `fw-`. */
export type UkitFontWeightValues =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "bold"
  | "normal"

/** `fw-*` — font-weight */
export type UkitFontWeightFw = `fw-${UkitFontWeightValues}`

/** Font weight — `fw-700`, `fw-bold`, `fw-normal`. */
export type UkitFontWeight = UkitFontWeightFw

/** Values accepted after `text-`. */
export type UkitTextValues =
  | "left"
  | "center"
  | "right"
  | "justify"
  | "start"
  | "end"
  | "uppercase"
  | "lowercase"
  | "capitalize"
  | "none"

/** `text-*` — text-align or text-transform */
export type UkitTextText = `text-${UkitTextValues}`

/** `text` classes that take no value. */
export type UkitTextBare =
  | "text-ellipsis"
  | "text-ellipsis-2"
  | "text-ellipsis-3"
  | "text-ellipsis-4"
  | "text-ellipsis-5"
  | "text-ellipsis-6"

/** Text align, transform & ellipsis — `text-center`, `text-uppercase`, `text-ellipsis` (single line) and `text-ellipsis-3` (clamp). */
export type UkitText = UkitTextText | UkitTextBare

/** Values accepted after `text-decoration-`. */
export type UkitTextDecorationValues = "none" | "underline" | "overline" | "line-through"

/** `text-decoration-*` — text-decoration */
export type UkitTextDecorationTextDecoration = `text-decoration-${UkitTextDecorationValues}`

/** Text decoration — `text-decoration-none`, `text-decoration-underline`, `text-decoration-line-through`. */
export type UkitTextDecoration = UkitTextDecorationTextDecoration

/** Values accepted after `list-style-`. */
export type UkitListStyleValues =
  | "none"
  | "disc"
  | "circle"
  | "square"
  | "decimal"
  | "lower-alpha"
  | "upper-alpha"
  | "lower-roman"
  | "upper-roman"

/** `list-style-*` — list-style-type */
export type UkitListStyleListStyle = `list-style-${UkitListStyleValues}`

/** Values accepted after `list-style-position-`. */
export type UkitListStyleListStylePositionValues = "inside" | "outside"

/** `list-style-position-*` — list-style-position */
export type UkitListStyleListStylePosition = `list-style-position-${UkitListStyleListStylePositionValues}`

/** List style — `list-style-none`, `list-style-disc`, `list-style-position-inside`. */
export type UkitListStyle = UkitListStyleListStyle | UkitListStyleListStylePosition

/** Values accepted after `lh-`. */
export type UkitLineHeightValues =
  | "1"
  | "1-05"
  | "1-1"
  | "1-15"
  | "1-2"
  | "1-25"
  | "1-3"
  | "1-35"
  | "1-4"
  | "1-45"
  | "1-5"
  | "1-55"
  | "1-6"
  | "1-65"
  | "1-7"
  | "1-75"
  | "1-8"
  | "1-85"
  | "1-9"
  | "1-95"
  | "2"
  | "2-5"
  | "3"
  | "3-5"
  | "4"
  | "4-5"

/** `lh-*` — line-height */
export type UkitLineHeightLh = `lh-${UkitLineHeightValues}`

/** Line height — `lh-1`, `lh-1-2`, `lh-1-5`, `lh-4-5` — the dash is the decimal point. */
export type UkitLineHeight = UkitLineHeightLh

/** Values accepted after `ws-`. */
export type UkitWhiteSpaceValues =
  | "nowrap"
  | "normal"
  | "pre"
  | "pre-wrap"
  | "pre-line"
  | "break-spaces"

/** `ws-*` — white-space */
export type UkitWhiteSpaceWs = `ws-${UkitWhiteSpaceValues}`

/** White space — `ws-nowrap`, `ws-pre-wrap`. */
export type UkitWhiteSpace = UkitWhiteSpaceWs

/** Values accepted after `letter-spacing-`. */
export type UkitLetterSpacingValues =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "0-5px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "5px"
  | "6px"
  | "7px"
  | "8px"
  | "9px"
  | "10px"
  | "neg-1"
  | "neg-2"
  | "neg-3"
  | "neg-4"
  | "neg-5"
  | "neg-6"
  | "neg-7"
  | "neg-8"
  | "neg-9"
  | "neg-10"
  | "neg-0-5px"
  | "neg-1px"
  | "neg-2px"
  | "neg-3px"
  | "neg-4px"
  | "neg-5px"
  | "neg-6px"
  | "neg-7px"
  | "neg-8px"
  | "neg-9px"
  | "neg-10px"
  | "0-01-em"
  | "0-02-em"
  | "0-05-em"
  | "0-1-em"
  | "0-12-em"
  | "0-15-em"
  | "0-2-em"
  | "neg-0-01-em"
  | "neg-0-02-em"
  | "neg-0-05-em"
  | "neg-0-1-em"
  | "neg-0-12-em"
  | "neg-0-15-em"
  | "neg-0-2-em"

/** `letter-spacing-*` — letter-spacing */
export type UkitLetterSpacingLetterSpacing = `letter-spacing-${UkitLetterSpacingValues}`

/** Letter spacing — `letter-spacing-1`, `letter-spacing-0-5px`, `letter-spacing-0-1-em`, `letter-spacing-neg-1`. */
export type UkitLetterSpacing = UkitLetterSpacingLetterSpacing

/** Values accepted after `rounded-`. */
export type UkitBorderRadiusValues =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "full"
  | "50-percent"
  | "0px"
  | "1px"
  | "2px"
  | "3px"
  | "4px"
  | "6px"
  | "8px"
  | "10px"
  | "11px"
  | "12px"
  | "14px"
  | "16px"
  | "20px"
  | "24px"
  | "28px"
  | "30px"
  | "32px"
  | "40px"
  | "t-0px"
  | "t-1px"
  | "t-2px"
  | "t-3px"
  | "t-4px"
  | "t-6px"
  | "t-8px"
  | "t-10px"
  | "t-11px"
  | "t-12px"
  | "t-14px"
  | "t-16px"
  | "t-20px"
  | "t-24px"
  | "t-28px"
  | "t-30px"
  | "t-32px"
  | "t-40px"
  | "b-0px"
  | "b-1px"
  | "b-2px"
  | "b-3px"
  | "b-4px"
  | "b-6px"
  | "b-8px"
  | "b-10px"
  | "b-11px"
  | "b-12px"
  | "b-14px"
  | "b-16px"
  | "b-20px"
  | "b-24px"
  | "b-28px"
  | "b-30px"
  | "b-32px"
  | "b-40px"
  | "l-0px"
  | "l-1px"
  | "l-2px"
  | "l-3px"
  | "l-4px"
  | "l-6px"
  | "l-8px"
  | "l-10px"
  | "l-11px"
  | "l-12px"
  | "l-14px"
  | "l-16px"
  | "l-20px"
  | "l-24px"
  | "l-28px"
  | "l-30px"
  | "l-32px"
  | "l-40px"
  | "r-0px"
  | "r-1px"
  | "r-2px"
  | "r-3px"
  | "r-4px"
  | "r-6px"
  | "r-8px"
  | "r-10px"
  | "r-11px"
  | "r-12px"
  | "r-14px"
  | "r-16px"
  | "r-20px"
  | "r-24px"
  | "r-28px"
  | "r-30px"
  | "r-32px"
  | "r-40px"

/** `rounded-*` — border-radius */
export type UkitBorderRadiusRounded = `rounded-${UkitBorderRadiusValues}`

/** `border-radius-*` — border-radius */
export type UkitBorderRadiusBorderRadius = `border-radius-${UkitBorderRadiusValues}`

/** Border radius — `rounded-lg`, `rounded-12px`, `rounded-t-8px`, `rounded-full`. */
export type UkitBorderRadius = UkitBorderRadiusRounded | UkitBorderRadiusBorderRadius

/** `border` classes that take no value. */
export type UkitBorderBare =
  | "border"
  | "border-none"
  | "border-transparent"
  | "border-t"
  | "border-b"
  | "border-l"
  | "border-r"
  | "border-s"
  | "border-e"
  | "border-t-none"
  | "border-b-none"
  | "border-l-none"
  | "border-r-none"
  | "border-s-none"
  | "border-e-none"

/** Borders — `border`, per-side `border-t`, clears like `border-none`, `border-t-none`. */
export type UkitBorder = UkitBorderBare

/** Values accepted after `grid-cols-`. */
export type UkitGridColsValues =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"

/** `grid-cols-*` — grid-template-columns */
export type UkitGridColsGridCols = `grid-cols-${UkitGridColsValues}`

/** Grid columns — `grid-cols-3` sets `display: grid` plus a 3-column template. */
export type UkitGridCols = UkitGridColsGridCols

/** `grid-col-span-*` — grid-column */
export type UkitGridColSpanGridColSpan = `grid-col-span-${UkitGridColsValues}`

/** `grid-col-span` classes that take no value. */
export type UkitGridColSpanBare = "grid-col-span-full"

/** Grid column span — `grid-col-span-2`, `grid-col-span-full`. */
export type UkitGridColSpan = UkitGridColSpanGridColSpan | UkitGridColSpanBare

/** Values accepted after `grid-rows-`. */
export type UkitGridRowsValues = "1" | "2" | "3" | "4" | "5" | "6"

/** `grid-rows-*` — grid-template-rows */
export type UkitGridRowsGridRows = `grid-rows-${UkitGridRowsValues}`

/** Grid rows — `grid-rows-3` sets `display: grid` plus a 3-row template. */
export type UkitGridRows = UkitGridRowsGridRows

/** `grid-row-span-*` — grid-row */
export type UkitGridRowSpanGridRowSpan = `grid-row-span-${UkitGridRowsValues}`

/** `grid-row-span` classes that take no value. */
export type UkitGridRowSpanBare = "grid-row-span-full"

/** Grid row span — `grid-row-span-2`, `grid-row-span-full`. */
export type UkitGridRowSpan = UkitGridRowSpanGridRowSpan | UkitGridRowSpanBare

/** Values accepted after `grid-flow-`. */
export type UkitGridFlowValues = "row" | "col" | "dense" | "row-dense" | "col-dense"

/** `grid-flow-*` — grid-auto-flow */
export type UkitGridFlowGridFlow = `grid-flow-${UkitGridFlowValues}`

/** Grid auto flow — `grid-flow-row`, `grid-flow-col-dense`. */
export type UkitGridFlow = UkitGridFlowGridFlow

/** `animate` classes that take no value. */
export type UkitAnimateBare =
  | "animate-fade-in"
  | "animate-fade-in-up"
  | "animate-fade-in-scale"
  | "animate-slide-in-right"
  | "animate-spin"
  | "animate-pulse"

/** Animations — Ready-made keyframe animations; the `@keyframes` block is emitted on demand. */
export type UkitAnimate = UkitAnimateBare
// ---------------------------------------------------------------------------
// The full vocabulary
// ---------------------------------------------------------------------------

/** Every base utility, without a breakpoint suffix. */
export type UkitClassBase =
  | UkitBackground
  | UkitCursor
  | UkitOutline
  | UkitPointerEvents
  | UkitUserSelect
  | UkitDisplay
  | UkitSizingPercent
  | UkitSizingFixed
  | UkitSizingViewport
  | UkitSizingContent
  | UkitPosition
  | UkitOffset
  | UkitTransform
  | UkitFloat
  | UkitClearfix
  | UkitVerticalAlign
  | UkitAlign
  | UkitJustify
  | UkitFlexShorthand
  | UkitFlexGrowShrink
  | UkitFlexDirection
  | UkitFlexFlow
  | UkitObjectFit
  | UkitZIndex
  | UkitOverflow
  | UkitOpacity
  | UkitSpacing
  | UkitFontFamily
  | UkitFontSize
  | UkitFontWeight
  | UkitText
  | UkitTextDecoration
  | UkitListStyle
  | UkitLineHeight
  | UkitWhiteSpace
  | UkitLetterSpacing
  | UkitBorderRadius
  | UkitBorder
  | UkitGridCols
  | UkitGridColSpan
  | UkitGridRows
  | UkitGridRowSpan
  | UkitGridFlow
  | UkitAnimate

/** Breakpoint suffixes every base utility accepts. */
export type UkitBreakpointSuffix = "" | "-m" | "-t"

/**
 * Every valid class name, including the `-m` (mobile) and `-t` (tablet)
 * variants. Use it to type props, literal maps or test fixtures.
 *
 * Note: `.border` cannot take `-t`, because `.border-t` already means
 * border-top and the engine resolves the raw name first.
 */
export type UkitClass = UkitClassBase | `${UkitClassBase}${UkitBreakpointSuffix}`

/**
 * Strict union plus an escape hatch, so autocomplete works without rejecting
 * classes composed at runtime (`m-${size}-rem`).
 */
export type UkitClassName = UkitClass | (string & {})

/** Anything accepted in a class list: a class, or a falsy conditional slot. */
export type UkitClassInput = UkitClassName | false | null | undefined

/**
 * Join class names. Autocompletes the ukit vocabulary while accepting
 * conditionals, so it replaces `clsx`-style helpers in this codebase:
 *
 *   cn("d-flex", "align-items-center", isOpen && "d-none-m")
 *
 * Runtime validation is intentionally *not* done here: see
 * `matchCandidate()` from the main entry (`npx ukit-css validate` for files).
 */
export function cn(...parts: UkitClassInput[]): string {
  return parts.filter(Boolean).join(" ")
}
