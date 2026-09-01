# eslint-plugin-design-tokens

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
