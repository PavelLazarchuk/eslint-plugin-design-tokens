---
'eslint-plugin-design-tokens': minor
---

Add `no-unknown-token-var`, on as `warn` in the recommended config. Every other rule reads `var(--…)` as proof a value came from somewhere; this one checks the name against your design system, once you name it with `prefixes` and `allowlist`. Unconfigured it reports nothing, because there is no way to tell a token from a typo without knowing the namespace.

Every rule now reads the entry points that previously hid a hardcode. Object forms of the CSS factories — `css({ … })`, vanilla-extract's `style({ … })` — are read like their tagged-template forms, and `keyframes`, `createGlobalStyle` and `injectGlobal` are read like `css`. Styles that follow `styled.div.attrs({ … })` or `.withConfig({ … })` are checked, while the configuration object handed to them is left alone. Every argument of a style call is read, so `styled.div(base, { color: '#fff' })` no longer hides the second object.

MUI's other two `sx` forms are read as well: `sx={theme => ({ … })}` and `sx={[base, active && { … }]}`, along with the conditional form. A `const` is now followed through `as const` and `satisfies`, and a template literal with nothing interpolated into it (`` color: `#fff` ``) is read as the literal it is.

Code that previously passed because a hardcode sat in one of these places will start reporting.
