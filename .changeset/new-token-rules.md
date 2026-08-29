---
'eslint-plugin-design-tokens': minor
---

Add `no-hardcoded-typography`, `no-hardcoded-shadows` and `no-hardcoded-radius`, all on as `warn` in the recommended config.

Every rule — the two existing ones included — now also reads the emotion `css` prop (object and tagged-template forms) and standalone `` css`...` `` tagged templates. Code that previously passed because a hardcode sat inside `css` will start reporting.
