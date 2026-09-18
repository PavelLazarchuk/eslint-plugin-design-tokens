# eslint-plugin-design-tokens

## 1.5.0

### Minor Changes

- b2c0d97: `no-hardcoded-colors` reads inside the value, and knows the modern color syntax.

    - A color is now found **anywhere in a value**, not only when it is the whole of one: `background: 'linear-gradient(#fff, #000)'`, `border-top: '1px solid #ccc'`, `text-shadow`, `filter: drop-shadow(0 0 2px #000)` and `outline` all used to pass in silence. The message names the color it found rather than the value it was hiding in, and a declaration is still reported once however many colors it holds.
    - `oklch()`, `oklab()`, `lab()`, `lch()`, `hwb()`, `color()`, `color-mix()` and `light-dark()` are recognised as colors. `no-hardcoded-borders` and `no-hardcoded-shadows` read the same matcher, so a border or a shadow written in one of them is now read as a border or a shadow too.
    - The fallback in `var(--brand, #fff)` is a hardcoded color and is reported as one. The custom property itself, and a value that only reads custom properties — `color-mix(in oklch, var(--a) 40%, var(--b))` — are left alone as before.
    - `allowlist` is applied token by token, so `allowlist: ['#fff']` excuses the `#fff` in `border: '1px solid #fff'` without excusing the rest of the value.

    A named color is only recognised inside a longer value when the property could hold one, so a font stack ending in `Tan` stays a font stack.

## 1.4.0

### Minor Changes

- 357dbf8: Ship `strict` and `all` configs alongside `recommended`, in both the flat and the legacy form. `strict` is the recommended set as errors; `all` is derived from the plugin's rule list rather than a curated one, so a rule added later turns on with it.

    Every rule now takes two more options: `allowlistPatterns`, which excuses a value matched by any of the patterns, and `ignorePropertyPattern`, which skips a declaration whose property matches — regular expressions for the cases an exact-value list cannot name. `no-unknown-token-var` reads `allowlistPatterns` as variable names, so `['^--ds-']` says what `prefixes: ['--ds-']` says.

    Each rule declares its defaults as `meta.defaultOptions` (ESLint 9+ applies them; the rules merge them themselves on older hosts in the peer range) and marks itself `meta.docs.recommended`, so `eslint --print-config` and tooling that reads rule metadata both see what a rule does before it is configured.

## 1.3.0

### Minor Changes

- a72e649: Add `no-unknown-token-var`, on as `warn` in the recommended config. Every other rule reads `var(--…)` as proof a value came from somewhere; this one checks the name against your design system, once you name it with `prefixes` and `allowlist`. Unconfigured it reports nothing, because there is no way to tell a token from a typo without knowing the namespace.

    Every rule now reads the entry points that previously hid a hardcode. Object forms of the CSS factories — `css({ … })`, vanilla-extract's `style({ … })` — are read like their tagged-template forms, and `keyframes`, `createGlobalStyle` and `injectGlobal` are read like `css`. Styles that follow `styled.div.attrs({ … })` or `.withConfig({ … })` are checked, while the configuration object handed to them is left alone. Every argument of a style call is read, so `styled.div(base, { color: '#fff' })` no longer hides the second object.

    MUI's other two `sx` forms are read as well: `sx={theme => ({ … })}` and `sx={[base, active && { … }]}`, along with the conditional form. A `const` is now followed through `as const` and `satisfies`, and a template literal with nothing interpolated into it (`` color: `#fff` ``) is read as the literal it is.

    Code that previously passed because a hardcode sat in one of these places will start reporting.

## 1.2.0

### Minor Changes

- 9a11329: Add `no-hardcoded-borders`, `no-hardcoded-transitions` and `no-hardcoded-z-index`, all on as `warn` in the recommended config.

    Every rule now reads two more entry points: Ant Design's `styles` slot prop (`<Card styles={{ body: {...} }} />`), and a style object pulled out into a `const` in the same file (`const styles = {...}` next to `sx={styles}`), followed one hop through `const` only. Numeric literals are read alongside strings, so `zIndex: 1300` and `fontWeight: 700` are now reported where they previously slipped through.

    Per-rule documentation moved from the README into `docs/rules/*.md`, generated and checked with `eslint-doc-generator`; `meta.docs.url` now points at the rule's own page.

## 1.1.0

### Minor Changes

- 0511327: Add `no-hardcoded-typography`, `no-hardcoded-shadows` and `no-hardcoded-radius`, all on as `warn` in the recommended config.

    Every rule — the two existing ones included — now also reads the emotion `css` prop (object and tagged-template forms) and standalone `` css`...` `` tagged templates. Code that previously passed because a hardcode sat inside `css` will start reporting.

## 1.0.0

### Major Changes

- Initial release.
- TypeScript support.
- Documentation.
