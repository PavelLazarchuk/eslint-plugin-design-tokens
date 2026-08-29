---
'eslint-plugin-design-tokens': minor
---

Add `no-hardcoded-borders`, `no-hardcoded-transitions` and `no-hardcoded-z-index`, all on as `warn` in the recommended config.

Every rule now reads two more entry points: Ant Design's `styles` slot prop (`<Card styles={{ body: {...} }} />`), and a style object pulled out into a `const` in the same file (`const styles = {...}` next to `sx={styles}`), followed one hop through `const` only. Numeric literals are read alongside strings, so `zIndex: 1300` and `fontWeight: 700` are now reported where they previously slipped through.

Per-rule documentation moved from the README into `docs/rules/*.md`, generated and checked with `eslint-doc-generator`; `meta.docs.url` now points at the rule's own page.
