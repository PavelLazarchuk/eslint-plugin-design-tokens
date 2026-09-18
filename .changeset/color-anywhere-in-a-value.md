---
'eslint-plugin-design-tokens': minor
---

`no-hardcoded-colors` reads inside the value, and knows the modern color syntax.

- A color is now found **anywhere in a value**, not only when it is the whole of one: `background: 'linear-gradient(#fff, #000)'`, `border-top: '1px solid #ccc'`, `text-shadow`, `filter: drop-shadow(0 0 2px #000)` and `outline` all used to pass in silence. The message names the color it found rather than the value it was hiding in, and a declaration is still reported once however many colors it holds.
- `oklch()`, `oklab()`, `lab()`, `lch()`, `hwb()`, `color()`, `color-mix()` and `light-dark()` are recognised as colors. `no-hardcoded-borders` and `no-hardcoded-shadows` read the same matcher, so a border or a shadow written in one of them is now read as a border or a shadow too.
- The fallback in `var(--brand, #fff)` is a hardcoded color and is reported as one. The custom property itself, and a value that only reads custom properties — `color-mix(in oklch, var(--a) 40%, var(--b))` — are left alone as before.
- `allowlist` is applied token by token, so `allowlist: ['#fff']` excuses the `#fff` in `border: '1px solid #fff'` without excusing the rest of the value.

A named color is only recognised inside a longer value when the property could hold one, so a font stack ending in `Tan` stays a font stack.
