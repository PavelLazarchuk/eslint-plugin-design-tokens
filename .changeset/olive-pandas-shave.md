---
'eslint-plugin-design-tokens': minor
---

Ship `strict` and `all` configs alongside `recommended`, in both the flat and the legacy form. `strict` is the recommended set as errors; `all` is derived from the plugin's rule list rather than a curated one, so a rule added later turns on with it.

Every rule now takes two more options: `allowlistPatterns`, which excuses a value matched by any of the patterns, and `ignorePropertyPattern`, which skips a declaration whose property matches — regular expressions for the cases an exact-value list cannot name. `no-unknown-token-var` reads `allowlistPatterns` as variable names, so `['^--ds-']` says what `prefixes: ['--ds-']` says.

Each rule declares its defaults as `meta.defaultOptions` (ESLint 9+ applies them; the rules merge them themselves on older hosts in the peer range) and marks itself `meta.docs.recommended`, so `eslint --print-config` and tooling that reads rule metadata both see what a rule does before it is configured.
