# eslint-plugin-design-tokens

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
